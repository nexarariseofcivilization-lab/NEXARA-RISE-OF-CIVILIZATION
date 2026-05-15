-- 024_civilization_hypervisor.sql
-- Civilization Compute Governor: Runtime Orchestration & Load Shedding

CREATE TABLE region_compute_governor (
    region_id UUID PRIMARY KEY REFERENCES regions(id) ON DELETE CASCADE,
    fidelity_mode VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL, DEGRADED
    current_entropy_load DECIMAL(10,2) DEFAULT 0.0,
    max_entropy_budget DECIMAL(10,2) DEFAULT 1000.0,
    event_compression_active BOOLEAN DEFAULT false,
    tick_throttle_factor INTEGER DEFAULT 1,
    last_fidelity_shift_tick BIGINT REFERENCES global_ticks(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed existing regions
INSERT INTO region_compute_governor (region_id)
SELECT id FROM regions ON CONFLICT DO NOTHING;

-- RPC to Calculate and Enforce Hypervisor Policies per Region
CREATE OR REPLACE FUNCTION process_hypervisor_orchestration(p_tick_id BIGINT)
RETURNS VOID AS $$
DECLARE
    r RECORD;
    v_base_load DECIMAL;
    v_new_fidelity VARCHAR(20);
    v_compression BOOLEAN;
    v_throttle INTEGER;
BEGIN
    FOR r IN 
        SELECT 
            rcg.region_id, rcg.fidelity_mode, rcg.max_entropy_budget,
            rem.local_chaos_index, rem.event_saturation_index,
            rd.unrest_pressure
        FROM region_compute_governor rcg
        LEFT JOIN region_execution_metadata rem ON rcg.region_id = rem.region_id
        LEFT JOIN region_demographics rd ON rcg.region_id = rd.region_id
    LOOP
        -- Calculate Estimated Entropy Load based on Chaos and Unrest
        v_base_load := COALESCE(r.local_chaos_index, 0) * 5.0 + COALESCE(r.unrest_pressure, 0) * 3.0 + COALESCE(r.event_saturation_index, 0) * 2.0;

        -- Determine Target Fidelity based on unrest and chaos, while respecting compute bounds
        IF v_base_load > 800 THEN
            v_new_fidelity := 'CRITICAL';
            v_throttle := 1;
            v_compression := false;
        ELSIF v_base_load > 400 THEN
            v_new_fidelity := 'HIGH';
            v_throttle := 1;
            v_compression := false;
        ELSIF v_base_load > 200 THEN
            v_new_fidelity := 'MEDIUM';
            v_throttle := 2;
            v_compression := false;
        ELSE
            v_new_fidelity := 'LOW';
            v_throttle := 5;
            v_compression := true;
        END IF;

        -- BUDGET EXHAUSTION (Thermal Throttling)
        -- If the calculated load exceeds the budget, the region is forced into DEGRADED mode
        IF v_base_load > r.max_entropy_budget THEN
            v_new_fidelity := 'DEGRADED';
            v_throttle := 10; -- Max throttle
            v_compression := true;
        END IF;

        -- Update Governor
        UPDATE region_compute_governor SET
            current_entropy_load = v_base_load,
            fidelity_mode = v_new_fidelity,
            tick_throttle_factor = v_throttle,
            event_compression_active = v_compression,
            last_fidelity_shift_tick = CASE WHEN fidelity_mode != v_new_fidelity THEN p_tick_id ELSE last_fidelity_shift_tick END,
            updated_at = NOW()
        WHERE region_id = r.region_id;

        -- We also update the region_execution_metadata interval to align the actual tick dispatcher
        UPDATE region_execution_metadata SET
            current_tick_interval = v_throttle
        WHERE region_id = r.region_id;

    END LOOP;
END;
$$ LANGUAGE plpgsql;
