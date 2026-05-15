-- 001_world_foundation.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. GLOBAL TIME AUTHORITY
-- ==========================================
CREATE TABLE global_ticks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tick_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    description VARCHAR(255)
);

-- ==========================================
-- 2. WORLD PARAMETERS
-- ==========================================
-- Stores global configurations and parameters (e.g. global weather modifier, base trade rates)
CREATE TABLE world_parameters (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_tick_id BIGINT REFERENCES global_ticks(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. REGION HIERARCHY (SHARDING ENGINE)
-- ==========================================
-- Defines simulation boundaries and hierarchies
CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    parent_region_id UUID REFERENCES regions(id),
    authority_scope VARCHAR(50) NOT NULL, -- e.g., 'GLOBAL', 'FEDERAL', 'PROVINCE', 'DISTRICT'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, parent_region_id)
);

-- ==========================================
-- 4. CURRENT REGION STATE & CLOCK DRIFT
-- ==========================================
-- The live reality of a region. Mutated by Simulation Engines.
CREATE TABLE region_state_current (
    region_id UUID PRIMARY KEY REFERENCES regions(id) ON DELETE CASCADE,
    last_processed_tick_id BIGINT REFERENCES global_ticks(id),
    sync_status VARCHAR(50) DEFAULT 'SYNCED', -- 'SYNCED', 'DRIFTING', 'DESYNCED'
    population BIGINT DEFAULT 0,
    wealth_index DECIMAL(10,2) DEFAULT 50.0,
    stability_index DECIMAL(10,2) DEFAULT 80.0,
    infrastructure_health DECIMAL(10,2) DEFAULT 100.0,
    unrest_level DECIMAL(10,2) DEFAULT 0.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 5. REGION STATE SNAPSHOTS
-- ==========================================
-- Lightweight and Full snapshots for temporal history and debugging
CREATE TABLE region_state_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    tick_id BIGINT REFERENCES global_ticks(id) ON DELETE CASCADE,
    snapshot_type VARCHAR(50) NOT NULL, -- 'TICK_DELTA', 'HOURLY_FULL', 'DAILY_ARCHIVE', 'ERA'
    state_data JSONB NOT NULL, -- Stores a frozen copy or delta of region_state_current + economy + etc
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optimization: querying snapshots by region and tick order
CREATE INDEX idx_region_snapshots ON region_state_snapshots (region_id, tick_id DESC);

-- ==========================================
-- 6. EVENT BUS LOG (HISTORICAL BLOODSTREAM)
-- ==========================================
-- Append-only. No updates allowed.
CREATE TABLE event_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tick_id BIGINT REFERENCES global_ticks(id),
    correlation_id UUID, -- Groups related events in a cascade
    causation_event_id UUID REFERENCES event_log(id), -- The event that triggered this event
    topic VARCHAR(255) NOT NULL,
    region_id UUID REFERENCES regions(id), -- Nullable for global events
    payload JSONB NOT NULL,
    source VARCHAR(255) NOT NULL, -- e.g., 'Economy_Worker', 'Infrastructure_Node'
    retention_class VARCHAR(50) DEFAULT 'EPHEMERAL', -- 'PERMANENT', 'DEGRADABLE', 'EPHEMERAL'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_event_log_tick ON event_log (tick_id DESC);
CREATE INDEX idx_event_log_topic ON event_log(topic);
CREATE INDEX idx_event_log_region ON event_log(region_id);
CREATE INDEX idx_event_log_correlation ON event_log(correlation_id);

-- Enforce Append-Only via Trigger
CREATE OR REPLACE FUNCTION prevent_event_log_update()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Updates to event_log are strictly forbidden to ensure historical integrity.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_event_log_no_update
    BEFORE UPDATE ON event_log
    FOR EACH ROW
    EXECUTE FUNCTION prevent_event_log_update();

CREATE OR REPLACE FUNCTION prevent_event_log_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Deletes from event_log are strictly forbidden.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_event_log_no_delete
    BEFORE DELETE ON event_log
    FOR EACH ROW
    EXECUTE FUNCTION prevent_event_log_delete();

-- ==========================================
-- 7. EVENT QUEUE (ACTIVE ORCHESTRATION)
-- ==========================================
-- Transient table for active processing
CREATE TABLE event_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idempotency_key VARCHAR(255) UNIQUE, -- Prevent double processing
    correlation_id UUID,
    causation_event_id UUID,
    topic VARCHAR(255) NOT NULL,
    region_id UUID REFERENCES regions(id),
    payload JSONB NOT NULL,
    source VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'PROCESSING'
    retry_count INT DEFAULT 0,
    priority_class VARCHAR(50) DEFAULT 'NORMAL', -- 'CRITICAL_SYSTEM', 'CRITICAL_SOCIAL', 'HIGH_ECONOMIC', 'NORMAL', 'LOW_PRIORITY'
    expiry_tick_id BIGINT REFERENCES global_ticks(id), -- If tick surpasses this, event may be dropped or dead-lettered
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_event_queue_priority ON event_queue(priority_class, created_at ASC);
CREATE INDEX idx_event_queue_status ON event_queue(status);

-- ==========================================
-- 8. EVENT DEAD LETTER QUEUE
-- ==========================================
-- Failed event processing bucket for manual intervention or forensic analysis
CREATE TABLE event_dead_letter (
    event_id UUID PRIMARY KEY, -- Inherited from event_queue id
    topic VARCHAR(255) NOT NULL,
    correlation_id UUID,
    region_id UUID REFERENCES regions(id),
    payload JSONB NOT NULL,
    source VARCHAR(255) NOT NULL,
    error_reason TEXT NOT NULL,
    failed_at_tick_id BIGINT REFERENCES global_ticks(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
