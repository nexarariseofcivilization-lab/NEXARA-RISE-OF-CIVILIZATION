-- 022_epistemic_fragmentation_and_memory.sql

CREATE TABLE region_epistemic_state (
    region_id UUID PRIMARY KEY REFERENCES regions(id) ON DELETE CASCADE,
    perceived_economy DECIMAL(5,2) DEFAULT 50.0,
    perceived_stability DECIMAL(5,2) DEFAULT 50.0,
    perceived_corruption DECIMAL(5,2) DEFAULT 50.0,
    truth_divergence_index DECIMAL(5,2) DEFAULT 0.0,
    dominant_narrative VARCHAR(100) DEFAULT 'STATUS_QUO',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historiography / Civilization Memory
CREATE TABLE canonical_historical_events (
    id SERIAL PRIMARY KEY,
    tick_id BIGINT REFERENCES global_ticks(id),
    region_id UUID REFERENCES regions(id),
    event_classification VARCHAR(50) NOT NULL, -- e.g. TRAUMA, REVOLUTION, GOLDEN_AGE, EPISTEMIC_CRISIS
    canonical_name VARCHAR(200) NOT NULL,
    historical_weight DECIMAL(5,2) DEFAULT 100.0, -- Slowly decays over many ticks
    mythologization_index DECIMAL(5,2) DEFAULT 0.0, -- How distorted the event becomes over time
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO region_epistemic_state (region_id)
SELECT id FROM regions ON CONFLICT DO NOTHING;

-- Function to evaluate Epistemic Divergence
CREATE OR REPLACE FUNCTION process_epistemic_divergence(p_tick_id BIGINT)
RETURNS VOID AS $$
DECLARE
    r RECORD;
    v_actual_economy DECIMAL;
    v_actual_stability DECIMAL;
    v_actual_corruption DECIMAL;
    v_divergence DECIMAL;
    v_bias DECIMAL;
BEGIN
    FOR r IN 
        SELECT 
            es.region_id, 
            es.perceived_economy, es.perceived_stability, es.perceived_corruption,
            rd.unrest_pressure, rd.avg_stress, rd.polarization_index, rd.avg_education,
            rs.average_price_index, rs.infrastructure_health,
            gt.institutional_trust, gt.bureaucratic_paralysis,
            rss.pirate_radio_reach, rss.black_market_capacity
        FROM region_epistemic_state es
        JOIN region_demographics rd ON es.region_id = rd.region_id
        JOIN region_state_current rs ON es.region_id = rs.region_id
        JOIN government_treasury gt ON es.region_id = gt.region_id
        LEFT JOIN region_shadow_systems rss ON es.region_id = rss.region_id
    LOOP
        -- Objective states mapped to 0-100 scale (100 = good/high, 0 = bad/low depending on metric)
        v_actual_economy := GREATEST(0, 100.0 - (r.average_price_index / 2.0)); -- Inverse price
        v_actual_stability := GREATEST(0, 100.0 - r.unrest_pressure);
        v_actual_corruption := r.bureaucratic_paralysis;
        
        -- High polarization & high shadow networks introduce epistemic drift (bias)
        v_bias := CASE WHEN r.polarization_index > 70 OR r.pirate_radio_reach > 50 THEN 2.0 ELSE 0.5 END;

        -- Update perceived realities with drift. 
        -- If trust is low, perception of economy and stability drops artificially lower than reality
        IF r.institutional_trust < 30 THEN
            UPDATE region_epistemic_state SET 
                perceived_economy = GREATEST(0, perceived_economy - v_bias),
                perceived_stability = GREATEST(0, perceived_stability - v_bias),
                perceived_corruption = LEAST(100, perceived_corruption + v_bias)
            WHERE region_id = r.region_id;
        ELSE
            -- Convergence toward truth if trust is high
            UPDATE region_epistemic_state SET 
                perceived_economy = perceived_economy + ((v_actual_economy - perceived_economy) * 0.1),
                perceived_stability = perceived_stability + ((v_actual_stability - perceived_stability) * 0.1),
                perceived_corruption = perceived_corruption + ((v_actual_corruption - perceived_corruption) * 0.1)
            WHERE region_id = r.region_id;
        END IF;
        
        -- Recalculate Truth Divergence Index (Root Mean Square Deviation of perceived vs actual)
        v_divergence := SQRT(
            POWER(v_actual_economy - (SELECT perceived_economy FROM region_epistemic_state WHERE region_id = r.region_id), 2) +
            POWER(v_actual_stability - (SELECT perceived_stability FROM region_epistemic_state WHERE region_id = r.region_id), 2) +
            POWER(v_actual_corruption - (SELECT perceived_corruption FROM region_epistemic_state WHERE region_id = r.region_id), 2)
        ) / 3.0;
        
        UPDATE region_epistemic_state SET 
            truth_divergence_index = LEAST(100, v_divergence),
            dominant_narrative = CASE 
                WHEN v_divergence > 50 AND r.institutional_trust < 20 THEN 'SYSTEMIC_BETRAYAL'
                WHEN v_divergence > 30 AND r.perceived_economy < 40 THEN 'MANUFACTURED_CRISIS'
                WHEN v_actual_stability < 30 AND (SELECT perceived_stability FROM region_epistemic_state WHERE region_id = r.region_id) > 70 THEN 'PROPAGANDA_DELUSION'
                ELSE 'CONCENSUS_REALITY'
            END,
            updated_at = NOW()
        WHERE region_id = r.region_id;
        
        -- Publish Historical Event if Divergence snaps
        IF v_divergence > 70 AND r.unrest_pressure > 80 THEN
            IF NOT EXISTS (SELECT 1 FROM canonical_historical_events WHERE region_id = r.region_id AND event_classification = 'EPISTEMIC_CRISIS' AND tick_id > p_tick_id - 1440) THEN
                INSERT INTO canonical_historical_events (tick_id, region_id, event_classification, canonical_name)
                VALUES (p_tick_id, r.region_id, 'EPISTEMIC_CRISIS', 'The Era of Alternate Realities');
            END IF;
        END IF;
        
        -- Historical Event Decay
        UPDATE canonical_historical_events
        SET 
            historical_weight = GREATEST(0, historical_weight - 0.1),
            mythologization_index = LEAST(100, mythologization_index + 0.05)
        WHERE region_id = r.region_id AND historical_weight > 0;

    END LOOP;
END;
$$ LANGUAGE plpgsql;
