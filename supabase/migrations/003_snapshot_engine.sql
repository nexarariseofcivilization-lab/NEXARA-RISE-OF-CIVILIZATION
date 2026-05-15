-- 003_snapshot_engine.sql

-- ==========================================
-- REGION SNAPSHOT ENGINE
-- ==========================================
-- Creates a point-in-time snapshot of the current realities
CREATE OR REPLACE FUNCTION trigger_region_snapshot(
    p_region_id UUID, 
    p_snapshot_type VARCHAR DEFAULT 'TICK_DELTA'
)
RETURNS UUID AS $$
DECLARE
    new_snapshot_id UUID;
    cur_tick BIGINT;
    region_data JSONB;
BEGIN
    SELECT MAX(id) INTO cur_tick FROM global_ticks;

    -- Serialize current region state into JSONB
    SELECT row_to_json(rsc.*)::jsonb INTO region_data
    FROM region_state_current rsc
    WHERE region_id = p_region_id;

    IF region_data IS NULL THEN
        RETURN NULL;
    END IF;

    -- Insert snapshot
    INSERT INTO region_state_snapshots (
        region_id, tick_id, snapshot_type, state_data
    ) VALUES (
        p_region_id, cur_tick, p_snapshot_type, region_data
    ) RETURNING id INTO new_snapshot_id;

    RETURN new_snapshot_id;
END;
$$ LANGUAGE plpgsql;
