-- Phase 48: Cognitive Compression & Meaning Systems
-- Creates Memetic Simplification and Cultural Resilience

CREATE TABLE IF NOT EXISTS memetic_contagion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID REFERENCES regions(id),
    compressed_symbol VARCHAR(255),
    emotional_payload VARCHAR(50), 
    stickiness FLOAT DEFAULT 50.0,
    virality FLOAT DEFAULT 1.0,
    active BOOLEAN DEFAULT true,
    created_tick BIGINT
);

CREATE TABLE IF NOT EXISTS cultural_resilience_anchors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID REFERENCES regions(id),
    anchor_type VARCHAR(50), 
    description TEXT,
    healing_power FLOAT DEFAULT 10.0, 
    active BOOLEAN DEFAULT true,
    created_tick BIGINT
);

CREATE OR REPLACE FUNCTION process_memetics_and_meaning(p_tick_id BIGINT)
RETURNS void AS $$
BEGIN
    -- 1. Narrative Simplification (Cognitive Compression)
    -- When fatigue is high, insert memes.
    INSERT INTO memetic_contagion (region_id, compressed_symbol, emotional_payload, created_tick)
    SELECT 
        nam.region_id, 
        'Slogan against ' || split_part(nam.topic, ' ', 1), 
        CASE WHEN random() > 0.5 THEN 'OUTRAGE' ELSE 'FEAR' END,
        p_tick_id
    FROM narrative_attention_market nam
    JOIN population_cognitive_state pcs ON nam.region_id = pcs.region_id
    WHERE pcs.fatigue_level > 60 
      AND nam.attention_share > 20
      AND random() > 0.8;

    -- 2. Passive Citizen Drift (Silent Majority)
    -- In times of high apathy and stress, unrest is buried and turns into conformity
    UPDATE demographics d
    SET unrest_pressure = GREATEST(0.0, unrest_pressure - 5.0),
        avg_stress = LEAST(100.0, avg_stress + 2.0)
    FROM population_cognitive_state pcs
    WHERE d.region_id = pcs.region_id 
      AND pcs.apathy_index > 60
      AND d.unrest_pressure > 30;

    -- 3. Meaning Systems (Micro-hopes & Resilience)
    INSERT INTO cultural_resilience_anchors (region_id, anchor_type, description, created_tick)
    SELECT 
        pcs.region_id, 
        CASE 
            WHEN random() > 0.6 THEN 'FESTIVAL'
            WHEN random() > 0.3 THEN 'COMMUNITY_KITCHEN'
            ELSE 'UNDERGROUND_ART'
        END,
        'Organic resilience response to systemic fatigue',
        p_tick_id
    FROM population_cognitive_state pcs
    WHERE pcs.fatigue_level > 70 AND pcs.apathy_index > 40
      AND random() > 0.8 
      AND NOT EXISTS (SELECT 1 FROM cultural_resilience_anchors cra WHERE cra.region_id = pcs.region_id AND cra.active = true);

    -- Apply healing to demographics
    UPDATE demographics d
    SET avg_stress = GREATEST(0.0, avg_stress - (cra.healing_power * 0.1)),
        avg_happiness = LEAST(100.0, avg_happiness + (cra.healing_power * 0.1))
    FROM cultural_resilience_anchors cra
    WHERE d.region_id = cra.region_id AND cra.active = true;

    UPDATE population_cognitive_state pcs
    SET apathy_index = GREATEST(0.0, apathy_index - (cra.healing_power * 0.15))
    FROM cultural_resilience_anchors cra
    WHERE pcs.region_id = cra.region_id AND cra.active = true;

END;
$$ LANGUAGE plpgsql;
