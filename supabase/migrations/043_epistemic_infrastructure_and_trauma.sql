-- 043_epistemic_infrastructure_and_trauma.sql

-- 1. Epistemic Trauma (Post-Truth Trauma)
-- Generated when a massive reality snap occurs, causing long-term institutional distrust.
CREATE TABLE IF NOT EXISTS regional_epistemic_trauma (
    region_id UUID PRIMARY KEY REFERENCES regions(id),
    trauma_level FLOAT DEFAULT 0.0,
    institutional_distrust_multiplier FLOAT DEFAULT 1.0,
    cynicism_index FLOAT DEFAULT 0.0,
    last_trauma_event_tick BIGINT DEFAULT 0
);

INSERT INTO regional_epistemic_trauma (region_id)
SELECT id FROM regions ON CONFLICT DO NOTHING;

-- 2. Observability Grid & Measurement Uncertainty
-- Who measures reality? If this grid degrades, even "objective" stats become blurry or corrupted.
CREATE TABLE IF NOT EXISTS regional_observability_grid (
    region_id UUID PRIMARY KEY REFERENCES regions(id),
    sensor_network_health FLOAT DEFAULT 100.0, -- Degrades with infrastructure collapse
    statistical_corruption_factor FLOAT DEFAULT 0.0, -- Increases with institutional decay
    measurement_uncertainty_band FLOAT DEFAULT 0.0, -- The +/- error margin in reporting "truth"
    last_calibration_tick BIGINT DEFAULT 0
);

INSERT INTO regional_observability_grid (region_id)
SELECT id FROM regions ON CONFLICT DO NOTHING;

-- Modify process_reality_friction to inject trauma on SNAP
CREATE OR REPLACE FUNCTION process_reality_friction(p_tick_id BIGINT, p_region_id UUID)
RETURNS void AS $$
DECLARE
    v_pressure FLOAT;
BEGIN
    -- Increase dissonance if physical deficit is high while delusion is also high
    UPDATE regional_reality_friction
    SET cognitive_dissonance_pressure = LEAST(100.0, cognitive_dissonance_pressure + 0.1)
    WHERE region_id = p_region_id
    RETURNING cognitive_dissonance_pressure INTO v_pressure;

    -- If the pressure snaps (> 90), reality forces a painful "Epistemic Correction"
    IF v_pressure > 90.0 THEN
        UPDATE regional_epistemic_divergence
        SET divergence_score = GREATEST(0.0, divergence_score - 50.0)
        WHERE region_id = p_region_id;
        
        -- Phase 43: Trauma injection on snap
        UPDATE regional_epistemic_trauma
        SET trauma_level = LEAST(100.0, trauma_level + 25.0),
            institutional_distrust_multiplier = LEAST(3.0, institutional_distrust_multiplier + 0.5),
            cynicism_index = LEAST(100.0, cynicism_index + 15.0),
            last_trauma_event_tick = p_tick_id
        WHERE region_id = p_region_id;
        
        -- Reset dissonance after snap
        UPDATE regional_reality_friction
        SET cognitive_dissonance_pressure = 0.0,
            last_reality_snap_tick = p_tick_id
        WHERE region_id = p_region_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Evaluate Observability
CREATE OR REPLACE FUNCTION process_observability_degradation(p_tick_id BIGINT, p_region_id UUID)
RETURNS void AS $$
BEGIN
    -- Observability degrades if there is infrastructure decay or social unrest
    -- This adds an uncertainty band to the "objective" truth, blinding the causal engine's precision
    UPDATE regional_observability_grid
    SET sensor_network_health = GREATEST(10.0, sensor_network_health - 0.05),
        measurement_uncertainty_band = LEAST(50.0, 100.0 - sensor_network_health + (statistical_corruption_factor * 10))
    WHERE region_id = p_region_id;
END;
$$ LANGUAGE plpgsql;
