-- 023_policy_vm_upgrade.sql

ALTER TABLE policy_directives
ADD COLUMN bytecode JSONB;

UPDATE policy_directives
SET bytecode = '[
    {"opcode": "EVAL_GT", "table": "region_demographics", "field": "unrest_pressure", "value": 70, "fail_jump": "END"},
    {"opcode": "EVAL_GT", "table": "region_state_current", "field": "average_price_index", "value": 120, "fail_jump": "END"},
    {"opcode": "VALIDATE_LEGITIMACY", "value": 1.5, "fail_jump": "END"},
    {"opcode": "MUTATE", "table": "government_treasury", "field": "fiscal_reserve", "op": "SUB", "value": 50000},
    {"opcode": "MUTATE", "table": "region_demographics", "field": "unrest_pressure", "op": "SUB", "value": 15},
    {"opcode": "MUTATE", "table": "region_demographics", "field": "avg_stress", "op": "SUB", "value": 10},
    {"opcode": "MUTATE", "table": "region_state_current", "field": "average_price_index", "op": "SUB", "value": 5},
    {"opcode": "CONSUME_LEGITIMACY", "value": 1.5},
    {"opcode": "END"}
]'::jsonb
WHERE id = 'EMERGENCY_FOOD_SUBSIDY';

UPDATE policy_directives
SET bytecode = '[
    {"opcode": "EVAL_GT", "table": "region_demographics", "field": "unrest_pressure", "value": 90, "fail_jump": "END"},
    {"opcode": "VALIDATE_LEGITIMACY", "value": 10.0, "fail_jump": "END"},
    {"opcode": "MUTATE", "table": "region_demographics", "field": "unrest_pressure", "op": "SET", "value": 0},
    {"opcode": "MUTATE", "table": "region_state_current", "field": "infrastructure_health", "op": "ADD", "value": 20},
    {"opcode": "MUTATE", "table": "government_treasury", "field": "institutional_trust", "op": "SUB", "value": 40},
    {"opcode": "MUTATE", "table": "region_demographics", "field": "polarization_index", "op": "ADD", "value": 20},
    {"opcode": "CONSUME_LEGITIMACY", "value": 10.0},
    {"opcode": "END"}
]'::jsonb
WHERE id = 'MARTIAL_LAW_DEPLOYMENT';
