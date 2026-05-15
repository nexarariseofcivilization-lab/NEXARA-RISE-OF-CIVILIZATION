-- 021_policy_graph_compiler.sql
-- Declarative Civilization Runtime: Policy Graph Compiler

CREATE TABLE policy_directives (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    trigger_conditions JSONB NOT NULL, -- Declarative evaluation rules
    effects JSONB NOT NULL, -- Declarative mutation rules
    base_cooldown_ticks BIGINT DEFAULT 1440,
    legitimacy_cost DECIMAL(5,2) DEFAULT 0.0,
    epoch_gate VARCHAR(100) DEFAULT NULL, -- If set, only runs during specific epochs
    is_active BOOLEAN DEFAULT true
);

-- Example Seed: Emergency Food Subsidy
INSERT INTO policy_directives (id, name, description, trigger_conditions, effects, base_cooldown_ticks, legitimacy_cost)
VALUES (
    'EMERGENCY_FOOD_SUBSIDY',
    'Emergency Food Subsidy',
    'Injects direct capital and reduces unrest at the cost of legitimacy and fiscal reserves.',
    '{"unrest_pressure": {">": 70}, "average_price_index": {">": 120}}'::jsonb,
    '[
        {"target": "government_treasury", "field": "fiscal_reserve", "operation": "decrease", "value": 50000},
        {"target": "region_demographics", "field": "unrest_pressure", "operation": "decrease", "value": 15},
        {"target": "region_demographics", "field": "avg_stress", "operation": "decrease", "value": 10},
        {"target": "region_state_current", "field": "average_price_index", "operation": "decrease", "value": 5}
    ]'::jsonb,
    500,
    1.5
);

-- Example Seed: Martial Law Deployment
INSERT INTO policy_directives (id, name, description, trigger_conditions, effects, base_cooldown_ticks, legitimacy_cost)
VALUES (
    'MARTIAL_LAW_DEPLOYMENT',
    'Martial Law',
    'Forcibly stops unrest and stabilizes infrastructure, but severely damages institutional trust and legitimacy.',
    '{"unrest_pressure": {">": 90}}'::jsonb,
    '[
        {"target": "region_demographics", "field": "unrest_pressure", "operation": "set", "value": 0},
        {"target": "region_state_current", "field": "infrastructure_health", "operation": "increase", "value": 20},
        {"target": "government_treasury", "field": "institutional_trust", "operation": "decrease", "value": 40},
        {"target": "region_demographics", "field": "polarization_index", "operation": "increase", "value": 20}
    ]'::jsonb,
    2880,
    10.0
);

CREATE TABLE active_regional_policies (
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    policy_id VARCHAR(100) REFERENCES policy_directives(id) ON DELETE CASCADE,
    last_triggered_tick BIGINT REFERENCES global_ticks(id),
    PRIMARY KEY (region_id, policy_id)
);

-- Evaluator RPC (The Runtime Engine)
CREATE OR REPLACE FUNCTION evaluate_and_execute_policy_graph(p_tick_id BIGINT, p_region_id UUID)
RETURNS VOID AS $$
DECLARE
    v_policy RECORD;
    v_state_json JSONB;
    v_is_triggered BOOLEAN;
    v_effect JSONB;
    v_target_table VARCHAR;
    v_field VARCHAR;
    v_operation VARCHAR;
    v_value DECIMAL;
    v_cooldown_passed BOOLEAN;
    v_const simulation_constitution%ROWTYPE;
