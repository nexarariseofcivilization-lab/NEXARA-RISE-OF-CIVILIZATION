import { getSupabaseAdmin } from '../supabase-admin';
import { PopulationWorker } from './PopulationWorker';
import { EconomyWorker } from './EconomyWorker';
import { PoliticalWorker } from './PoliticalWorker';
import { InfrastructureWorker } from './InfrastructureWorker';
import { PerceptionWorker } from './PerceptionWorker';
import { FactionWorker } from './FactionWorker';
import { GoalWorker } from './GoalWorker';
import { DiplomacyWorker } from './DiplomacyWorker';
import { CultureWorker } from './CultureWorker';

export interface EventPayload {
    id: string;
    topic: string;
    payload: any;
    region_id: string | null;
    source: string;
    correlation_id: string | null;
}

export class TickDispatcher {
    private supabase: any = getSupabaseAdmin();

    async executeTick(description: string = 'Standard System Tick') {
        const startTime = Date.now();
        console.log(`[TICK ENGINE] Initiating Tick: ${description}`);
        const { data: tickId, error: tickErr } = await (this.supabase.rpc as any)('advance_global_tick', {
            tick_description: description
        });

        if (tickErr || !tickId) {
            console.error('[TICK ENGINE] Failed to advance global tick.', tickErr);
            throw new Error('Failed to advance global tick');
        }

        console.log(`[TICK ENGINE] Advanced to Tick ID: ${tickId}`);

        // 1. Fetch pending events
        const { data: pendingEvents, error: fetchErr } = await this.supabase
            .from('event_queue')
            .select('*')
            .eq('status', 'PENDING')
            .order('priority_class', { ascending: false })
            .order('created_at', { ascending: true })
            .limit(100) as any; // Batch limit to prevent memory explosion

        if (fetchErr) {
            console.error('[TICK ENGINE] Failed to fetch pending events.', fetchErr);
            return { tickId, processed: 0, failed: 0 };
        }

        let processed = 0;
        let failed = 0;

        if (pendingEvents && pendingEvents.length > 0) {
            // 2. Mark as processing (optimistic locking pattern)
            const eventIds = pendingEvents.map((e: any) => e.id);
            await (this.supabase.from('event_queue')
                .update({ status: 'PROCESSING' } as any)
                .in('id', eventIds) as any);

            // 3. Dispatch events to domain handlers
            for (const event of pendingEvents) {
                try {
                    await this.handleEvent(event as EventPayload);
                    // Move to history if successful
                    await (this.supabase.rpc as any)('archive_event_to_history', { p_event_id: event.id, p_retention_class: 'PERMANENT' });
                    processed++;
                } catch (err: any) {
                    // ...

                    console.error(`[TICK ENGINE] Event ${event.id} failed:`, err);
                    // Move to dead letter
                    await (this.supabase.from('event_dead_letter').insert({
                        event_id: event.id,
                        topic: event.topic,
                        correlation_id: event.correlation_id,
                        region_id: event.region_id,
                        payload: event.payload,
                        source: 'TickDispatcher',
                        error_reason: err.message || 'Unknown handler error',
                        failed_at_tick_id: tickId
                    } as any) as any);
                    
                    // Cleanup from queue
                    await (this.supabase.from('event_queue').delete().eq('id', event.id) as any);
                    failed++;
                }
            }
        }

        // 3.5. Civilization Compute Governor (Hypervisor) execution
        try {
            await (this.supabase.rpc as any)('process_hypervisor_orchestration', { p_tick_id: tickId });
        } catch (hypErr) {
            console.error(`[TICK ENGINE] Hypervisor Orchestration failed:`, hypErr);
        }

        // 3.6. Temporal Elasticity & Causal Graph Energy Models
        try {
            await (this.supabase.rpc as any)('evaluate_temporal_elasticity', { p_tick_id: tickId });
            await (this.supabase.rpc as any)('process_causal_resonance', { p_tick_id: tickId });
            
            // Phase 34: Causal Horizon & Semantic Gravity
            await (this.supabase.rpc as any)('process_causal_horizon_sync', { p_tick_id: tickId }).catch(() => {});
            await (this.supabase.rpc as any)('process_semantic_gravity', { p_tick_id: tickId }).catch(() => {});
            
            // Phase 39: Evaluate Thermal Heat Zones
            await (this.supabase.rpc as any)('evaluate_causal_heat', { p_tick_id: tickId }).catch(() => {});
            
            // Phase 40: Apply Energy Conservation Laws & Dissipation
            await (this.supabase.rpc as any)('apply_energy_conservation_laws', { p_tick_id: tickId }).catch(() => {});
        } catch (causalErr) {
            console.error(`[TICK ENGINE] Causal Engine / Temporal Elasticity failed:`, causalErr);
        }

        // 4. Sub-Engines: Run Dynamics using Region Runtime Isolation with Adaptive Complexity Scaling
        const { data: regionData } = await this.supabase.from('regions').select('id') as any;
        const { data: metaData } = await this.supabase.from('region_execution_metadata').select('*') as any;
        const { data: governorData } = await this.supabase.from('region_compute_governor').select('*') as any;
        const { data: elasticityData } = await this.supabase.from('region_temporal_elasticity').select('*') as any;
        const { data: constitutionData } = await this.supabase.from('simulation_constitution').select('*').eq('id', 1).single() as any;
        const constitution = constitutionData || null;

        const infraWorker = new InfrastructureWorker();
        const percWorker = new PerceptionWorker();
        const facWorker = new FactionWorker();
        const popWorker = new PopulationWorker();
        const econWorker = new EconomyWorker();
        const polWorker = new PoliticalWorker();

        // PHASE 35: Register Executors for Reactive Router
        const activeExecutors: any[] = [infraWorker, popWorker, econWorker, polWorker, percWorker, facWorker];

        // PHASE 37: Executor Dependency Topology (DAG) Sort
        // Hardcoding the topological order for now, representing the DAG relationships
        // Infra -> Economy -> Population -> Political -> Faction -> Perception
        const sortedExecutors: any[] = [infraWorker, econWorker, popWorker, polWorker, facWorker, percWorker];

        const regionsToRun = [];

        if (regionData && regionData.length > 0) {
            for (const r of regionData) {
                const meta = metaData?.find((m: any) => m.region_id === r.id);
                const gov = governorData?.find((g: any) => g.region_id === r.id);
                const elasticity = elasticityData?.find((e: any) => e.region_id === r.id);
                
                // Temporal Elasticity resolution target (default to 30 if null)
                let interval = elasticity ? elasticity.tick_resolution_target : 30;
                
                // Optionally if we still want governor override, but elasticity is the new paradigm
                // interval = Math.min(interval, gov ? gov.tick_throttle_factor : interval);
                
                if (meta) {
                    const localChaos = meta.local_chaos_index;

                    // Circuit Breaker Constraint Checks
                    if (constitution && constitution.circuit_breaker_enabled && localChaos > constitution.circuit_breaker_chaos_threshold) {
                        console.warn(`[TICK ENGINE] 🛑 CIRCUIT BREAKER TRIGGERED for Region ${r.id}. Local Chaos (${localChaos}) exceeded threshold (${constitution.circuit_breaker_chaos_threshold}). Execution paused to prevent cascade.`);
                        continue; // Skip execution completely
                    }
                }

                if (Number(tickId) % interval === 0) {
                    regionsToRun.push({ region: r, gov });
                }
            }

            if (regionsToRun.length > 0) {
                console.log(`[TICK ENGINE] Adaptive Complexity Scaling: Executing isolated regional shards for ${regionsToRun.length} out of ${regionData.length} active regions...`);
            }
            for (const shard of regionsToRun) {
                const region = shard.region;
                const gov = shard.gov;
                const fidelity = gov ? gov.fidelity_mode : 'MEDIUM';

                try {
                    // Start region transaction sequence boundary
                    // Degradation Protocols: Depending on fidelity, some workers are skipped
                    
                    // 1. Process asynchronous cross-shard arrivals FIRST (so they affect this tick)
                    if (fidelity !== 'DEGRADED') {
                        try {
                            await (this.supabase.rpc as any)('process_arrived_transits', { p_target_region: region.id, p_current_tick: tickId });
                        } catch (transitErr) {
                            console.error(`[TICK ENGINE] Cross-shard transit processing failed for ${region.id}`, transitErr);
                        }
                    }

                    // PHASE 35: Reactive Causal Kernel Dispatch
                    // Fetch Active Causal Events for this region and route to interested Executors
                    if (fidelity !== 'DEGRADED') {
                        try {
                            const { data: rawEvents } = await this.supabase
                                .from('active_causal_events')
                                .select('*')
                                .eq('status', 'ACTIVE')
                                .eq('region_id', region.id);
                                
                            const causalEvents = rawEvents ? [...rawEvents] : [];
                            
                            // Inject system TICK PULSE event
                            causalEvents.push({
                                id: `sys-tick-${tickId}-${region.id}`,
                                region_id: region.id,
                                layer_name: 'META',
                                event_type: 'GLOBAL_TICK_PULSE',
                                energy_level: 1.0,
                                resonance_depth: 0,
                                status: 'ACTIVE'
                            });
                            
                            if (causalEvents && causalEvents.length > 0) {
                                for (const event of causalEvents) {
                                    for (const executor of sortedExecutors) {
                                        // Match subscription loosely via prefix matching (Simulating SQL LIKE)
                                        if (executor.subscriptions.some((sub: string) => event.event_type.startsWith(sub.replace('%', '')))) {
                                            if (executor.canExecute(event, null)) {
                                                const packets = await executor.execute(event, null);
                                                // Insert packets immediately as PENDING mutations
                                                if (packets && packets.length > 0) {
                                                    for (const p of packets) {
                                                        await this.supabase.from('causal_mutation_packets').insert({
                                                            tick_id: tickId,
                                                            region_id: region.id,
                                                            source_event_id: event.id,
                                                            executor_node: executor.executorNode,
                                                            target_table: p.target_table,
                                                            target_record_id: p.target_record_id,
                                                            mutation_payload: p.mutation_payload,
                                                            fidelity_cost: p.fidelity_cost,
                                                            status: 'PENDING'
                                                        });
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } catch (exErr) {
                            console.error(`[TICK ENGINE] Reactive Executor Dispatch failed for ${region.id}`, exErr);
                        }
                    }

                    // PHASE 35/37: Orchestrate Causal Mutation Pipeline
                    // Includes new arbitration engine step to resolve conflicts
                    if (fidelity !== 'DEGRADED') {
                        try {
                            // PHASE 37: Validate packets against structural constraints
                            await (this.supabase.rpc as any)('validate_causal_mutations', { p_tick_id: tickId, p_region_id: region.id });

                            // PHASE 39: Coalesce mutations to reduce micro-packets
                            await (this.supabase.rpc as any)('coalesce_pending_mutations', { p_tick_id: tickId, p_region_id: region.id });

                            // PHASE 40: Resolve causal starvation to prevent semantic deadlocks
                            await (this.supabase.rpc as any)('resolve_causal_starvation', { p_tick_id: tickId }).catch(() => {});

                            // PHASE 36: Run arbitration to reject conflicting packets
                            await (this.supabase.rpc as any)('evaluate_causal_arbitration', { p_tick_id: tickId, p_region_id: region.id });

                            // Commit the winning PENDING packets
                            const { data: packets } = await this.supabase
                                .from('causal_mutation_packets')
                                .select('id')
                                .eq('status', 'PENDING')
                                .eq('region_id', region.id) as any;
                            
                            if (packets && packets.length > 0) {
                                for(const p of packets) {
                                    await (this.supabase.rpc as any)('orchestrate_mutation_commit', { p_packet_id: p.id, p_tick_id: tickId });
                                }
                            }
                        } catch (commitErr) {
                            console.error(`[TICK ENGINE] Mutation orchestration failed for ${region.id}`, commitErr);
                        }
                    }

                    // Phase 40: ALL legacy sweep executions (processRegion) have been permanently removed.
                    // The simulation is now a pure distributed causal inference graph.

                    // Declarative Policy Enforcement Layer (Compiler Graph Execution)
                    // We might only evaluate policies heavily if not in DEGRADED mode
                    if (fidelity !== 'DEGRADED') {
                        try {
                            await (this.supabase.rpc as any)('evaluate_and_execute_policy_graph', { p_tick_id: tickId, p_region_id: region.id });
                        } catch (polErr) {
                             console.error(`[CRITICAL] Policy Compiler Engine failed for region ${region.id}`, polErr);
                        }
                    } else {
                         console.warn(`[TICK ENGINE] 🔻 Hypervisor executing DEGRADED degradation mode for ${region.id}. Policy graph bypassed.`);
                    }
                    
                    if (metaData?.some((m: any) => m.region_id === region.id)) {
                        this.supabase.from('region_execution_metadata').update({ last_executed_tick_id: tickId, updated_at: new Date().toISOString() }).eq('region_id', region.id).then();
                    }
                } catch (shardErr: any) {
                    // Region Isolation Protection: Prevent region failure from cascading to global simulation
                    console.error(`[CRITICAL] Regional Shard ${region.id} encountered a fatal error during tick ${tickId}. Soft-failing region.`, shardErr);
                    // In a more robust system, we would mark this region as 'DEGRADED' in DB.
                }
            }
        }

        // 5. Global / Inter-Regional Sub-Engines
        console.log(`[TICK ENGINE] Executing Global Meta-Systems...`);
        const goalWorker = new GoalWorker();
        await goalWorker.processGoalTick(tickId, tickId);

        const dipWorker = new DiplomacyWorker();
        await dipWorker.processDiplomacyTick(tickId, tickId);

        const cultureWorker = new CultureWorker();
        await cultureWorker.processCultureTick(tickId, tickId);

        // Global Civilization Resilience & Mutation 
        try {
            await (this.supabase.rpc as any)('sample_engine_budget', { p_tick_id: tickId });
            await (this.supabase.rpc as any)('process_recovery_and_mutation', { p_tick_id: tickId });
            await (this.supabase.rpc as any)('process_epistemic_divergence', { p_tick_id: tickId });
            await (this.supabase.rpc as any)('process_agent_personality_kernel', { p_tick_id: tickId });
            await (this.supabase.rpc as any)('process_systemic_warfare', { p_tick_id: tickId });
            await (this.supabase.rpc as any)('process_doctrine_mutation', { p_tick_id: tickId });
            await (this.supabase.rpc as any)('process_institutional_inertia', { p_tick_id: tickId });

            // Phase 46: Civilization Memory Engine
            await (this.supabase.rpc as any)('process_civilization_memory', { p_current_tick: tickId }).catch(() => {});

            // Phase 47: Cognitive Fatigue Architecture & Attention Economy
            await (this.supabase.rpc as any)('process_cognitive_economy', { p_tick_id: tickId }).catch(() => {});

            // Phase 48: Memetics and Meaning Systems
            await (this.supabase.rpc as any)('process_memetics_and_meaning', { p_tick_id: tickId }).catch(() => {});

            // Phase 49: Collective Identity Clustering
            await (this.supabase.rpc as any)('process_identity_clustering', { p_tick_id: tickId }).catch(() => {});
        } catch (mutErr) {
            console.error(`[TICK ENGINE] Mutation/Epistemic/Global Engine failed:`, mutErr);
        }

        // Global Population Migration
        try {
            await popWorker.processGlobalMigration(tickId, tickId);
        } catch (migErr) {
            console.error(`[TICK ENGINE] Global migration failed:`, migErr);
        }

        // Calculate tick metrics
        const endTime = Date.now();
        const processingTimeMs = endTime - startTime;
        
        // Runtime Stability Benchmarking
        if (processingTimeMs > 800) {
            console.warn(`[TICK ENGINE] ⚠️ TICK DRIFT WARNING: Processing took ${processingTimeMs}ms (Threshold: 800ms)`);
        } else if (pendingEvents && pendingEvents.length >= 100) {
            console.warn(`[TICK ENGINE] ⚠️ QUEUE SATURATION WARNING: Fetched 100 max events. Queue is backed up.`);
        } else {
            console.log(`[TICK ENGINE] ✅ Tick ${tickId} Completed in ${processingTimeMs}ms. Status: STABLE.`);
        }
        
        try {
            await (this.supabase.rpc as any)('save_tick_metrics', {
                p_tick_id: tickId,
                p_time_ms: processingTimeMs,
                p_events: processed
            });
        } catch (err) {
            console.error('[TICK ENGINE] Failed to save tick metrics:', err);
        }

        // 5. Finalize the tick (Snapshots etc)
        await this.finalizeTick(tickId);
        
        console.log(`[TICK ENGINE] Tick ${tickId} Processed in ${processingTimeMs}ms. Events: ${processed} SUCCESS | ${failed} FAILED.`);
        return { tickId, processed, failed };
    }

    private async handleEvent(event: EventPayload) {
        // Core Event Router. 
        // In a full implementation, this uses a robust router pattern.
        switch(event.topic) {
            case 'INFRA.NODE.OFFLINE':
                console.log(`Handling ${event.topic} for region ${event.region_id}`);
                // Implement logic...
                break;
            case 'ECONOMY.MARKET.UPDATE':
                console.log(`Handling ${event.topic} for region ${event.region_id}`);
                // Implement logic...
                break;
            default:
                console.log(`No explicit handler for topic: ${event.topic}. Auto-archiving.`);
                // If it's a generic telemetry event, just consider it handled so it gets archived.
                break;
        }
    }

    private async finalizeTick(tickId: number) {
        // e.g., Trigger delta snapshots for all regions
        // For vertical slice, we might fetch active regions and call snapshot rpc
        const { data: regions } = await this.supabase.from('regions').select('id') as any;
        if (regions) {
            for (const r of regions) {
                await (this.supabase.rpc as any)('trigger_region_snapshot', { 
                    p_region_id: r.id, 
                    p_snapshot_type: 'TICK_DELTA' 
                });
            }
        }
    }
}
