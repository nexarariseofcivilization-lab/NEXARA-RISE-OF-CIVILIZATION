-- Phase 47: Cognitive Fatigue & Attention Economy

-- Tracks the finite collective attention bandwidth of a population
CREATE TABLE IF NOT EXISTS population_cognitive_state (
    region_id UUID PRIMARY KEY REFERENCES regions(id),
    total_attention_bandwidth FLOAT DEFAULT 100.0,
    consumed_bandwidth FLOAT DEFAULT 0.0,
    fatigue_level FLOAT DEFAULT 0.0, -- 0-100. High fatigue means new events are ignored.
    apathy_index FLOAT DEFAULT 0.0, -- 0-100. High apathy reduces civil unrest but also reduces productivity (learned helplessness).
    last_updated_tick BIGINT DEFAULT 0
);

-- The marketplace of public attention
CREATE TABLE IF NOT EXISTS narrative_attention_market (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID REFERENCES regions(id),
    topic VARCHAR(255),
    attention_share FLOAT DEFAULT 0.0, -- Amount of bandwidth this consumes
    momentum FLOAT DEFAULT 1.0, -- Growth or decay rate
    saturation_point FLOAT DEFAULT 80.0, -- Point where people get sick of hearing about it
    created_tick BIGINT
);

CREATE OR REPLACE FUNCTION process_cognitive_economy(p_tick_id BIGINT)
RETURNS void AS $$
BEGIN
    -- 1. Progress Attention Decay
    -- Narratives naturally lose momentum over time, unless actively fueled
    UPDATE narrative_attention_market
    SET momentum = momentum - 0.05,
        attention_share = GREATEST(0, attention_share + momentum)
    WHERE momentum > -1.0;

    -- Clean up completely forgotten/dead narratives
    DELETE FROM narrative_attention_market WHERE attention_share <= 0;

    -- 2. Recalculate Bandwidth & Fatigue
    -- Total consumed attention across all active narratives
    UPDATE population_cognitive_state pcs
    SET consumed_bandwidth = COALESCE((SELECT SUM(attention_share) FROM narrative_attention_market WHERE region_id = pcs.region_id), 0)
    WHERE true;

    -- Update Fatigue & Apathy
    -- If consumed > capacity, society is overwhelmed. Fatigue spikes.
    -- If fatigue > 80, apathy sets in (people stop caring).
    UPDATE population_cognitive_state
    SET fatigue_level = LEAST(100.0, GREATEST(0.0, fatigue_level + CASE WHEN consumed_bandwidth > total_attention_bandwidth THEN 2.0 ELSE -1.0 END)),
        apathy_index = LEAST(100.0, GREATEST(0.0, apathy_index + CASE WHEN fatigue_level > 80.0 THEN 1.0 ELSE -0.5 END)),
        last_updated_tick = p_tick_id
    WHERE true;

    -- 3. The Apathy Effect: Bureaucratic Friction & Learned Helplessness
    -- In high apathy: street protests decrease (people are too tired to riot),
    -- but general stress/depression increases, dragging down productivity.
    UPDATE demographics d
    SET unrest_pressure = GREATEST(0.0, unrest_pressure - (pcs.apathy_index * 0.1)),
        avg_stress = LEAST(100.0, avg_stress + (pcs.fatigue_level * 0.05))
    FROM population_cognitive_state pcs
    WHERE d.region_id = pcs.region_id AND pcs.apathy_index > 20.0;

END;
$$ LANGUAGE plpgsql;
