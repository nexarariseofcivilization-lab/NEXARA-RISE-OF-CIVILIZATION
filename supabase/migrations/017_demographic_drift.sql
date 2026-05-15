-- 017_demographic_drift.sql

-- Expand households with Demographic Drift metrics
ALTER TABLE households
ADD COLUMN generation INT DEFAULT 1,
ADD COLUMN education_level DECIMAL(5,2) DEFAULT 50.0, -- 0 (Uneducated) to 100 (Highly Educated)
ADD COLUMN ideological_alignment DECIMAL(5,2) DEFAULT 0.0, -- -100 (Progressive) to 100 (Conservative)
ADD COLUMN household_age_ticks BIGINT DEFAULT 0,
ADD COLUMN generational_memory JSONB DEFAULT '[]'::jsonb, -- Stores impactful events shaping ideology
ADD COLUMN life_expectancy_ticks BIGINT DEFAULT 43200; -- Approx 30 days of real-time ticks roughly equivalent to a generation

-- Expand Region Demographics for Census Analytics
ALTER TABLE region_demographics
ADD COLUMN avg_education DECIMAL(5,2) DEFAULT 50.0,
ADD COLUMN polarization_index DECIMAL(5,2) DEFAULT 0.0,
ADD COLUMN generational_cohort JSONB DEFAULT '{"GEN_1": 100}'::jsonb;

-- Overwrite Biological Decay RPC to include Aging, Birth, Death, and Ideology Drift
CREATE OR REPLACE FUNCTION process_biological_decay(p_tick_id BIGINT, p_region_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    -- 1. Standard Biological & Psychological Decay
    UPDATE households
    SET 
        base_hunger = GREATEST(0, base_hunger - 0.5),
        base_stamina = GREATEST(0, CASE WHEN current_action = 'SLEEPING' THEN base_stamina + 5.0 WHEN current_action = 'WORKING' THEN base_stamina - 2.0 ELSE base_stamina - 0.5 END),
        base_stress = LEAST(100, base_stress + CASE WHEN base_hunger < 30 THEN 3.0 WHEN base_hunger < 50 THEN 1.0 WHEN base_stamina < 20 THEN 2.0 WHEN critical_needs_met < 50 THEN 2.0 ELSE -0.5 END),
        household_age_ticks = household_age_ticks + 1,
        
        -- Demographic Drift: Ideology shifts slightly with education and high stress
        -- High education + high stress pushes towards progressive (-), Low education + high stress pushes conservative (+)
        ideological_alignment = GREATEST(-100, LEAST(100, ideological_alignment + 
            CASE 
                WHEN base_stress > 70 AND education_level > 60 THEN -0.5
                WHEN base_stress > 70 AND education_level < 40 THEN 0.5
                ELSE 0.0
            END
        ))
    WHERE (p_region_id IS NULL OR region_id = p_region_id);

    -- 2. Synthetic Census: Birth Rates
    -- Households with low stress and high stability grow
    UPDATE households
    SET headcount = headcount + 1
    WHERE (p_region_id IS NULL OR region_id = p_region_id)
      AND base_stress < 20 
      AND stability_needs_met >= 80 
      AND RANDOM() < 0.001; -- 0.1% chance per tick if conditions are perfect

    -- 3. Synthetic Census: Death Rates & Generational Shift
    -- Old households transfer to next generation, simulating death/inheritance
    UPDATE households
    SET 
        generation = generation + 1,
        household_age_ticks = 0,
        headcount = GREATEST(1, headcount - 1), -- Oldest passed away
        ideological_alignment = ideological_alignment * 0.8, -- Regression to mean on generational shift
        wealth = GREATEST(0, wealth * 0.9) -- Funerary/inheritance loss
    WHERE (p_region_id IS NULL OR region_id = p_region_id)
      AND (household_age_ticks > life_expectancy_ticks OR (base_hunger = 0 AND base_health = 0)); 
      
END;
$$ LANGUAGE plpgsql;

-- Overwrite Aggregator to include Education and Cohorts
CREATE OR REPLACE FUNCTION aggregate_region_demographics(p_tick_id BIGINT, p_region_id UUID)
RETURNS VOID AS $$
DECLARE
    v_total BIGINT;
    v_avg_stress DECIMAL(5,2);
    v_avg_trust DECIMAL(5,2);
    v_avg_edu DECIMAL(5,2);
    v_avg_ideo DECIMAL(5,2);
    v_unrest_pressure DECIMAL(5,2);
BEGIN
    SELECT 
        COALESCE(SUM(headcount), 0),
        COALESCE(AVG(base_stress), 0),
        COALESCE(AVG(government_trust), 50.0),
        COALESCE(AVG(education_level), 50.0),
        COALESCE(AVG(ideological_alignment), 0.0)
    INTO v_total, v_avg_stress, v_avg_trust, v_avg_edu, v_avg_ideo
    FROM households
    WHERE region_id = p_region_id;

    IF v_total = 0 THEN
        RETURN;
    END IF;

    v_unrest_pressure := GREATEST(0, v_avg_stress - (v_avg_trust / 2));

    INSERT INTO region_demographics (region_id, total_population, avg_stress, avg_trust, unrest_pressure, updated_tick_id, avg_education, polarization_index)
    VALUES (p_region_id, v_total, v_avg_stress, v_avg_trust, v_unrest_pressure, p_tick_id, v_avg_edu, ABS(v_avg_ideo) * 2.0)
    ON CONFLICT (region_id) 
    DO UPDATE SET 
        total_population = EXCLUDED.total_population,
        avg_stress = EXCLUDED.avg_stress,
        avg_trust = EXCLUDED.avg_trust,
        unrest_pressure = EXCLUDED.unrest_pressure,
        updated_tick_id = EXCLUDED.updated_tick_id,
        avg_education = EXCLUDED.avg_education,
        polarization_index = EXCLUDED.polarization_index;

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
                jsonb_build_object('unrest_pressure', v_unrest_pressure, 'avg_stress', v_avg_stress, 'ideological_alignment', v_avg_ideo),
                'Population_Aggregator',
                p_region_id,
                'HIGH_SOCIAL'
            );
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;
