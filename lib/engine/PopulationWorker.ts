import { getSupabaseAdmin } from '../supabase-admin';
import { BaseExecutor, CausalEvent, MutationPacket } from './ReactiveExecutor';

export class PopulationWorker extends BaseExecutor {
    constructor() {
        super(
            'PopulationNode',         // executorNode
            'REACTIVE',               // operatingMode
            ['POPULATION_%', 'ECONOMY_CRASH', 'POLITICAL_CRISIS', 'MARTIAL_LAW', 'GLOBAL_TICK_PULSE'], // subscriptions
            30,                       // priority
            getSupabaseAdmin()
        );
    }

    canExecute(event: CausalEvent, context: any): boolean {
        return event.energy_level > 0.1;
    }

    async execute(event: CausalEvent, context: any): Promise<MutationPacket[]> {
        const packets: MutationPacket[] = [];
        
        // Example: If the economy crashes, generate unrest packets
        if (event.event_type === 'ECONOMY_CRASH') {
            packets.push(this.createPacket(
                'region_state_current', null, 
                { action: 'increase_unrest', intensity: event.energy_level, region_id: event.region_id },
                3.0
            ));
        }

        // Production pulse event
        if (event.event_type === 'POPULATION_MIGRATION_PULSE') {
             packets.push(this.createPacket(
                 'ai_citizens', null,
                 { action: 'trigger_migration_wave', region_id: event.region_id },
                 2.0
             ));
        }

        if (event.event_type === 'GLOBAL_TICK_PULSE') {
             // 1. Biological Loop for specific region
             packets.push(this.createPacket(
                 'ai_citizens', null,
                 { action: 'process_biological_decay', region_id: event.region_id },
                 1.0
             ));
             
             // 2. Behavioral Aggregation
             packets.push(this.createPacket(
                 'region_demographics', null,
                 { action: 'aggregate_region_demographics', region_id: event.region_id },
                 1.0
             ));
        }

        return packets;
    }

    async processGlobalMigration(tickId: number, tickCounter: number) {
        if (tickCounter % 5 === 0) {
            console.log(`[POPULATION ENGINE] Processing Migration (Mass Exodus) checks...`);
            const { error: migErr } = await (this.supabase.rpc as any)('process_population_migration', {
                p_tick_id: tickId
            });
            if (migErr) {
                console.error(`[POPULATION ENGINE] Migration processing failed:`, migErr);
                throw new Error(`Migration failed: ${migErr.message}`);
            }
        }
    }
}
