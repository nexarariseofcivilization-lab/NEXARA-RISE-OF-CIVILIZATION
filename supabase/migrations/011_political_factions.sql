-- 011_political_factions.sql

-- ==========================================
-- 1. FACTIONS & IDEOLOGIES
-- ==========================================
CREATE TABLE factions (
    id VARCHAR(50) PRIMARY KEY, -- 'WORKER_UNION', 'ELITE_SYNDICATE', 'MILITARY_COUNCIL', 'RADICAL_SEPARATISTS'
    name VARCHAR(255) NOT NULL,
    ideology VARCHAR(50) NOT NULL,
    
    national_influence DECIMAL(5,2) DEFAULT 0.0,
    capital DECIMAL(15,2) DEFAULT 0.0,
    
    -- Agenda parameters
    preferred_policy_type VARCHAR(50) DEFAULT NULL,
    
    created_at_tick_id BIGINT REFERENCES global_ticks(id)
);

INSERT INTO factions (id, name, ideology, national_influence, capital, preferred_policy_type) VALUES
('WORKER_UNION', 'National Workers Syndicate', 'LABOR_SOCIALIST', 20.0, 50000.0, 'SUBSIDY'),
('ELITE_SYNDICATE', 'Oligarch Consortium', 'ELITE_CAPITALIST', 40.0, 5000000.0, 'TAX_RELIEF'),
('MILITARY_COUNCIL', 'Armed Forces Vanguard', 'AUTHORITARIAN_NATIONALIST', 30.0, 1000000.0, 'AUTHORITARIAN'),
('RADICAL_SEPARATISTS', 'Free Horizons Movement', 'RADICAL_ANARCHIST', 5.0, 10000.0, NULL);

-- ==========================================
-- 2. REGIONAL FACTION PRESENCE
-- ==========================================
CREATE TABLE regional_factions (
    faction_id VARCHAR(50) REFERENCES factions(id) ON DELETE CASCADE,
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    
    influence_score DECIMAL(5,2) DEFAULT 0.0, -- 0-100
    member_count BIGINT DEFAULT 0,
    loyalty DECIMAL(5,2) DEFAULT 50.0,
    
    updated_tick_id BIGINT REFERENCES global_ticks(id),
    PRIMARY KEY (faction_id, region_id)
);

-- Initialize regional factions when a region is created
DO $$
DECLARE
    r RECORD;
    f RECORD;
BEGIN
    FOR r IN SELECT * FROM regions LOOP
        FOR f IN SELECT * FROM factions LOOP
            INSERT INTO regional_factions (faction_id, region_id, influence_score)
            VALUES (f.id, r.id, 
                CASE 
                    WHEN f.id = 'WORKER_UNION' THEN 10.0
                    WHEN f.id = 'ELITE_SYNDICATE' THEN 25.0
                    WHEN f.id = 'MILITARY_COUNCIL' THEN 15.0
                    ELSE 2.0
                END
            ) ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END;
$$;

-- ==========================================
-- 3. STATE SECURITY & PARALYSIS
-- ==========================================
ALTER TABLE government_treasury
ADD COLUMN coercive_force_capacity DECIMAL(5,2) DEFAULT 100.0, -- Health of security apparatus
ADD COLUMN security_maintenance DECIMAL(15,2) DEFAULT 50000.00,
ADD COLUMN bureaucratic_paralysis DECIMAL(5,2) DEFAULT 0.0; -- 0-100, reduces policy efficacy

-- ==========================================
-- 4. ORGANIZED MOBILIZATION (EVENTS)
-- ==========================================
CREATE TABLE organized_mobilizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    faction_id VARCHAR(50) REFERENCES factions(id) ON DELETE CASCADE,
    
    mobilization_type VARCHAR(50) NOT NULL, -- 'PROTEST', 'STRIKE', 'SABOTAGE', 'REBELLION'
    intensity DECIMAL(5,2) DEFAULT 10.0, -- 0-100
    status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUPPRESSED', 'ESCALATED', 'RESOLVED'
    
    created_at_tick_id BIGINT REFERENCES global_ticks(id),
    resolved_at_tick_id BIGINT REFERENCES global_ticks(id)
);

