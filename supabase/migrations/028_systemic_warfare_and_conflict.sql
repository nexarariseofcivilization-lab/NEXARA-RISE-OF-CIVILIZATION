-- 028_systemic_warfare_and_conflict.sql
-- Warfare as Systemic Pressure Projection

CREATE TABLE systemic_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_faction_id VARCHAR(50) REFERENCES factions(id) ON DELETE CASCADE,
    source_region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    target_region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    target_faction_id VARCHAR(50) REFERENCES factions(id), -- Can be null if targeting region infrastructure
    
    conflict_doctrine VARCHAR(50) NOT NULL, -- 'BLOCKADE', 'INSURGENCY', 'INFRASTRUCTURE_DENIAL', 'ECONOMIC_EXHAUSTION', 'INFORMATION_WARFARE'
    intensity DECIMAL(5,2) DEFAULT 10.0,
    escalation_level VARCHAR(20) DEFAULT 'LOW', -- 'LOW', 'MEDIUM', 'TOTAL'
    
    attrition_inflicted JSONB DEFAULT '{}'::jsonb, -- Track accumulated damage
    
    started_at_tick BIGINT REFERENCES global_ticks(id),
    resolved_at_tick BIGINT REFERENCES global_ticks(id),
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'STALEMATE', 'RESOLVED', 'COLLAPSED'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RPC to process the slow, grinding nature of systemic warfare
CREATE OR REPLACE FUNCTION process_systemic_warfare(p_tick_id BIGINT, p_region_id UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    c RECORD;
    v_fatigue_dmg DECIMAL;
    v_infra_dmg DECIMAL;
    v_econ_dmg DECIMAL;
    v_infra_target RECORD;
BEGIN
    -- Process all active conflicts affecting the given region (or all if NULL)
    FOR c IN SELECT * FROM systemic_conflicts WHERE status = 'ACTIVE' AND (p_region_id IS NULL OR target_region_id = p_region_id) LOOP
        
        -- Default base damage scaling by intensity
        v_fatigue_dmg := c.intensity * 0.1;
        v_infra_dmg := c.intensity * 0.05;
        v_econ_dmg := c.intensity * 0.2;

        IF c.escalation_level = 'TOTAL' THEN
            v_fatigue_dmg := v_fatigue_dmg * 3;
            v_infra_dmg := v_infra_dmg * 3;
            v_econ_dmg := v_econ_dmg * 3;
        END IF;

        -- Apply structural damage based on Doctrine
        
        IF c.conflict_doctrine = 'BLOCKADE' THEN
            -- Increase prices, lower fiscal reserve, cause starvation/fatigue
            UPDATE region_state_current 
            SET average_price_index = LEAST(500.0, average_price_index + v_econ_dmg)
            WHERE region_id = c.target_region_id;
            
            UPDATE region_demographics
            SET unrest_pressure = LEAST(100.0, unrest_pressure + v_fatigue_dmg)
            WHERE region_id = c.target_region_id;

        ELSIF c.conflict_doctrine = 'INFRASTRUCTURE_DENIAL' THEN
            -- Randomly damage infrastructure nodes (Power, Water, Transport)
            FOR v_infra_target IN SELECT * FROM infrastructure_nodes WHERE region_id = c.target_region_id AND status != 'DESTROYED' LOOP
                IF random() < 0.3 THEN
                    UPDATE infrastructure_nodes
                    SET health = GREATEST(0, health - v_infra_dmg),
                        status = CASE WHEN health - v_infra_dmg <= 0 THEN 'DESTROYED' WHEN health - v_infra_dmg < 40 THEN 'CRITICAL' ELSE 'ONLINE' END
                    WHERE id = v_infra_target.id;
                END IF;
            END LOOP;

        ELSIF c.conflict_doctrine = 'INSURGENCY' THEN
            -- Destabilize legitimacy, lower state capacity, increase local chaos
            UPDATE region_execution_metadata
            SET local_chaos_index = LEAST(100.0, local_chaos_index + v_fatigue_dmg)
            WHERE region_id = c.target_region_id;
            
            UPDATE government_treasury
            SET legitimacy_score = GREATEST(0, legitimacy_score - v_fatigue_dmg * 0.5),
                bureaucratic_paralysis = LEAST(100.0, bureaucratic_paralysis + v_fatigue_dmg)
            WHERE region_id = c.target_region_id;

        ELSIF c.conflict_doctrine = 'ECONOMIC_EXHAUSTION' THEN
            -- Drain capital and increase structural poverty
            UPDATE government_treasury
            SET capital = GREATEST(0, capital - (v_econ_dmg * 100)),
                fiscal_reserve = GREATEST(0, fiscal_reserve - (v_econ_dmg * 50))
            WHERE region_id = c.target_region_id;

            UPDATE region_demographics
            SET structural_poverty = LEAST(100.0, structural_poverty + v_econ_dmg * 0.1)
            WHERE region_id = c.target_region_id;
        END IF;

        -- Warfare exhaustion for the SOURCE (war is expensive)
        UPDATE government_treasury
        SET capital = GREATEST(0, capital - (v_econ_dmg * 50))
        WHERE region_id = c.source_region_id;
        
        -- Conflict Entropy/Stalemate Check
        -- If source runs out of capital or target completely collapses, the war resolves or stalemates.
        -- We will keep it simple for now: random chance to de-escalate if intensity is high for too long.
        IF p_tick_id - c.started_at_tick > 100 AND random() < 0.05 THEN
            UPDATE systemic_conflicts SET status = 'STALEMATE', resolved_at_tick = p_tick_id WHERE id = c.id;
            PERFORM publish_event('CONFLICT.STALEMATE', jsonb_build_object('conflict_id', c.id), 'Warfare_Engine', c.target_region_id, 'MAJOR_POLITICAL');
        END IF;

    END LOOP;
END;
$$ LANGUAGE plpgsql;
