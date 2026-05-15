-- 032_institutional_inertia.sql
-- Institutions as Semi-Autonomous Organisms

CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    institution_type VARCHAR(50) NOT NULL, -- 'BUREAUCRACY', 'MILITARY', 'JUDICIARY', 'CENTRAL_BANK'
    
    inertia_mass DECIMAL(5,2) DEFAULT 80.0, -- How hard it is to change its ways
    entrenchment_level DECIMAL(5,2) DEFAULT 50.0, -- Self-preservation power (sabotages reforms)
    corruption_index DECIMAL(5,2) DEFAULT 10.0,
    
    dominant_faction_id VARCHAR(50) REFERENCES factions(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed institutions for each region
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT * FROM regions LOOP
        INSERT INTO institutions (region_id, name, institution_type, inertia_mass, entrenchment_level, dominant_faction_id)
        VALUES 
        (r.id, 'Ministry of Interior', 'BUREAUCRACY', 85.0, 70.0, 'TECHNOCRATS'),
        (r.id, 'Regional Command', 'MILITARY', 90.0, 80.0, 'MILITARY_COUNCIL'),
        (r.id, 'Federal Reserve Branch', 'CENTRAL_BANK', 95.0, 60.0, 'ELITE_SYNDICATE');
    END LOOP;
END;
$$;

-- Function: Institutional self-preservation
CREATE OR REPLACE FUNCTION process_institutional_inertia(p_tick_id BIGINT)
RETURNS VOID AS $$
DECLARE
    i RECORD;
BEGIN
    FOR i IN SELECT * FROM institutions LOOP
        -- Institutions actively fight against changes (bureaucratic paralysis)
        -- If entrenchment is high, it artificially inflates bureaucratic paralysis locally
        IF i.entrenchment_level > 60 THEN
            UPDATE government_treasury
            SET bureaucratic_paralysis = LEAST(100.0, bureaucratic_paralysis + (i.entrenchment_level * 0.005))
            WHERE region_id = i.region_id;
        END IF;

        -- Corruption drift: institutions naturally become more corrupt over time unless reformed or purged
        UPDATE institutions
        SET corruption_index = LEAST(100.0, corruption_index + 0.05)
        WHERE id = i.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
