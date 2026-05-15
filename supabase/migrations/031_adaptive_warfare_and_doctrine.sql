-- 031_adaptive_warfare_and_doctrine.sql

-- Adds warfare mutation tracking
CREATE OR REPLACE FUNCTION process_doctrine_mutation(p_tick_id BIGINT)
RETURNS VOID AS $$
DECLARE
    c RECORD;
    v_source_treasury RECORD;
    v_target_metadata RECORD;
BEGIN
    FOR c IN SELECT * FROM systemic_conflicts WHERE status = 'ACTIVE' LOOP
        -- Get treasury for source faction
        SELECT * INTO v_source_treasury FROM government_treasury WHERE region_id = c.source_region_id;
        
        -- If source is running critically low on capital while maintaining a total war or expensive blockade
        IF v_source_treasury.capital < 1000 AND c.escalation_level = 'TOTAL' THEN
            -- Downgrade to insurgency
            UPDATE systemic_conflicts SET escalation_level = 'LOW', conflict_doctrine = 'INSURGENCY' WHERE id = c.id;
            PERFORM publish_event('CONFLICT.MUTATION', jsonb_build_object('conflict_id', c.id, 'new_doctrine', 'INSURGENCY', 'reason', 'RESOURCE_EXHAUSTION'), 'Warfare_Engine', c.source_region_id, 'MAJOR_POLITICAL');
        
        ELSIF v_source_treasury.capital < 300 AND c.conflict_doctrine IN ('BLOCKADE', 'ECONOMIC_EXHAUSTION', 'INFRASTRUCTURE_DENIAL') THEN
            -- Downgrade to cheap information warfare
            UPDATE systemic_conflicts SET conflict_doctrine = 'INFORMATION_WARFARE' WHERE id = c.id;
            PERFORM publish_event('CONFLICT.MUTATION', jsonb_build_object('conflict_id', c.id, 'new_doctrine', 'INFORMATION_WARFARE', 'reason', 'BANKRUPTCY_AVOIDANCE'), 'Warfare_Engine', c.source_region_id, 'MODERATE_SOCIAL');
        END IF;

        -- If target is extremely destabilized and source has plenty of capital, opportunistically escalate
        SELECT * INTO v_target_metadata FROM region_execution_metadata WHERE region_id = c.target_region_id;
        IF v_target_metadata.local_chaos_index > 80 AND c.escalation_level = 'LOW' AND v_source_treasury.capital > 5000 THEN
            UPDATE systemic_conflicts SET escalation_level = 'TOTAL', conflict_doctrine = 'INFRASTRUCTURE_DENIAL' WHERE id = c.id;
            PERFORM publish_event('CONFLICT.MUTATION', jsonb_build_object('conflict_id', c.id, 'new_doctrine', 'INFRASTRUCTURE_DENIAL', 'reason', 'OPPORTUNISTIC_ESCALATION'), 'Warfare_Engine', c.source_region_id, 'MAJOR_POLITICAL');
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
