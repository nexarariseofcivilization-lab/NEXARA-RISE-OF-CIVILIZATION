-- 046_b_memory_seed.sql
-- Seed data for Epochs
INSERT INTO historical_epochs (region_id, title, description, start_tick, end_tick, dominant_theme, objective_cause)
SELECT id, 'The Great Connectivity Collapse', 'A massive failure of the primary fiber routing protocols causing nationwide blackout.', 5000, 5080, 'ECONOMIC_COLLAPSE', 'Protocol mismatch in Core Router Alpha'
FROM regions LIMIT 1;

INSERT INTO collective_memory_drift (epoch_id, region_id, public_memory_narrative, distortion_level, blame_narrative)
SELECT 
    (SELECT id FROM historical_epochs LIMIT 1),
    (SELECT id FROM regions LIMIT 1),
    'Foreign agents hijacked the power grid to silence the populace.',
    65.0,
    'Foreign espionage faction'
WHERE EXISTS (SELECT id FROM historical_epochs LIMIT 1);

INSERT INTO civilization_myths (epoch_id, region_id, myth_title, sacredness_score, legitimacy_modifier)
SELECT
    (SELECT id FROM historical_epochs LIMIT 1),
    (SELECT id FROM regions LIMIT 1),
    'The Night of Silent Betrayal',
    85.0,
    1.15
WHERE EXISTS (SELECT id FROM historical_epochs LIMIT 1);
