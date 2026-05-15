-- 018_civilization_recovery_and_mutation.sql

-- 1. Institutional Mutation: Regime Types
ALTER TABLE government_treasury
ADD COLUMN regime_type VARCHAR(50) DEFAULT 'DEMOCRACY', -- 'DEMOCRACY', 'OLIGARCHY', 'TECHNOCRACY', 'MILITARY_JUNTA', 'FAILED_STATE'
ADD COLUMN regime_age_ticks BIGINT DEFAULT 0;

-- 2. Shadow Adaptation Systems
CREATE TABLE region_shadow_systems (
    region_id UUID PRIMARY KEY REFERENCES regions(id) ON DELETE CASCADE,
    black_market_capacity DECIMAL(5,2) DEFAULT 0.0, -- 0-100
    informal_clinic_capacity DECIMAL(5,2) DEFAULT 0.0, -- 0-100
    militia_control DECIMAL(5,2) DEFAULT 0.0, -- 0-100
    pirate_radio_reach DECIMAL(5,2) DEFAULT 0.0, -- 0-100
    updated_tick_id BIGINT REFERENCES global_ticks(id)
);

-- Initialize for existing regions
INSERT INTO region_shadow_systems (region_id)
SELECT id FROM regions ON CONFLICT DO NOTHING;

-- 3. Recovery Dynamics RPC (Cultural Cooling, Institutional Mutation, Shadow Growth)
CREATE OR REPLACE FUNCTION process_recovery_and_mutation(p_tick_id BIGINT)
RETURNS VOID AS $$
DECLARE
    r RECORD;
    v_chaos DECIMAL;
BEGIN
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
        
        -- A. CULTURAL COOLING (Reconciliation & Exhaustion)
        -- If social fatigue is extremely high, polarization and unrest naturally start to cool off (people are too exhausted to fight)
        IF r.social_fatigue > 80 THEN
            UPDATE region_demographics 
            SET 
                polarization_index = GREATEST(0, polarization_index - 1.0),
                unrest_pressure = GREATEST(0, unrest_pressure - 2.0),
                social_fatigue = GREATEST(0, social_fatigue - 0.5) -- Slow recovery of energy
            WHERE region_id = r.region_id;
            
            -- Cool households directly (regression to mean)
            UPDATE households
            SET ideological_alignment = ideological_alignment * 0.95
            WHERE region_id = r.region_id AND RANDOM() < 0.1;
        END IF;

        -- B. INSTITUTIONAL MUTATION
        -- If the state is consistently failing, it mutates.
        IF r.bureaucratic_paralysis > 90 AND r.institutional_trust < 10 THEN
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
                institutional_trust = 50, -- Reset trust slightly because it's a "new" regime
                bureaucratic_paralysis = 20, -- Flush out the old bureaucracy
                fiscal_reserve = GREATEST(0, fiscal_reserve * 0.5) -- Lost capital during transition
            WHERE region_id = r.region_id;
            
            -- Publish event
            PERFORM publish_event(
                'POLITICS.REGIME_MUTATION',
                jsonb_build_object('old_regime', r.regime_type, 'chaos_index', v_chaos),
                'Mutation_Engine',
                r.region_id,
                'CRITICAL'
            );
        ELSE
            UPDATE government_treasury
            SET regime_age_ticks = regime_age_ticks + 1
            WHERE region_id = r.region_id;
        END IF;

        -- C. SHADOW ADAPTATION SYSTEMS
        -- When formal systems fail, shadow networks grow to fill the gap organically.
        UPDATE region_shadow_systems
        SET 
            -- Black Market grows if prices are too high or infra is low
            black_market_capacity = GREATEST(0, LEAST(100, black_market_capacity + CASE WHEN r.average_price_index > 150 THEN 2.0 ELSE -0.5 END)),
            -- Informal Clinics grow if general health infra is failing (simulated here by extreme stress + low infra)
            informal_clinic_capacity = GREATEST(0, LEAST(100, informal_clinic_capacity + CASE WHEN r.infrastructure_health < 40 THEN 1.5 ELSE -0.5 END)),
            -- Militia control grows if trust is low and unrest is high
            militia_control = GREATEST(0, LEAST(100, militia_control + CASE WHEN r.unrest_pressure > 70 AND r.institutional_trust < 30 THEN 1.0 ELSE -1.0 END)),
            
            updated_tick_id = p_tick_id
        WHERE region_id = r.region_id;
        
        -- D. APPLY SHADOW HEALING & COSTS
        -- Shadow systems reduce stress (survival mechanism), but degrade formal trust
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
