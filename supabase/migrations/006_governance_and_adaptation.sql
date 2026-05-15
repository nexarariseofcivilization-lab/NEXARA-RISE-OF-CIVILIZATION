-- 006_governance_and_adaptation.sql

-- ==========================================
-- 1. GOVERNMENT & BUDGET SYSTEM
-- ==========================================
CREATE TABLE government_treasury (
    region_id UUID PRIMARY KEY REFERENCES regions(id) ON DELETE CASCADE,
    fiscal_reserve DECIMAL(15,2) DEFAULT 10000000.00,
    debt_level DECIMAL(15,2) DEFAULT 0.00,
    tax_rate DECIMAL(5,2) DEFAULT 15.00, -- Base tax percentage
    institutional_trust DECIMAL(5,2) DEFAULT 50.00, -- 0-100
    updated_tick_id BIGINT REFERENCES global_ticks(id)
);

-- ==========================================
-- 2. POLICY ARSENAL (Definitions)
-- ==========================================
CREATE TABLE policy_blueprints (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    policy_type VARCHAR(50) NOT NULL, -- 'SUBSIDY', 'TAX_RELIEF', 'RATIONING', 'MARTIAL_LAW'
    base_cost DECIMAL(15,2) DEFAULT 0.00,
    implementation_delay_ticks INT DEFAULT 3, -- Latency before effect
    bureaucratic_friction DECIMAL(5,2) DEFAULT 0.10, -- 10% lost to corruption/inefficiency
    description TEXT
);

INSERT INTO policy_blueprints (id, name, policy_type, base_cost, implementation_delay_ticks, bureaucratic_friction) VALUES
('FOOD_SUBSIDY', 'Emergency Food Subsidy', 'SUBSIDY', 500000.00, 2, 0.15),
('TAX_HOLIDAY', 'Working Class Tax Holiday', 'TAX_RELIEF', 1000000.00, 1, 0.05),
('MARTIAL_LAW', 'Declare Martial Law', 'AUTHORITARIAN', 250000.00, 1, 0.00),
('PRICE_CAPS', 'Essential Resource Price Controls', 'MARKET_INTERVENTION', 50000.00, 3, 0.20),
('AGRI_STIMULUS', 'Agricultural Production Stimulus', 'STIMULUS', 2000000.00, 10, 0.30); -- Takes long, loses 30% to bureaucracy

-- ==========================================
-- 3. ACTIVE/ENACTED POLICIES
-- ==========================================
CREATE TABLE active_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    policy_id VARCHAR(50) REFERENCES policy_blueprints(id),
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'ACTIVE', 'COMPLETED', 'FAILED'
    enacted_at_tick_id BIGINT REFERENCES global_ticks(id),
    activates_at_tick_id BIGINT REFERENCES global_ticks(id),
    expires_at_tick_id BIGINT REFERENCES global_ticks(id), -- Null if indefinite
    actual_cost DECIMAL(15,2) DEFAULT 0.00,
    efficacy DECIMAL(5,2) DEFAULT 1.00 -- 1.00 minus bureaucratic friction + random variance
);

-- ==========================================
-- 4. RPC: ENACT POLICY
-- ==========================================
CREATE OR REPLACE FUNCTION enact_policy(
    p_region_id UUID,
    p_policy_id VARCHAR
) RETURNS UUID AS $$
DECLARE
    v_new_active_policy_id UUID;
    v_blueprint policy_blueprints%ROWTYPE;
    v_treasury government_treasury%ROWTYPE;
    v_cur_tick BIGINT;
    v_cost DECIMAL;
    v_efficacy DECIMAL;
BEGIN
    SELECT MAX(id) INTO v_cur_tick FROM global_ticks;
    
    SELECT * INTO v_blueprint FROM policy_blueprints WHERE id = p_policy_id;
    SELECT * INTO v_treasury FROM government_treasury WHERE region_id = p_region_id FOR UPDATE;
    
    -- Check if we can afford it (simple strict check or allow debt)
    -- Allow debt if critical, but for now just add to debt if cost > reserve.
    v_cost := v_blueprint.base_cost;
    IF v_treasury.fiscal_reserve >= v_cost THEN
        UPDATE government_treasury 
        SET fiscal_reserve = fiscal_reserve - v_cost 
        WHERE region_id = p_region_id;
    ELSE
        -- Enter debt
        UPDATE government_treasury 
        SET 
            fiscal_reserve = 0,
            debt_level = debt_level + (v_cost - fiscal_reserve)
        WHERE region_id = p_region_id;
    END IF;
    
    -- Calculate efficacy (subject to bureaucratic loss)
    v_efficacy := 1.0 - v_blueprint.bureaucratic_friction - (random() * 0.1); -- Random additional 0-10% loss
    v_efficacy := GREATEST(0.1, v_efficacy);

    INSERT INTO active_policies (
        region_id, policy_id, enacted_at_tick_id, 
        activates_at_tick_id, actual_cost, efficacy
    ) VALUES (
        p_region_id, p_policy_id, v_cur_tick,
        v_cur_tick + v_blueprint.implementation_delay_ticks, v_cost, v_efficacy
    ) RETURNING id INTO v_new_active_policy_id;
    
    -- Emit event
    PERFORM publish_event(
        'POLITICS.POLICY.ENACTED',
        jsonb_build_object('policy_id', p_policy_id, 'activates_at', v_cur_tick + v_blueprint.implementation_delay_ticks, 'cost', v_cost),
        'Political_Engine',
        p_region_id,
        'HIGH_ECONOMIC'
    );
    
    RETURN v_new_active_policy_id;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 5. RPC: PROCESS POLICIES & GOVERNANCE
