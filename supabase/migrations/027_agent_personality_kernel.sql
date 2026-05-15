-- 027_agent_personality_kernel.sql

-- ==========================================
-- 1. AGENTS & PERSONALITY GENOME
-- ==========================================
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'FACTION_LEADER', 'BUREAUCRAT', 'GENERAL', 'UNION_BOSS', 'OLIGARCH'
    affiliation_faction_id VARCHAR(50) REFERENCES factions(id),
    
    -- Personality Genome
    ambition DECIMAL(5,2) DEFAULT 50.0, -- Drives power grabs, ignores limits
    ideological_rigidity DECIMAL(5,2) DEFAULT 50.0, -- Resistance to state/policy changes
    strategic_inertia INT DEFAULT 20, -- Ticks before abandoning a failing strategy
    
    -- Dynamic State
    current_power DECIMAL(5,2) DEFAULT 10.0, -- Limits action scale
    fatigue DECIMAL(5,2) DEFAULT 0.0, -- Regenerates slowly. High fatigue reduces power effectiveness
    
    -- Current Persistence of Intent
    current_intent_type VARCHAR(50), -- 'CONSOLIDATE_POWER', 'SABOTAGE_FACTION', 'REFORM_POLICY', 'HOARD_WEALTH'
    current_intent_target VARCHAR(255), -- Could be a faction ID, 'TREASURY', etc.
    intent_locked_until_tick BIGINT,
    
    created_at_tick BIGINT REFERENCES global_ticks(id),
    life_status VARCHAR(50) DEFAULT 'ACTIVE' -- 'ACTIVE', 'RETIRED', 'EXILED', 'ASSASSINATED'
);

-- ==========================================
-- 2. TRAUMA & MEMORY
-- ==========================================
CREATE TABLE agent_trauma_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    
    trauma_type VARCHAR(50) NOT NULL, -- 'REVOLT_SURVIVOR', 'ECONOMIC_RUIN', 'BETRAYED'
    trigger_source_id VARCHAR(255) NOT NULL, -- Target faction or other agent
    intensity DECIMAL(5,2) NOT NULL,
    decay_rate DECIMAL(5,4) DEFAULT 0.005,
    
    encoded_at_tick BIGINT REFERENCES global_ticks(id)
);

-- Seed some initial agents
DO $$
DECLARE
    v_tick_id BIGINT;
    r RECORD;
BEGIN
    SELECT MAX(id) INTO v_tick_id FROM global_ticks;
    IF v_tick_id IS NULL THEN v_tick_id := 1; END IF;

    FOR r IN SELECT * FROM regions LOOP
        -- Add a Union Boss
        INSERT INTO agents (region_id, name, role, affiliation_faction_id, ambition, ideological_rigidity, strategic_inertia, current_intent_type, current_intent_target, intent_locked_until_tick, created_at_tick)
        VALUES (r.id, 'Comrade Vance', 'UNION_BOSS', 'WORKER_UNION', 70.0, 85.0, 10, 'CONSOLIDATE_POWER', 'WORKER_UNION', v_tick_id + 10, v_tick_id);

        -- Add an Oligarch
        INSERT INTO agents (region_id, name, role, affiliation_faction_id, ambition, ideological_rigidity, strategic_inertia, current_intent_type, current_intent_target, intent_locked_until_tick, created_at_tick)
        VALUES (r.id, 'Director Sterling', 'OLIGARCH', 'ELITE_SYNDICATE', 90.0, 30.0, 5, 'HOARD_WEALTH', 'TREASURY', v_tick_id + 5, v_tick_id);
        
        -- Add a General
        INSERT INTO agents (region_id, name, role, affiliation_faction_id, ambition, ideological_rigidity, strategic_inertia, current_intent_type, current_intent_target, intent_locked_until_tick, created_at_tick)
        VALUES (r.id, 'General Graves', 'GENERAL', 'MILITARY_COUNCIL', 60.0, 95.0, 30, 'CONSOLIDATE_POWER', 'MILITARY_COUNCIL', v_tick_id + 30, v_tick_id);
    END LOOP;
END;
$$;

