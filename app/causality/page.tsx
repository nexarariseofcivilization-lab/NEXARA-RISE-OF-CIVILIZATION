import React from 'react';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, GitMerge, Layers, Clock, Activity, AlertTriangle, Shield, Magnet, Database, History, Archive, Flame, Battery, Cpu, Brain, HeartCrack, RadioTower, EyeOff, Microscope, Users, Scale, BookOpen, Scroll, Landmark, Ghost } from 'lucide-react';

export const revalidate = 0;

export default async function CausalityPage() {
    const supabase = getSupabaseAdmin();
    
    const { data: regions } = await supabase.from('regions').select('id, name') as any;
    const { data: elasticity } = await supabase.from('region_temporal_elasticity').select('*') as any;
    const { data: genomes } = await supabase.from('civilization_identity_genome').select('*') as any;
    const { data: events } = await supabase.from('active_causal_events').select('*').order('energy_level', { ascending: false }) as any;
    
    // Phase 34 Additions
    const { data: rawLimits } = await supabase.from('causal_propagation_limits').select('*') as any;
    const limits = rawLimits || [];
    
    const { data: rawSubs } = await supabase.from('causal_subscription_registry').select('*').order('priority_order') as any;
    const subscriptions = rawSubs || [];
    
    const { data: rawHorizons } = await supabase.from('region_temporal_horizon').select('*') as any;
    const horizons = rawHorizons || [];
    
    const { data: rawWells } = await supabase.from('semantic_gravity_wells').select('*') as any;
    const gravityWells = rawWells || [];

    // Phase 35 Additions
    const { data: rawDomains } = await supabase.from('causal_isolation_domains').select('*') as any;
    const isolationDomains = rawDomains || [];
    
    const { data: rawPackets } = await supabase.from('causal_mutation_packets').select('*').order('created_at', { ascending: false }).limit(20) as any;
    const mutationPackets = rawPackets || [];
    
    const { data: rawCommits } = await supabase.from('causal_commit_log').select('*').order('commit_order', { ascending: false }).limit(20) as any;
    const commitLogs = rawCommits || [];

    const { data: rawArbitration } = await supabase.from('causal_arbitration_rules').select('*') as any;
    const arbitrationRules = rawArbitration || [];

    // Phase 37 Additions
    const { data: rawDAG } = await supabase.from('executor_dependency_graph').select('*') as any;
    const dagRules = rawDAG || [];

    const { data: rawConstraints } = await supabase.from('mutation_validation_constraints').select('*') as any;
    const validationConstraints = rawConstraints || [];

    // Phase 38 Additions
    const { data: rawVirtualization } = await supabase.from('state_compression_registry').select('*, regions(name)') as any;
    const virtualizationState = rawVirtualization || [];
    
    // Phase 39 Additions
    const { data: rawHeatMap } = await supabase.from('regional_causal_heat').select('*, regions(name)') as any;
    const heatMap = rawHeatMap || [];
    
    // Phase 40 Additions
    const { data: rawEnergy } = await supabase.from('global_energy_conservation').select('*') as any;
    const energyConservation = rawEnergy || [];
    const { data: rawStarvation } = await supabase.from('causal_packet_starvation_tracker').select('*, causal_mutation_packets(target_table, status)') as any;
    const starvationTracker = rawStarvation || [];

    // Phase 41 Additions
    const { data: rawEpistemic } = await supabase.from('regional_epistemic_divergence').select('*, regions(name)') as any;
    const epistemicDivergence = rawEpistemic || [];

    // Phase 42 Additions
    const { data: rawFriction } = await supabase.from('regional_reality_friction').select('*, regions(name)') as any;
    const realityFriction = rawFriction || [];

    // Phase 43 Additions
    const { data: rawTrauma } = (await supabase.from('regional_epistemic_trauma').select('*, regions(name)')) as any;
    const epistemicTrauma = rawTrauma || [];
    const { data: rawObservability } = (await supabase.from('regional_observability_grid').select('*, regions(name)')) as any;
    const observabilityGrid = rawObservability || [];

    // Phase 44 Additions
    const { data: rawRecovery } = (await supabase.from('regional_recovery_institutions').select('*, regions(name)')) as any;
    const recoveryInstitutions = rawRecovery || [];

    // Phase 45 Additions
    const { data: rawTrustGraph } = (await supabase.from('epistemic_trust_graph').select('*, regions(name)')) as any;
    const epistemicTrustGraph = rawTrustGraph || [];
    const { data: rawClassDivide } = (await supabase.from('epistemic_class_divide').select('*, regions(name)')) as any;
    const epistemicClassDivide = rawClassDivide || [];

    // Phase 46 Additions
    const { data: rawEpochs } = (await supabase.from('historical_epochs').select('*, regions(name)').order('start_tick', { ascending: false })) as any;
    const historicalEpochs = rawEpochs || [];
    const { data: rawMemoryDrift } = (await supabase.from('collective_memory_drift').select('*, historical_epochs(title)')) as any;
    const memoryDrift = rawMemoryDrift || [];
    const { data: rawTraumaTransfer } = (await supabase.from('generational_trauma_transfer').select('*, regions(name)')) as any;
    const traumaTransfer = rawTraumaTransfer || [];
    const { data: rawMyths } = (await supabase.from('civilization_myths').select('*, regions(name), historical_epochs(title)')) as any;
    const civilizationMyths = rawMyths || [];

    return (
        <MainLayout>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Temporal Elasticity State */}
                <Card className="col-span-1 xl:col-span-1">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2">
                            <span>Temporal Elasticity Engine</span>
                        </CardTitle>
                        <p className="text-sm text-gray-400 font-mono">Dynamic tick resolution based on regional entropy.</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {regions?.map((region: any) => {
                            const e = elasticity?.find((e: any) => e.region_id === region.id);
                            if (!e) return null;
                            return (
                                <div key={region.id} className="p-4 bg-gray-900 border border-gray-800 rounded-md">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="font-bold">{region.name}</div>
                                        <Badge variant={e.state_classification === 'STABLE' ? 'outline' : 'destructive'}>
                                            {e.state_classification}
                                        </Badge>
                                    </div>
                                    <div className="text-sm font-mono text-gray-500 grid grid-cols-2 gap-2">
                                        <div><span className="text-gray-400">Resolution Target:</span> Every {e.tick_resolution_target} Ticks</div>
                                        <div><span className="text-gray-400">Tick Modulo:</span> {e.current_tick_modulo}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Civilization Identity Genome */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2">
                            <span>Civilization Genome</span>
                        </CardTitle>
                        <p className="text-sm text-gray-400 font-mono">Persistent cultural archetypes and historical trauma traits.</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {regions?.map((region: any) => {
                            const gen = genomes?.find((g: any) => g.region_id === region.id);
                            if (!gen) return null;
                            return (
                                <div key={region.id} className="p-4 bg-gray-900 border border-gray-800 rounded-md">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="font-bold">{region.name}</div>
                                        <div className="text-sm text-blue-400 font-mono">{gen.dominant_archetype}</div>
                                    </div>
                                    <div className="text-sm font-mono grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-gray-500 mb-1">Historical Trauma Index</div>
                                            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                                <div className="bg-red-500 h-full" style={{ width: `${Math.min(100, Math.max(0, gen.historical_trauma_index))}%` }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500 mb-1">Continuity Cohesion</div>
                                            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                                <div className="bg-green-500 h-full" style={{ width: `${Math.min(100, Math.max(0, gen.continuity_cohesion))}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Active Causal Resonance Graph */}
                <Card className="col-span-1 xl:col-span-3">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2">
                            <Activity className="w-5 h-5 text-yellow-500" />
                            Active Causal Events Graph
                        </CardTitle>
                        <p className="text-sm text-gray-400 font-mono">Events with energy momentum propagating through structural layers.</p>
                    </CardHeader>
                    <CardContent>
                        {events && events.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {events.map((ev: any) => (
                                    <div key={ev.id} className="p-3 border border-gray-800 rounded-md relative overflow-hidden">
                                        {/* Energy background bar indicator */}
                                        <div 
                                            className="absolute bottom-0 left-0 bg-yellow-500/10 h-1" 
                                            style={{ width: `${Math.min(100, ev.energy_level)}%` }}
                                        />
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-xs px-2 py-1 bg-gray-800 rounded font-mono ${ev.status === 'ACTIVE' ? 'text-yellow-400' : 'text-gray-500'}`}>
                                                {ev.status}
                                            </span>
                                            <span className="text-xs font-mono text-blue-400">{ev.layer_name}</span>
                                        </div>
                                        <div className="font-bold text-sm mb-1">{ev.event_type}</div>
                                        <div className="text-xs text-gray-500 font-mono mt-2 space-y-1">
                                            <div className="flex justify-between">
                                                <span>Energy:</span> 
                                                <span className="text-white">{ev.energy_level.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Decay Rate:</span> 
                                                <span>-{ev.decay_rate_per_tick.toFixed(2)}/t</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Resonance Factor:</span> 
                                                <span>{ev.resonance_factor.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Reactivation Thresh:</span> 
                                                <span>{ev.reactivation_threshold.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 text-gray-500 font-mono border border-dashed border-gray-800 rounded-md">
                                No active causal resonance events propagating at this time. Simulator entropy is stable.
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>

            {/* PHASE 34: Causal Engine Architectures */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
                
                {/* Temporal Causal Horizon Sync */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            Temporal Horizon Sync
                        </CardTitle>
                        <p className="text-xs text-gray-400 font-mono">Asymmetric temporal barrier to prevent causality paradox.</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {horizons && horizons.length > 0 ? horizons.map((h: any) => (
                            <div key={h.region_id} className="p-3 bg-gray-900 border border-gray-800 rounded">
                                <div className="text-xs font-mono text-gray-500 mb-1">REGION {h.region_id.substring(0,8)}</div>
                                <div className="flex justify-between items-center text-sm font-mono text-gray-300">
                                    <span>Latest Tick: <span className="text-blue-400 font-bold">{h.last_processed_tick}</span></span>
                                    <span>Locked: <span className="text-purple-400 font-bold">{h.locked_horizon_tick}</span></span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-xs text-gray-600 font-mono italic">Horizon mapping uninitialized...</div>
                        )}
                    </CardContent>
                </Card>

                {/* Semantic Gravity Compression */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2">
                            <Magnet className="w-5 h-5 text-fuchsia-500" />
                            Semantic Gravity Wells
                        </CardTitle>
                        <p className="text-xs text-gray-400 font-mono">Dormant micro-events merging into historical anchor points.</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {gravityWells && gravityWells.length > 0 ? gravityWells.map((gw: any) => (
                            <div key={gw.id} className="p-3 bg-gray-900 border border-fuchsia-900/30 rounded">
                                <div className="font-bold text-sm mb-1 text-fuchsia-400">{gw.semantic_theme}</div>
                                <div className="text-xs font-mono text-gray-500 flex justify-between">
                                    <span>Absorbed: {gw.absorbed_event_count}</span>
                                    <span>Mass: {gw.total_mass.toFixed(1)} / {gw.collapse_threshold}</span>
                                </div>
                                <div className="w-full h-1 mt-2 bg-gray-800 rounded overflow-hidden">
                                    <div className="h-full bg-fuchsia-500" style={{ width: `${Math.min(100, (gw.total_mass/gw.collapse_threshold)*100)}%` }} />
                                </div>
                            </div>
                        )) : (
                            <div className="text-xs text-gray-600 font-mono italic">No massive semantic gravity detected.</div>
                        )}
                    </CardContent>
                </Card>

                {/* Causal Subscriptions */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2">
                            <Network className="w-5 h-5 text-emerald-500" />
                            Causal Subscriptions
                        </CardTitle>
                        <p className="text-xs text-gray-400 font-mono">Bounded layer listeners replacing monolith polling.</p>
                    </CardHeader>
                    <CardContent className="space-y-2 h-[300px] overflow-y-auto custom-scrollbar">
                        {subscriptions && subscriptions.length > 0 ? subscriptions.map((sub: any) => (
                            <div key={sub.id} className="p-3 border border-gray-800 bg-gray-900 rounded grid grid-cols-2 gap-2 text-xs font-mono">
                                <div className="col-span-2 font-bold text-emerald-400 flex items-center justify-between">
                                    <span>{sub.worker_node}</span>
                                    <Badge variant="outline" className="text-[10px] bg-black">PR: {sub.priority_order}</Badge>
                                </div>
                                <div className="text-gray-400">Layer: <span className="text-white">{sub.target_layer}</span></div>
                                <div className="text-gray-400 text-right">Pat: <span className="text-white">{sub.event_type_pattern}</span></div>
                            </div>
                        )) : (
                            <div className="text-xs text-gray-600 font-mono italic">Engine decoupled, no routes mapped...</div>
                        )}
                    </CardContent>
                </Card>

            </div>

            {/* PHASE 35: Causal Execution Semantics */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
                
                {/* Isolation Domains */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2">
                            <Shield className="w-5 h-5 text-indigo-500" />
                            Isolation Domains
                        </CardTitle>
                        <p className="text-xs text-gray-400 font-mono">Anti-chaos resonance barriers.</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {isolationDomains && isolationDomains.length > 0 ? isolationDomains.map((dom: any) => (
                            <div key={dom.domain_name} className="p-3 bg-gray-900 border border-gray-800 rounded flex justify-between items-center">
                                <span className="font-bold text-sm text-indigo-400">{dom.domain_name}</span>
                                <div className="text-xs font-mono text-gray-500 text-right">
                                    <div>Max Res: <span className="text-white">{dom.max_cross_domain_resonance}</span></div>
                                    <div>Cap: <span className="text-white">{dom.domain_entropy_cap}</span></div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-xs text-gray-600 font-mono italic">No isolated domains detected.</div>
                        )}
                    </CardContent>
                </Card>

                {/* Arbitration Rules */}
                <Card className="col-span-1 xl:col-span-3 mt-6 mb-2">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2">
                            <Layers className="w-5 h-5 text-rose-500" />
                            Causal Arbitration Hierarchy
                        </CardTitle>
                        <p className="text-xs text-gray-400 font-mono">Resolves conflicts when multiple executors propose changes to the same reality state.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            {arbitrationRules && arbitrationRules.length > 0 ? arbitrationRules.map((rule: any) => (
                                <div key={rule.id} className="p-3 bg-gray-900 border border-gray-800 rounded flex flex-col justify-between">
                                     <div className="flex justify-between items-center mb-1">
                                        <Badge variant="outline" className="text-[10px] text-gray-300 bg-gray-800">{rule.domain}</Badge>
                                        <span className="text-[10px] font-bold text-rose-400">WT: {rule.legitimacy_weight}</span>
                                     </div>
                                     <div className="text-xs text-white max-w-[200px] truncate">{rule.winning_executor_pattern}</div>
                                     <div className="text-[10px] text-gray-500 mt-2 truncate">Target: {rule.target_table}</div>
                                </div>
                            )) : (
                                <div className="text-xs text-gray-600 font-mono italic">No arbitration rules active.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Executor DAG */}
                <Card className="col-span-1 xl:col-span-2 mt-6">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2">
                            <Network className="w-5 h-5 text-cyan-500" />
                            Executor Dependency Graph
                        </CardTitle>
                        <p className="text-xs text-gray-400 font-mono">Topological execution precedence.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dagRules && dagRules.length > 0 ? dagRules.map((rule: any) => (
                                <div key={rule.id} className="p-3 bg-gray-900 border border-gray-800 rounded flex gap-3 items-center">
                                    <div className="text-xs font-bold text-cyan-400 truncate w-1/2">{rule.executor_node}</div>
                                    <div className="text-[10px] text-gray-500">{"->"}</div>
                                    <div className="text-xs text-white truncate w-1/2">{rule.depends_on_node}</div>
                                    <Badge variant="outline" className="text-[9px] bg-black text-gray-400 ml-auto">{rule.dependency_type}</Badge>
                                </div>
                            )) : (
                                <div className="text-xs text-gray-600 font-mono italic">No topology registered.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Validation Constraints */}
                <Card className="col-span-1 xl:col-span-1 mt-6">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2">
                            <Shield className="w-5 h-5 text-fuchsia-500" />
                            Mutation Validation Kernel
                        </CardTitle>
                        <p className="text-xs text-gray-400 font-mono">Constitutional limits on state mutations.</p>
                    </CardHeader>
                    <CardContent className="h-[200px] overflow-y-auto custom-scrollbar space-y-2">
                        {validationConstraints && validationConstraints.length > 0 ? validationConstraints.map((vc: any) => (
                            <div key={vc.id} className="p-3 border border-fuchsia-900/30 bg-gray-900 rounded text-xs font-mono">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-fuchsia-400">{vc.target_table}</span>
                                    <Badge variant="outline" className="text-[9px] text-fuchsia-300">{vc.constraint_type}</Badge>
                                </div>
                                <div className="text-[10px] text-gray-400 break-all">{JSON.stringify(vc.constraint_payload)}</div>
                            </div>
                        )) : (
                            <div className="text-xs text-gray-600 font-mono italic">No constraints active.</div>
                        )}
                    </CardContent>
                </Card>

                {/* Mutation Packets */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2">
                            <Database className="w-5 h-5 text-amber-500" />
                            Mutation Packets
                        </CardTitle>
                        <p className="text-xs text-gray-400 font-mono">Pending executable state changes.</p>
                    </CardHeader>
                    <CardContent className="h-[300px] overflow-y-auto custom-scrollbar space-y-2">
                        {mutationPackets && mutationPackets.length > 0 ? mutationPackets.map((pkt: any) => (
                            <div key={pkt.id} className="p-3 border border-amber-900/30 bg-gray-900 rounded text-xs font-mono">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-amber-400">{pkt.executor_node}</span>
                                    <Badge variant="outline" className={`text-[10px] bg-black ${pkt.status === 'COMMITTED' ? 'text-green-500' : 'text-yellow-500'}`}>{pkt.status}</Badge>
                                </div>
                                <div className="text-gray-400">Target: <span className="text-white">{pkt.target_table}</span></div>
                                <div className="text-gray-400">Tick: <span className="text-white">{pkt.tick_id}</span></div>
                            </div>
                        )) : (
                            <div className="text-xs text-gray-600 font-mono italic">No pending mutations in pipeline...</div>
                        )}
                    </CardContent>
                </Card>

                {/* Causal Commit Log */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2">
                            <History className="w-5 h-5 text-lime-500" />
                            Causal Commit Log
                        </CardTitle>
                        <p className="text-xs text-gray-400 font-mono">Deterministic Write-Ahead Sequence.</p>
                    </CardHeader>
                    <CardContent className="h-[300px] overflow-y-auto custom-scrollbar space-y-2">
                        {commitLogs && commitLogs.length > 0 ? commitLogs.map((log: any) => (
                            <div key={log.id} className="p-3 border border-lime-900/30 bg-gray-900 rounded text-xs font-mono">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-lime-400">SEQ: {log.commit_order}</span>
                                    <span className="text-gray-500 text-[10px]">TICK: {log.tick_id}</span>
                                </div>
                                <div className="text-gray-400 truncate">Pkt: {log.mutation_packet_id}</div>
                                <div className="text-gray-500 mt-1 flex justify-between">
                                    <span>Time: {new Date(log.committed_at).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-xs text-gray-600 font-mono italic">Write-Ahead Log is empty...</div>
                        )}
                    </CardContent>
                </Card>

                {/* State Compression / Virtualization */}
                <Card className="col-span-1 xl:col-span-3 mt-6">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2">
                            <Archive className="w-5 h-5 text-teal-500" />
                            State Virtualization Layer
                        </CardTitle>
                        <p className="text-xs text-gray-400 font-mono">Memory paging for dormant civilization data.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {virtualizationState && virtualizationState.length > 0 ? virtualizationState.map((vs: any) => (
                                <div key={vs.id} className="p-3 bg-gray-900 border border-gray-800 rounded flex flex-col justify-between">
                                     <div className="flex justify-between items-center mb-1">
                                        <Badge variant="outline" className={`text-[10px] ${vs.compression_status === 'ACTIVE' ? 'text-green-500 bg-green-900/20' : 'text-teal-400 bg-teal-900/20'}`}>
                                            {vs.compression_status}
                                        </Badge>
                                        <span className="text-[10px] font-bold text-teal-500">Ratio: {vs.compression_ratio}</span>
                                     </div>
                                     <div className="text-xs text-white truncate my-1">
                                         {vs.regions?.name || 'Unknown Region'} - {vs.target_table}
                                     </div>
                                     <div className="text-[10px] text-gray-500 truncate">
                                         Virtualized: {new Date(vs.last_virtualized_at).toLocaleString()}
                                     </div>
                                 </div>
                            )) : (
                                <div className="text-xs text-gray-600 font-mono italic">All layers fully materialized. No virtualized states.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Thermal Zones / Heat Map */}
                <Card className="col-span-1 xl:col-span-3 mt-6">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2">
                            <Flame className="w-5 h-5 text-orange-500" />
                            Regional Causal Heat Zones
                        </CardTitle>
                        <p className="text-xs text-gray-400 font-mono">Thermal volatility indicators driving continuous temporal elasticity.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {heatMap && heatMap.length > 0 ? heatMap.map((hz: any) => (
                                <div key={hz.region_id} className="p-3 bg-gray-900 border border-gray-800 rounded flex flex-col justify-between">
                                     <div className="flex justify-between items-center mb-1">
                                        <Badge variant="outline" className={`text-[10px] ${
                                            hz.thermal_state === 'CRITICAL' ? 'text-red-500 bg-red-900/20' : 
                                            hz.thermal_state === 'HOT' ? 'text-orange-500 bg-orange-900/20' :
                                            hz.thermal_state === 'WARM' ? 'text-yellow-500 bg-yellow-900/20' :
                                            'text-blue-500 bg-blue-900/20'
                                        }`}>
                                            {hz.thermal_state}
                                        </Badge>
                                        <span className="text-[10px] font-bold text-orange-400">Vol: {hz.resonance_volatility}</span>
                                     </div>
                                     <div className="text-xs text-white truncate my-1">
                                         {hz.regions?.name || 'Unknown Region'}
                                     </div>
                                     <div className="text-[10px] text-gray-500 flex justify-between">
                                         <span>Packets/Tick: {hz.packet_density_per_tick}</span>
                                     </div>
                                </div>
                            )) : (
                                <div className="text-xs text-gray-600 font-mono italic">No thermal heat maps active.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* PHASE 40: Semantic Energy & Starvation Mitigation */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
                
                {/* Global Energy Conservation */}
                <Card className="col-span-1 xl:col-span-2">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2">
                            <Battery className="w-5 h-5 text-emerald-400" />
                            Global Energy Conservation Law
                        </CardTitle>
                        <p className="text-xs text-gray-400 font-mono">Enforces domain entropy caps to prevent perpetual motion resonance.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {energyConservation && energyConservation.length > 0 ? energyConservation.map((ec: any) => (
                                <div key={ec.id} className="p-3 bg-gray-900 border border-emerald-900/30 rounded flex flex-col justify-between">
                                     <div className="flex justify-between items-center mb-1">
                                         <span className="font-bold text-sm text-emerald-400">{ec.domain}</span>
                                         <Badge variant="outline" className="text-[10px] bg-black text-gray-300">Dissipate: {ec.base_dissipation_rate}/t</Badge>
                                     </div>
                                     <div className="text-xs font-mono text-gray-500 mt-2 mb-1 flex justify-between">
                                         <span>Energy Pool</span>
                                         <span>{ec.current_energy_pool.toFixed(0)} / {ec.max_energy_capacity.toFixed(0)}</span>
                                     </div>
                                     <div className="w-full h-1.5 bg-gray-800 rounded overflow-hidden">
                                         <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (ec.current_energy_pool / ec.max_energy_capacity) * 100)}%` }} />
                                     </div>
                                </div>
                            )) : (
                                <div className="text-xs text-gray-600 font-mono italic">Conservation domains uninitialized.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Packet Starvation Tracker */}
                <Card className="col-span-1 border-red-900/40 border">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-red-500" />
                            Causal Starvation Alerts
                        </CardTitle>
                        <p className="text-xs text-gray-400 font-mono">Pending multi-tick deadlocks and starvation decay.</p>
                    </CardHeader>
                    <CardContent className="h-[250px] overflow-y-auto custom-scrollbar space-y-2">
                        {starvationTracker && starvationTracker.length > 0 ? starvationTracker.map((st: any) => (
                            <div key={st.packet_id} className="p-3 bg-red-950/20 border border-red-900/30 rounded text-xs font-mono">
                                 <div className="flex justify-between items-center mb-1">
                                     <span className="font-bold text-red-400 truncate w-2/3">ID: {st.packet_id.substring(0,8)}</span>
                                     <Badge variant="outline" className="text-[9px] text-red-300 border-red-800 bg-black">WAIT {st.wait_ticks}t</Badge>
                                 </div>
                                 <div className="text-gray-400">Target: <span className="text-white">{st.causal_mutation_packets?.target_table || 'Unknown'}</span></div>
                                 <div className="text-gray-500 mt-1 flex justify-between items-center">
                                     <span>Thresh: {st.starvation_threshold}</span>
                                     <span className={st.causal_mutation_packets?.status === 'REJECTED_STARVATION' ? 'text-red-500 font-bold' : 'text-gray-500'}>
                                         [{st.causal_mutation_packets?.status || 'PENDING'}]
                                     </span>
                                 </div>
                            </div>
                        )) : (
                            <div className="text-xs text-gray-600 font-mono italic">No semantic deadlocks or starvation detected. Pipeline healthy.</div>
                        )}
                    </CardContent>
                </Card>
                
            </div>

            {/* PHASE 41 & 42: Causal Identity Fragmentation & Reality Friction */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                
                {/* Epistemic Divergence */}
                <Card className="col-span-1 border-purple-900/40 border">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2 text-purple-400">
                            <Brain className="w-5 h-5" />
                            Epistemic Divergence
                        </CardTitle>
                        <p className="text-xs text-purple-300/60 font-mono">Narrative fracture from objective history.</p>
                    </CardHeader>
                    <CardContent className="h-[250px] overflow-y-auto custom-scrollbar space-y-4">
                        {epistemicDivergence && epistemicDivergence.length > 0 ? epistemicDivergence.map((ed: any) => (
                            <div key={ed.region_id} className="p-3 bg-purple-950/10 border border-purple-900/30 rounded flex flex-col justify-between">
                                 <div className="flex justify-between items-center mb-2">
                                     <span className="font-bold text-sm text-purple-200">{ed.regions?.name || 'Unknown Region'}</span>
                                     <Badge variant="outline" className="text-[10px] border-purple-800 bg-black text-purple-300">
                                        {ed.dominant_narrative_filter}
                                     </Badge>
                                 </div>
                                 <div className="text-xs font-mono text-gray-500 mb-1 flex justify-between">
                                     <span>Divergence</span>
                                     <span className={ed.divergence_score > 80 ? "text-red-400 font-bold" : ""}>{ed.divergence_score.toFixed(1)}%</span>
                                 </div>
                                 <div className="w-full h-1.5 bg-gray-900 rounded overflow-hidden">
                                     <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, ed.divergence_score)}%` }} />
                                 </div>
                            </div>
                        )) : (
                            <div className="text-xs text-gray-600 font-mono italic">Consensus intact.</div>
                        )}
                    </CardContent>
                </Card>

                {/* Reality Friction */}
                <Card className="col-span-1 border-red-900/40 border">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2 text-red-500">
                            <Activity className="w-5 h-5" />
                            Reality Friction (Cognitive Dissonance)
                        </CardTitle>
                        <p className="text-xs text-red-400/60 font-mono">Pressure from physical contradiction against dogma.</p>
                    </CardHeader>
                    <CardContent className="h-[250px] overflow-y-auto custom-scrollbar space-y-4">
                        {realityFriction && realityFriction.length > 0 ? realityFriction.map((rf: any) => (
                            <div key={rf.region_id} className="p-3 bg-red-950/10 border border-red-900/40 rounded flex flex-col justify-between relative overflow-hidden">
                                 
                                 {/* Snap Alert */}
                                 {rf.cognitive_dissonance_pressure > 90 && (
                                     <div className="absolute inset-0 bg-red-900/20 border border-red-500 animate-pulse pointer-events-none" />
                                 )}

                                 <div className="flex justify-between items-center mb-2 relative z-10">
                                     <span className="font-bold text-sm text-red-200">{rf.regions?.name || 'Unknown Region'}</span>
                                     <span className="text-[10px] text-red-400/70 font-mono">Last Snap: t={rf.last_reality_snap_tick}</span>
                                 </div>
                                 <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1 relative z-10">
                                     <span>Physical Deficit: {rf.physical_deficit_score.toFixed(1)}</span>
                                     <span>Narrative Delusion: {rf.narrative_delusion_score.toFixed(1)}</span>
                                 </div>
                                 <div className="text-xs font-mono text-gray-300 mt-2 mb-1 flex justify-between relative z-10">
                                     <span>Dissonance Pressure</span>
                                     <span className={rf.cognitive_dissonance_pressure > 80 ? "text-red-500 font-bold" : "text-yellow-500"}>
                                         {rf.cognitive_dissonance_pressure.toFixed(1)}%
                                     </span>
                                 </div>
                                 <div className="w-full h-1.5 bg-gray-900 rounded overflow-hidden relative z-10">
                                     <div className="h-full bg-gradient-to-r from-yellow-500 to-red-600 transition-all duration-500" 
                                          style={{ width: `${Math.min(100, rf.cognitive_dissonance_pressure)}%` }} />
                                 </div>
                            </div>
                        )) : (
                            <div className="text-xs text-gray-600 font-mono italic">Physical reality aligns with narrative. No significant dissonance.</div>
                        )}
                    </CardContent>
                </Card>

            </div>

            {/* PHASE 43: Epistemic Infrastructure & Trauma */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                
                {/* Epistemic Trauma */}
                <Card className="col-span-1 border-stone-800/60 border bg-stone-950/20">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2 text-stone-400">
                            <HeartCrack className="w-5 h-5 text-red-700" />
                            Post-Truth Trauma Index
                        </CardTitle>
                        <p className="text-xs text-stone-500 font-mono">Long-term institutional distrust following a reality snap.</p>
                    </CardHeader>
                    <CardContent className="h-[250px] overflow-y-auto custom-scrollbar space-y-4">
                        {epistemicTrauma && epistemicTrauma.length > 0 ? epistemicTrauma.map((et: any) => (
                            <div key={et.region_id} className="p-3 bg-stone-900/30 border border-stone-800/50 rounded flex flex-col justify-between">
                                 <div className="flex justify-between items-center mb-2">
                                     <span className="font-bold text-sm text-stone-300">{et.regions?.name || 'Unknown Region'}</span>
                                     <span className="text-[10px] text-stone-500 font-mono">Last Snap t={et.last_trauma_event_tick}</span>
                                 </div>
                                 <div className="grid grid-cols-2 gap-2 text-xs font-mono text-stone-500">
                                     <div className="p-2 bg-black/40 rounded border border-stone-800/30">
                                        <div className="text-[9px] uppercase tracking-wider mb-1">Trauma Lvl</div>
                                        <div className={et.trauma_level > 50 ? "text-red-500 font-bold" : "text-stone-300"}>{et.trauma_level.toFixed(1)}</div>
                                     </div>
                                     <div className="p-2 bg-black/40 rounded border border-stone-800/30">
                                        <div className="text-[9px] uppercase tracking-wider mb-1">Cynicism</div>
                                        <div className={et.cynicism_index > 50 ? "text-yellow-600 font-bold" : "text-stone-300"}>{et.cynicism_index.toFixed(1)}</div>
                                     </div>
                                 </div>
                                 <div className="mt-3 flex justify-between text-[10px] font-mono border-t border-stone-800/50 pt-2">
                                     <span className="text-stone-500">Distrust Multiplier</span>
                                     <span className="text-stone-300 font-bold">{et.institutional_distrust_multiplier.toFixed(2)}x</span>
                                 </div>
                            </div>
                        )) : (
                            <div className="text-xs text-stone-600 font-mono italic">No trauma recorded.</div>
                        )}
                    </CardContent>
                </Card>

                {/* Observability Grid */}
                <Card className="col-span-1 border-cyan-900/30 border bg-slate-950/20">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2 text-cyan-500">
                            <RadioTower className="w-5 h-5" />
                            Observability Grid
                        </CardTitle>
                        <p className="text-xs text-cyan-600/60 font-mono">Precision matrix and measurement uncertainty band.</p>
                    </CardHeader>
                    <CardContent className="h-[250px] overflow-y-auto custom-scrollbar space-y-4">
                        {observabilityGrid && observabilityGrid.length > 0 ? observabilityGrid.map((og: any) => (
                            <div key={og.region_id} className="p-3 bg-slate-900/40 border border-cyan-900/30 rounded">
                                 <div className="flex justify-between items-center mb-3">
                                     <div className="font-bold text-sm text-cyan-300 flex items-center gap-2">
                                         {og.sensor_network_health < 50 && <EyeOff className="w-3 h-3 text-yellow-500" />}
                                         {og.regions?.name || 'Unknown Region'}
                                     </div>
                                     <Badge variant="outline" className={`text-[10px] bg-black ${og.measurement_uncertainty_band > 30 ? 'text-yellow-500 border-yellow-800' : 'text-cyan-400 border-cyan-800'}`}>
                                        ±{og.measurement_uncertainty_band.toFixed(1)}% Error
                                     </Badge>
                                 </div>
                                 
                                 <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-[10px] font-mono text-cyan-600/70 mb-1">
                                            <span>Sensor Health</span>
                                            <span>{og.sensor_network_health.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-800 rounded overflow-hidden">
                                            <div className="h-full bg-cyan-500" style={{ width: `${Math.min(100, og.sensor_network_health)}%` }} />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="flex justify-between text-[10px] font-mono text-cyan-600/70 mb-1">
                                            <span>Statistical Corruption</span>
                                            <span className={og.statistical_corruption_factor > 0.5 ? "text-yellow-500" : ""}>
                                                {(og.statistical_corruption_factor * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-800 rounded overflow-hidden">
                                            <div className="h-full bg-yellow-500/70" style={{ width: `${Math.min(100, og.statistical_corruption_factor * 100)}%` }} />
                                        </div>
                                    </div>
                                 </div>
                                 
                            </div>
                        )) : (
                            <div className="text-xs text-slate-500 font-mono italic">Grid uncalibrated.</div>
                        )}
                    </CardContent>
                </Card>

            </div>

            {/* PHASE 44: Epistemic Recovery Mechanisms */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                <Card className="col-span-1 xl:col-span-2 border-emerald-900/40 border bg-emerald-950/20">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2 text-emerald-400">
                            <Microscope className="w-5 h-5" />
                            Epistemic Recovery Institutions
                        </CardTitle>
                        <p className="text-xs text-emerald-500/60 font-mono">Distributed networks fighting cognitive decay and healing trauma.</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {recoveryInstitutions && recoveryInstitutions.length > 0 ? recoveryInstitutions.map((ri: any) => (
                                <div key={ri.region_id} className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded flex flex-col justify-between">
                                     <div className="flex justify-between items-center mb-3">
                                         <span className="font-bold text-sm text-emerald-300">{ri.regions?.name || 'Unknown Region'}</span>
                                         <Badge variant="outline" className="text-[10px] bg-black text-emerald-400 border-emerald-800">
                                            Recon: {ri.reconciliation_momentum.toFixed(1)}
                                         </Badge>
                                     </div>
                                     <div className="space-y-2 text-xs font-mono text-emerald-600/70">
                                         <div>
                                            <div className="flex justify-between mb-1">
                                                <span>Scientific Integrity</span>
                                                <span className="text-emerald-400">{ri.scientific_integrity.toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full h-1 bg-emerald-950 rounded overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, ri.scientific_integrity)}%` }} />
                                            </div>
                                         </div>
                                         <div>
                                            <div className="flex justify-between mb-1">
                                                <span>Independent Audit</span>
                                                <span className="text-emerald-400">{ri.independent_audit_capacity.toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full h-1 bg-emerald-950 rounded overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, ri.independent_audit_capacity)}%` }} />
                                            </div>
                                         </div>
                                         <div>
                                            <div className="flex justify-between mb-1">
                                                <span>Citizen Mesh</span>
                                                <span className="text-emerald-400">{ri.citizen_verification_mesh.toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full h-1 bg-emerald-950 rounded overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, ri.citizen_verification_mesh)}%` }} />
                                            </div>
                                         </div>
                                     </div>
                                </div>
                            )) : (
                                <div className="text-xs text-emerald-700 font-mono italic">No recovery institutions established.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* PHASE 45: Trust Stratification & Class Divide */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                
                {/* Epistemic Class Divide */}
                <Card className="col-span-1 border-indigo-900/40 border bg-indigo-950/20">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2 text-indigo-400">
                            <Scale className="w-5 h-5" />
                            Epistemic Class Divide
                        </CardTitle>
                        <p className="text-xs text-indigo-500/60 font-mono">Unequal access to objective observability.</p>
                    </CardHeader>
                    <CardContent className="h-[250px] overflow-y-auto custom-scrollbar space-y-4">
                        {epistemicClassDivide && epistemicClassDivide.length > 0 ? epistemicClassDivide.map((ecd: any) => (
                            <div key={ecd.region_id} className="p-3 bg-indigo-950/30 border border-indigo-900/50 rounded">
                                 <div className="flex justify-between items-center mb-3">
                                     <span className="font-bold text-sm text-indigo-300">{ecd.regions?.name || 'Unknown Region'}</span>
                                     <Badge variant="outline" className="text-[10px] bg-black text-indigo-400 border-indigo-800">
                                        Gini: {ecd.informational_gini_index.toFixed(2)}
                                     </Badge>
                                 </div>
                                 <div className="space-y-2 text-[10px] font-mono text-indigo-600/80">
                                    <div className="flex justify-between items-center">
                                        <span className="w-20">Elite</span>
                                        <div className="flex-1 mx-2 h-1.5 bg-indigo-950 rounded overflow-hidden">
                                            <div className="h-full bg-indigo-500" style={{ width: `${ecd.elite_access_multiplier * 100}%` }} />
                                        </div>
                                        <span className="w-8 text-right">{(ecd.elite_access_multiplier * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="w-20">Middle</span>
                                        <div className="flex-1 mx-2 h-1.5 bg-indigo-950 rounded overflow-hidden">
                                            <div className="h-full bg-indigo-500" style={{ width: `${ecd.middle_access_multiplier * 100}%` }} />
                                        </div>
                                        <span className="w-8 text-right">{(ecd.middle_access_multiplier * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="w-20">Working</span>
                                        <div className="flex-1 mx-2 h-1.5 bg-indigo-950 rounded overflow-hidden">
                                            <div className="h-full bg-indigo-500" style={{ width: `${ecd.working_access_multiplier * 100}%` }} />
                                        </div>
                                        <span className="w-8 text-right">{(ecd.working_access_multiplier * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="w-20">Marginalized</span>
                                        <div className="flex-1 mx-2 h-1.5 bg-indigo-950 rounded overflow-hidden">
                                            <div className="h-full bg-indigo-500" style={{ width: `${ecd.marginalized_access_multiplier * 100}%` }} />
                                        </div>
                                        <span className="w-8 text-right">{(ecd.marginalized_access_multiplier * 100).toFixed(0)}%</span>
                                    </div>
                                 </div>
                            </div>
                        )) : (
                            <div className="text-xs text-indigo-700 font-mono italic">No class divide data.</div>
                        )}
                    </CardContent>
                </Card>

                {/* Trust Stratification Graph */}
                <Card className="col-span-1 border-fuchsia-900/40 border bg-fuchsia-950/20">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2 text-fuchsia-400">
                            <Users className="w-5 h-5" />
                            Trust Stratification
                        </CardTitle>
                        <p className="text-xs text-fuchsia-500/60 font-mono">Institutional trust weighted by demographic segment.</p>
                    </CardHeader>
                    <CardContent className="h-[250px] overflow-y-auto custom-scrollbar space-y-4">
                        {epistemicTrustGraph && epistemicTrustGraph.length > 0 ? (
                            <div className="space-y-4">
                                {/* Group by Region */}
                                {Array.from(new Set(epistemicTrustGraph.map((item: any) => item.region_id))).map((regionId: any) => {
                                    const regionItems = epistemicTrustGraph.filter((item: any) => item.region_id === regionId);
                                    const regionName = regionItems[0]?.regions?.name || 'Unknown Region';
                                    
                                    return (
                                        <div key={regionId} className="p-3 bg-fuchsia-950/30 border border-fuchsia-900/50 rounded">
                                            <div className="font-bold text-sm text-fuchsia-300 mb-3">{regionName}</div>
                                            
                                            <div className="space-y-3">
                                                {/* Group by Demographic */}
                                                {Array.from(new Set(regionItems.map((item: any) => item.demographic_segment))).map((demo: any) => {
                                                    const demoItems = regionItems.filter((item: any) => item.demographic_segment === demo);
                                                    return (
                                                        <div key={demo} className="bg-black/40 p-2 rounded border border-fuchsia-900/30">
                                                            <div className="text-[10px] font-bold text-fuchsia-400 mb-2 uppercase tracking-wider">{demo}</div>
                                                            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                                                                {demoItems.map((item: any) => (
                                                                    <div key={item.id} className="flex justify-between items-center p-1 bg-fuchsia-950/20 rounded">
                                                                        <span className="text-fuchsia-500/70 truncate mr-2" title={item.institution_type}>
                                                                            {item.institution_type}
                                                                        </span>
                                                                        <span className={item.trust_weight > 75 ? "text-fuchsia-300 font-bold" : "text-fuchsia-600"}>
                                                                            {item.trust_weight.toFixed(0)}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-xs text-fuchsia-700 font-mono italic">No trust graph data established.</div>
                        )}
                    </CardContent>
                </Card>

            </div>

            {/* PHASE 46: Civilization Memory Engine */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-6">
                
                {/* Historical Epochs */}
                <Card className="col-span-1 border-amber-900/40 border bg-amber-950/20">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2 text-amber-400">
                            <BookOpen className="w-5 h-5" />
                            Historical Epochs
                        </CardTitle>
                        <p className="text-xs text-amber-500/60 font-mono">Compressed causal histories.</p>
                    </CardHeader>
                    <CardContent className="h-[250px] overflow-y-auto custom-scrollbar space-y-4">
                        {historicalEpochs && historicalEpochs.length > 0 ? historicalEpochs.map((epoch: any) => (
                            <div key={epoch.id} className="p-3 bg-amber-950/30 border border-amber-900/50 rounded space-y-2">
                                <div className="flex justify-between items-start">
                                    <span className="font-bold text-sm text-amber-300">{epoch.title}</span>
                                    <Badge variant="outline" className="text-[10px] bg-black text-amber-400 border-amber-800">
                                        {epoch.regions?.name || 'Global'}
                                    </Badge>
                                </div>
                                <div className="text-[10px] text-amber-500/80 font-mono italic">
                                    Ticks {epoch.start_tick} - {epoch.end_tick || 'Present'}
                                </div>
                                <div className="text-xs text-amber-400/90 leading-tight">
                                    {epoch.objective_cause}
                                </div>
                                <div className="text-[10px] text-amber-600 font-mono">Theme: {epoch.dominant_theme}</div>
                            </div>
                        )) : (
                            <div className="text-xs text-amber-700 font-mono italic">No historical epochs recorded.</div>
                        )}
                    </CardContent>
                </Card>

                {/* Collective Memory Drift */}
                <Card className="col-span-1 border-orange-900/40 border bg-orange-950/20">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2 text-orange-400">
                            <Ghost className="w-5 h-5" />
                            Memory Drift
                        </CardTitle>
                        <p className="text-xs text-orange-500/60 font-mono">Public memory distortion over time.</p>
                    </CardHeader>
                    <CardContent className="h-[250px] overflow-y-auto custom-scrollbar space-y-4">
                        {memoryDrift && memoryDrift.length > 0 ? memoryDrift.map((drift: any) => (
                            <div key={drift.epoch_id} className="p-3 bg-orange-950/30 border border-orange-900/50 rounded space-y-2">
                                <div className="font-bold text-sm text-orange-300">{drift.historical_epochs?.title || 'Unknown Epoch'}</div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-mono text-orange-500">
                                        <span>Distortion</span>
                                        <span>{drift.distortion_level.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-orange-950 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-orange-500 h-full" style={{ width: `${drift.distortion_level}%` }} />
                                    </div>
                                </div>
                                <div className="text-[10px] bg-black/40 p-2 rounded border border-orange-900/30">
                                    <div className="text-orange-600 font-mono mb-1">Public Narrative:</div>
                                    <div className="text-orange-400 italic">&quot;{drift.public_memory_narrative}&quot;</div>
                                </div>
                                {drift.blame_narrative && (
                                    <div className="text-[10px] font-mono text-red-400">Blame: {drift.blame_narrative}</div>
                                )}
                            </div>
                        )) : (
                            <div className="text-xs text-orange-700 font-mono italic">No memory drift tracking.</div>
                        )}
                    </CardContent>
                </Card>

                {/* Generational Trauma Transfer */}
                <Card className="col-span-1 border-red-900/40 border bg-red-950/20">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2 text-red-400">
                            <Scroll className="w-5 h-5" />
                            Generational Trauma
                        </CardTitle>
                        <p className="text-xs text-red-500/60 font-mono">Inherited baseline cynicism.</p>
                    </CardHeader>
                    <CardContent className="h-[250px] overflow-y-auto custom-scrollbar space-y-4">
                        {traumaTransfer && traumaTransfer.length > 0 ? traumaTransfer.map((trauma: any) => (
                            <div key={trauma.region_id} className="p-3 bg-red-950/30 border border-red-900/50 rounded space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-sm text-red-300">{trauma.regions?.name || 'Unknown'}</span>
                                    <Badge variant="outline" className="text-[10px] bg-black text-red-400 border-red-800">
                                        Gen {trauma.current_generation_index}
                                    </Badge>
                                </div>
                                <div className="pt-2">
                                    <div className="flex justify-between text-[10px] font-mono text-red-500 mb-1">
                                        <span>Inherited Cynicism</span>
                                        <span>{trauma.inherited_cynicism_baseline.toFixed(1)}</span>
                                    </div>
                                    <div className="w-full bg-red-950 h-2 rounded-full overflow-hidden">
                                        <div className="bg-red-500 h-full" style={{ width: `${Math.min(100, trauma.inherited_cynicism_baseline)}%` }} />
                                    </div>
                                </div>
                                <div className="text-[10px] font-mono text-red-600/70 text-right">
                                    Decay Rate: {trauma.generational_decay_rate} / Gen
                                </div>
                            </div>
                        )) : (
                            <div className="text-xs text-red-700 font-mono italic">No inherited trauma recorded.</div>
                        )}
                    </CardContent>
                </Card>

                {/* Civilization Myths */}
                <Card className="col-span-1 border-yellow-900/40 border bg-yellow-950/20">
                    <CardHeader>
                        <CardTitle className="font-mono text-lg uppercase flex items-center gap-2 text-yellow-400">
                            <Landmark className="w-5 h-5" />
                            Civilization Myths
                        </CardTitle>
                        <p className="text-xs text-yellow-500/60 font-mono">Epochs ascended to dogmatic status.</p>
                    </CardHeader>
                    <CardContent className="h-[250px] overflow-y-auto custom-scrollbar space-y-4">
                        {civilizationMyths && civilizationMyths.length > 0 ? civilizationMyths.map((myth: any) => (
                            <div key={myth.id} className="p-3 bg-yellow-950/30 border border-yellow-900/50 rounded space-y-2">
                                <div className="font-bold text-sm text-yellow-300">{myth.myth_title}</div>
                                <div className="text-[10px] text-yellow-600 font-mono">
                                    Origin: {myth.historical_epochs?.title || 'Precursor Era'}
                                </div>
                                <div className="pt-2 grid grid-cols-2 gap-2 text-[10px] font-mono text-yellow-500">
                                    <div className="bg-black/40 p-1.5 rounded border border-yellow-900/30 flex flex-col items-center">
                                        <span className="text-yellow-600/80 mb-1">Sacredness</span>
                                        <span className="font-bold">{myth.sacredness_score.toFixed(1)}</span>
                                    </div>
                                    <div className="bg-black/40 p-1.5 rounded border border-yellow-900/30 flex flex-col items-center">
                                        <span className="text-yellow-600/80 mb-1">Legitimacy</span>
                                        <span className="font-bold">{myth.legitimacy_modifier.toFixed(2)}x</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-xs text-yellow-700 font-mono italic">No national myths established.</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
