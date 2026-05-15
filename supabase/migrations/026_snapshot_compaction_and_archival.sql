-- 026_snapshot_compaction_and_archival.sql
-- Computational Storage Governance: Data Volume & Snapshot Economics

CREATE TABLE civilization_archival_epochs (
    id SERIAL PRIMARY KEY,
    epoch_name VARCHAR(100) NOT NULL,
    start_tick BIGINT NOT NULL,
    end_tick BIGINT NOT NULL,
    compaction_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COMPACTING, COMPACTED, COLD_STORAGE
    compressed_state_blob JSONB, -- The macroeconomic semantic summary
    total_events_compressed BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Archival Procedure: Aggregates detailed events into Semantic Chunks
CREATE OR REPLACE FUNCTION compact_historical_events(p_max_tick BIGINT, p_epoch_id INTEGER)
RETURNS VOID AS $$
DECLARE
    v_total_compressed BIGINT := 0;
    v_semantic_summary JSONB;
BEGIN
    SELECT COUNT(*) INTO v_total_compressed 
    FROM event_log 
    WHERE tick_id <= p_max_tick;

    -- Create summary (Simulated: In reality we would run a massive group by)
    SELECT jsonb_build_object(
        'compressed_events_count', v_total_compressed,
        'dominant_categories', (SELECT jsonb_agg(event_category) FROM (SELECT DISTINCT event_category FROM event_log WHERE tick_id <= p_max_tick LIMIT 5) as t),
        'summary_note', 'Historical data compacted into causal macro-blocks.'
    ) INTO v_semantic_summary;

    UPDATE civilization_archival_epochs
    SET compaction_status = 'COMPACTED',
        total_events_compressed = v_total_compressed,
        compressed_state_blob = v_semantic_summary
    WHERE id = p_epoch_id;

    -- Permanently Delete old high-resolution logs to save disk space
    -- We assume causal replay at this depth uses the Epoch Blob instead of granular events.
    DELETE FROM event_log WHERE tick_id <= p_max_tick;
    
END;
$$ LANGUAGE plpgsql;
