import { SupabaseClient } from '@supabase/supabase-js';

export type OperatingMode = 'LEGACY_SWEEP' | 'REACTIVE' | 'HYBRID';

export interface CausalEvent {
    id: string;
    region_id: string;
    layer_name: string;
    event_type: string;
    energy_level: number;
    resonance_depth?: number;
}

export interface MutationPacket {
    target_table: string;
    target_record_id: string | null;
    mutation_payload: Record<string, any>;
    fidelity_cost: number;
}

/**
 * ReactiveExecutor defines the formal contract for subsystem engines.
 * Instead of monolith sweeping, workers become small modular executors
 * that react to CausalEvents.
 */
export interface ReactiveExecutor {
    executorNode: string;
    operatingMode: OperatingMode;
    subscriptions: string[]; // event_type patterns, e.g. "INFRA_%"
    priority: number;

    // Evaluate causal pressure without side effects
    canExecute(event: CausalEvent, context: any): boolean;

    // React deterministically: generate immutable mutation packets
    execute(event: CausalEvent, context: any): MutationPacket[] | Promise<MutationPacket[]>;
    
    // Fallback for hybrid or legacy mode
    sweep?(tickId: number, regionId: string, context?: any): Promise<void>;
}

export abstract class BaseExecutor implements ReactiveExecutor {
    constructor(
        public executorNode: string,
        public operatingMode: OperatingMode,
        public subscriptions: string[],
        public priority: number,
        protected supabase: SupabaseClient
    ) {}

    abstract canExecute(event: CausalEvent, context: any): boolean;
    abstract execute(event: CausalEvent, context: any): MutationPacket[] | Promise<MutationPacket[]>;

    protected createPacket(target_table: string, target_record_id: string | null, payload: any, cost: number = 1.0): MutationPacket {
        return {
            target_table,
            target_record_id,
            mutation_payload: payload,
            fidelity_cost: cost
        };
    }

    protected async emitPackets(tickId: number, regionId: string, eventId: string | null, packets: MutationPacket[]) {
        for (const p of packets) {
            await this.supabase.from('causal_mutation_packets').insert({
                tick_id: tickId,
                region_id: regionId,
                source_event_id: eventId,
                executor_node: this.executorNode,
                target_table: p.target_table,
                target_record_id: p.target_record_id,
                mutation_payload: p.mutation_payload,
                fidelity_cost: p.fidelity_cost,
                status: 'PENDING'
            });
        }
    }
}