-- ==========================================
-- 3. AGENT INTENT KERNEL RPC
-- ==========================================
CREATE OR REPLACE FUNCTION process_agent_personality_kernel(p_tick_id BIGINT, p_region_id UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    a RECORD;
    v_trauma_modifier DECIMAL;
    v_target_faction RECORD;
    v_treasury RECORD;
BEGIN
    -- 1. Decay Trauma
    UPDATE agent_trauma_memory
    SET intensity = GREATEST(0, intensity - decay_rate)
    WHERE intensity > 0;

    -- Delete healed traumas
    DELETE FROM agent_trauma_memory WHERE intensity <= 0;

    -- 2. Process Active Agents
    FOR a IN SELECT * FROM agents WHERE life_status = 'ACTIVE' AND (p_region_id IS NULL OR region_id = p_region_id) LOOP
        
        -- Fatigue recovery
        IF a.fatigue > 0 THEN
            UPDATE agents SET fatigue = GREATEST(0, fatigue - 2.0) WHERE id = a.id;
        END IF;

        -- Evaluate Intent Lock (Strategic Inertia)
        IF p_tick_id >= a.intent_locked_until_tick OR a.current_intent_type IS NULL THEN
            -- TIME TO PIVOT OR RENEW
            -- Agents with high rigidity tend to renew the same intent.
            -- High ambition makes them pivot to SABOTAGE if power < 50
            IF a.ambition > 70 AND a.current_power < 30 AND random() < 0.4 THEN
                UPDATE agents 
                SET current_intent_type = 'SABOTAGE_FACTION',
                    -- Target rival faction randomly for now
                    current_intent_target = (CASE WHEN a.affiliation_faction_id = 'WORKER_UNION' THEN 'ELITE_SYNDICATE' ELSE 'WORKER_UNION' END),
                    intent_locked_until_tick = p_tick_id + a.strategic_inertia
                WHERE id = a.id;
            ELSE
                -- Renew or default to consolidate
                UPDATE agents 
                SET current_intent_type = 'CONSOLIDATE_POWER',
                    current_intent_target = a.affiliation_faction_id,
                    intent_locked_until_tick = p_tick_id + a.strategic_inertia
                WHERE id = a.id;
            END IF;
        END IF;

        -- 3. Execute Intent (If not exhausted)
        IF a.fatigue < 80 THEN
            
            -- Action: CONSOLIDATE_POWER
            IF a.current_intent_type = 'CONSOLIDATE_POWER' THEN
                -- Try to boost their faction's influence
                UPDATE regional_factions 
                SET influence_score = LEAST(100.0, influence_score + (a.current_power * 0.05))
                WHERE faction_id = a.affiliation_faction_id AND region_id = a.region_id;
                
                -- Gain some fatigue and power
                UPDATE agents SET current_power = LEAST(100.0, current_power + 1.0), fatigue = fatigue + 5.0 WHERE id = a.id;
            
            -- Action: SABOTAGE_FACTION
            ELSIF a.current_intent_type = 'SABOTAGE_FACTION' THEN
                -- Check trauma against target
                SELECT COALESCE(MAX(intensity), 0) INTO v_trauma_modifier FROM agent_trauma_memory WHERE agent_id = a.id AND trigger_source_id = a.current_intent_target;
                
                -- The more trauma, the harder they hit
                UPDATE regional_factions 
                SET influence_score = GREATEST(0.0, influence_score - (a.current_power * 0.1 * (1.0 + (v_trauma_modifier / 100.0))))
                WHERE faction_id = a.current_intent_target AND region_id = a.region_id;

                UPDATE agents SET fatigue = fatigue + 10.0 WHERE id = a.id;

            -- Action: HOARD_WEALTH
            ELSIF a.current_intent_type = 'HOARD_WEALTH' THEN
                -- Steal from treasury using power. Causes bureaucratic paralysis.
                SELECT * INTO v_treasury FROM government_treasury WHERE region_id = a.region_id;
                IF v_treasury.fiscal_reserve > 1000 THEN
                    UPDATE government_treasury 
                    SET fiscal_reserve = fiscal_reserve - (a.current_power * 10),
                        bureaucratic_paralysis = LEAST(100.0, bureaucratic_paralysis + (a.current_power * 0.05))
                    WHERE region_id = a.region_id;
                    
                    UPDATE agents SET current_power = LEAST(100.0, current_power + 5.0), fatigue = fatigue + 2.0 WHERE id = a.id;
                END IF;
            END IF;

            -- Burnout check (High ambition agents ignore fatigue limits and risk burnout)
            IF a.ambition > 80 AND a.fatigue > 90 THEN
                -- Agent suffers a breakdown
                UPDATE agents 
                SET current_power = GREATEST(0, current_power / 2),
                    fatigue = 100.0,
                    current_intent_type = 'RECOVER',
                    intent_locked_until_tick = p_tick_id + 50
                WHERE id = a.id;
                
                PERFORM publish_event('AGENT.BURNOUT', jsonb_build_object('agent_name', a.name, 'role', a.role), 'Personality_Kernel', a.region_id, 'MODERATE_SOCIAL');
            END IF;

        END IF;

    END LOOP;
END;
$$ LANGUAGE plpgsql;
