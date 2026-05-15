-- Phase 49: Social Identity Clustering & Emergent Tribes
-- Tracks the emergent, non-rational social alignments based on shared systems

CREATE TABLE IF NOT EXISTS social_identity_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID REFERENCES regions(id),
    cluster_name VARCHAR(100), 
    core_grievance VARCHAR(255),
    defining_emotion VARCHAR(50), -- 'ANGER', 'FEAR', 'PRIDE', 'RESIGNATION', 'HOPE'
    epistemic_anchor VARCHAR(50), -- 'STATE_MEDIA', 'CONSPIRACY_FORUMS', 'ACADEMIA', 'ALTERNATIVE_MEDIA'
    cohesion_score FLOAT DEFAULT 10.0, -- How strongly bound is this group? (0-100)
    radicalization_level FLOAT DEFAULT 0.0, -- (0-100)
    population_size BIGINT DEFAULT 0,
    created_tick BIGINT
);

CREATE OR REPLACE FUNCTION process_identity_clustering(p_tick_id BIGINT)
RETURNS void AS $$
BEGIN
    -- 1. Emergence: Spontaneous generation of new identity clusters under extreme conditions
    -- High Fatigue + High Unrest -> Populist Anger Bloc
    INSERT INTO social_identity_clusters (region_id, cluster_name, core_grievance, defining_emotion, epistemic_anchor, created_tick)
    SELECT 
        d.region_id, 
        'The Betrayed ' || d.socioeconomic_class,
        'Institutional Failure and Economic Hardship',
        'ANGER',
        'ALTERNATIVE_MEDIA',
        p_tick_id
    FROM demographics d
    JOIN population_cognitive_state pcs ON d.region_id = pcs.region_id
    WHERE d.avg_stress > 70 
      AND pcs.fatigue_level > 60 
      AND d.unrest_pressure > 50
      AND random() > 0.9
      AND NOT EXISTS (SELECT 1 FROM social_identity_clusters sic WHERE sic.region_id = d.region_id AND sic.defining_emotion = 'ANGER');

    -- High Affluence + High Distrust of Masses -> Technocratic Isolation
    INSERT INTO social_identity_clusters (region_id, cluster_name, core_grievance, defining_emotion, epistemic_anchor, created_tick)
    SELECT 
        d.region_id, 
        'The Rationalists',
        'Populist Chaos and Bureaucratic Incompetence',
        'RESIGNATION',
        'INSTITUTIONAL_DATA',
        p_tick_id
    FROM demographics d
    JOIN population_cognitive_state pcs ON d.region_id = pcs.region_id
    WHERE d.gdp_contribution > 50.0 
      AND d.institutional_trust > 60 
      AND pcs.apathy_index > 40
      AND random() > 0.9
      AND NOT EXISTS (SELECT 1 FROM social_identity_clusters sic WHERE sic.region_id = d.region_id AND sic.defining_emotion = 'RESIGNATION');

    -- 2. Cohesion & Radicalization Dynamics
    -- If a cluster's core emotion is anger and unrest is high, they radicalize.
    UPDATE social_identity_clusters sic
    SET radicalization_level = LEAST(100.0, radicalization_level + 2.0),
        cohesion_score = LEAST(100.0, cohesion_score + 1.0)
    FROM demographics d
    WHERE sic.region_id = d.region_id 
      AND sic.defining_emotion = 'ANGER' 
      AND d.unrest_pressure > 60;

    -- If meaning systems heal the region, radicalization cools down
    UPDATE social_identity_clusters sic
    SET radicalization_level = GREATEST(0.0, radicalization_level - 3.0),
        cohesion_score = GREATEST(10.0, cohesion_score - 1.0)
    FROM cultural_resilience_anchors cra
    WHERE sic.region_id = cra.region_id 
      AND cra.active = true;

    -- 3. Dissolution of Weak Clusters
    -- If a cluster loses cohesion, it dissolves back into the general population
    DELETE FROM social_identity_clusters WHERE cohesion_score < 5.0;

END;
$$ LANGUAGE plpgsql;
