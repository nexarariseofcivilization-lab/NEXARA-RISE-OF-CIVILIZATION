-- 005_economic_survival_engine.sql

-- ==========================================
-- 1. RESOURCES (The Survival Primitives)
-- ==========================================
CREATE TABLE resources (
    id VARCHAR(50) PRIMARY KEY, -- 'FOOD', 'WATER', 'POWER', 'FUEL', 'MEDICINE'
    name VARCHAR(255) NOT NULL,
    is_essential BOOLEAN DEFAULT TRUE,
    base_price DECIMAL(10,2) NOT NULL,
    elasticity DECIMAL(5,2) DEFAULT 1.0 -- How much price swings based on scarcity
);

INSERT INTO resources (id, name, is_essential, base_price, elasticity) VALUES
('FOOD', 'Basic Nutrition', TRUE, 10.00, 0.8),
('WATER', 'Clean Water', TRUE, 5.00, 0.5),
('POWER', 'Electricity', TRUE, 15.00, 1.2),
('FUEL', 'Energy Fuel', TRUE, 20.00, 1.5),
('MEDICINE', 'Basic Healthcare', TRUE, 50.00, 0.2);

-- ==========================================
-- 2. REGIONAL MARKET STATE
-- ==========================================
-- Tracks supply, demand, and dynamic pricing per region
CREATE TABLE regional_market (
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    resource_id VARCHAR(50) REFERENCES resources(id),
    
    current_price DECIMAL(15,2) NOT NULL,
    available_supply BIGINT DEFAULT 0,
    daily_demand BIGINT DEFAULT 0,
    
    -- Telemetry for events
    price_change_pct DECIMAL(5,2) DEFAULT 0.0,
    shortage_severity DECIMAL(5,2) DEFAULT 0.0, -- 0 = abundant, 100 = total collapse
    
    updated_tick_id BIGINT REFERENCES global_ticks(id),
    
    PRIMARY KEY (region_id, resource_id)
);

-- Initialize market state triggered by trigger or handled in app.

-- ==========================================
-- 3. BUSINESSES (Infrastructure & Producers)
-- ==========================================
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(50) NOT NULL, -- 'AGRICULTURE', 'UTILITY', 'LOGISTICS', 'HEALTHCARE'
    produces_resource_id VARCHAR(50) REFERENCES resources(id),
    
    -- Economic Health
    capital DECIMAL(15,2) DEFAULT 100000.00,
    operational_efficiency DECIMAL(5,2) DEFAULT 100.0, 
    production_capacity BIGINT DEFAULT 1000,
    
    -- Employment
    max_employees INT DEFAULT 100,
    current_employees INT DEFAULT 0,
    base_wage DECIMAL(10,2) DEFAULT 50.00,
    
    is_bankrupt BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. RPC: PRODUCTION & EMPLOYMENT
