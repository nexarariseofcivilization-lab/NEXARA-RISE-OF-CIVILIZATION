-- 013_diplomacy_and_memory.sql

-- ==========================================
-- 1. STABILIZATION: SOCIAL FATIGUE
-- ==========================================
ALTER TABLE region_demographics
ADD COLUMN social_fatigue DECIMAL(5,2) DEFAULT 0.0; -- 0-100

-- ==========================================
-- 2. FACTION MEMORY (LONG-TERM GRIEVANCES)
-- ==========================================
CREATE TABLE faction_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faction_id VARCHAR(50) REFERENCES factions(id) ON DELETE CASCADE,
    target_ref VARCHAR(50) NOT NULL, -- Either a faction_id or 'GOVERNMENT'
    
    memory_type VARCHAR(50) NOT NULL, -- 'SUPPRESSION', 'BETRAYAL', 'AID', 'ALLIANCE'
    intensity DECIMAL(5,2) DEFAULT 50.0,
    
    created_at_tick_id BIGINT REFERENCES global_ticks(id),
    updated_at_tick_id BIGINT REFERENCES global_ticks(id)
);

-- ==========================================
-- 3. DIPLOMACY & FATIGUE ENGINE
-- ==========================================
CREATE OR REPLACE FUNCTION process_diplomacy_and_fatigue_tick(p_tick_id BIGINT)
RETURNS VOID AS $$
DECLARE
    r RECORD;
    fac RECORD;
    rel RECORD;
    mem RECORD;
    v_affinity DECIMAL;
BEGIN
    -- 1. SOCIAL FATIGUE PROGRESSION (Dampening runaway collapse)
    FOR r IN SELECT * FROM region_demographics LOOP
        -- If unrest is high, people get tired over time
        IF r.unrest_pressure > 60 THEN
            UPDATE region_demographics 
            SET social_fatigue = LEAST(100.0, social_fatigue + 2.0)
            WHERE id = r.id;
        ELSE
            -- Recover fatigue if calm
            UPDATE region_demographics 
            SET social_fatigue = GREATEST(0.0, social_fatigue - 1.0)
            WHERE id = r.id;
        END IF;

        -- If fatigue is high, it artificially suppresses unrest and panic (apathy)
        IF r.social_fatigue > 50.0 THEN
            UPDATE region_demographics
            SET unrest_pressure = GREATEST(0.0, unrest_pressure - (r.social_fatigue * 0.1)),
                panic_level = GREATEST(0.0, panic_level - (r.social_fatigue * 0.1))
            WHERE id = r.id;
        END IF;
    END LOOP;

    -- 2. MEMORY DECAY & INFLUENCE
    FOR mem IN SELECT * FROM faction_memory LOOP
        -- Memories fade slowly
        UPDATE faction_memory 
        SET intensity = GREATEST(0.0, intensity - 0.5),
            updated_at_tick_id = p_tick_id
        WHERE id = mem.id;
        
        -- Delete forgotten memories
        IF (SELECT intensity FROM faction_memory WHERE id = mem.id) <= 0 THEN
            DELETE FROM faction_memory WHERE id = mem.id;
        END IF;
    END LOOP;

    -- 3. COALITION FORMATION & RELATIONS UPDATE
    -- Realistically, factions look at mutual friends and enemies
    FOR rel IN SELECT * FROM faction_relations LOOP
        
        -- Check if they have a shared memory/grievance against Government
        IF EXISTS (SELECT 1 FROM faction_memory WHERE faction_id = rel.faction_id_a AND target_ref = 'GOVERNMENT') AND
           EXISTS (SELECT 1 FROM faction_memory WHERE faction_id = rel.faction_id_b AND target_ref = 'GOVERNMENT') THEN
            -- Enemy of my enemy is my friend
            UPDATE faction_relations 
            SET affinity_score = LEAST(100.0, affinity_score + 2.0)
            WHERE faction_id_a = rel.faction_id_a AND faction_id_b = rel.faction_id_b;
        END IF;

        -- Check if one betrayed the other
        IF EXISTS (SELECT 1 FROM faction_memory WHERE faction_id = rel.faction_id_a AND target_ref = rel.faction_id_b AND memory_type = 'BETRAYAL') THEN
            UPDATE faction_relations 
            SET affinity_score = GREATEST(-100.0, affinity_score - 10.0),
                pact_type = 'VENDETTA'
            WHERE faction_id_a = rel.faction_id_a AND faction_id_b = rel.faction_id_b;
        END IF;

        -- Form Pact if affinity is high enough
        SELECT affinity_score INTO v_affinity FROM faction_relations WHERE faction_id_a = rel.faction_id_a AND faction_id_b = rel.faction_id_b;
        
        IF v_affinity > 70.0 AND rel.pact_type != 'COALITION' THEN
            UPDATE faction_relations SET pact_type = 'COALITION' WHERE faction_id_a = rel.faction_id_a AND faction_id_b = rel.faction_id_b;
            UPDATE faction_relations SET pact_type = 'COALITION' WHERE faction_id_a = rel.faction_id_b AND faction_id_b = rel.faction_id_a;
            
            PERFORM publish_event('DIPLOMACY.PACT.FORMED', 
                jsonb_build_object('faction_a', rel.faction_id_a, 'faction_b', rel.faction_id_b, 'pact', 'COALITION'), 
                'Diplomacy_Engine', NULL, 'HIGH_SOCIAL');
        ELSIF v_affinity < -50.0 AND rel.pact_type != 'VENDETTA' THEN
            UPDATE faction_relations SET pact_type = 'VENDETTA' WHERE faction_id_a = rel.faction_id_a AND faction_id_b = rel.faction_id_b;
            UPDATE faction_relations SET pact_type = 'VENDETTA' WHERE faction_id_a = rel.faction_id_b AND faction_id_b = rel.faction_id_a;
            
            PERFORM publish_event('DIPLOMACY.PACT.BROKEN', 
                jsonb_build_object('faction_a', rel.faction_id_a, 'faction_b', rel.faction_id_b, 'pact', 'VENDETTA'), 
                'Diplomacy_Engine', NULL, 'CRITICAL_SOCIAL');
        END IF;
    END LOOP;
    
    -- 4. SPAWN SUPPRESSION MEMORIES (Hooking into previous suppression logic)
    -- If there's an active mobilization that was just suppressed, faction remembers.
    FOR fac IN SELECT faction_id FROM organized_mobilizations WHERE status = 'SUPPRESSED' AND resolved_at_tick_id = p_tick_id LOOP
        -- Upsert memory
        IF EXISTS (SELECT 1 FROM faction_memory WHERE faction_id = fac.faction_id AND target_ref = 'GOVERNMENT' AND memory_type = 'SUPPRESSION') THEN
            UPDATE faction_memory SET intensity = LEAST(100.0, intensity + 20.0), updated_at_tick_id = p_tick_id
            WHERE faction_id = fac.faction_id AND target_ref = 'GOVERNMENT' AND memory_type = 'SUPPRESSION';
        ELSE
            INSERT INTO faction_memory (faction_id, target_ref, memory_type, intensity, created_at_tick_id, updated_at_tick_id)
            VALUES (fac.faction_id, 'GOVERNMENT', 'SUPPRESSION', 40.0, p_tick_id, p_tick_id);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
