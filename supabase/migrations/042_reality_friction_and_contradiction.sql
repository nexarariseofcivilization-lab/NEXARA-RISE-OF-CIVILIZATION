-- 042_reality_friction_and_contradiction.sql

-- 1. Reality Friction / Epistemic Tension
-- Tracks the tension between the accepted narrative (dogma) and underlying physical reality.
CREATE TABLE IF NOT EXISTS regional_reality_friction (
    region_id UUID PRIMARY KEY REFERENCES regions(id),
    physical_deficit_score FLOAT DEFAULT 0.0,         -- tracks objective survival failures (starvation, blackout)
    narrative_delusion_score FLOAT DEFAULT 0.0,       -- magnitude of forced positive narrative
    cognitive_dissonance_pressure FLOAT DEFAULT 0.0,  -- tension between the two
    last_reality_snap_tick BIGINT DEFAULT 0
);

INSERT INTO regional_reality_friction (region_id)
SELECT id FROM regions ON CONFLICT DO NOTHING;

-- 2. Stub for Reality Friction processing
CREATE OR REPLACE FUNCTION process_reality_friction(p_tick_id BIGINT, p_region_id UUID)
RETURNS void AS $$
BEGIN
    -- Increase dissonance if physical deficit is high while delusion is also high
    -- (e.g. people are starving but state media says harvest is bountiful)
    UPDATE regional_reality_friction
    SET cognitive_dissonance_pressure = LEAST(100.0, cognitive_dissonance_pressure + 0.1)
    WHERE region_id = p_region_id;

    -- If the pressure snaps (> 90), reality forces a painful "Epistemic Correction"
    UPDATE regional_epistemic_divergence
    SET divergence_score = GREATEST(0.0, divergence_score - 50.0)
    WHERE region_id = p_region_id 
    AND (SELECT cognitive_dissonance_pressure FROM regional_reality_friction WHERE region_id = p_region_id) > 90.0;
    
    -- Reset dissonance after snap
    UPDATE regional_reality_friction
    SET cognitive_dissonance_pressure = 0.0,
        last_reality_snap_tick = p_tick_id
    WHERE region_id = p_region_id AND cognitive_dissonance_pressure > 90.0;
END;
$$ LANGUAGE plpgsql;
