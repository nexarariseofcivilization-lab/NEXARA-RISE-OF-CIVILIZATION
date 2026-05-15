-- 034_causal_propagation_and_sync.sql

-- Alter active_causal_events to support depth tracking
ALTER TABLE active_causal_events ADD COLUMN IF NOT EXISTS resonance_depth INT DEFAULT 0;

-- 1. Causal Propagation Limits
CREATE TABLE IF NOT EXISTS causal_propagation_limits (
    region_id UUID PRIMARY KEY REFERENCES regions(id),
    max_resonance_depth INT DEFAULT 5,
    energy_floor_threshold FLOAT DEFAULT 5.0,
    propagation_entropy_cap FLOAT DEFAULT 500.0,
    active_resonance_dampening FLOAT DEFAULT 0.1
);

-- 2. Causal Subscription Engine
CREATE TABLE IF NOT EXISTS causal_subscription_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_node VARCHAR(100) NOT NULL,
    target_layer VARCHAR(50) REFERENCES structural_layer_hierarchy(layer_name),
    event_type_pattern VARCHAR(100) NOT NULL,
    priority_order INT DEFAULT 100,
    required_fidelity VARCHAR(50) DEFAULT 'ANY',
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Temporal Causal Horizon
CREATE TABLE IF NOT EXISTS region_temporal_horizon (
    region_id UUID PRIMARY KEY REFERENCES regions(id),
    last_processed_tick BIGINT DEFAULT 0,
    locked_horizon_tick BIGINT DEFAULT 0,
    pending_future_events INT DEFAULT 0
);

-- 4. Semantic Event Gravity Wells
CREATE TABLE IF NOT EXISTS semantic_gravity_wells (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID REFERENCES regions(id),
    gravity_center_event_id UUID REFERENCES active_causal_events(id),
    semantic_theme VARCHAR(100) NOT NULL,
    absorbed_event_count INT DEFAULT 0,
    total_mass FLOAT DEFAULT 0.0,
    collapse_threshold FLOAT DEFAULT 1000.0,
    is_active BOOLEAN DEFAULT TRUE
);

-- Seed base limits & horizons
INSERT INTO causal_propagation_limits (region_id)
SELECT id FROM regions ON CONFLICT DO NOTHING;

INSERT INTO region_temporal_horizon (region_id)
SELECT id FROM regions ON CONFLICT DO NOTHING;

-- Seed basic subscriptions
INSERT INTO causal_subscription_registry (worker_node, target_layer, event_type_pattern, priority_order) VALUES
('ECONOMY_ENGINE', 'ECONOMY', 'MARKET_%', 10),
('POLITICS_ENGINE', 'POLITICS', 'POLICY_%', 20),
('POPULATION_ENGINE', 'POPULATION', 'DEMO_%', 30),
('WARFARE_ENGINE', 'PHYSICS', 'CONFLICT_%', 5),
('CULTURE_MYTH_ENGINE', 'MYTH', '%_SYMBOLISM', 90)
ON CONFLICT DO NOTHING;

-- Stub for semantic gravity processing
CREATE OR REPLACE FUNCTION process_semantic_gravity(p_tick_id BIGINT)
RETURNS void AS $$
BEGIN
    UPDATE semantic_gravity_wells 
    SET total_mass = total_mass + (absorbed_event_count * 0.1)
    WHERE is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Stub for Horizon Sync
CREATE OR REPLACE FUNCTION process_causal_horizon_sync(p_tick_id BIGINT)
RETURNS void AS $$
BEGIN
    UPDATE region_temporal_horizon
    SET last_processed_tick = p_tick_id,
        locked_horizon_tick = p_tick_id - 5 -- 5 ticks trailing lock
    WHERE last_processed_tick < p_tick_id;
END;
$$ LANGUAGE plpgsql;
