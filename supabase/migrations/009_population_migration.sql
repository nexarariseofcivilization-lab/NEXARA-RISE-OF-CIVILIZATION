-- 009_population_migration.sql

-- ==========================================
-- 1. POPULATION MOVEMENT (MIGRATION)
-- ==========================================

CREATE OR REPLACE FUNCTION process_population_migration(p_tick_id BIGINT)
RETURNS VOID AS $$
DECLARE
    r_source RECORD;
    r_dest RECORD;
    v_migrants INT;
BEGIN
    -- For each region where unrest is very high, people attempt to flee
    FOR r_source IN 
        SELECT id, total_population, unrest_pressure 
        FROM region_demographics 
        WHERE unrest_pressure > 70 
    LOOP
        -- Calculate migrants (up to 1% of population per tick if critical)
        v_migrants := (r_source.total_population * ((r_source.unrest_pressure - 70) / 1000.0))::INT;
        
        IF v_migrants > 0 THEN
            -- Find the safest region (lowest unrest pressure) to migrate to
            SELECT id INTO r_dest
            FROM region_demographics
            WHERE id != r_source.id AND unrest_pressure < 50
            ORDER BY unrest_pressure ASC
            LIMIT 1;
            
            IF FOUND THEN
                -- Move population (Update Demographics)
                UPDATE region_demographics
                SET total_population = GREATEST(0, total_population - v_migrants)
                WHERE id = r_source.id;
                
                UPDATE region_demographics
                SET total_population = total_population + v_migrants
                WHERE id = r_dest.id;
                
                -- Move households proportionally
                -- (We simplify by moving some household rows, or just updating their region_id)
                -- We move up to (v_migrants / 4) households
                UPDATE households
                SET region_id = r_dest.id,
                    wealth = GREATEST(0, wealth * 0.5), -- Migrants lose 50% wealth in transit
                    base_stress = LEAST(100, base_stress + 20) -- Stress increases due to move
                WHERE id IN (
                    SELECT id FROM households 
                    WHERE region_id = r_source.id 
                    LIMIT GREATEST(1, v_migrants / 4)
                );
                
                -- Emit Migration Event
                PERFORM publish_event(
                    'POPULATION.MIGRATION.MASS_EXODUS',
                    jsonb_build_object('migrants', v_migrants, 'from_region', r_source.id, 'to_region', r_dest.id),
                    'Population_Engine',
                    r_source.id,
                    'CRITICAL_SOCIAL'
                );
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
