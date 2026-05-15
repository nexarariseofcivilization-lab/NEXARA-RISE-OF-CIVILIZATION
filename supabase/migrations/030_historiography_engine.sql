-- 030_historiography_engine.sql
-- Semantic Compression & Synthetic Historian Layer

CREATE TABLE historical_syntheses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    epoch_id INTEGER REFERENCES civilization_archival_epochs(id) ON DELETE CASCADE,
    region_id UUID REFERENCES regions(id), -- If NULL, this is a global synthesis
    
    era_name VARCHAR(255) NOT NULL, -- e.g., "The Dark Winter", "The Great Fragmentation"
    
    primary_causes JSONB NOT NULL, -- e.g., ["Agricultural collapse", "Power grid sabotage"]
    structural_narrative TEXT NOT NULL, -- Sentences describing the structural breakdown/rise
    dominant_factions JSONB,
    
    generated_at_tick BIGINT REFERENCES global_ticks(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for historiography queries
CREATE INDEX idx_historiography_region_epoch ON historical_syntheses(region_id, epoch_id);

-- Simulate the Historiography Engine extracting meaning from raw data.
-- In a real distributed system, a specialized worker (semantic indexer) would run this.
CREATE OR REPLACE FUNCTION generate_era_synthesis(p_epoch_id INTEGER, p_max_tick BIGINT)
RETURNS UUID AS $$
DECLARE
    v_syn_id UUID;
BEGIN
    -- Fallback/Mock synthesis logic based on constraints
    -- In production, this might summarize dominant unrest events or invoke an LLM/semantic processor out-of-band
    INSERT INTO historical_syntheses (epoch_id, era_name, primary_causes, structural_narrative, dominant_factions, generated_at_tick)
    VALUES (
        p_epoch_id,
        'Era of Instability ' || p_epoch_id,
        '["Systemic load shed", "Hypervisor intervention", "Cross-shard friction"]'::jsonb,
        'During this epoch, the federation experienced intense computational and structural decay, leading to strict enforcement of degradation protocols. Several regional borders became highly frictioned.',
        '["TECHNOCRATS", "SURVIVALISTS"]'::jsonb,
        p_max_tick
    ) RETURNING id INTO v_syn_id;

    RETURN v_syn_id;
END;
$$ LANGUAGE plpgsql;

-- Overwrite compact_historical_events from 026 to wire up the historiography engine
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

    -- Trigger the semantic historian to synthesize the era
    PERFORM generate_era_synthesis(p_epoch_id, p_max_tick);

    -- Permanently Delete old high-resolution logs to save disk space
    -- We assume causal replay at this depth uses the Epoch Blob instead of granular events.
    DELETE FROM event_log WHERE tick_id <= p_max_tick;
END;
$$ LANGUAGE plpgsql;
