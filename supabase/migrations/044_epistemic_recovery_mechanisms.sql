-- 044_epistemic_recovery_mechanisms.sql

-- 1. Epistemic Recovery Institutions
-- Tracks the strength of truth-seeking and reconciling institutions that heal epistemic decay.
CREATE TABLE IF NOT EXISTS regional_recovery_institutions (
    region_id UUID PRIMARY KEY REFERENCES regions(id),
    scientific_integrity FLOAT DEFAULT 50.0,          -- Reduces statistical corruption
    independent_audit_capacity FLOAT DEFAULT 50.0,    -- Repairs sensor_network_health
    citizen_verification_mesh FLOAT DEFAULT 10.0,     -- Provides baseline observability even if state sensors fail
    reconciliation_momentum FLOAT DEFAULT 0.0,        -- Slowly heals epistemic trauma and cynicism
    last_recovery_tick BIGINT DEFAULT 0
);

INSERT INTO regional_recovery_institutions (region_id)
SELECT id FROM regions ON CONFLICT DO NOTHING;

-- 2. Process Epistemic Recovery
CREATE OR REPLACE FUNCTION process_epistemic_recovery(p_tick_id BIGINT, p_region_id UUID)
RETURNS void AS $$
DECLARE
    v_scientific FLOAT;
    v_audit FLOAT;
    v_mesh FLOAT;
    v_recon FLOAT;
BEGIN
    SELECT scientific_integrity, independent_audit_capacity, citizen_verification_mesh, reconciliation_momentum
    INTO v_scientific, v_audit, v_mesh, v_recon
    FROM regional_recovery_institutions
    WHERE region_id = p_region_id;

    IF NOT FOUND THEN RETURN; END IF;

    -- 1. Repair Observability
    -- Audit capacity slowly repairs the main sensor grid
    UPDATE regional_observability_grid
    SET sensor_network_health = LEAST(100.0, sensor_network_health + (v_audit * 0.005)),
        statistical_corruption_factor = GREATEST(0.0, statistical_corruption_factor - (v_scientific * 0.001)),
        -- Uncertainty band shrinks if mesh is high, creating a secondary "floor" for truth
        measurement_uncertainty_band = GREATEST(1.0, measurement_uncertainty_band - (v_mesh * 0.01) - (v_scientific * 0.01))
    WHERE region_id = p_region_id;

    -- 2. Heal Epistemic Trauma
    IF v_recon > 0 THEN
        UPDATE regional_epistemic_trauma
        SET trauma_level = GREATEST(0.0, trauma_level - (v_recon * 0.02)),
            cynicism_index = GREATEST(0.0, cynicism_index - (v_recon * 0.01)),
            institutional_distrust_multiplier = GREATEST(1.0, institutional_distrust_multiplier - (v_recon * 0.005))
        WHERE region_id = p_region_id;
    END IF;

    -- 3. Degrade recovery momentum over time if not actively funded/supported
    UPDATE regional_recovery_institutions
    SET reconciliation_momentum = GREATEST(0.0, reconciliation_momentum - 0.5),
        last_recovery_tick = p_tick_id
    WHERE region_id = p_region_id;

END;
$$ LANGUAGE plpgsql;
