import { getSupabaseAdmin } from '../supabase-admin';
import { BaseExecutor, CausalEvent, MutationPacket } from './ReactiveExecutor';

export class PoliticalWorker extends BaseExecutor {
    constructor() {
        super(
            'PoliticalNode',
            'REACTIVE',
            ['POLITICAL_%', 'GLOBAL_TICK_PULSE', 'CRITICAL_UNREST'],
            40,
            getSupabaseAdmin()
        );
    }

    canExecute(event: CausalEvent, context: any): boolean {
        return event.energy_level > 0.1;
    }

    async execute(event: CausalEvent, context: any): Promise<MutationPacket[]> {
        const packets: MutationPacket[] = [];
        
        if (event.event_type === 'CRITICAL_UNREST') {
            packets.push(this.createPacket(
                'regional_policies', null, 
                { action: 'eval_emergency_policy', severity: event.energy_level, region_id: event.region_id },
                1.5
            ));
        }

        if (event.event_type === 'GLOBAL_TICK_PULSE') {
             packets.push(this.createPacket(
                 'governance_pulse', null,
                 { action: 'process_governance_tick', region_id: event.region_id },
                 1.0
             ));
              // Phase 44: Epistemic Recovery
             packets.push(this.createPacket(
                 'regional_recovery_institutions', null,
                 { action: 'process_epistemic_recovery', region_id: event.region_id },
                 1.0
             ));
             // Phase 45: Trust Stratification
             packets.push(this.createPacket(
                 'epistemic_trust_graph', null,
                 { action: 'process_trust_stratification', region_id: event.region_id },
                 1.0
             ));
        }

        return packets;
    }
}
