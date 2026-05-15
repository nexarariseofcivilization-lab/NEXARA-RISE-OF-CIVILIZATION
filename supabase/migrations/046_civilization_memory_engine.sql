-- 046_civilization_memory_engine.sql

-- 1. Historical Compression Layer (Epochs)
-- Compresses many causal commits into a single historical epoch for long-term memory.
CREATE TABLE IF NOT EXISTS historical_epochs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID REFERENCES regions(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_tick BIGINT NOT NULL,
    end_tick BIGINT,
    dominant_theme VARCHAR(50), -- 'ECONOMIC_COLLAPSE', 'CIVIL_UNREST', 'EPISTEMIC_FRACTURE', 'GOLDEN_AGE'
    objective_cause TEXT,
    initial_impact_score FLOAT DEFAULT 50.0, -- Used to determine if this event survives the forgetting curve
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Collective Memory Drift & Forgetting Curve
-- Tracks how public memory distorts and fades over time.
CREATE TABLE IF NOT EXISTS collective_memory_drift (
    epoch_id UUID PRIMARY KEY REFERENCES historical_epochs(id) ON DELETE CASCADE,
    region_id UUID REFERENCES regions(id),
    public_memory_narrative TEXT,
    distortion_level FLOAT DEFAULT 0.0, -- 0 = Perfect recall, 100 = Completely fabricated
    historical_relevance FLOAT DEFAULT 100.0, -- 0 = Forgotten
    blame_narrative VARCHAR(255),
    last_drift_tick BIGINT DEFAULT 0
);

-- 3. Generational Transfer
-- Tracks inherited trauma and baseline distrust across generations.
CREATE TABLE IF NOT EXISTS generational_trauma_transfer (
    region_id UUID PRIMARY KEY REFERENCES regions(id),
    current_generation_index INT DEFAULT 1,
    inherited_cynicism_baseline FLOAT DEFAULT 0.0,
    generational_decay_rate FLOAT DEFAULT 0.1, -- How much trauma fades per generation naturally
    last_generation_shift_tick BIGINT DEFAULT 0
);

INSERT INTO generational_trauma_transfer (region_id)
SELECT id FROM regions ON CONFLICT DO NOTHING;

-- 4. Myth Formation Engine
-- Tracks epochs that have ascended into sacred myths.
CREATE TABLE IF NOT EXISTS civilization_myths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    epoch_id UUID REFERENCES historical_epochs(id),
    region_id UUID REFERENCES regions(id),
    myth_title VARCHAR(255) NOT NULL,
    sacredness_score FLOAT DEFAULT 10.0, -- Resistance to Reality Friction. Higher means harder to snap.
    legitimacy_modifier FLOAT DEFAULT 1.0, -- How much it boosts or damages governance legitimacy
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active Forgetting Engine
CREATE OR REPLACE FUNCTION process_civilization_memory(p_tick_id BIGINT, p_region_id UUID)
RETURNS void AS $$
BEGIN
    -- 1. Historical Entropy: Memories actively decay (Forgetting Curve)
    -- The smaller the initial impact, the faster it decays
    UPDATE collective_memory_drift cmd
    SET historical_relevance = GREATEST(0.0, cmd.historical_relevance - (100.0 / GREATEST(1.0, he.initial_impact_score))),
        distortion_level = LEAST(100.0, cmd.distortion_level + 0.2),
        last_drift_tick = p_tick_id
    FROM historical_epochs he
    WHERE cmd.epoch_id = he.id AND cmd.region_id = p_region_id;

    -- 2. Oblivion Barrier: Remove memories that have faded from public consciousness entirely
    -- They still exist in 'historical_epochs' (archival history) but NOT in 'collective_memory_drift' (lived public consciousness)
    DELETE FROM collective_memory_drift
    WHERE historical_relevance <= 0.0 AND region_id = p_region_id;

    -- 3. Myth-Making: Only memories that resist forgetting AND become heavily distorted turn into Myths
    INSERT INTO civilization_myths (epoch_id, region_id, myth_title, sacredness_score)
    SELECT cmd.epoch_id, cmd.region_id, 'The Legend of ' || he.title, 50.0
    FROM collective_memory_drift cmd
    JOIN historical_epochs he ON cmd.epoch_id = he.id
    WHERE cmd.region_id = p_region_id 
      AND cmd.distortion_level > 80.0
      AND cmd.historical_relevance > 50.0 -- Must still be somewhat relevant
      AND NOT EXISTS (SELECT 1 FROM civilization_myths cm WHERE cm.epoch_id = cmd.epoch_id)
    LIMIT 1;

END;
$$ LANGUAGE plpgsql;