-- ==========================================
-- 5. FACTION DYNAMICS (RPC)
-- ==========================================
CREATE OR REPLACE FUNCTION process_faction_dynamics(p_tick_id BIGINT, p_region_id UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    r RECORD;
    f RECORD;
    treasury RECORD;
    v_new_influence DECIMAL;
    v_total_unrest DECIMAL;
    v_elite_inf DECIMAL;
BEGIN
    FOR r IN SELECT * FROM regions WHERE (p_region_id IS NULL OR id = p_region_id) LOOP
        SELECT unrest_pressure INTO v_total_unrest FROM region_demographics WHERE region_id = r.id;
        SELECT * INTO treasury FROM government_treasury WHERE region_id = r.id;
        
        -- 1. Security Apparatus Maintenance
        IF treasury.fiscal_reserve >= treasury.security_maintenance THEN
            UPDATE government_treasury 
            SET fiscal_reserve = fiscal_reserve - security_maintenance,
                coercive_force_capacity = LEAST(100.0, coercive_force_capacity + 5.0)
            WHERE region_id = r.id;
        ELSE
            -- Deficit causes security apparatus to decay
            UPDATE government_treasury
            SET coercive_force_capacity = GREATEST(0.0, coercive_force_capacity - 10.0)
            WHERE region_id = r.id;
        END IF;

        -- 2. Faction Actions & Influence Growth
        FOR f IN SELECT * FROM regional_factions WHERE region_id = r.id LOOP
            -- Influence grows if unrest is high and government trust is low
            IF v_total_unrest > 50 AND treasury.institutional_trust < 40 THEN
                IF f.faction_id = 'WORKER_UNION' OR f.faction_id = 'RADICAL_SEPARATISTS' THEN
                    v_new_influence := f.influence_score + ((v_total_unrest - 50) * 0.05);
                    UPDATE regional_factions SET influence_score = LEAST(100.0, v_new_influence) WHERE faction_id = f.faction_id AND region_id = r.id;
                END IF;
            END IF;
            
            -- Elites grow influence when economy is bad (buying up resources) or paralyzing govt
            IF f.faction_id = 'ELITE_SYNDICATE' AND treasury.debt_level > 1000000 THEN
                UPDATE regional_factions SET influence_score = LEAST(100.0, influence_score + 1.0) WHERE faction_id = f.faction_id AND region_id = r.id;
            END IF;
            
            -- Spawn organized mobilizations if influence and unrest are high
            IF f.influence_score > 40 AND v_total_unrest > 60 THEN
                -- Don't spawn if already active for this faction in this region
                IF NOT EXISTS(SELECT 1 FROM organized_mobilizations WHERE region_id = r.id AND faction_id = f.faction_id AND status = 'ACTIVE') THEN
                    IF f.faction_id = 'WORKER_UNION' AND random() < 0.2 THEN
                        INSERT INTO organized_mobilizations (region_id, faction_id, mobilization_type, intensity, created_at_tick_id)
                        VALUES (r.id, f.faction_id, 'STRIKE', f.influence_score, p_tick_id);
                        
                        PERFORM publish_event('FACTION.MOBILIZATION.STRIKE', jsonb_build_object('faction', f.faction_id, 'intensity', f.influence_score), 'Faction_Engine', r.id, 'HIGH_ECONOMIC');
                    
                    ELSIF f.faction_id = 'RADICAL_SEPARATISTS' AND random() < 0.3 THEN
                        INSERT INTO organized_mobilizations (region_id, faction_id, mobilization_type, intensity, created_at_tick_id)
                        VALUES (r.id, f.faction_id, 'SABOTAGE', f.influence_score, p_tick_id);
                        
                        PERFORM publish_event('FACTION.MOBILIZATION.SABOTAGE', jsonb_build_object('faction', f.faction_id, 'intensity', f.influence_score), 'Faction_Engine', r.id, 'CRITICAL_SYSTEM');
                    END IF;
                END IF;
            END IF;
        END LOOP;
        
        -- 3. Resolve Mobilizations & Apply Impacts
        FOR f IN SELECT * FROM organized_mobilizations WHERE region_id = r.id AND status = 'ACTIVE' LOOP
            -- Government tries to suppress using Coercive Force
            SELECT coercive_force_capacity INTO treasury FROM government_treasury WHERE region_id = r.id;
            
            IF f.intensity < treasury.coercive_force_capacity AND random() < 0.7 THEN
                -- Suppressed! Reduces institutional trust as a side effect (repression cost)
                UPDATE organized_mobilizations SET status = 'SUPPRESSED', resolved_at_tick_id = p_tick_id WHERE id = f.id;
                UPDATE government_treasury SET institutional_trust = GREATEST(0, institutional_trust - 5.0) WHERE region_id = r.id;
                
                PERFORM publish_event('FACTION.MOBILIZATION.SUPPRESSED', jsonb_build_object('faction', f.faction_id, 'type', f.mobilization_type), 'Faction_Engine', r.id, 'MODERATE_SOCIAL');
            ELSE
                -- It succeeds / scales
                IF f.mobilization_type = 'STRIKE' THEN
                    -- Tank operational efficiency of businesses
                    UPDATE businesses SET operational_efficiency = GREATEST(0, operational_efficiency - (f.intensity)) WHERE region_id = r.id;
                
                ELSIF f.mobilization_type = 'SABOTAGE' THEN
                    -- Damage random infrastructure
                    UPDATE infrastructure_nodes SET health = GREATEST(0, health - (f.intensity * 0.5)) WHERE region_id = r.id AND status != 'OFFLINE' AND id = (SELECT id FROM infrastructure_nodes WHERE region_id = r.id ORDER BY random() LIMIT 1);
                END IF;
                
                -- Escalation check
                IF random() < 0.2 THEN
                    UPDATE organized_mobilizations SET intensity = LEAST(100.0, intensity + 10.0) WHERE id = f.id;
                ELSE
                    -- Eventually resolves naturally or burns out
                    IF random() < 0.1 THEN
                        UPDATE organized_mobilizations SET status = 'RESOLVED', resolved_at_tick_id = p_tick_id WHERE id = f.id;
                    END IF;
                END IF;
            END IF;
        END LOOP;
        
        -- 4. Calculate Bureaucratic Paralysis
        -- If elite influence > 50 and institutional trust < 30, paralysis shoots up.
        -- Paralysis caps the efficacy of any new policy
        SELECT influence_score INTO v_elite_inf FROM regional_factions WHERE region_id = r.id AND faction_id = 'ELITE_SYNDICATE';
        IF v_elite_inf > 50 AND treasury.institutional_trust < 30 THEN
            UPDATE government_treasury SET bureaucratic_paralysis = LEAST(100.0, bureaucratic_paralysis + 5.0) WHERE region_id = r.id;
        ELSE
            UPDATE government_treasury SET bureaucratic_paralysis = GREATEST(0.0, bureaucratic_paralysis - 2.0) WHERE region_id = r.id;
        END IF;

    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to hook paralysis into policy efficacy
CREATE OR REPLACE FUNCTION apply_paralysis_to_policy() RETURNS TRIGGER AS $$
DECLARE
    v_paralysis DECIMAL;
BEGIN
    SELECT bureaucratic_paralysis INTO v_paralysis FROM government_treasury WHERE region_id = NEW.region_id;
    -- Reduce efficacy by paralysis percentage
    NEW.efficacy := GREATEST(0.0, NEW.efficacy * (1.0 - (v_paralysis / 100.0)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tg_apply_paralysis ON active_policies;
CREATE TRIGGER tg_apply_paralysis
    BEFORE INSERT ON active_policies
    FOR EACH ROW EXECUTE FUNCTION apply_paralysis_to_policy();