BEGIN
    SELECT * INTO v_const FROM simulation_constitution WHERE id = 1;

    -- Materialize a combined state view for the region to evaluate triggers against
    SELECT jsonb_build_object(
        'unrest_pressure', rd.unrest_pressure,
        'avg_stress', rd.avg_stress,
        'average_price_index', rs.average_price_index,
        'bureaucratic_paralysis', gt.bureaucratic_paralysis,
        'institutional_trust', gt.institutional_trust,
        'fiscal_reserve', gt.fiscal_reserve
    ) INTO v_state_json
    FROM region_demographics rd
    JOIN region_state_current rs ON rd.region_id = rs.region_id
    JOIN government_treasury gt ON rd.region_id = gt.region_id
    WHERE rd.region_id = p_region_id;

    -- Iterate over active policies
    FOR v_policy IN SELECT * FROM policy_directives WHERE is_active = true LOOP
        
        -- Check Cooldown
        v_cooldown_passed := true;
        IF EXISTS (SELECT 1 FROM active_regional_policies WHERE region_id = p_region_id AND policy_id = v_policy.id) THEN
            IF (p_tick_id - (SELECT last_triggered_tick FROM active_regional_policies WHERE region_id = p_region_id AND policy_id = v_policy.id)) < v_policy.base_cooldown_ticks THEN
                v_cooldown_passed := false;
            END IF;
        END IF;

        IF NOT v_cooldown_passed THEN
            CONTINUE;
        END IF;

        -- Evaluate declarative triggers
        -- VERY simplified evaluating engine for the prototype
        v_is_triggered := true;
        
        -- Unrest check > 70
        IF v_policy.trigger_conditions ? 'unrest_pressure' THEN
            IF (v_policy.trigger_conditions->'unrest_pressure'->>'>')::DECIMAL IS NOT NULL THEN
                IF NOT ((v_state_json->>'unrest_pressure')::DECIMAL > (v_policy.trigger_conditions->'unrest_pressure'->>'>')::DECIMAL) THEN
                    v_is_triggered := false;
                END IF;
            END IF;
        END IF;

        -- Price check > 120
        IF v_policy.trigger_conditions ? 'average_price_index' THEN
            IF (v_policy.trigger_conditions->'average_price_index'->>'>')::DECIMAL IS NOT NULL THEN
                IF NOT ((v_state_json->>'average_price_index')::DECIMAL > (v_policy.trigger_conditions->'average_price_index'->>'>')::DECIMAL) THEN
                    v_is_triggered := false;
                END IF;
            END IF;
        END IF;

        IF v_is_triggered THEN
            -- CONSTITUTIONAL VALIDATION
            IF (v_const.admin_legitimacy - v_policy.legitimacy_cost) < 0.0 THEN
                -- Policy Rejected by Constitutional Limit
                PERFORM publish_event(
                    'SYSTEM.POLICY.REJECTED',
                    jsonb_build_object('policy', v_policy.id, 'reason', 'INSUFFICIENT_LEGITIMACY'),
                    'Policy_Engine',
                    p_region_id,
                    'WARNING'
                );
                CONTINUE;
            END IF;

            -- APPLY EFFECTS (Sandbox / Interpreter Layer)
            FOR v_effect IN SELECT * FROM jsonb_array_elements(v_policy.effects) LOOP
                v_target_table := v_effect->>'target';
                v_field := v_effect->>'field';
                v_operation := v_effect->>'operation';
                v_value := (v_effect->>'value')::DECIMAL;

                -- Sandbox constraint: hardcoded allowed mutations
                IF v_target_table = 'government_treasury' THEN
                    IF v_field = 'fiscal_reserve' THEN
                        IF v_operation = 'decrease' THEN
                            UPDATE government_treasury SET fiscal_reserve = GREATEST(0, fiscal_reserve - v_value) WHERE region_id = p_region_id;
                        END IF;
                    ELSIF v_field = 'institutional_trust' THEN
                         IF v_operation = 'decrease' THEN
                            UPDATE government_treasury SET institutional_trust = GREATEST(0, institutional_trust - v_value) WHERE region_id = p_region_id;
                        END IF;
                    END IF;
                ELSIF v_target_table = 'region_demographics' THEN
                    IF v_field = 'unrest_pressure' THEN
                        IF v_operation = 'decrease' THEN
                            UPDATE region_demographics SET unrest_pressure = GREATEST(0, unrest_pressure - v_value) WHERE region_id = p_region_id;
                        ELSIF v_operation = 'set' THEN
                            UPDATE region_demographics SET unrest_pressure = v_value WHERE region_id = p_region_id;
                        END IF;
                    ELSIF v_field = 'avg_stress' THEN
                        IF v_operation = 'decrease' THEN
                            UPDATE region_demographics SET avg_stress = GREATEST(0, avg_stress - v_value) WHERE region_id = p_region_id;
                        END IF;
                    ELSIF v_field = 'polarization_index' THEN
                        IF v_operation = 'increase' THEN
                            UPDATE region_demographics SET polarization_index = LEAST(100, polarization_index + v_value) WHERE region_id = p_region_id;
                        END IF;
                    END IF;
                ELSIF v_target_table = 'region_state_current' THEN
                    IF v_field = 'average_price_index' THEN
                        IF v_operation = 'decrease' THEN
                            -- Constitutional Check on Deflation Velocity
                            UPDATE region_state_current SET average_price_index = GREATEST(v_const.min_price_index, average_price_index - LEAST(v_value, v_const.max_deflation_velocity)) WHERE region_id = p_region_id;
                        END IF;
                     ELSIF v_field = 'infrastructure_health' THEN
                        IF v_operation = 'increase' THEN
                            UPDATE region_state_current SET infrastructure_health = LEAST(100, infrastructure_health + v_value) WHERE region_id = p_region_id;
                        END IF;
                    END IF;
                END IF;
            END LOOP;

            -- Pay Legitimacy Cost
            UPDATE simulation_constitution SET admin_legitimacy = GREATEST(0, admin_legitimacy - v_policy.legitimacy_cost) WHERE id = 1;

            -- Mark cooldown
            INSERT INTO active_regional_policies (region_id, policy_id, last_triggered_tick)
            VALUES (p_region_id, v_policy.id, p_tick_id)
            ON CONFLICT (region_id, policy_id) DO UPDATE SET last_triggered_tick = p_tick_id;

            -- Publish execution trace
            PERFORM publish_event(
                'SYSTEM.POLICY.EXECUTED',
                jsonb_build_object('policy', v_policy.id, 'legitimacy_cost', v_policy.legitimacy_cost),
                'Policy_Engine',
                p_region_id,
                'CRITICAL'
            );

        END IF;

    END LOOP;
END;
$$ LANGUAGE plpgsql;
