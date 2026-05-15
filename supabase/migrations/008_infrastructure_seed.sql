-- 008_infrastructure_seed.sql

DO $$
DECLARE
    r RECORD;
    v_power UUID;
    v_water UUID;
    v_logistics UUID;
    v_hospital UUID;
BEGIN
    FOR r IN SELECT * FROM regions LOOP
        -- For each region, insert a Power Plant
        INSERT INTO infrastructure_nodes (region_id, name, node_type, health, operational_efficiency, base_capacity, base_maintenance_cost, status)
        VALUES (
            r.id, 
            r.name || ' Main Power Grid', 
            'POWER_PLANT', 
            100.0, 100.0, 500000, 10000.00, 'ACTIVE'
        ) RETURNING id INTO v_power;

        -- Insert Water Facility
        INSERT INTO infrastructure_nodes (region_id, name, node_type, health, operational_efficiency, base_capacity, base_maintenance_cost, status)
        VALUES (
            r.id, 
            r.name || ' Water Treatment Center', 
            'WATER_FACILITY', 
            100.0, 100.0, 500000, 5000.00, 'ACTIVE'
        ) RETURNING id INTO v_water;

        -- Insert Logistics Hub
        INSERT INTO infrastructure_nodes (region_id, name, node_type, health, operational_efficiency, base_capacity, base_maintenance_cost, status)
        VALUES (
            r.id, 
            r.name || ' Central Logistics Hub', 
            'LOGISTICS_HUB', 
            100.0, 100.0, 200000, 8000.00, 'ACTIVE'
        ) RETURNING id INTO v_logistics;

        -- Insert Hospital
        INSERT INTO infrastructure_nodes (region_id, name, node_type, health, operational_efficiency, base_capacity, base_maintenance_cost, status)
        VALUES (
            r.id, 
            r.name || ' General Hospital', 
            'HOSPITAL', 
            100.0, 100.0, 10000, 15000.00, 'ACTIVE'
        ) RETURNING id INTO v_hospital;

        -- Create Dependencies
        -- Water depends on Power
        INSERT INTO node_dependencies (consumer_node_id, provider_node_id, dependency_type, criticality)
        VALUES (v_water, v_power, 'ELECTRICITY', 1.0);

        -- Logistics depends on Power
        INSERT INTO node_dependencies (consumer_node_id, provider_node_id, dependency_type, criticality)
        VALUES (v_logistics, v_power, 'ELECTRICITY', 0.5); -- partial dependency (can run slow without power)

        -- Hospital depends on Power AND Water
        INSERT INTO node_dependencies (consumer_node_id, provider_node_id, dependency_type, criticality)
        VALUES (v_hospital, v_power, 'ELECTRICITY', 1.0);
        
        INSERT INTO node_dependencies (consumer_node_id, provider_node_id, dependency_type, criticality)
        VALUES (v_hospital, v_water, 'WATER', 1.0);
    END LOOP;
END;
$$;
