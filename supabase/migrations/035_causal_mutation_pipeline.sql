-- 035_causal_mutation_pipeline.sql

-- 1. Executor Operating Modes
-- Added to causal_subscription_registry to support worker duality
ALTER TABLE causal_subscription_registry ADD COLUMN IF NOT EXISTS operating_mode VARCHAR(20) DEFAULT 'LEGACY_SWEEP'; -- LEGACY_SWEEP, REACTIVE, HYBRID

-- 2. Mutation Packets (The Write-Ahead Log structure for deterministic state changes)
CREATE TABLE IF NOT EXISTS causal_mutation_packets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tick_id BIGINT NOT NULL,
    region_id UUID REFERENCES regions(id),
    source_event_id UUID REFERENCES active_causal_events(id),
    executor_node VARCHAR(100) NOT NULL,
    target_table VARCHAR(100) NOT NULL,
    target_record_id UUID,          -- Nullable for inserts or aggregate updates where payload defines it
    mutation_payload JSONB NOT NULL,
    fidelity_cost FLOAT DEFAULT 1.0,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, COMMITTED, REJECTED, ROLLED_BACK
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    committed_at TIMESTAMP WITH TIME ZONE
);

-- 3. Causal Commit Log (The formalized deterministic sequence of what happened)
CREATE TABLE IF NOT EXISTS causal_commit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tick_id BIGINT NOT NULL,
    mutation_packet_id UUID REFERENCES causal_mutation_packets(id),
    previous_state JSONB,
    new_state JSONB,
    commit_order BIGINT NOT NULL, -- Global sequence for deterministic replay
    committed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sequence for global commit ordering to avoid timestamp collisions
CREATE SEQUENCE IF NOT EXISTS causal_commit_order_seq;

-- 4. Subscription Isolation Domains
-- Define isolation boundaries so MYTH doesn't instantly blow up PHYSICS without passing through thresholds
CREATE TABLE IF NOT EXISTS causal_isolation_domains (
    domain_name VARCHAR(50) PRIMARY KEY, -- PHYSICAL, ECONOMIC, SOCIAL, CULTURAL, META
    max_cross_domain_resonance FLOAT DEFAULT 10.0,
    domain_entropy_cap FLOAT DEFAULT 1000.0
);

INSERT INTO causal_isolation_domains (domain_name, max_cross_domain_resonance) VALUES
('PHYSICAL', 20.0),
('ECONOMIC', 50.0),
('SOCIAL', 80.0),
('CULTURAL', 100.0),
('META', 5.0)
ON CONFLICT DO NOTHING;

-- Map layers to domains in the hierarchy
ALTER TABLE structural_layer_hierarchy ADD COLUMN IF NOT EXISTS isolation_domain VARCHAR(50) REFERENCES causal_isolation_domains(domain_name);

UPDATE structural_layer_hierarchy SET isolation_domain = 'PHYSICAL' WHERE layer_name = 'PHYSICS' OR layer_name = 'INFRASTRUCTURE';
UPDATE structural_layer_hierarchy SET isolation_domain = 'ECONOMIC' WHERE layer_name = 'ECONOMY';
UPDATE structural_layer_hierarchy SET isolation_domain = 'SOCIAL'   WHERE layer_name = 'POPULATION' OR layer_name = 'POLITICS';
UPDATE structural_layer_hierarchy SET isolation_domain = 'CULTURAL' WHERE layer_name = 'CULTURE' OR layer_name = 'MYTH';

-- Helper to safely orchestrate commits
CREATE OR REPLACE FUNCTION orchestrate_mutation_commit(p_packet_id UUID, p_tick_id BIGINT)
RETURNS boolean AS $$
DECLARE
    v_packet causal_mutation_packets%ROWTYPE;
BEGIN
    SELECT * INTO v_packet FROM causal_mutation_packets WHERE id = p_packet_id AND status = 'PENDING';
    IF NOT FOUND THEN RETURN false; END IF;

    -- In a full implementation, we actually execute dynamic SQL using v_packet.target_table
    -- and v_packet.mutation_payload.
    -- For now, we simulate success and insert into the commit log.

    INSERT INTO causal_commit_log (tick_id, mutation_packet_id, commit_order)
    VALUES (p_tick_id, p_packet_id, nextval('causal_commit_order_seq'));

    UPDATE causal_mutation_packets SET status = 'COMMITTED', committed_at = NOW() WHERE id = p_packet_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;
