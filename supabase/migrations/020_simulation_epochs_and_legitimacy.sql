-- 020_simulation_epochs_and_legitimacy.sql

-- 1. Deterministic Randomness Registry
CREATE TABLE region_entropy_seeds (
    region_id UUID PRIMARY KEY REFERENCES regions(id) ON DELETE CASCADE,
    current_seed BIGINT NOT NULL DEFAULT 123456789,
    permutation_count BIGINT DEFAULT 0
);

INSERT INTO region_entropy_seeds (region_id)
SELECT id FROM regions ON CONFLICT DO NOTHING;

-- Custom deterministic random func (Linear Congruential Generator for simplicity in SQL)
CREATE OR REPLACE FUNCTION deterministic_random(p_region_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_seed BIGINT;
    v_a BIGINT := 1664525;
    v_c BIGINT := 1013904223;
    v_m BIGINT := 4294967296; -- 2^32
    v_next_seed BIGINT;
    v_result DECIMAL;
BEGIN
    SELECT current_seed INTO v_seed FROM region_entropy_seeds WHERE region_id = p_region_id;
    IF v_seed IS NULL THEN
        RETURN RANDOM(); -- Fallback
    END IF;
    
    v_next_seed := (v_a * v_seed + v_c) % v_m;
    
    UPDATE region_entropy_seeds 
    SET current_seed = v_next_seed, permutation_count = permutation_count + 1 
    WHERE region_id = p_region_id;
    
    v_result := v_next_seed::DECIMAL / v_m::DECIMAL;
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 2. Versioned Constitutional Epochs
CREATE TABLE simulation_epochs (
    id SERIAL PRIMARY KEY,
    start_tick_id BIGINT REFERENCES global_ticks(id),
    end_tick_id BIGINT REFERENCES global_ticks(id), -- NULL if current
    epoch_name VARCHAR(100) NOT NULL,
    constitution_blob JSONB NOT NULL,
    legitimacy_cost DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Operational Legitimacy
-- Admin actions cost institutional trust globally.
ALTER TABLE simulation_constitution
ADD COLUMN admin_legitimacy DECIMAL(5,2) DEFAULT 100.0;

-- Function to transition epochs
CREATE OR REPLACE FUNCTION transition_simulation_epoch(
    p_new_name VARCHAR(100), 
    p_legitimacy_cost DECIMAL
)
RETURNS VOID AS $$
DECLARE
    v_current_tick BIGINT;
BEGIN
    SELECT COALESCE(MAX(id), 1) INTO v_current_tick FROM global_ticks;

    -- Close current epoch
    UPDATE simulation_epochs
    SET end_tick_id = v_current_tick
    WHERE end_tick_id IS NULL;

    -- Open new epoch
    INSERT INTO simulation_epochs (start_tick_id, epoch_name, constitution_blob, legitimacy_cost)
    VALUES (
        v_current_tick,
        p_new_name,
        (SELECT row_to_json(sc)::jsonb FROM simulation_constitution sc WHERE id = 1),
        p_legitimacy_cost
    );

    -- Apply legitimacy penalty
    UPDATE simulation_constitution
    SET admin_legitimacy = GREATEST(0, admin_legitimacy - p_legitimacy_cost)
    WHERE id = 1;
    
    -- Global trust shock based on legitimacy cost (Admin intervention disturbs natural order)
    IF p_legitimacy_cost > 0 THEN
        UPDATE government_treasury
        SET institutional_trust = GREATEST(0, institutional_trust - (p_legitimacy_cost / 10.0));
        
        UPDATE region_demographics
        SET avg_stress = LEAST(100, avg_stress + (p_legitimacy_cost / 5.0));
    END IF;
    
    PERFORM publish_event(
        'SYSTEM.EPOCH_TRANSITION',
        jsonb_build_object('new_epoch', p_new_name, 'trust_shock', p_legitimacy_cost),
        'Constitution_Core',
        NULL,
        'CRITICAL'
    );
END;
$$ LANGUAGE plpgsql;

-- Seed initial epoch
SELECT transition_simulation_epoch('GENESIS_ERA', 0.0);
