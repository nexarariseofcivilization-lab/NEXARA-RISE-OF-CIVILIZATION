-- 004_population_dynamics.sql

-- ==========================================
-- 1. HOUSEHOLDS (The base population unit)
-- ==========================================
-- We model households instead of individual citizens to save compute
-- while maintaining emergent sociological pressures.
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    social_class VARCHAR(50) NOT NULL, -- 'LOWER', 'WORKING', 'MIDDLE', 'UPPER', 'ELITE'
    headcount INT DEFAULT 4,
    
    -- Economics
    wealth DECIMAL(15,2) DEFAULT 0.0,
    employment_status VARCHAR(50) DEFAULT 'UNEMPLOYED', -- 'EMPLOYED', 'UNEMPLOYED', 'BUSINESS_OWNER'
    employer_id UUID, -- will reference businesses
    
    -- Biological / Psychological State (0-100)
    base_hunger DECIMAL(5,2) DEFAULT 100.0,   -- 100 = Full, 0 = Starving
    base_stamina DECIMAL(5,2) DEFAULT 100.0,
    base_stress DECIMAL(5,2) DEFAULT 0.0,     -- 100 = Critical Stress
    base_health DECIMAL(5,2) DEFAULT 100.0,
    
    -- Needs Fulfillment (Maslow-lite)
    critical_needs_met DECIMAL(5,2) DEFAULT 100.0,  -- Food, Water, Shelter
    stability_needs_met DECIMAL(5,2) DEFAULT 100.0, -- Job, Healthcare, Power
    aspirational_needs_met DECIMAL(5,2) DEFAULT 100.0, -- Luxury, Status
    
    -- Activity State
    current_action VARCHAR(50) DEFAULT 'IDLE',   -- 'IDLE', 'WORKING', 'SHOPPING', 'PROTESTING', 'SLEEPING', 'MIGRATING'
    
    -- Sentiments
    government_trust DECIMAL(5,2) DEFAULT 50.0,
    radicalization_level DECIMAL(5,2) DEFAULT 0.0, -- High stress + low trust = radicalization -> Protesting/Riot
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_households_region ON households(region_id);
CREATE INDEX idx_households_class ON households(social_class);
CREATE INDEX idx_households_state ON households(current_action);

-- ==========================================
-- 2. REGION DEMOGRAPHICS
-- ==========================================
-- Aggregated Materialized State for fast reads and AI Context limits
CREATE TABLE region_demographics (
    region_id UUID PRIMARY KEY REFERENCES regions(id) ON DELETE CASCADE,
    total_population BIGINT DEFAULT 0,
    
    -- Class distribution
    pct_lower DECIMAL(5,2) DEFAULT 0.0,
    pct_working DECIMAL(5,2) DEFAULT 0.0,
    pct_middle DECIMAL(5,2) DEFAULT 0.0,
    pct_upper DECIMAL(5,2) DEFAULT 0.0,
    pct_elite DECIMAL(5,2) DEFAULT 0.0,
    
    -- Averages
    avg_stress DECIMAL(5,2) DEFAULT 0.0,
    avg_trust DECIMAL(5,2) DEFAULT 50.0,
    unemployment_rate DECIMAL(5,2) DEFAULT 0.0,
    
    -- The critical threshold for Riot Events
    unrest_pressure DECIMAL(5,2) DEFAULT 0.0, 
    
    updated_tick_id BIGINT REFERENCES global_ticks(id)
);

-- ==========================================
-- 3. BIOLOGICAL DECAY FUNCTION (RPC)
-- ==========================================
-- Handles systemic decay. Run by Biological_Worker every global tick (1 min)
CREATE OR REPLACE FUNCTION process_biological_decay(p_tick_id BIGINT, p_region_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    -- Apply biological and psychological decay based on current state
    -- Hunger decreases, stamina decreases.
    -- If hunger < 30, stress explodes.
    UPDATE households
    SET 
        base_hunger = GREATEST(0, base_hunger - 0.5), -- Hunger drops naturally
        base_stamina = GREATEST(0, 
            CASE 
                WHEN current_action = 'SLEEPING' THEN base_stamina + 5.0
                WHEN current_action = 'WORKING' THEN base_stamina - 2.0
                ELSE base_stamina - 0.5
            END
        ),
        base_stress = LEAST(100, base_stress + 
            CASE 
                WHEN base_hunger < 30 THEN 3.0   -- Starving = High stress
                WHEN base_hunger < 50 THEN 1.0   -- Hungry = Mild stress
                WHEN base_stamina < 20 THEN 2.0  -- Exhausted = High stress
                WHEN critical_needs_met < 50 THEN 2.0 -- Lack of shelter/power = High stress
                ELSE -0.5 -- Natural stress decay if everything is fine
            END
        )
    WHERE (p_region_id IS NULL OR region_id = p_region_id);
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 4. AGGREGATOR FUNCTION
-- ==========================================
-- Syncs household dynamics into region_demographics and spawns Unrest events if needed
CREATE OR REPLACE FUNCTION aggregate_region_demographics(p_tick_id BIGINT, p_region_id UUID)
RETURNS VOID AS $$
DECLARE
    v_total BIGINT;
    v_avg_stress DECIMAL(5,2);
    v_avg_trust DECIMAL(5,2);
    v_unrest_pressure DECIMAL(5,2);
BEGIN
    SELECT 
        COALESCE(SUM(headcount), 0),
        COALESCE(AVG(base_stress), 0),
        COALESCE(AVG(government_trust), 50.0)
    INTO v_total, v_avg_stress, v_avg_trust
    FROM households
    WHERE region_id = p_region_id;

    IF v_total = 0 THEN
        RETURN; -- No citizens
    END IF;

    -- Calculate Unrest Pressure: High Stress + Low Trust
    v_unrest_pressure := GREATEST(0, v_avg_stress - (v_avg_trust / 2));

    -- Upsert region_demographics
    INSERT INTO region_demographics (region_id, total_population, avg_stress, avg_trust, unrest_pressure, updated_tick_id)
    VALUES (p_region_id, v_total, v_avg_stress, v_avg_trust, v_unrest_pressure, p_tick_id)
    ON CONFLICT (region_id) 
    DO UPDATE SET 
        total_population = EXCLUDED.total_population,
        avg_stress = EXCLUDED.avg_stress,
        avg_trust = EXCLUDED.avg_trust,
        unrest_pressure = EXCLUDED.unrest_pressure,
        updated_tick_id = EXCLUDED.updated_tick_id;

    -- Emit Critical Events via Event Bus
    IF v_unrest_pressure > 80.0 THEN
        -- Check if we already have an active unrest event to prevent spam
        IF NOT EXISTS (
            SELECT 1 FROM event_queue 
            WHERE topic = 'POPULATION.RIOT.PROBABILITY_HIGH' AND region_id = p_region_id AND status = 'PENDING'
        ) THEN
            -- Dispatch event
            PERFORM publish_event(
                'POPULATION.RIOT.PROBABILITY_HIGH',
                jsonb_build_object('unrest_pressure', v_unrest_pressure, 'avg_stress', v_avg_stress),
                'Population_Engine',
                p_region_id,
                'CRITICAL_SOCIAL'
            );
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;
