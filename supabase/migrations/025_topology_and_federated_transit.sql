-- 025_topology_and_federated_transit.sql
-- Geographic Fragmentation & Asynchronous Cross-Shard Communication

-- 1. Spatial Topology & Geographic Reality
CREATE TABLE region_spatial_attributes (
    region_id UUID PRIMARY KEY REFERENCES regions(id) ON DELETE CASCADE,
    coordinate_x DECIMAL(10,2) DEFAULT 0.0,
    coordinate_y DECIMAL(10,2) DEFAULT 0.0,
    climate_zone VARCHAR(50) DEFAULT 'TROPICAL', -- TROPICAL, ARID, TEMPERATE, HIGHLAND
    terrain_roughness DECIMAL(5,2) DEFAULT 1.0, -- Multiplier for logistics cost
    strategic_value DECIMAL(5,2) DEFAULT 50.0
);

INSERT INTO region_spatial_attributes (region_id)
SELECT id FROM regions ON CONFLICT DO NOTHING;

-- 2. Inter-Region Graph (Edges)
CREATE TABLE inter_region_edges (
    source_region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    target_region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    base_distance_km DECIMAL(10,2) NOT NULL,
    base_travel_ticks BIGINT NOT NULL,
    terrain_friction DECIMAL(5,2) DEFAULT 1.0, 
    border_permeability DECIMAL(5,2) DEFAULT 1.0, -- 1.0 = open, 0.0 = closed
    border_status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, MILITARIZED, CLOSED, CONTESTED
    PRIMARY KEY (source_region_id, target_region_id)
);

-- Seed basic topology (Assuming standard region IDs exist or we update them later; we'll use a generic seeder if empty)
-- We will just define the table and let the engine seed connections.

-- 3. Federated Cross-Shard Message Bus (The "Asynchronous Transit Queue")
-- To prevent cross-region dependency explosions and lock contention,
-- ALL inter-region effects (migration, trade, rumors) happen via delayed transit payloads.
CREATE TABLE cross_shard_transit_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    departure_tick_id BIGINT REFERENCES global_ticks(id),
    arrival_tick_id BIGINT REFERENCES global_ticks(id), -- calculated based on travel_ticks * friction / permeability
    source_region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    target_region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    transit_type VARCHAR(50) NOT NULL, -- MIGRATION, TRADE_CARAVAN, IDEOLOGICAL_CONTAGION, PARAMILITARY_INCURSION
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'IN_TRANSIT', -- IN_TRANSIT, DELIVERED, LOST, INTERCEPTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient transit processing
CREATE INDEX idx_transit_arrival ON cross_shard_transit_queue(arrival_tick_id, target_region_id, status);

-- 4. Function to Dispatch a Transit Payload
CREATE OR REPLACE FUNCTION dispatch_cross_shard_transit(
    p_source_id UUID,
    p_target_id UUID,
    p_type VARCHAR,
    p_payload JSONB,
    p_current_tick BIGINT
) RETURNS UUID AS $$
DECLARE
    v_edge RECORD;
    v_arrival_tick BIGINT;
    v_new_id UUID;
BEGIN
    -- Get edge details
    SELECT * INTO v_edge FROM inter_region_edges 
    WHERE source_region_id = p_source_id AND target_region_id = p_target_id;
    
    -- Default 10 ticks if no edge explicitly defined (fallback for unconnected adjacent logic)
    IF v_edge IS NULL THEN
        v_arrival_tick := p_current_tick + 10;
    ELSE
        -- If border is closed, permutation is 0, payload cannot travel normally. (Could be rejected here, but we'll queue as INTERCEPTED or extreme delay)
        IF v_edge.border_permeability <= 0.01 THEN
             -- Smuggling / illegal crossing routing (10x slower)
             v_arrival_tick := p_current_tick + (v_edge.base_travel_ticks * v_edge.terrain_friction * 10);
        ELSE
             v_arrival_tick := p_current_tick + (v_edge.base_travel_ticks * v_edge.terrain_friction / v_edge.border_permeability);
        END IF;
    END IF;
    
    INSERT INTO cross_shard_transit_queue (departure_tick_id, arrival_tick_id, source_region_id, target_region_id, transit_type, payload)
    VALUES (p_current_tick, v_arrival_tick, p_source_id, p_target_id, p_type, p_payload)
    RETURNING id INTO v_new_id;
    
    RETURN v_new_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to Process Arrived Transit Payloads (Run by destination shard)
CREATE OR REPLACE FUNCTION process_arrived_transits(p_target_region UUID, p_current_tick BIGINT)
RETURNS INTEGER AS $$
DECLARE
    v_transit RECORD;
    v_count INTEGER := 0;
BEGIN
    FOR v_transit IN 
        SELECT * FROM cross_shard_transit_queue 
        WHERE target_region_id = p_target_region 
        AND arrival_tick_id <= p_current_tick 
        AND status = 'IN_TRANSIT'
    LOOP
        -- Processing logic per type
        -- MIGRATION: Add to target demographics
        IF v_transit.transit_type = 'MIGRATION' THEN
            UPDATE region_demographics 
            SET active_population = active_population + (v_transit.payload->>'count')::INTEGER,
                unrest_pressure = LEAST(100, unrest_pressure + COALESCE((v_transit.payload->>'unrest_burden')::DECIMAL, 0))
            WHERE region_id = p_target_region;
            
        -- IDEOLOGICAL_CONTAGION: Alter target narrative/polarization
        ELSIF v_transit.transit_type = 'IDEOLOGICAL_CONTAGION' THEN
            UPDATE region_demographics
            SET polarization_index = LEAST(100, polarization_index + (v_transit.payload->>'virality')::DECIMAL)
            WHERE region_id = p_target_region;
            
        -- TRADE_CARAVAN: Supply shock
        ELSIF v_transit.transit_type = 'TRADE_CARAVAN' THEN
            UPDATE region_state_current
            SET average_price_index = GREATEST(10, average_price_index - (v_transit.payload->>'supply_value')::DECIMAL)
            WHERE region_id = p_target_region;
            
            UPDATE government_treasury
            SET capital = capital + (v_transit.payload->>'tax_value')::DECIMAL
            WHERE region_id = p_target_region;
        END IF;
        
        -- Mark as delivered
        UPDATE cross_shard_transit_queue SET status = 'DELIVERED' WHERE id = v_transit.id;
        v_count := v_count + 1;
    END LOOP;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;
