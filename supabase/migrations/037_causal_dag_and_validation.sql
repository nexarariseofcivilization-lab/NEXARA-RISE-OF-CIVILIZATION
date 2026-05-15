-- 037_causal_dag_and_validation.sql

-- 1. Executor Dependency Topology (DAG)
CREATE TABLE IF NOT EXISTS executor_dependency_graph (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    executor_node VARCHAR(100) NOT NULL,
    depends_on_node VARCHAR(100) NOT NULL,
    dependency_type VARCHAR(20) DEFAULT 'HARD', -- HARD, SOFT, CAUSAL
    max_tick_lag INT DEFAULT 0
);

-- Seed basic DAG
INSERT INTO executor_dependency_graph (executor_node, depends_on_node, dependency_type) VALUES
('EconomyNode', 'InfrastructureNode', 'HARD'),
('PopulationNode', 'EconomyNode', 'SOFT'),
('PoliticalNode', 'PopulationNode', 'SOFT'),
('FactionNode', 'PoliticalNode', 'SOFT')
ON CONFLICT DO NOTHING;

-- 2. Mutation Validation Kernel constraints
CREATE TABLE IF NOT EXISTS mutation_validation_constraints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_table VARCHAR(100) NOT NULL,
    constraint_type VARCHAR(50) NOT NULL, -- BOUNDS, ENTROPY, CONSTITUTIONAL
    constraint_payload JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Seed basic constraints
INSERT INTO mutation_validation_constraints (target_table, constraint_type, constraint_payload) VALUES
('regional_market', 'BOUNDS', '{"max_price_spike_pct": 500, "min_supply_cap": 0}'),
('region_state_current', 'ENTROPY', '{"max_entropy_delta_per_tick": 50}'),
('region_state_current', 'CONSTITUTIONAL', '{"blocked_actions": ["MARTIAL_LAW_WITHOUT_CRISIS"]}')
ON CONFLICT DO NOTHING;

-- Stub for validating mutation packets before arbitration
CREATE OR REPLACE FUNCTION validate_causal_mutations(p_tick_id BIGINT, p_region_id UUID)
RETURNS void AS $$
BEGIN
    -- This function evaluates PENDING packets against mutation_validation_constraints.
    -- Violating packets are marked as REJECTED_VALIDATION.
    
    -- Pseudo-implementation: Reject packets with excessive fidelity/entropy cost
    UPDATE causal_mutation_packets
    SET status = 'REJECTED_VALIDATION'
    WHERE status = 'PENDING'
      AND tick_id = p_tick_id
      AND region_id = p_region_id
      AND fidelity_cost > 10.0; -- Exceeds hardcoded safety bound for now
END;
$$ LANGUAGE plpgsql;
