-- 010_perception_layer.sql

-- ==========================================
-- 1. INFORMATION CHANNELS (Media & Social Networks)
-- ==========================================
CREATE TABLE information_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    channel_type VARCHAR(50) NOT NULL, -- 'STATE_MEDIA', 'PRIVATE_NEWS', 'SOCIAL_NETWORK', 'UNDERGROUND_FORUM'
    
    reach_pct DECIMAL(5,2) DEFAULT 10.0, -- What % of region population sees this
    sensationalism_index DECIMAL(5,2) DEFAULT 0.5, -- 0.0 to 1.0 (higher = exaggerates issues)
    public_trust DECIMAL(5,2) DEFAULT 50.0,
    
    -- Economic survival for media
    capital DECIMAL(15,2) DEFAULT 10000.00,
    
    updated_tick_id BIGINT REFERENCES global_ticks(id)
);

-- ==========================================
-- 2. PUBLIC NARRATIVES & RUMORS
-- ==========================================
CREATE TABLE public_narratives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    origin_channel_id UUID REFERENCES information_channels(id) ON DELETE SET NULL,
    
    topic VARCHAR(100) NOT NULL, -- e.g., 'FOOD_SHORTAGE', 'GOV_CORRUPTION', 'DISEASE_OUTBREAK'
    narrative_type VARCHAR(50) NOT NULL, -- 'FACT', 'RUMOR', 'PROPAGANDA'
    
    severity DECIMAL(5,2) NOT NULL, -- How scary/impactful the narrative is (0-100)
    veracity DECIMAL(5,2) NOT NULL, -- How true it actually is (0-100)
    
    penetration_pct DECIMAL(5,2) DEFAULT 0.0, -- % of population that believes/knows it
    spread_velocity DECIMAL(5,2) DEFAULT 1.0, 
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at_tick_id BIGINT REFERENCES global_ticks(id),
    updated_tick_id BIGINT REFERENCES global_ticks(id)
);

-- ==========================================
-- 3. PERCEPTION & TRUST MODIFICATIONS
-- ==========================================
ALTER TABLE region_demographics
ADD COLUMN avg_media_trust DECIMAL(5,2) DEFAULT 50.0,
ADD COLUMN avg_community_trust DECIMAL(5,2) DEFAULT 50.0,
ADD COLUMN panic_level DECIMAL(5,2) DEFAULT 0.0;

ALTER TABLE households
ADD COLUMN media_trust DECIMAL(5,2) DEFAULT 50.0,
ADD COLUMN community_trust DECIMAL(5,2) DEFAULT 50.0,
ADD COLUMN panic_level DECIMAL(5,2) DEFAULT 0.0,
ADD COLUMN faction_id VARCHAR(50) DEFAULT 'UNALIGNED'; -- 'UNALIGNED', 'WORKER_UNION', 'ELITE_BLOC', 'RADICALS'

