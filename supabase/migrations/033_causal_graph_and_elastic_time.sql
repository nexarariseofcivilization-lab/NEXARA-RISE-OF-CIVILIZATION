-- 033_causal_graph_and_elastic_time.sql

-- 1. Temporal Elasticity
CREATE TABLE IF NOT EXISTS region_temporal_elasticity (
    region_id UUID PRIMARY KEY REFERENCES regions(id),
    state_classification VARCHAR(50) DEFAULT 'STABLE', -- STABLE, CHAOTIC, CONFLICT, COLLAPSING, DORMANT
    tick_resolution_target INT DEFAULT 30, -- how often to process (1 = realtime, 30 = slow)
    current_tick_modulo INT DEFAULT 0,
    elasticity_momentum FLOAT DEFAULT 0.0,
    last_state_transition_tick BIGINT
);

-- 2. Structural Layer Hierarchy
CREATE TABLE IF NOT EXISTS structural_layer_hierarchy (
    layer_level INT PRIMARY KEY,
    layer_name VARCHAR(50) UNIQUE NOT NULL, -- PHYSICS, INFRASTRUCTURE, ECONOMY, POPULATION, POLITICS, CULTURE, MYTH
    base_resonance_capacity FLOAT NOT NULL,
    downstream_damping_factor FLOAT NOT NULL
);

INSERT INTO structural_layer_hierarchy (layer_level, layer_name, base_resonance_capacity, downstream_damping_factor) VALUES
(1, 'PHYSICS', 100.0, 0.1),
(2, 'INFRASTRUCTURE', 80.0, 0.2),
(3, 'ECONOMY', 60.0, 0.4),
(4, 'POPULATION', 50.0, 0.5),
(5, 'POLITICS', 40.0, 0.6),
(6, 'CULTURE', 30.0, 0.8),
(7, 'MYTH', 100.0, 0.9)
ON CONFLICT (layer_level) DO NOTHING;

-- 3. Event Energy Model (Active Causal Events)
CREATE TABLE IF NOT EXISTS active_causal_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID REFERENCES regions(id),
    layer_name VARCHAR(50) REFERENCES structural_layer_hierarchy(layer_name),
    event_type VARCHAR(100) NOT NULL,
    root_cause_id UUID REFERENCES active_causal_events(id),
    energy_level FLOAT NOT NULL DEFAULT 100.0,
    decay_rate_per_tick FLOAT NOT NULL DEFAULT 1.0,
    resonance_factor FLOAT NOT NULL DEFAULT 0.1,
    reactivation_threshold FLOAT NOT NULL DEFAULT 20.0,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, DORMANT, EXHAUSTED
    started_at_tick BIGINT NOT NULL,
    last_resonance_tick BIGINT
);

-- 4. Civilization Identity Genome
CREATE TABLE IF NOT EXISTS civilization_identity_genome (
    region_id UUID PRIMARY KEY REFERENCES regions(id),
    dominant_archetype VARCHAR(100) DEFAULT 'UNDEFINED',
    historical_trauma_index FLOAT DEFAULT 0.0,
    continuity_cohesion FLOAT DEFAULT 100.0,
    adaptation_bias VARCHAR(50) DEFAULT 'NEUTRAL',
    last_updated_tick BIGINT
);

-- Seed defaults
INSERT INTO region_temporal_elasticity (region_id)
SELECT id FROM regions
ON CONFLICT DO NOTHING;

INSERT INTO civilization_identity_genome (region_id)
SELECT id FROM regions
ON CONFLICT DO NOTHING;

-- Function to evaluate and update temporal elasticity based on region health
CREATE OR REPLACE FUNCTION evaluate_temporal_elasticity(p_tick_id BIGINT)
RETURNS void AS $$
DECLARE
    r_record RECORD;
    v_demography RECORD;
    v_infra RECORD;
    v_classification VARCHAR(50);
    v_resolution INT;
BEGIN
    FOR r_record IN SELECT * FROM region_temporal_elasticity LOOP
        
        -- Get latest metrics
        SELECT * INTO v_demography FROM demographic_strata WHERE region_id = r_record.region_id LIMIT 1;
        SELECT * INTO v_infra FROM regions WHERE id = r_record.region_id;
        
        -- Default to STABLE
        v_classification := 'STABLE';
        v_resolution := 30; -- Process every 30 ticks
        
        -- Check for Conflict
        IF EXISTS (SELECT 1 FROM systemic_conflicts WHERE (source_region_id = r_record.region_id OR target_region_id = r_record.region_id) AND status = 'ACTIVE') THEN
            v_classification := 'CONFLICT';
            v_resolution := 1; -- Realtime
        -- Check for Collapse
        ELSIF v_infra IS NOT NULL AND v_infra.infrastructure_health < 30 OR (v_demography IS NOT NULL AND v_demography.unrest_pressure > 80) THEN
            v_classification := 'COLLAPSING';
            v_resolution := 2; -- High fidelity
        -- Check for Chaos
        ELSIF v_infra IS NOT NULL AND v_infra.infrastructure_health < 60 OR (v_demography IS NOT NULL AND v_demography.avg_stress > 60) THEN
            v_classification := 'CHAOTIC';
            v_resolution := 5; -- Medium fidelity
        END IF;
        
        -- Update
        UPDATE region_temporal_elasticity
        SET 
            state_classification = v_classification,
            tick_resolution_target = v_resolution,
            current_tick_modulo = p_tick_id % v_resolution
        WHERE region_id = r_record.region_id;
        
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Event Resonance Engine
CREATE OR REPLACE FUNCTION process_causal_resonance(p_tick_id BIGINT)
RETURNS void AS $$
BEGIN
    -- 1. Apply Natural Decay
    UPDATE active_causal_events
    SET 
        energy_level = energy_level - decay_rate_per_tick
    WHERE status = 'ACTIVE';
    
    -- 2. Mark Exhausted
    UPDATE active_causal_events
    SET status = 'EXHAUSTED'
    WHERE energy_level <= 0 AND status = 'ACTIVE';
    
    -- 3. Evaluate Dormancy Reactivation (if energy somehow spiked due to external factors, or if resonance pushes it up)
    UPDATE active_causal_events
    SET status = 'ACTIVE',
        last_resonance_tick = p_tick_id
    WHERE status = 'DORMANT' AND energy_level > reactivation_threshold;

    -- Cross-layer resonance mapping could go here. 
    -- For now, we perform a straightforward transfer of energy occasionally.
END;
$$ LANGUAGE plpgsql;

-- Inject a seed event to kick off causality for testing
CREATE OR REPLACE FUNCTION seed_initial_causal_events(p_tick_id BIGINT)
RETURNS void AS $$
DECLARE
    v_region UUID;
BEGIN
    SELECT id INTO v_region FROM regions LIMIT 1;
    IF v_region IS NOT NULL THEN
        INSERT INTO active_causal_events (region_id, layer_name, event_type, energy_level, decay_rate_per_tick, status, started_at_tick)
        VALUES (v_region, 'PHYSICS', 'POWER_BLACKOUT', 80.0, 2.0, 'ACTIVE', p_tick_id);
    END IF;
END;
$$ LANGUAGE plpgsql;
