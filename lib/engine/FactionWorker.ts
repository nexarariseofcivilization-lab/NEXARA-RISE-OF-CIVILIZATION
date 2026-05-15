import { getSupabaseAdmin } from '../supabase-admin';
import { BaseExecutor, CausalEvent, MutationPacket } from './ReactiveExecutor';

export class FactionWorker extends BaseExecutor {
    constructor() {
        super(
            'FactionNode',
            'REACTIVE',
            ['FACTION_%', 'GLOBAL_TICK_PULSE', 'POWER_VACUUM'],
            50,
            getSupabaseAdmin()
        );
    }

    canExecute(event: CausalEvent, context: any): boolean {
        return event.energy_level > 0.1;
    }

    async execute(event: CausalEvent, context: any): Promise<MutationPacket[]> {
        const packets: MutationPacket[] = [];
        
        if (event.event_type === 'POWER_VACUUM') {
            packets.push(this.createPacket(
                'factions', null, 
                { action: 'trigger_mobilization', intensity: event.energy_level, region_id: event.region_id },
                1.5
            ));
        }

        if (event.event_type === 'GLOBAL_TICK_PULSE') {
             packets.push(this.createPacket(
                 'faction_dynamics', null,
                 { action: 'process_faction_dynamics', region_id: event.region_id },
                 1.0
             ));
        }

        return packets;
    }
}