-- ==========================================
CREATE OR REPLACE FUNCTION process_economic_production(p_tick_id BIGINT, p_region_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    -- 1. Businesses pay wages and produce goods
    -- For simplicity in the vertical slice, businesses produce resources directly into the regional market
    -- if they have capital.
    
    -- Deduct wages from capital
    UPDATE businesses
    SET capital = capital - (current_employees * base_wage)
    WHERE is_bankrupt = FALSE AND (p_region_id IS NULL OR region_id = p_region_id);
    
    -- Mark bankrupt if capital < 0
    UPDATE businesses
    SET is_bankrupt = TRUE, current_employees = 0
    WHERE capital < 0 AND is_bankrupt = FALSE AND (p_region_id IS NULL OR region_id = p_region_id);

    -- Businesses produce resources and add to regional supply
    WITH production AS (
        SELECT 
            region_id,
            produces_resource_id as resource_id,
            SUM((current_employees::DECIMAL / NULLIF(max_employees, 0)) * production_capacity * (operational_efficiency / 100.0)) as total_produced
        FROM businesses
        WHERE is_bankrupt = FALSE
        GROUP BY region_id, produces_resource_id
    )
    UPDATE regional_market rm
    SET available_supply = available_supply + p.total_produced,
        updated_tick_id = p_tick_id
    FROM production p
    WHERE rm.region_id = p.region_id AND rm.resource_id = p.resource_id
    AND (p_region_id IS NULL OR rm.region_id = p_region_id);
    
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 5. RPC: MARKET RESOLUTION & CONSUMPTION
-- ==========================================
CREATE OR REPLACE FUNCTION process_market_and_consumption(p_tick_id BIGINT, p_region_id UUID)
RETURNS VOID AS $$
DECLARE
    r RECORD;
    v_total_demand BIGINT;
    v_household_count BIGINT;
    v_shortage_ratio DECIMAL;
    v_new_price DECIMAL;
    v_price_spike DECIMAL;
BEGIN
    -- Get household count
    SELECT COUNT(*) INTO v_household_count 
    FROM households WHERE region_id = p_region_id;

    IF v_household_count = 0 THEN RETURN; END IF;

    FOR r IN SELECT * FROM regional_market WHERE region_id = p_region_id LOOP
        -- For survival slice, every household needs 1 unit of each essential resource per sub-tick
        v_total_demand := v_household_count; 
        
        -- Calculate shortage
        IF r.available_supply >= v_total_demand THEN
            v_shortage_ratio := 0;
            -- Small price decay due to abundance
            v_new_price := GREATEST(r.current_price * 0.98, (SELECT base_price FROM resources WHERE id = r.resource_id) * 0.5);
        ELSE
            IF v_total_demand > 0 THEN
                v_shortage_ratio := 1.0 - (r.available_supply::DECIMAL / v_total_demand::DECIMAL);
            ELSE
                v_shortage_ratio := 0;
            END IF;
            
            -- Price spikes based on elasticity and shortage
            v_new_price := r.current_price * (1.0 + (v_shortage_ratio * (SELECT elasticity FROM resources WHERE id = r.resource_id)));
        END IF;

        -- Check for severe events
        v_price_spike := (v_new_price - r.current_price) / NULLIF(r.current_price, 0);
        
        IF v_price_spike > 0.15 THEN
            PERFORM publish_event(
                'ECONOMY.INFLATION.SPIKE',
                jsonb_build_object('resource_id', r.resource_id, 'old_price', r.current_price, 'new_price', v_new_price),
                'Economy_Engine',
                p_region_id,
                'HIGH_ECONOMIC'
            );
        END IF;
        
        IF v_shortage_ratio > 0.3 THEN
            PERFORM publish_event(
                'ECONOMY.SUPPLY.SHORTAGE',
                jsonb_build_object('resource_id', r.resource_id, 'shortage_pct', v_shortage_ratio * 100),
                'Economy_Engine',
                p_region_id,
                'CRITICAL_SYSTEM'
            );
        END IF;

        -- Update market
        UPDATE regional_market
        SET 
            current_price = v_new_price,
            daily_demand = v_total_demand,
            shortage_severity = v_shortage_ratio * 100.0,
            price_change_pct = v_price_spike * 100.0,
            available_supply = GREATEST(0, available_supply - v_total_demand),
            updated_tick_id = p_tick_id
        WHERE region_id = r.region_id AND resource_id = r.resource_id;
        
        -- Apply impact to households (Wealth deduction & Survival failure)
        -- In reality this would be more nuanced per class.
        -- If it's FOOD and there's a shortage, randomly select households to suffer starvation penalty.
        IF r.resource_id = 'FOOD' AND v_shortage_ratio > 0 THEN
            -- Some households fail to secure food, increasing hunger drastically
            UPDATE households
            SET 
                base_hunger = GREATEST(0, base_hunger - 20),
                wealth = GREATEST(0, wealth - r.current_price) -- Still charge them (black market)
            WHERE region_id = p_region_id 
            AND random() < v_shortage_ratio; -- Probabilistic allocation
        ELSE
            -- Normal consumption deduction
            UPDATE households
            SET wealth = GREATEST(0, wealth - r.current_price)
            WHERE region_id = p_region_id;
        END IF;
        
    END LOOP;
END;
$$ LANGUAGE plpgsql;
