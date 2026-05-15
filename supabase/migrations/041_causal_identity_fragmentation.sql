-- 041_causal_identity_fragmentation.sql

-- 1. Epistemic Divergence Tracker
-- Tracks how much a region's accepted reality deviates from the global objective truth
CREATE TABLE IF NOT EXISTS regional_epistemic_divergence (
    region_id UUID PRIMARY KEY REFERENCES regions(id),
    divergence_score FLOAT DEFAULT 0.0, -- 0.0 = Objective reality, 100.0 = Complete hallucination/myth
    dominant_narrative_filter VARCHAR(100) DEFAULT 'OBJECTIVE',
    last_reality_fracture_tick BIGINT DEFAULT 0
);

-- Seed defaults
INSERT INTO regional_epistemic_divergence (region_id)
SELECT id FROM regions ON CONFLICT DO NOTHING;

-- 2. Historical Subjectivity (Fragmented Reality)
-- Allows an objective causal commit to have multiple subjective interpretations
CREATE TABLE IF NOT EXISTS historical_event_interpretations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commit_id UUID REFERENCES causal_commit_log(id),
    region_id UUID REFERENCES regions(id),
    faction_id UUID REFERENCES test_factions(id), -- optional
    subjective_narrative TEXT NOT NULL,
    propaganda_distortion_factor FLOAT DEFAULT 1.0, 
    believer_count BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stub function for propagating epistemic divergence
CREATE OR REPLACE FUNCTION process_epistemic_divergence(p_tick_id BIGINT)
RETURNS void AS $$
BEGIN
    -- Increase divergence where myth or unrest is high
    -- This is a conceptual stub. In full implementation, it reads social_perception tables.
    UPDATE regional_epistemic_divergence
    SET divergence_score = LEAST(100.0, divergence_score + 0.05)
    WHERE region_id IN (
        SELECT region_id FROM regional_causal_heat WHERE thermal_state IN ('HOT', 'CRITICAL')
    );
END;
$$ LANGUAGE plpgsql;
