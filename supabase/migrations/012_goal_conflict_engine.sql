-- 012_goal_conflict_engine.sql

-- ==========================================
-- 1. INFRASTRUCTURE CAPTURE 
-- ==========================================
ALTER TABLE infrastructure_nodes 
ADD COLUMN controlling_faction_id VARCHAR(50) REFERENCES factions(id) ON DELETE SET NULL DEFAULT NULL;

-- ==========================================
-- 2. FACTION RELATIONS & COALITIONS
-- ==========================================
CREATE TABLE faction_relations (
    faction_id_a VARCHAR(50) REFERENCES factions(id) ON DELETE CASCADE,
    faction_id_b VARCHAR(50) REFERENCES factions(id) ON DELETE CASCADE,
    affinity_score DECIMAL(5,2) DEFAULT 0.0, -- -100 (Vendetta) to 100 (Coalition)
    pact_type VARCHAR(50) DEFAULT 'NONE', -- 'COALITION', 'NON_AGGRESSION', 'NONE', 'VENDETTA'
    PRIMARY KEY (faction_id_a, faction_id_b)
);

DO $$
DECLARE
    f1 RECORD;
    f2 RECORD;
BEGIN
    FOR f1 IN SELECT * FROM factions LOOP
        FOR f2 IN SELECT * FROM factions WHERE id != f1.id LOOP
            INSERT INTO faction_relations (faction_id_a, faction_id_b, affinity_score, pact_type)
            VALUES (f1.id, f2.id, (random() * 40) - 20, 'NONE')
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END;
$$;

-- ==========================================
-- 3. DYNAMIC FACTION OBJECTIVES (GOAL ENGINE)
-- ==========================================
CREATE TABLE faction_objectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faction_id VARCHAR(50) REFERENCES factions(id) ON DELETE CASCADE,
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    
    objective_type VARCHAR(50) NOT NULL, -- 'CAPTURE_INFRASTRUCTURE', 'FORCE_POLICY', 'CRUSH_RIVAL'
    target_ref VARCHAR(255) NOT NULL, -- ID of whatever they are targeting (e.g., node_id, or rival_id)
    target_name VARCHAR(255),
    
    progress DECIMAL(5,2) DEFAULT 0.0,
    required_progress DECIMAL(5,2) DEFAULT 100.0,
    
    status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'ACHIEVED', 'ABANDONED', 'FAILED'
    
    created_at_tick_id BIGINT REFERENCES global_ticks(id),
    updated_at_tick_id BIGINT REFERENCES global_ticks(id)
);

-- ==========================================
-- 4. GOAL CONFLICT & AUTONOMOUS AGENT LOGIC
-- ==========================================
CREATE OR REPLACE FUNCTION process_goal_conflict_tick(p_tick_id BIGINT)
RETURNS VOID AS $$
DECLARE
    fac RECORD;
    obj RECORD;
    reg RECORD;
    infra RECORD;
    v_influence DECIMAL;
    v_active_ops INT;
