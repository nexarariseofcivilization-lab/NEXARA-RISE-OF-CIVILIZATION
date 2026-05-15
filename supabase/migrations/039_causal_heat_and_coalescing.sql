-- 039_causal_heat_and_coalescing.sql

-- 1. Causal Heat Zones & Thermal Control
-- Replaces rigid tick fidelity with continuous thermal states
CREATE TABLE IF NOT EXISTS regional_causal_heat (
    region_id UUID PRIMARY KEY REFERENCES regions(id),
    thermal_state VARCHAR(20) DEFAULT 'WARM', -- COLD, WARM, HOT, CRITICAL
    packet_density_per_tick FLOAT DEFAULT 0.0,
    resonance_volatility FLOAT DEFAULT 0.0,
    last_state_change_tick BIGINT DEFAULT 0
);

-- Seed regional heat
INSERT INTO regional_causal_heat (region_id)
SELECT id FROM regions ON CONFLICT DO NOTHING;

-- 2. Semantic Materialization Rules
CREATE TABLE IF NOT EXISTS semantic_materialization_thresholds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type_pattern VARCHAR(100) NOT NULL,
    min_energy_threshold FLOAT NOT NULL DEFAULT 5.0,
    coalesce_target_event VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO semantic_materialization_thresholds (event_type_pattern, min_energy_threshold, coalesce_target_event) VALUES
('ECONOMY_PRICE_FLUCTUATION', 2.0, 'MARKET_INSTABILITY'),
('POPULATION_UNREST_MINOR', 5.0, 'SOCIAL_UNREST'),
('INFRA_MINOR_DECAY', 10.0, 'INFRA_COLLAPSE')
ON CONFLICT DO NOTHING;

-- 3. Mutation Coalescing (Simulated View/Stub)
-- In a real runtime, the dispatcher or hypervisor would run a coalescing algorithm
-- grouping similar PENDING packets and summing their vectors.
CREATE OR REPLACE FUNCTION coalesce_pending_mutations(p_tick_id BIGINT, p_region_id UUID)
RETURNS void AS $$
BEGIN
    -- Conceptual stub: We'd aggregate identical target_tables + actions into single packets.
    -- E.g., multiple "increase_unrest" -> one packet with summed intensity.
    -- This prevents the write-ahead log from choking on micro-mutations.
    NULL;
END;
$$ LANGUAGE plpgsql;

-- Evaluate Causal Heat
CREATE OR REPLACE FUNCTION evaluate_causal_heat(p_tick_id BIGINT)
RETURNS void AS $$
BEGIN
    -- Dynamically update thermal state based on active events and entropy
    UPDATE regional_causal_heat rh
    SET thermal_state = 
        CASE 
            WHEN (SELECT COUNT(*) FROM active_causal_events WHERE region_id = rh.region_id AND status = 'ACTIVE') > 10 THEN 'CRITICAL'
            WHEN (SELECT COUNT(*) FROM active_causal_events WHERE region_id = rh.region_id AND status = 'ACTIVE') > 5 THEN 'HOT'
            WHEN (SELECT COUNT(*) FROM active_causal_events WHERE region_id = rh.region_id AND status = 'ACTIVE') > 0 THEN 'WARM'
            ELSE 'COLD'
        END;
END;
$$ LANGUAGE plpgsql;
