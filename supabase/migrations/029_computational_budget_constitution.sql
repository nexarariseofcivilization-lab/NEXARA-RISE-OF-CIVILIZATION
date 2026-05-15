-- 029_computational_budget_constitution.sql
-- Computational Constitution: Governing the Simulation Engine Itself

-- Add Hypervisor / Engine execution limits to the constitution to ensure survivability
ALTER TABLE simulation_constitution 
ADD COLUMN engine_max_events_per_tick INTEGER DEFAULT 5000,
ADD COLUMN engine_snapshot_compaction_threshold BIGINT DEFAULT 10000,
ADD COLUMN engine_transit_queue_max_depth INTEGER DEFAULT 2000,
ADD COLUMN engine_throttle_cpu_budget BOOLEAN DEFAULT true;

-- Active resource accounting for the simulation engine runtime to shed loads explicitly
CREATE TABLE engine_computational_budget (
    id SERIAL PRIMARY KEY,
    current_tick_id BIGINT REFERENCES global_ticks(id),
    events_in_queue INTEGER DEFAULT 0,
    transit_items_in_flight INTEGER DEFAULT 0,
    db_load_metric DECIMAL(5,2) DEFAULT 0.0, -- Proxy metric indicating system stress
    is_cpu_throttled BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO engine_computational_budget (id) VALUES (1);

-- Metric update function that acts as an OS kernel resource sampler
CREATE OR REPLACE FUNCTION sample_engine_budget(p_tick_id BIGINT)
RETURNS VOID AS $$
DECLARE
    v_events INT;
    v_transit INT;
    v_constitution RECORD;
BEGIN
    SELECT COUNT(*) INTO v_events FROM event_log WHERE tick_id = p_tick_id;
    SELECT COUNT(*) INTO v_transit FROM cross_shard_transit_queue WHERE status = 'IN_TRANSIT';
    SELECT * INTO v_constitution FROM simulation_constitution WHERE id = 1;

    UPDATE engine_computational_budget
    SET current_tick_id = p_tick_id,
        events_in_queue = v_events,
        transit_items_in_flight = v_transit,
        is_cpu_throttled = CASE WHEN v_constitution.engine_throttle_cpu_budget = TRUE 
                                AND (v_events > v_constitution.engine_max_events_per_tick OR v_transit > v_constitution.engine_transit_queue_max_depth) THEN TRUE ELSE FALSE END,
        updated_at = NOW()
    WHERE id = 1;
END;
$$ LANGUAGE plpgsql;