-- ==========================================
-- 4. PROCESS PERCEPTION TICK (RPC)
-- ==========================================
CREATE OR REPLACE FUNCTION process_perception_tick(p_tick_id BIGINT, p_region_id UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    r RECORD;
    sys_health DECIMAL;
    v_new_penetration DECIMAL;
BEGIN
    -- 1. Generate autonomous rumors based on systemic stress
    FOR r IN SELECT * FROM regions WHERE (p_region_id IS NULL OR id = p_region_id) LOOP
        SELECT infrastructure_health INTO sys_health FROM region_state_current WHERE region_id = r.id;
        
        -- If infrastructure is failing, rumors spawn automatically
        IF sys_health < 80 AND random() < 0.1 THEN
            -- Spawn a rumor about shortage or blackout
            INSERT INTO public_narratives (region_id, topic, narrative_type, severity, veracity, spread_velocity, created_at_tick_id)
            VALUES (r.id, 'INFRA_COLLAPSE_FEAR', 'RUMOR', 50 + (random() * 50), 20.0, 5.0 + (random() * 10), p_tick_id);
            
            PERFORM publish_event('PERCEPTION.RUMOR.SPAWNED', jsonb_build_object('topic', 'INFRA_COLLAPSE_FEAR'), 'Perception_Engine', r.id, 'MODERATE_SOCIAL');
        END IF;

        -- Check market shortage for panic triggers
        -- If food shortage severity > 5%, spawn huge rumor
        IF EXISTS(SELECT 1 FROM regional_market WHERE region_id = r.id AND resource_id = 'FOOD' AND shortage_severity > 5.0) THEN
            IF random() < 0.2 THEN
                INSERT INTO public_narratives (region_id, topic, narrative_type, severity, veracity, spread_velocity, created_at_tick_id)
                VALUES (r.id, 'FOOD_SHORTAGE_PANIC', 'RUMOR', 80 + (random() * 20), 50.0, 15.0, p_tick_id);
                
                PERFORM publish_event('PERCEPTION.RUMOR.SPAWNED', jsonb_build_object('topic', 'FOOD_SHORTAGE_PANIC'), 'Perception_Engine', r.id, 'HIGH_SOCIAL');
            END IF;
        END IF;
    END LOOP;

    -- 2. Propagate Narratives
    FOR r IN SELECT * FROM public_narratives WHERE is_active = TRUE AND (p_region_id IS NULL OR region_id = p_region_id) LOOP
        -- Narrative grows based on its velocity and region panic
        v_new_penetration := LEAST(100.0, r.penetration_pct + r.spread_velocity);
        
        UPDATE public_narratives
        SET penetration_pct = v_new_penetration,
            updated_tick_id = p_tick_id
        WHERE id = r.id;

        -- Apply impact to households
        IF v_new_penetration > 10.0 THEN
            IF r.topic = 'FOOD_SHORTAGE_PANIC' THEN
                -- Increase panic heavily
                UPDATE households
                SET panic_level = LEAST(100.0, panic_level + (r.severity * 0.1))
                WHERE region_id = r.region_id 
                AND random() < (v_new_penetration / 100.0);
            ELSIF r.topic = 'GOV_CORRUPTION' THEN
                UPDATE households
                SET government_trust = GREATEST(0.0, government_trust - (r.severity * 0.1)),
                    radicalization_level = LEAST(100.0, radicalization_level + (r.severity * 0.05))
                WHERE region_id = r.region_id 
                AND random() < (v_new_penetration / 100.0);
            END IF;
        END IF;

        -- Rumors die out over time if not sustained
        IF r.narrative_type = 'RUMOR' THEN
            UPDATE public_narratives
            SET spread_velocity = spread_velocity - 0.5
            WHERE id = r.id;

            IF r.spread_velocity <= 0 THEN
                UPDATE public_narratives SET is_active = FALSE WHERE id = r.id;
            END IF;
        END IF;
    END LOOP;
    
    -- 3. Aggregate Demographics Panic
    FOR r IN SELECT * FROM regions WHERE (p_region_id IS NULL OR id = p_region_id) LOOP
        UPDATE region_demographics rd
        SET panic_level = (SELECT COALESCE(AVG(panic_level), 0) FROM households WHERE region_id = rd.region_id),
            avg_media_trust = (SELECT COALESCE(AVG(media_trust), 50) FROM households WHERE region_id = rd.region_id),
            avg_community_trust = (SELECT COALESCE(AVG(community_trust), 50) FROM households WHERE region_id = rd.region_id)
        WHERE region_id = r.id;
        
        -- Decay panic naturally over time if no active bad narratives
        UPDATE households
        SET panic_level = GREATEST(0.0, panic_level - 1.0)
        WHERE region_id = r.id AND panic_level > 0;
    END LOOP;

END;
$$ LANGUAGE plpgsql;

-- 5. FUNCTION: PANIC BUYING
CREATE OR REPLACE FUNCTION process_panic_buying(p_tick_id BIGINT, p_region_id UUID)
RETURNS VOID AS $$
DECLARE
    v_avg_panic DECIMAL;
BEGIN
    SELECT panic_level INTO v_avg_panic FROM region_demographics WHERE region_id = p_region_id;
    
    IF v_avg_panic > 20.0 THEN
        -- Preemptive hoarding deduction from the market.
        UPDATE regional_market
        SET available_supply = GREATEST(0, available_supply - ((v_avg_panic / 100.0) * daily_demand))
        WHERE region_id = p_region_id AND resource_id IN ('FOOD', 'WATER', 'MEDICINE', 'FUEL');
        
        PERFORM publish_event(
            'ECONOMY.MARKET.PANIC_BUYING',
            jsonb_build_object('panic_level', v_avg_panic),
            'Perception_Engine',
            p_region_id,
            'HIGH_SOCIAL'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. INFO SEEDING
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT * FROM regions LOOP
        INSERT INTO information_channels (region_id, name, channel_type, reach_pct, sensationalism_index, public_trust)
        VALUES 
        (r.id, 'State National Broadcast', 'STATE_MEDIA', 80.0, 0.1, 60.0),
        (r.id, 'Nexara Times', 'PRIVATE_NEWS', 60.0, 0.4, 45.0),
        (r.id, 'WhisperNet Underground', 'SOCIAL_NETWORK', 40.0, 0.9, 30.0);
    END LOOP;
END;
$$;
