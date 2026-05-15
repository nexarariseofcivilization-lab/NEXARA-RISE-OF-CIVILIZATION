-- 045_trust_stratification.sql

-- 1. Trust Stratification Graph
-- Maps which demographic segments trust which information institutions.
CREATE TABLE IF NOT EXISTS epistemic_trust_graph (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID REFERENCES regions(id),
    demographic_segment VARCHAR(50), -- 'ELITE', 'MIDDLE', 'WORKING', 'MARGINALIZED'
    institution_type VARCHAR(50),    -- 'STATE_MEDIA', 'SCIENCE', 'RELIGION', 'PEER_NETWORK'
    trust_weight FLOAT DEFAULT 50.0, -- 0-100
    last_shift_tick BIGINT DEFAULT 0,
    UNIQUE(region_id, demographic_segment, institution_type)
);

-- Seed initial graph for existing regions
INSERT INTO epistemic_trust_graph (region_id, demographic_segment, institution_type, trust_weight)
SELECT id, 'ELITE', 'STATE_MEDIA', 80.0 FROM regions ON CONFLICT DO NOTHING;
INSERT INTO epistemic_trust_graph (region_id, demographic_segment, institution_type, trust_weight)
SELECT id, 'ELITE', 'SCIENCE', 90.0 FROM regions ON CONFLICT DO NOTHING;
INSERT INTO epistemic_trust_graph (region_id, demographic_segment, institution_type, trust_weight)
SELECT id, 'ELITE', 'PEER_NETWORK', 60.0 FROM regions ON CONFLICT DO NOTHING;

INSERT INTO epistemic_trust_graph (region_id, demographic_segment, institution_type, trust_weight)
SELECT id, 'WORKING', 'STATE_MEDIA', 40.0 FROM regions ON CONFLICT DO NOTHING;
INSERT INTO epistemic_trust_graph (region_id, demographic_segment, institution_type, trust_weight)
SELECT id, 'WORKING', 'RELIGION', 85.0 FROM regions ON CONFLICT DO NOTHING;
INSERT INTO epistemic_trust_graph (region_id, demographic_segment, institution_type, trust_weight)
SELECT id, 'WORKING', 'PEER_NETWORK', 90.0 FROM regions ON CONFLICT DO NOTHING;

-- 2. Epistemic Class Divide
-- Tracks how unequally objective reality is distributed across classes.
CREATE TABLE IF NOT EXISTS epistemic_class_divide (
    region_id UUID PRIMARY KEY REFERENCES regions(id),
    elite_access_multiplier FLOAT DEFAULT 1.0,       -- 1.0 = sees the full observability grid
    middle_access_multiplier FLOAT DEFAULT 0.7,      -- Sees 70% of reality, 30% noise
    working_access_multiplier FLOAT DEFAULT 0.4,     -- Sees 40% of reality, 60% noise
    marginalized_access_multiplier FLOAT DEFAULT 0.1,-- Almost entirely disconnected from formal observability
    informational_gini_index FLOAT DEFAULT 0.4,      -- Inequality of information
    last_updated_tick BIGINT DEFAULT 0
);

INSERT INTO epistemic_class_divide (region_id)
SELECT id FROM regions ON CONFLICT DO NOTHING;

-- 3. Process Function
CREATE OR REPLACE FUNCTION process_trust_stratification(p_tick_id BIGINT, p_region_id UUID)
RETURNS void AS $$
DECLARE
    v_trauma FLOAT;
BEGIN
    -- Read regional trauma to know if trust needs to shift
    SELECT trauma_level INTO v_trauma FROM regional_epistemic_trauma WHERE region_id = p_region_id;
    IF v_trauma IS NULL THEN v_trauma := 0; END IF;

    -- If trauma is high, working class drops trust in STATE_MEDIA and SCIENCE, increases in RELIGION and PEER_NETWORK
    IF v_trauma > 50.0 THEN
        UPDATE epistemic_trust_graph
        SET trust_weight = GREATEST(0.0, trust_weight - 2.0),
            last_shift_tick = p_tick_id
        WHERE region_id = p_region_id AND demographic_segment = 'WORKING' AND institution_type IN ('STATE_MEDIA', 'SCIENCE');

        UPDATE epistemic_trust_graph
        SET trust_weight = LEAST(100.0, trust_weight + 2.0),
            last_shift_tick = p_tick_id
        WHERE region_id = p_region_id AND demographic_segment = 'WORKING' AND institution_type IN ('RELIGION', 'PEER_NETWORK');
    END IF;

    -- Calculate Informational Gini Index (simplified proxy)
    UPDATE epistemic_class_divide
    SET informational_gini_index = (elite_access_multiplier - marginalized_access_multiplier) / 2.0,
        last_updated_tick = p_tick_id
    WHERE region_id = p_region_id;

END;
$$ LANGUAGE plpgsql;
