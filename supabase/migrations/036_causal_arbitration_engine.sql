-- 036_causal_arbitration_engine.sql

-- 1. Arbitration Rulesets (Authority Hierarchy)
CREATE TABLE IF NOT EXISTS causal_arbitration_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain VARCHAR(50) NOT NULL REFERENCES causal_isolation_domains(domain_name),
    target_table VARCHAR(100) NOT NULL,
    winning_executor_pattern VARCHAR(100) NOT NULL,
    legitimacy_weight FLOAT DEFAULT 1.0,
    entropy_tax FLOAT DEFAULT 0.0,
    temporal_priority VARCHAR(20) DEFAULT 'LATEST', -- 'LATEST', 'EARLIEST', 'HIGHEST_FIDELITY'
    is_active BOOLEAN DEFAULT TRUE
);

-- Seed basic arbitration rules
INSERT INTO causal_arbitration_rules (domain, target_table, winning_executor_pattern, legitimacy_weight, entropy_tax) VALUES
('ECONOMIC', 'regional_market', 'GovernmentSubsidyExecutor', 2.0, 5.0),
('ECONOMIC', 'regional_market', 'EconomyWorker', 1.0, 0.5),
('SOCIAL', 'region_state_current', 'MartialLawExecutor', 5.0, 20.0),
('SOCIAL', 'region_state_current', 'PopulationWorker', 1.0, 1.0)
ON CONFLICT DO NOTHING;

-- 2. Mutation Conflict Log 
CREATE TABLE IF NOT EXISTS causal_mutation_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tick_id BIGINT NOT NULL,
    region_id UUID REFERENCES regions(id),
    target_table VARCHAR(100) NOT NULL,
    target_record_id UUID,
    winning_packet_id UUID REFERENCES causal_mutation_packets(id),
    losing_packet_id UUID REFERENCES causal_mutation_packets(id),
    resolution_reason VARCHAR(255),
    resolved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Modify orchestrate_mutation_commit to use arbitration
-- Note: A real implementation would group packets by table/record and run arbitration.
-- For this baseline, we add a stub for arbitration evaluation.

CREATE OR REPLACE FUNCTION evaluate_causal_arbitration(p_tick_id BIGINT, p_region_id UUID)
RETURNS void AS $$
DECLARE
    -- Here we would look for multiple PENDING packets targeting the same table + record
BEGIN
    -- This is a procedural stub. In reality, it groups by target_table and target_record_id.
    -- Then applies causal_arbitration_rules to find the winner.
    -- The losers are marked 'REJECTED' instead of 'COMMITTED'.
    -- The winner is retained as 'PENDING' for orchestrate_mutation_commit to pick up.
    
    -- Example logic:
    UPDATE causal_mutation_packets cmp1
    SET status = 'REJECTED'
    WHERE status = 'PENDING'
      AND tick_id = p_tick_id
      AND region_id = p_region_id
      AND EXISTS (
          SELECT 1 FROM causal_mutation_packets cmp2
          WHERE cmp2.status = 'PENDING'
            AND cmp2.tick_id = p_tick_id
            AND cmp2.region_id = p_region_id
            AND cmp2.target_table = cmp1.target_table
            AND cmp2.target_record_id = cmp1.target_record_id
            AND cmp2.id != cmp1.id
            AND cmp2.fidelity_cost > cmp1.fidelity_cost -- Naive arbitration: highest cost wins
      );

END;
$$ LANGUAGE plpgsql;
