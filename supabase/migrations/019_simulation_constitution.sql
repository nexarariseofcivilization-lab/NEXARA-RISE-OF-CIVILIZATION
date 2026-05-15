-- 019_simulation_constitution.sql
-- Meta-System Governance & Hard Systemic Invariants

CREATE TABLE simulation_constitution (
    id INT PRIMARY KEY DEFAULT 1,
    
    -- Economic Invariants
    max_inflation_velocity DECIMAL(5,2) DEFAULT 5.0,
    max_deflation_velocity DECIMAL(5,2) DEFAULT 2.0,
    min_price_index DECIMAL(5,2) DEFAULT 10.0,
    
    -- Demographic & Social Invariants
    max_ideology_swing DECIMAL(5,2) DEFAULT 2.5,
    max_migration_rate DECIMAL(5,2) DEFAULT 2.0, -- Max % of population moving per tick
    
    -- Institutional Invariants
    collapse_cooldown_ticks BIGINT DEFAULT 1440, -- Approx 1 real day in simulation time (1 tick = 1 min)
    
    -- Fault Containment (Circuit Breakers)
    circuit_breaker_enabled BOOLEAN DEFAULT true,
    circuit_breaker_chaos_threshold DECIMAL(5,2) DEFAULT 95.0,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO simulation_constitution (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Inject Constraints into Existing Systems

-- 1. Modify Mutation to respect the Cooldown to prevent ping-pong regime collapse
CREATE OR REPLACE FUNCTION process_recovery_and_mutation(p_tick_id BIGINT)
RETURNS VOID AS $$
DECLARE
    r RECORD;
    v_chaos DECIMAL;
    v_cooldown BIGINT;
BEGIN
    SELECT collapse_cooldown_ticks INTO v_cooldown FROM simulation_constitution WHERE id = 1;

    FOR r IN 
        SELECT 
            gt.region_id, gt.regime_type, gt.regime_age_ticks, gt.institutional_trust, gt.bureaucratic_paralysis,
            rd.unrest_pressure, rd.avg_stress, rd.polarization_index, rd.social_fatigue,
            rs.infrastructure_health, rs.average_price_index,
            rem.local_chaos_index
        FROM government_treasury gt
        JOIN region_demographics rd ON gt.region_id = rd.region_id
        JOIN region_state_current rs ON gt.region_id = rs.region_id
        LEFT JOIN region_execution_metadata rem ON gt.region_id = rem.region_id
    LOOP
        v_chaos := COALESCE(rem.local_chaos_index, 0.0);
        
        -- A. CULTURAL COOLING
        IF r.social_fatigue > 80 THEN
            UPDATE region_demographics 
            SET 
                polarization_index = GREATEST(0, polarization_index - 1.0),
                unrest_pressure = GREATEST(0, unrest_pressure - 2.0),
                social_fatigue = GREATEST(0, social_fatigue - 0.5)
            WHERE region_id = r.region_id;
            
            UPDATE households
            SET ideological_alignment = ideological_alignment * 0.95
            WHERE region_id = r.region_id AND RANDOM() < 0.1;
        END IF;

        -- B. INSTITUTIONAL MUTATION (WITH COOLDOWN CONSTRAINT)
        IF r.bureaucratic_paralysis > 90 AND r.institutional_trust < 10 THEN
            IF r.regime_age_ticks > v_cooldown THEN -- CONSTITUTIONAL CONSTRAINT APPLIED
                -- Regime collapse
                UPDATE government_treasury
                SET 
                    regime_type = CASE 
                        WHEN r.regime_type = 'DEMOCRACY' THEN 'OLIGARCHY'
                        WHEN r.regime_type = 'OLIGARCHY' THEN 'MILITARY_JUNTA'
                        WHEN r.regime_type = 'MILITARY_JUNTA' THEN 'FAILED_STATE'
                        WHEN r.regime_type = 'FAILED_STATE' THEN 'TECHNOCRACY'
                        WHEN r.regime_type = 'TECHNOCRACY' THEN 'DEMOCRACY'
                        ELSE 'DEMOCRACY'
                    END,
                    regime_age_ticks = 0,
                    institutional_trust = 50,
                    bureaucratic_paralysis = 20,
                    fiscal_reserve = GREATEST(0, fiscal_reserve * 0.5)
                WHERE region_id = r.region_id;
                
                -- Publish event
                PERFORM publish_event(
                    'POLITICS.REGIME_MUTATION',
                    jsonb_build_object('old_regime', r.regime_type, 'chaos_index', v_chaos),
                    'Mutation_Engine',
                    r.region_id,
                    'CRITICAL'
                );
            END IF;
        ELSE
            UPDATE government_treasury
            SET regime_age_ticks = regime_age_ticks + 1
            WHERE region_id = r.region_id;
        END IF;

        -- C. SHADOW ADAPTATION SYSTEMS
        UPDATE region_shadow_systems
        SET 
            black_market_capacity = GREATEST(0, LEAST(100, black_market_capacity + CASE WHEN r.average_price_index > 150 THEN 2.0 ELSE -0.5 END)),
            informal_clinic_capacity = GREATEST(0, LEAST(100, informal_clinic_capacity + CASE WHEN r.infrastructure_health < 40 THEN 1.5 ELSE -0.5 END)),
            militia_control = GREATEST(0, LEAST(100, militia_control + CASE WHEN r.unrest_pressure > 70 AND r.institutional_trust < 30 THEN 1.0 ELSE -1.0 END)),
            updated_tick_id = p_tick_id
        WHERE region_id = r.region_id;
        
        -- D. APPLY SHADOW HEALING & COSTS
        IF EXISTS (SELECT 1 FROM region_shadow_systems WHERE region_id = r.region_id AND (black_market_capacity > 50 OR informal_clinic_capacity > 50)) THEN
            UPDATE region_demographics
            SET avg_stress = GREATEST(0, avg_stress - 1.0)
            WHERE region_id = r.region_id;
        END IF;

        IF EXISTS (SELECT 1 FROM region_shadow_systems WHERE region_id = r.region_id AND militia_control > 50) THEN
            UPDATE government_treasury
            SET institutional_trust = GREATEST(0, institutional_trust - 0.5)
            WHERE region_id = r.region_id;
        END IF;

    END LOOP;
END;
$$ LANGUAGE plpgsql;
