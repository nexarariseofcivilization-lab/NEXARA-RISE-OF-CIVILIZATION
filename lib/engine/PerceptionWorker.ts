import { getSupabaseAdmin } from '../supabase-admin';
import { BaseExecutor, CausalEvent, MutationPacket } from './ReactiveExecutor';

export class PerceptionWorker extends BaseExecutor {
    constructor() {
        super(
            'PerceptionNode',
            'REACTIVE',
            ['PERCEPTION_%', 'GLOBAL_TICK_PULSE', 'MYTH_RESONANCE', 'INFORMATION_CASCADE'],
            60,
            getSupabaseAdmin()
        );
    }

    canExecute(event: CausalEvent, context: any): boolean {
        return event.energy_level > 0.05; // Perception is very sensitive
    }

    async execute(event: CausalEvent, context: any): Promise<MutationPacket[]> {
        const packets: MutationPacket[] = [];
        
        if (event.event_type === 'INFORMATION_CASCADE') {
            packets.push(this.createPacket(
                'region_demographics', null, 
                { action: 'trigger_panic_buying', intensity: event.energy_level, region_id: event.region_id },
                1.2
            ));
        }

        if (event.event_type === 'MYTH_RESONANCE') {
            packets.push(this.createPacket(
                'historical_events', null,
                { action: 'amplify_mythology', resonance: event.energy_level, region_id: event.region_id },
                2.0
            ));
        }

        if (event.event_type === 'GLOBAL_TICK_PULSE') {
             packets.push(this.createPacket(
                 'social_perception', null,
                 { action: 'process_perception_tick', region_id: event.region_id },
                 1.0
             ));
             packets.push(this.createPacket(
                 'social_perception', null,
                 { action: 'process_panic_buying', region_id: event.region_id },
                 1.0
             ));
             // Phase 41: Epistemic Divergence (Causal Identity Fragmentation)
             packets.push(this.createPacket(
                 'regional_epistemic_divergence', null,
                 { action: 'process_epistemic_divergence', region_id: event.region_id },
                 1.0
             ));
             // Phase 42: Reality Friction (Cognitive Dissonance)
             packets.push(this.createPacket(
                 'regional_reality_friction', null,
                 { action: 'process_reality_friction', region_id: event.region_id },
                 1.0
             ));
             // Phase 46: Civilization Memory Engine
             packets.push(this.createPacket(
                 'historical_epochs', null,
                 { action: 'process_civilization_memory', region_id: event.region_id },
                 1.0
             ));
        }

        return packets;
    }
}
