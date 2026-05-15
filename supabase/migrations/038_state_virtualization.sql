-- 038_state_virtualization.sql

-- 1. Virtualization Status Ledger
-- Tracks which regions or layers are currently compressed or fully materialized.
CREATE TABLE IF NOT EXISTS state_compression_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID REFERENCES regions(id),
    target_table VARCHAR(100),
    compression_status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'STATISTICAL_ABSTRACTION', 'FROZEN_COMPRESSED'
    compressed_payload JSONB,
    compression_ratio FLOAT DEFAULT 1.0,
    last_virtualized_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_woken_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(region_id, target_table)
);

-- 2. Semantic Event Merging (Low-Energy Event Compression)
-- Instead of evaluating 100 tiny perturbations, we merge them into one statistical modifier
CREATE TABLE IF NOT EXISTS low_energy_event_merges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID REFERENCES regions(id),
    merged_event_type VARCHAR(100) NOT NULL,
    constituent_event_count INT DEFAULT 0,
    accumulated_energy FLOAT DEFAULT 0.0,
    merged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stub function to simulate freezing a dormant region layer
CREATE OR REPLACE FUNCTION freeze_dormant_region_layer(p_region_id UUID, p_target_table VARCHAR(100))
RETURNS void AS $$
BEGIN
    INSERT INTO state_compression_registry (region_id, target_table, compression_status, compression_ratio, last_virtualized_at)
    VALUES (p_region_id, p_target_table, 'FROZEN_COMPRESSED', 0.05, NOW())
    ON CONFLICT (region_id, target_table) 
    DO UPDATE SET 
        compression_status = 'FROZEN_COMPRESSED',
        last_virtualized_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Stub function to wake a frozen layer
CREATE OR REPLACE FUNCTION wake_compressed_region_layer(p_region_id UUID, p_target_table VARCHAR(100))
RETURNS void AS $$
BEGIN
    UPDATE state_compression_registry
    SET compression_status = 'ACTIVE',
        last_woken_at = NOW()
    WHERE region_id = p_region_id AND target_table = p_target_table;
END;
$$ LANGUAGE plpgsql;
