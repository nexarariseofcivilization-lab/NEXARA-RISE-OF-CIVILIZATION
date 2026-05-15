-- 015_stabilization_observability.sql

-- 1. TICK HEALTH METRICS
CREATE TABLE tick_health_metrics (
    id BIGINT PRIMARY KEY REFERENCES global_ticks(id) ON DELETE CASCADE,
    processing_time_ms BIGINT DEFAULT 0,
    events_processed INT DEFAULT 0,
    economic_pressure DECIMAL(5,2) DEFAULT 0.0,
    social_pressure DECIMAL(5,2) DEFAULT 0.0,
    political_fragmentation DECIMAL(5,2) DEFAULT 0.0,
    infrastructure_fragility DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. EVENT CIRCUIT BREAKERS
CREATE TABLE event_throttles (
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    event_category VARCHAR(50) NOT NULL,
    last_tick_id BIGINT REFERENCES global_ticks(id),
    consecutive_triggers INT DEFAULT 0,
    is_tripped BOOLEAN DEFAULT FALSE,
    cooldown_until_tick BIGINT,
    PRIMARY KEY (region_id, event_category)
);

-- 3. SOFT FAILURE MODES
ALTER TABLE infrastructure_nodes
ADD COLUMN efficiency_degradation DECIMAL(5,2) DEFAULT 0.0,
ADD COLUMN corruption_index DECIMAL(5,2) DEFAULT 0.0;

-- 4. OBSERVABILITY RPC
CREATE OR REPLACE FUNCTION calculate_civilization_pressures(p_tick_id BIGINT)
RETURNS VOID AS $$
DECLARE
    r RECORD;
    v_econ DECIMAL := 0;
    v_social DECIMAL := 0;
    v_political DECIMAL := 0;
    v_infra DECIMAL := 0;
    v_count INT := 0;
BEGIN
    FOR r IN SELECT * FROM region_demographics rd 
             JOIN region_state_current rc ON rc.region_id = rd.region_id
             JOIN government_treasury gt ON gt.region_id = rd.region_id
    LOOP
        v_econ := v_econ + LEAST(100.0, rc.average_price_index / 2.0); 
        v_social := v_social + rd.unrest_pressure + rd.panic_level;
        v_political := v_political + gt.bureaucratic_paralysis + rd.cultural_polarization;
        v_infra := v_infra + GREATEST(0.0, 100.0 - rc.infrastructure_health);
        v_count := v_count + 1;
    END LOOP;
    
    IF v_count > 0 THEN
        INSERT INTO tick_health_metrics (id, economic_pressure, social_pressure, political_fragmentation, infrastructure_fragility)
        VALUES (p_tick_id, 
                LEAST(100.0, v_econ / v_count), 
                LEAST(100.0, v_social / (v_count * 2)), 
                LEAST(100.0, v_political / (v_count * 2)), 
                LEAST(100.0, v_infra / v_count))
        ON CONFLICT (id) DO UPDATE SET
            economic_pressure = EXCLUDED.economic_pressure,
            social_pressure = EXCLUDED.social_pressure,
            political_fragmentation = EXCLUDED.political_fragmentation,
            infrastructure_fragility = EXCLUDED.infrastructure_fragility;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_circuit_breaker(p_region_id UUID, p_category VARCHAR, p_tick_id BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
    throttle RECORD;
BEGIN
    SELECT * INTO throttle FROM event_throttles WHERE region_id = p_region_id AND event_category = p_category;
    
    IF NOT FOUND THEN
        INSERT INTO event_throttles (region_id, event_category, last_tick_id, consecutive_triggers)
        VALUES (p_region_id, p_category, p_tick_id, 1);
        RETURN FALSE; -- Not tripped
    END IF;
    
    IF throttle.is_tripped THEN
        IF p_tick_id >= throttle.cooldown_until_tick THEN
            -- Resets
            UPDATE event_throttles SET is_tripped = FALSE, consecutive_triggers = 1, last_tick_id = p_tick_id WHERE region_id = p_region_id AND event_category = p_category;
            RETURN FALSE;
        END IF;
        RETURN TRUE; -- Tripped, block
    END IF;
    
    -- Relaxed consecutive condition: count triggers within last 2 ticks
    IF p_tick_id - COALESCE(throttle.last_tick_id, p_tick_id) <= 2 THEN
        IF throttle.consecutive_triggers >= 5 THEN
            -- Trip breaker
            UPDATE event_throttles SET is_tripped = TRUE, cooldown_until_tick = p_tick_id + 10, last_tick_id = p_tick_id WHERE region_id = p_region_id AND event_category = p_category;
            
            PERFORM publish_event('SYSTEM.CIRCUIT_BREAKER.TRIPPED', 
                    jsonb_build_object('category', p_category, 'cooldown', 10), 
                    'Meta_Governor', p_region_id, 'CRITICAL_SYSTEM');
            
            RETURN TRUE;
        ELSE
            UPDATE event_throttles SET consecutive_triggers = consecutive_triggers + 1, last_tick_id = p_tick_id WHERE region_id = p_region_id AND event_category = p_category;
            RETURN FALSE;
        END IF;
    ELSE
        UPDATE event_throttles SET consecutive_triggers = 1, last_tick_id = p_tick_id WHERE region_id = p_region_id AND event_category = p_category;
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Inject Circuit breakers into existing functions
CREATE OR REPLACE FUNCTION process_panic_buying(p_tick_id BIGINT, p_region_id UUID)
RETURNS VOID AS $$
DECLARE
    v_avg_panic DECIMAL;
    v_is_tripped BOOLEAN;
BEGIN
    v_is_tripped := check_circuit_breaker(p_region_id, 'PANIC_SPAWN', p_tick_id);
    IF v_is_tripped THEN RETURN; END IF;

    SELECT panic_level INTO v_avg_panic FROM region_demographics WHERE region_id = p_region_id;
    
    IF v_avg_panic > 20.0 THEN
        UPDATE regional_market
        SET available_supply = GREATEST(0.0, available_supply - ((v_avg_panic / 100.0) * daily_demand))
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

-- Save tick metrics function
CREATE OR REPLACE FUNCTION save_tick_metrics(p_tick_id BIGINT, p_time_ms BIGINT, p_events INT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO tick_health_metrics (id, processing_time_ms, events_processed)
    VALUES (p_tick_id, p_time_ms, p_events)
    ON CONFLICT (id) DO UPDATE SET
        processing_time_ms = EXCLUDED.processing_time_ms,
        events_processed = EXCLUDED.events_processed;
        
    PERFORM calculate_civilization_pressures(p_tick_id);
END;
$$ LANGUAGE plpgsql;
