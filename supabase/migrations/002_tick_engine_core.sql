-- 002_tick_engine_core.sql

-- ==========================================
-- 1. TICK ADVANCEMENT ENGINE
-- ==========================================
-- Advances the global narrative time, detects region drift, and handles event expiration
CREATE OR REPLACE FUNCTION advance_global_tick(tick_description VARCHAR DEFAULT 'Standard Tick')
RETURNS BIGINT AS $$
DECLARE
    new_tick_id BIGINT;
BEGIN
    -- 1. Create the new tick
    INSERT INTO global_ticks (description) VALUES (tick_description)
    RETURNING id INTO new_tick_id;

    -- 2. Validate Region Sync (detect drift)
    -- If a region hasn't processed its local events and updated its tick marker, it drifts.
    UPDATE region_state_current
    SET sync_status = 
        CASE 
            WHEN (new_tick_id - last_processed_tick_id) > 10 THEN 'DESYNCED'
            WHEN (new_tick_id - last_processed_tick_id) > 2 THEN 'DRIFTING'
            ELSE 'SYNCED'
        END;

    -- 3. Transition Expired Events in Queue to Dead Letter
    -- Ensures the event queue doesn't get infinitely backed up by unprocessable events
    INSERT INTO event_dead_letter (event_id, correlation_id, topic, region_id, payload, source, error_reason, failed_at_tick_id)
    SELECT id, correlation_id, topic, region_id, payload, source, 'TICK_EXPIRY_REACHED', new_tick_id
    FROM event_queue
    WHERE expiry_tick_id < new_tick_id AND status = 'PENDING';

    -- 4. Clean up expired events from active queue
    DELETE FROM event_queue
    WHERE expiry_tick_id < new_tick_id AND status = 'PENDING';

    -- 5. Return the new reality timestamp id
    RETURN new_tick_id;
END;
$$ LANGUAGE plpgsql;


-- ==========================================
-- 2. EVENT PUBLISHER
-- ==========================================
-- Formal contract for publishing to the event bus
CREATE OR REPLACE FUNCTION publish_event(
    p_topic VARCHAR,
    p_payload JSONB,
    p_source VARCHAR,
    p_region_id UUID DEFAULT NULL,
    p_priority_class VARCHAR DEFAULT 'NORMAL',
    p_idempotency_key VARCHAR DEFAULT NULL,
    p_correlation_id UUID DEFAULT NULL,
    p_causation_event_id UUID DEFAULT NULL,
    p_expires_in_ticks BIGINT DEFAULT 10
) RETURNS UUID AS $$
DECLARE
    new_event_id UUID;
    cur_tick BIGINT;
BEGIN
    -- Get current active tick
    SELECT MAX(id) INTO cur_tick FROM global_ticks;
    IF cur_tick IS NULL THEN cur_tick := 1; END IF;

    -- Insert into active orchestration queue
    INSERT INTO event_queue (
        topic, payload, source, region_id, priority_class, 
        idempotency_key, correlation_id, causation_event_id, expiry_tick_id
    ) VALUES (
        p_topic, p_payload, p_source, p_region_id, p_priority_class, 
        p_idempotency_key, p_correlation_id, p_causation_event_id, (cur_tick + p_expires_in_ticks)
    ) RETURNING id INTO new_event_id;

    RETURN new_event_id;
EXCEPTION 
    WHEN unique_violation THEN
        -- If idempotency_key triggers a duplicate, quietly return null or handle gracefully
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;


-- ==========================================
-- 3. EVENT ARCHIVER (Historical Migration)
-- ==========================================
-- Moves an event from the Active Queue to the Immutable Historical Log
CREATE OR REPLACE FUNCTION archive_event_to_history(
    p_event_id UUID, 
    p_retention_class VARCHAR DEFAULT 'EPHEMERAL'
) RETURNS BOOLEAN AS $$
DECLARE
    event_row event_queue%ROWTYPE;
    cur_tick BIGINT;
BEGIN
    SELECT MAX(id) INTO cur_tick FROM global_ticks;

    -- Lock the row for update to prevent race conditions
    SELECT * INTO event_row 
    FROM event_queue 
    WHERE id = p_event_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Move to immutable log
    INSERT INTO event_log (
        tick_id, correlation_id, causation_event_id, topic, 
        region_id, payload, source, retention_class
    ) VALUES (
        cur_tick, event_row.correlation_id, event_row.causation_event_id, event_row.topic,
        event_row.region_id, event_row.payload, event_row.source, p_retention_class
    );

    -- Remove from processing queue
    DELETE FROM event_queue WHERE id = p_event_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
