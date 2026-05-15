-- 014_culture_and_identity.sql

-- ==========================================
-- 1. CULTURAL ANCHORS & IDENTITY
-- ==========================================
ALTER TABLE region_demographics
ADD COLUMN cultural_polarization DECIMAL(5,2) DEFAULT 10.0, -- 0-100
ADD COLUMN dominant_ideology VARCHAR(50) DEFAULT 'PRAGMATISM';

-- ==========================================
-- 2. CULTURAL MYTHS & SYMBOLIC EVENTS
-- ==========================================
CREATE TABLE cultural_myths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    faction_id VARCHAR(50) REFERENCES factions(id) ON DELETE CASCADE,
    
    myth_type VARCHAR(50) NOT NULL, -- 'MARTYRDOM', 'SACRED_VICTORY', 'HISTORICAL_BETRAYAL', 'MANIFEST_DESTINY'
    myth_name VARCHAR(255) NOT NULL,
    symbolism_score DECIMAL(5,2) DEFAULT 50.0, -- 0-100. High score = irrational absolute behavior
    
    created_at_tick_id BIGINT REFERENCES global_ticks(id),
    updated_at_tick_id BIGINT REFERENCES global_ticks(id)
);

-- ==========================================
-- 3. CULTURE ENGINE (RPC)
-- ==========================================
CREATE OR REPLACE FUNCTION process_culture_and_identity_tick(p_tick_id BIGINT)
RETURNS VOID AS $$
DECLARE
    r RECORD;
    fac RECORD;
    myth RECORD;
    v_new_polarization DECIMAL;
    v_dom_ideology VARCHAR;
BEGIN
    -- 1. Polarization Drift
    FOR r IN SELECT * FROM regions LOOP
        -- Get dominant faction ideology for the region
        SELECT faction_id, influence_score INTO fac 
        FROM regional_factions 
        WHERE region_id = r.id AND influence_score > 0
        ORDER BY influence_score DESC LIMIT 1;
        
        IF FOUND AND fac.influence_score > 30 THEN
            SELECT ideology INTO v_dom_ideology FROM factions WHERE id = fac.faction_id;
            
            -- Update dominant ideology
            UPDATE region_demographics SET dominant_ideology = v_dom_ideology WHERE id = r.id;
            
            -- If multiple factions have high influence, polarization spikes
            IF EXISTS (SELECT 1 FROM regional_factions WHERE region_id = r.id AND faction_id != fac.faction_id AND influence_score > 20) THEN
                UPDATE region_demographics SET cultural_polarization = LEAST(100.0, cultural_polarization + 1.5) WHERE id = r.id;
            END IF;
        ELSE
            -- Normalize polarization slightly if no strong factions
            UPDATE region_demographics SET cultural_polarization = GREATEST(0.0, cultural_polarization - 0.5) WHERE id = r.id;
        END IF;

        -- 2. Myth Creation (Martyrdom / Historic Events)
        -- If a mobilization was suppressed recently, sometimes it creates a Martyr
        FOR fac IN SELECT * FROM organized_mobilizations WHERE region_id = r.id AND status = 'SUPPRESSED' AND resolved_at_tick_id >= p_tick_id - 3 LOOP
            IF random() < 0.1 AND NOT EXISTS(SELECT 1 FROM cultural_myths WHERE region_id = r.id AND faction_id = fac.faction_id AND myth_type = 'MARTYRDOM') THEN
                INSERT INTO cultural_myths (region_id, faction_id, myth_type, myth_name, symbolism_score, created_at_tick_id, updated_at_tick_id)
                VALUES (r.id, fac.faction_id, 'MARTYRDOM', 'The ' || fac.mobilization_type || ' Martyrs', 60.0 + (random()*20), p_tick_id, p_tick_id);
                
                PERFORM publish_event('CULTURE.MYTH.BORN', 
                    jsonb_build_object('faction', fac.faction_id, 'myth', 'MARTYRDOM', 'region', r.id), 
                    'Culture_Engine', r.id, 'CRITICAL_SOCIAL');
            END IF;
        END LOOP;
    END LOOP;

    -- 3. Myth Empowerment & Irrationality
    FOR myth IN SELECT * FROM cultural_myths LOOP
        -- Myths grow stronger if polarization is high
        v_new_polarization := (SELECT cultural_polarization FROM region_demographics WHERE id = myth.region_id);
        
        IF v_new_polarization > 60 THEN
            UPDATE cultural_myths SET symbolism_score = LEAST(100.0, symbolism_score + 1.0), updated_at_tick_id = p_tick_id WHERE id = myth.id;
        ELSE
            -- Myths fade very slowly if society is stable
            UPDATE cultural_myths SET symbolism_score = GREATEST(0.0, symbolism_score - 0.2), updated_at_tick_id = p_tick_id WHERE id = myth.id;
        END IF;

        IF myth.symbolism_score <= 0 THEN
            DELETE FROM cultural_myths WHERE id = myth.id;
            CONTINUE;
        END IF;

        -- IMPACT: High symbolism ignores fatigue and rationality
        IF myth.symbolism_score > 80 THEN
            -- Erase social fatigue for this faction's demographic, converting it directly to unrest overrides
            UPDATE region_demographics 
            SET social_fatigue = GREATEST(0.0, social_fatigue - 5.0),
                unrest_pressure = LEAST(100.0, unrest_pressure + 3.0)
            WHERE id = myth.region_id;

            -- Factions with Martyrs are impossible to negotiate with (Vendetta locking)
            UPDATE faction_relations 
            SET affinity_score = -100.0, pact_type = 'VENDETTA'
            WHERE faction_id_a = myth.faction_id OR faction_id_b = myth.faction_id;
        END IF;
    END LOOP;

END;
$$ LANGUAGE plpgsql;
