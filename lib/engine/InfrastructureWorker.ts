import { getSupabaseAdmin } from '../supabase-admin';
import { BaseExecutor, CausalEvent, MutationPacket } from './ReactiveExecutor';

export class InfrastructureWorker extends BaseExecutor {
    constructor() {
        super(
            'InfrastructureNode',     // executorNode
            'REACTIVE',               // operatingMode
            ['PHYSICS_%', 'INFRA_%', 'GLOBAL_TICK_PULSE'], // subscriptions
            10,                       // priority
            getSupabaseAdmin()
        );
    }

    canExecute(event: CausalEvent, context: any): boolean {
        // Evaluate local bounds to see if we should react
        return event.energy_level > 0.1;
    }

    async execute(event: CausalEvent, context: any): Promise<MutationPacket[]> {
        const packets: MutationPacket[] = [];
        
        // Convert causal event into concrete structural damage or upgrade packets
        if (event.event_type === 'PHYSICS_SHOCK' || event.event_type === 'INFRA_COLLAPSE') {
            packets.push(this.createPacket(
                'infrastructure_nodes', null, 
                { action: 'apply_damage', resonance_factor: event.resonance_depth || 1.0, region_id: event.region_id },
                1.5
            ));
        }

        if (event.event_type === 'GLOBAL_TICK_PULSE') {
             packets.push(this.createPacket(
                 'infrastructure_nodes', null,
                 { action: 'process_infrastructure_tick', region_id: event.region_id },
                 1.0
             ));
             packets.push(this.createPacket(
                 'infrastructure_nodes', null,
                 { action: 'aggregate_infrastructure_health', region_id: event.region_id },
                 1.0
             ));
             // Phase 43: Observability Degradation
             packets.push(this.createPacket(
                 'regional_observability_grid', null,
                 { action: 'process_observability_degradation', region_id: event.region_id },
                 1.0
             ));
        }

        return packets;
    }
}
