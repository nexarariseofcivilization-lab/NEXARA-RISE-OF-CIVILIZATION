-- 007_infrastructure_topology.sql

-- ==========================================
-- 1. INFRASTRUCTURE NODES
-- ==========================================
CREATE TABLE infrastructure_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    node_type VARCHAR(50) NOT NULL, -- 'POWER_PLANT', 'WATER_FACILITY', 'LOGISTICS_HUB', 'HOSPITAL', 'DATA_CENTER'
    
    health DECIMAL(5,2) DEFAULT 100.0,
    operational_efficiency DECIMAL(5,2) DEFAULT 100.0,
    base_capacity BIGINT NOT NULL DEFAULT 1000,
    base_maintenance_cost DECIMAL(15,2) NOT NULL DEFAULT 1000.00,
    
    status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'CRITICAL', 'OFFLINE'
    
    updated_tick_id BIGINT REFERENCES global_ticks(id)
);

CREATE INDEX idx_infra_region ON infrastructure_nodes(region_id);
CREATE INDEX idx_infra_type ON infrastructure_nodes(node_type);

-- ==========================================
-- 2. DEPENDENCY GRAPH
-- ==========================================
CREATE TABLE node_dependencies (
    consumer_node_id UUID REFERENCES infrastructure_nodes(id) ON DELETE CASCADE,
    provider_node_id UUID REFERENCES infrastructure_nodes(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) NOT NULL, -- 'ELECTRICITY', 'WATER', 'LOGISTICS'
    criticality DECIMAL(5,2) DEFAULT 1.0, -- 1.0 means full dependency
    PRIMARY KEY (consumer_node_id, provider_node_id)
);

-- ==========================================
-- 3. INFRASTRUCTURE PROCESSING & CASCADE
-- ==========================================
CREATE OR REPLACE FUNCTION process_infrastructure_tick(p_tick_id BIGINT, p_region_id UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    r RECORD;
    treasury RECORD;
BEGIN
    -- 1. Maintenance & Decay
    -- Subtract maintenance costs from government treasury. If treasury is empty, decay accelerates.
    FOR r IN SELECT * FROM infrastructure_nodes WHERE status != 'OFFLINE' AND (p_region_id IS NULL OR region_id = p_region_id) LOOP
        SELECT * INTO treasury FROM government_treasury WHERE region_id = r.region_id;
        
        IF treasury.fiscal_reserve >= r.base_maintenance_cost THEN
            -- Gov pays maintenance
            UPDATE government_treasury 
            SET fiscal_reserve = fiscal_reserve - r.base_maintenance_cost 
            WHERE region_id = r.region_id;
            
            -- Minor regular wear
            UPDATE infrastructure_nodes SET health = GREATEST(0, health - (random() * 0.5)) WHERE id = r.id;
        ELSE
            -- Neglect decay (budget deficit -> maintenance cuts)
            UPDATE infrastructure_nodes SET health = GREATEST(0, health - (2.0 + random() * 2.0)) WHERE id = r.id;
        END IF;
    END LOOP;

    -- 2. Failures & Status Updates
    FOR r IN SELECT * FROM infrastructure_nodes WHERE status != 'OFFLINE' AND (p_region_id IS NULL OR region_id = p_region_id) LOOP
        IF r.health < 10 THEN
            UPDATE infrastructure_nodes SET status = 'OFFLINE', operational_efficiency = 0.0 WHERE id = r.id;
            PERFORM publish_event(
                'INFRA.' || r.node_type || '.BLACKOUT',
                jsonb_build_object('node_id', r.id, 'node_name', r.name),
                'Infrastructure_Engine',
                r.region_id,
                'CRITICAL_SYSTEM'
            );
        ELSIF r.health < 40 THEN
            UPDATE infrastructure_nodes SET status = 'CRITICAL', operational_efficiency = 50.0 WHERE id = r.id;
        ELSE
            UPDATE infrastructure_nodes SET status = 'ACTIVE', operational_efficiency = 100.0 WHERE id = r.id;
        END IF;
    END LOOP;

    -- 3. Cascading Failure Propagation
    -- Consumers efficiency drops based on provider downtime and criticality
    -- Reset to base first (which reflects their own health)
    UPDATE infrastructure_nodes n
    SET operational_efficiency = CASE 
        WHEN status = 'OFFLINE' THEN 0.0 
        WHEN status = 'CRITICAL' THEN 50.0 
        ELSE 100.0 END
    WHERE (p_region_id IS NULL OR n.region_id = p_region_id);

    -- Apply reduction from offline dependencies
    UPDATE infrastructure_nodes consumer
    SET operational_efficiency = GREATEST(0, consumer.operational_efficiency - (d.criticality * 100.0))
    FROM node_dependencies d
    JOIN infrastructure_nodes provider ON d.provider_node_id = provider.id
    WHERE d.consumer_node_id = consumer.id 
      AND provider.status = 'OFFLINE'
      AND (p_region_id IS NULL OR consumer.region_id = p_region_id);
      
    -- Note: True cascade happens over multiple ticks organically as the node stays offline.
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 4. AGGREGATOR FUNCTION
-- ==========================================
-- Bridges Infrastructure to Economy and Society
CREATE OR REPLACE FUNCTION aggregate_infrastructure_health(p_tick_id BIGINT, p_region_id UUID)
RETURNS VOID AS $$
DECLARE
    v_avg_efficiency DECIMAL(10,2);
BEGIN
    SELECT COALESCE(AVG(operational_efficiency), 100.0) INTO v_avg_efficiency
    FROM infrastructure_nodes
    WHERE region_id = p_region_id;

    UPDATE region_state_current
    SET infrastructure_health = v_avg_efficiency,
        last_processed_tick_id = p_tick_id
    WHERE region_id = p_region_id;
    
    -- If infrastructure decays, businesses lose operational efficiency (logistics/power gaps)
    UPDATE businesses
    SET operational_efficiency = LEAST(v_avg_efficiency, 100.0)
    WHERE region_id = p_region_id AND is_bankrupt = FALSE;

    -- If infrastructure decays below 50, critical services are failing, unrest grows
    IF v_avg_efficiency < 50.0 THEN
        UPDATE households
        SET base_stress = LEAST(100, base_stress + 5.0)
        WHERE region_id = p_region_id;
        
        PERFORM publish_event(
            'INFRA.LOGISTICS.COLLAPSE',
            jsonb_build_object('health', v_avg_efficiency),
            'Infrastructure_Engine',
            p_region_id,
            'CRITICAL_SYSTEM'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;