BEGIN
    -- 1. STRATEGIC PLANNING: Spawn Objectives dynamically if no active operations
    FOR fac IN SELECT * FROM factions LOOP
        FOR reg IN SELECT * FROM regions LOOP
            SELECT influence_score INTO v_influence FROM regional_factions WHERE faction_id = fac.id AND region_id = reg.id;
            
            SELECT COUNT(*) INTO v_active_ops FROM faction_objectives WHERE faction_id = fac.id AND region_id = reg.id AND status = 'ACTIVE';
            
            -- If faction is somewhat influential but idle
            IF v_influence > 15.0 AND v_active_ops = 0 AND random() < 0.3 THEN
                
                -- Workers & Radicals: Target Infrastructure for leverage
                IF fac.id IN ('WORKER_UNION', 'RADICAL_SEPARATISTS') THEN
                    -- Find uncontrolled or rival-controlled infrastructure
                    SELECT * INTO infra FROM infrastructure_nodes 
                    WHERE region_id = reg.id AND (controlling_faction_id IS NULL OR controlling_faction_id != fac.id)
                    ORDER BY random() LIMIT 1;
                    
                    IF FOUND THEN
                        INSERT INTO faction_objectives (faction_id, region_id, objective_type, target_ref, target_name, created_at_tick_id, updated_at_tick_id)
                        VALUES (fac.id, reg.id, 'CAPTURE_INFRASTRUCTURE', infra.id::TEXT, infra.name, p_tick_id, p_tick_id);
                        
                        PERFORM publish_event('FACTION.STRATEGY.NEW_GOAL', 
                            jsonb_build_object('faction', fac.id, 'goal', 'CAPTURE_INFRASTRUCTURE', 'target', infra.name), 
                            'Goal_Engine', reg.id, 'MODERATE_SOCIAL');
                    END IF;
                
                -- Elites: Force beneficial policies or crush radicals
                ELSIF fac.id = 'ELITE_SYNDICATE' THEN
                    IF random() < 0.5 THEN
                        INSERT INTO faction_objectives (faction_id, region_id, objective_type, target_ref, target_name, created_at_tick_id, updated_at_tick_id)
                        VALUES (fac.id, reg.id, 'FORCE_POLICY', 'TAX_HOLIDAY', 'Tax Holiday Policy', p_tick_id, p_tick_id);
                    ELSE
                        INSERT INTO faction_objectives (faction_id, region_id, objective_type, target_ref, target_name, created_at_tick_id, updated_at_tick_id)
                        VALUES (fac.id, reg.id, 'CRUSH_RIVAL', 'RADICAL_SEPARATISTS', 'Radical Separatists', p_tick_id, p_tick_id);
                    END IF;
                
                -- Military Council: Re-seize infrastructure or crush unrest
                ELSIF fac.id = 'MILITARY_COUNCIL' THEN
                    INSERT INTO faction_objectives (faction_id, region_id, objective_type, target_ref, target_name, created_at_tick_id, updated_at_tick_id)
                    VALUES (fac.id, reg.id, 'CRUSH_RIVAL', 'WORKER_UNION', 'Worker Union', p_tick_id, p_tick_id);
                END IF;
            END IF;
        END LOOP;
    END LOOP;

    -- 2. EXECUTION: Progress Objectives based on influence + stochastic conflict
    FOR obj IN SELECT * FROM faction_objectives WHERE status = 'ACTIVE' LOOP
        SELECT COALESCE(influence_score, 0) INTO v_influence FROM regional_factions WHERE faction_id = obj.faction_id AND region_id = obj.region_id;
        
        -- Abandon goal if base influence collapses
        IF v_influence < 5.0 THEN
            UPDATE faction_objectives SET status = 'ABANDONED', updated_at_tick_id = p_tick_id WHERE id = obj.id;
            CONTINUE;
        END IF;

        IF obj.objective_type = 'CAPTURE_INFRASTRUCTURE' THEN
            -- Progress requires influence. Military has bonus vs infrastucture.
            UPDATE faction_objectives 
            SET progress = LEAST(100.0, progress + (v_influence * 0.15) + (random() * 5.0)), 
                updated_at_tick_id = p_tick_id 
            WHERE id = obj.id;
            
            IF (SELECT progress FROM faction_objectives WHERE id = obj.id) >= 100 THEN
                UPDATE infrastructure_nodes SET controlling_faction_id = obj.faction_id WHERE id = obj.target_ref::UUID;
                UPDATE faction_objectives SET status = 'ACHIEVED', updated_at_tick_id = p_tick_id WHERE id = obj.id;
                
                PERFORM publish_event('FACTION.STRATEGY.ACHIEVED', 
                    jsonb_build_object('faction', obj.faction_id, 'goal', 'CAPTURED_INFRASTRUCTURE', 'target', obj.target_name), 
                    'Goal_Engine', obj.region_id, 'CRITICAL_SYSTEM');
            END IF;
            
        ELSIF obj.objective_type = 'CRUSH_RIVAL' THEN
             UPDATE faction_objectives 
             SET progress = LEAST(100.0, progress + (v_influence * 0.1)), 
                 updated_at_tick_id = p_tick_id 
             WHERE id = obj.id;
             
             -- Direct collateral damage to rival influence
             UPDATE regional_factions 
             SET influence_score = GREATEST(0.0, influence_score - (v_influence * 0.05)) 
             WHERE faction_id = obj.target_ref AND region_id = obj.region_id;
             
             IF (SELECT progress FROM faction_objectives WHERE id = obj.id) >= 100 OR (SELECT influence_score FROM regional_factions WHERE faction_id = obj.target_ref AND region_id = obj.region_id) <= 0 THEN
                 UPDATE faction_objectives SET status = 'ACHIEVED', updated_at_tick_id = p_tick_id WHERE id = obj.id;
                 PERFORM publish_event('FACTION.STRATEGY.ACHIEVED', 
                    jsonb_build_object('faction', obj.faction_id, 'goal', 'CRUSHED_RIVAL', 'target', obj.target_name), 
                    'Goal_Engine', obj.region_id, 'HIGH_SOCIAL');
             END IF;
             
        ELSIF obj.objective_type = 'FORCE_POLICY' THEN
             -- Generate massive bureaucratic paralysis to force govt
             UPDATE government_treasury SET bureaucratic_paralysis = LEAST(100.0, bureaucratic_paralysis + (v_influence * 0.1)) WHERE region_id = obj.region_id;
             
             UPDATE faction_objectives 
             SET progress = LEAST(100.0, progress + (v_influence * 0.08)), 
                 updated_at_tick_id = p_tick_id 
             WHERE id = obj.id;
             
             IF (SELECT progress FROM faction_objectives WHERE id = obj.id) >= 100 THEN
                 -- Force the policy execution!
                 PERFORM enact_policy(obj.region_id, obj.target_ref);
                 
                 UPDATE faction_objectives SET status = 'ACHIEVED', updated_at_tick_id = p_tick_id WHERE id = obj.id;
                 
                 PERFORM publish_event('FACTION.STRATEGY.ACHIEVED', 
                    jsonb_build_object('faction', obj.faction_id, 'goal', 'FORCED_POLICY', 'target', obj.target_name), 
                    'Goal_Engine', obj.region_id, 'HIGH_SOCIAL');
             END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