-- ==========================================
CREATE OR REPLACE FUNCTION process_governance_tick(p_tick_id BIGINT, p_region_id UUID)
RETURNS VOID AS $$
DECLARE
    pol RECORD;
BEGIN
    -- 1. Tax Collection
    WITH regional_wealth AS (
        SELECT SUM(wealth) as total_wealth FROM households WHERE region_id = p_region_id
    )
    UPDATE government_treasury gt
    SET fiscal_reserve = fiscal_reserve + COALESCE((rw.total_wealth * (gt.tax_rate / 100.0) * 0.05), 0) -- tax 5% of tax_rate per cycle
    FROM regional_wealth rw
    WHERE gt.region_id = p_region_id;
    
    -- Tax impact on households
    UPDATE households h
    SET wealth = GREATEST(0, wealth - (wealth * ((SELECT tax_rate FROM government_treasury WHERE region_id = p_region_id) / 100.0) * 0.05))
    WHERE h.region_id = p_region_id;

    -- Emit treasury event if critical
    IF (SELECT debt_level FROM government_treasury WHERE region_id = p_region_id) > 5000000.00 THEN
        PERFORM publish_event('POLITICS.TREASURY.CRITICAL', jsonb_build_object('debt', (SELECT debt_level FROM government_treasury WHERE region_id = p_region_id)), 'Political_Engine', p_region_id, 'CRITICAL_SYSTEM');
    END IF;
    
    -- 2. Policy Activation (Delay Expiry)
    UPDATE active_policies
    SET status = 'ACTIVE'
    WHERE region_id = p_region_id AND status = 'PENDING' AND activates_at_tick_id <= p_tick_id;
    
    -- 3. Policy Effects
    FOR pol IN SELECT * FROM active_policies ap JOIN policy_blueprints pb ON ap.policy_id = pb.id WHERE ap.region_id = p_region_id AND ap.status = 'ACTIVE' LOOP
        IF pol.policy_id = 'FOOD_SUBSIDY' THEN
            -- Directly inject food supply using actual efficacy
            UPDATE regional_market
            SET available_supply = available_supply + (5000 * pol.efficacy)
            WHERE region_id = p_region_id AND resource_id = 'FOOD';
            
            -- End this discrete policy
            UPDATE active_policies SET status = 'COMPLETED' WHERE id = pol.id;
            
        ELSIF pol.policy_id = 'TAX_HOLIDAY' THEN
            -- Increase institutional trust
            UPDATE government_treasury SET institutional_trust = LEAST(100, institutional_trust + (5.0 * pol.efficacy)) WHERE region_id = p_region_id;
            UPDATE active_policies SET status = 'COMPLETED' WHERE id = pol.id;
            
        ELSIF pol.policy_id = 'MARTIAL_LAW' THEN
            -- Decrease unrest dramatically, but tank trust
            UPDATE households SET radicalization_level = 0, base_stress = GREATEST(0, base_stress - (20 * pol.efficacy)) WHERE region_id = p_region_id;
            UPDATE government_treasury SET institutional_trust = GREATEST(0, institutional_trust - 20) WHERE region_id = p_region_id;
            -- Need way to expire martial law, assume 1-shot impact for slice
            UPDATE active_policies SET status = 'COMPLETED' WHERE id = pol.id;
        END IF;
    END LOOP;

    -- Emit Trust collapse event if needed
    IF (SELECT institutional_trust FROM government_treasury WHERE region_id = p_region_id) < 10.0 THEN
        PERFORM publish_event('POLITICS.TRUST.COLLAPSE', jsonb_build_object('trust', (SELECT institutional_trust FROM government_treasury WHERE region_id = p_region_id)), 'Political_Engine', p_region_id, 'CRITICAL_SOCIAL');
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Initialize Treasury on Region Creation
CREATE OR REPLACE FUNCTION init_region_treasury() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO government_treasury (region_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tg_init_region_treasury ON regions;
CREATE TRIGGER tg_init_region_treasury
    AFTER INSERT ON regions
    FOR EACH ROW EXECUTE FUNCTION init_region_treasury();
