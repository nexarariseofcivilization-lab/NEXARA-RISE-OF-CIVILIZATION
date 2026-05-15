import { getSupabaseAdmin } from '../supabase-admin';
import { BaseExecutor, CausalEvent, MutationPacket } from './ReactiveExecutor';

export class EconomyWorker extends BaseExecutor {
    constructor() {
        super(
            'EconomyNode',            // executorNode
            'REACTIVE',               // operatingMode
            ['ECONOMY_%', 'INFRA_COLLAPSE', 'POPULATION_MIGRATION', 'GLOBAL_TICK_PULSE'], // subscriptions
            20,                       // priority
            getSupabaseAdmin()
        );
    }

    canExecute(event: CausalEvent, context: any): boolean {
        return event.energy_level > 0.1;
    }

    async execute(event: CausalEvent, context: any): Promise<MutationPacket[]> {
        const packets: MutationPacket[] = [];
        
        if (event.event_type === 'INFRA_COLLAPSE') {
            packets.push(this.createPacket(
                'regional_market', null, 
                { action: 'price_shock', intensity: event.energy_level, region_id: event.region_id },
                2.0
            ));
        }

        if (event.event_type === 'GLOBAL_TICK_PULSE') {
             packets.push(this.createPacket(
                 'economic_production', null,
                 { action: 'run_production', region_id: event.region_id },
                 1.0
             ));
             packets.push(this.createPacket(
                 'regional_market', null,
                 { action: 'resolve_market', region_id: event.region_id },
                 1.0
             ));
        }

        return packets;
    }
}
