-- 016_simulation_entropy_scaling.sql

-- Expanding Global Health Metrics (Simulation Entropy)
ALTER TABLE tick_health_metrics
ADD COLUMN chaos_index DECIMAL(5,2) DEFAULT 0.0,
ADD COLUMN event_saturation DECIMAL(5,2) DEFAULT 0.0,
ADD COLUMN ideological_temperature DECIMAL(5,2) DEFAULT 0.0,
ADD COLUMN institutional_fragility DECIMAL(5,2) DEFAULT 0.0,
ADD COLUMN systemic_coupling_strength DECIMAL(5,2) DEFAULT 0.0;

-- Region Execution Metadata for Adaptive Complexity Scaling
CREATE TABLE region_execution_metadata (
    region_id UUID PRIMARY KEY REFERENCES regions(id) ON DELETE CASCADE,
    last_executed_tick_id BIGINT REFERENCES global_ticks(id),
    current_tick_interval INT DEFAULT 1, -- e.g., 1 = every tick, 5 = every 5 ticks
    local_chaos_index DECIMAL(5,2) DEFAULT 0.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initialize metadata for existing regions
INSERT INTO region_execution_metadata (region_id, last_executed_tick_id, current_tick_interval, local_chaos_index)
SELECT id, NULL, 1, 0.0 FROM regions
ON CONFLICT DO NOTHING;

-- Update Observability RPC to calculate Entropy metrics
CREATE OR REPLACE FUNCTION calculate_civilization_pressures(p_tick_id BIGINT)
RETURNS VOID AS $$
DECLARE
    r RECORD;
    v_econ DECIMAL := 0;
    v_social DECIMAL := 0;
    v_political DECIMAL := 0;
    v_infra DECIMAL := 0;
    v_chaos DECIMAL := 0;
    v_events INT := 0;
    v_ideo DECIMAL := 0;
    v_instit DECIMAL := 0;
    v_coupling DECIMAL := 0;
    v_count INT := 0;
BEGIN
    FOR r IN SELECT * FROM region_demographics rd 
             JOIN region_state_current rc ON rc.region_id = rd.region_id
             JOIN government_treasury gt ON gt.region_id = rd.region_id
    LOOP
        v_econ := v_econ + LEAST(100.0, rc.average_price_index / 2.0); 
        v_social := v_social + rd.unrest_pressure + rd.panic_level;
        v_political := v_political + gt.bureaucratic_paralysis + rd.cultural_polarization;
        v_infra := v_infra + GREATEST(0.0, 100.0 - rc.infrastructure_health);
        
        -- Entropy Calculations
        v_chaos := v_chaos + LEAST(100.0, (rd.unrest_pressure * 1.5) + (gt.bureaucratic_paralysis * 0.8) + (GREATEST(0.0, 100.0 - rc.infrastructure_health)));
        v_ideo := v_ideo + GREATEST(0.0, (rd.cultural_polarization * 1.2) + (rd.panic_level * 0.5));
        v_instit := v_instit + LEAST(100.0, (gt.bureaucratic_paralysis * 1.5) + (rd.social_fatigue * 0.5));
        
        v_count := v_count + 1;
    END LOOP;
    
    -- Estimate event saturation from event queue size
    SELECT count(*) INTO v_events FROM event_queue WHERE status = 'PENDING';
    
    -- Estimate systemic coupling by finding interconnecting events/migration logs
    -- Simplified dummy calculation for coupling based on average pressure interconnects
    v_coupling := LEAST(100.0, (v_econ + v_social) / NULLIF(v_count * 2, 0));

    IF v_count > 0 THEN
        INSERT INTO tick_health_metrics (id, economic_pressure, social_pressure, political_fragmentation, infrastructure_fragility,
                                         chaos_index, event_saturation, ideological_temperature, institutional_fragility, systemic_coupling_strength)
        VALUES (p_tick_id, 
                LEAST(100.0, v_econ / v_count), 
                LEAST(100.0, v_social / (v_count * 2)), 
                LEAST(100.0, v_political / (v_count * 2)), 
                LEAST(100.0, v_infra / v_count),
                LEAST(100.0, (v_chaos / v_count) * (v_events / 100.0 + 1)),
                LEAST(100.0, v_events / 2.0),
                LEAST(100.0, v_ideo / v_count),
                LEAST(100.0, v_instit / v_count),
                v_coupling
                )
        ON CONFLICT (id) DO UPDATE SET
            economic_pressure = EXCLUDED.economic_pressure,
            social_pressure = EXCLUDED.social_pressure,
            political_fragmentation = EXCLUDED.political_fragmentation,
            infrastructure_fragility = EXCLUDED.infrastructure_fragility,
            chaos_index = EXCLUDED.chaos_index,
            event_saturation = EXCLUDED.event_saturation,
            ideological_temperature = EXCLUDED.ideological_temperature,
            institutional_fragility = EXCLUDED.institutional_fragility,
            systemic_coupling_strength = EXCLUDED.systemic_coupling_strength;
    END IF;
END;
$$ LANGUAGE plpgsql;
