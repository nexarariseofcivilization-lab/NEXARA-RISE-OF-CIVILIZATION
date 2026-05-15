'use client';

import { useAppStore } from '@/lib/store';
import { Database, AlertTriangle, Cpu, Radio, Shield, Zap, Activity, Globe, Hexagon, Terminal, Server, ArrowUpRight, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function CCNPage() {
    const { ccn, player, society, interactCCN } = useAppStore();
    const [selectedModule, setSelectedModule] = useState<string | null>(null);

    const modules = Object.values(ccn.modules);

    const getStatusColor = (health: number) => {
        if (health > 80) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
        if (health > 30) return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
        return 'text-red-500 bg-red-500/10 border-red-500/30';
    };

    const getStatusText = (status: string) => {
        if (status === 'OPTIMAL') return 'OPTIMAL';
        if (status === 'DEGRADED') return 'DEGRADED';
        return 'CRITICAL';
    };

    const getAlignmentColor = (alignment: string) => {
        if (alignment === 'ALIGNED') return 'text-cyan-400';
        if (alignment === 'DRIFTING') return 'text-amber-400';
        return 'text-red-500 animate-pulse';
    };

    return (
        <div className="h-full flex flex-col p-4 md:p-8 overflow-y-auto space-y-8 bg-zinc-950 text-gray-300 font-sans custom-scrollbar">
            
            {/* Header / Intro */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-800 pb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
                    <Hexagon className="w-64 h-64 -mt-10 -mr-10 text-cyan-500" />
                </div>
                <div>
                    <div className="flex items-center space-x-3 text-cyan-500 mb-2">
                        <Database className="w-5 h-5" />
                        <span className="text-xs font-mono tracking-widest uppercase">Orbital Infrastructure</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-widest uppercase font-mono shadow-cyan-500 drop-shadow-md">
                        Core Civilization Node
                    </h1>
                    <p className="text-zinc-400 mt-2 font-mono text-sm max-w-2xl">
                        The heartbeat of NEXARA. This global intelligence and simulation orchestration megastructure
                        is responsible for maintaining the delicate equilibrium of human society. It processes billions of 
                        data points per second, anticipating crises, allocating resources, and governing infrastructural 
                        priorities. Located in geostationary orbit, the CCN is the absolute pinnacle of autonomous governance.
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
                    <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded flex flex-col items-end">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Global Compute Load</span>
                        <div className="flex items-center space-x-2 mt-1">
                            <Activity className="w-4 h-4 text-cyan-400" />
                            <span className="font-mono text-cyan-400 font-bold">{ccn.metrics.computeLoad.toFixed(1)}%</span>
                        </div>
                    </div>
                    <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded flex flex-col items-end">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Sync Stability</span>
                        <div className="flex items-center space-x-2 mt-1">
                            <Globe className="w-4 h-4 text-emerald-400" />
                            <span className="font-mono text-emerald-400 font-bold">{ccn.metrics.syncStability.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Orbital Structure Schema (2 cols) */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                    <h2 className="text-sm font-bold tracking-widest uppercase text-zinc-400 font-mono flex items-center">
                        <Server className="w-4 h-4 mr-2" /> Structural Sub-Nodes
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {modules.map(mod => (
                            <div 
                                key={mod.id}
                                onClick={() => setSelectedModule(mod.id)}
                                className={cn(
                                    "p-4 border rounded cursor-pointer transition-all hover:bg-zinc-900/50 backdrop-blur-sm relative overflow-hidden group",
                                    selectedModule === mod.id ? "border-cyan-500/50 bg-cyan-950/10" : "border-zinc-800 bg-zinc-900/30"
                                )}
                            >
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex flex-col">
                                        <span className="text-white font-mono font-bold tracking-wide">{mod.name}</span>
                                        <span className="text-[10px] text-zinc-500 uppercase">Lv. {mod.level} Protocol</span>
                                    </div>
                                    <div className={cn("px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border", getStatusColor(mod.health))}>
                                        {getStatusText(mod.status)}
                                    </div>
                                </div>
                                <div className="space-y-2 relative z-10">
                                    <div className="flex justify-between text-xs font-mono">
                                        <span className="text-zinc-500">Integrity</span>
                                        <span className={cn(mod.health < 50 ? 'text-red-400' : 'text-zinc-300')}>{mod.health.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800/50">
                                        <div 
                                            className={cn("h-full transition-all duration-1000", mod.health < 50 ? 'bg-red-500' : mod.health < 80 ? 'bg-amber-500' : 'bg-emerald-500')}
                                            style={{ width: `${mod.health}%` }}
                                        />
                                    </div>
                                </div>
                                
                                {selectedModule === mod.id && (
                                    <div className="mt-4 pt-4 border-t border-zinc-800/50 text-xs text-zinc-400 font-mono">
                                        <p className="mb-4">{mod.description}</p>
                                        <div className="flex flex-col items-center gap-2 mb-6 p-4 bg-zinc-950/50 rounded border border-zinc-800/50">
                                            {mod.upstream && mod.upstream.length > 0 && (
                                                <div className="flex flex-col items-center">
                                                    <div className="flex gap-2 flex-wrap justify-center">
                                                        {mod.upstream.map(u => (
                                                            <div key={u} className="px-3 py-1.5 bg-zinc-900 border-t-2 border-t-cyan-500/50 border-x border-b border-zinc-800 rounded font-bold text-zinc-400 text-[10px] shadow-sm shadow-cyan-900/10">
                                                                {ccn.modules[u]?.name || u}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <ArrowDown className="w-4 h-4 text-zinc-600 mt-2 animate-bounce" />
                                                </div>
                                            )}
                                            
                                            <div className="px-5 py-2.5 bg-cyan-950/40 border border-cyan-500/50 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.1)] text-cyan-50 font-bold tracking-widest text-xs uppercase z-10">
                                                {mod.name}
                                            </div>
                                            
                                            {mod.downstream && mod.downstream.length > 0 && (
                                                <div className="flex flex-col items-center">
                                                    <ArrowDown className="w-4 h-4 text-zinc-600 mb-2 animate-bounce" />
                                                    <div className="flex gap-2 flex-wrap justify-center">
                                                        {mod.downstream.map(d => (
                                                            <div key={d} className="px-3 py-1.5 bg-zinc-900 border-b-2 border-b-amber-500/50 border-x border-t border-zinc-800 rounded font-bold text-zinc-400 text-[10px] shadow-sm shadow-amber-900/10">
                                                                {ccn.modules[d]?.name || d}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); interactCCN(mod.id, 'REPAIR'); }}
                                                className="px-3 py-1.5 bg-emerald-900/20 hover:bg-emerald-900/40 border border-emerald-800/50 rounded text-emerald-400 transition-colors flex items-center whitespace-nowrap"
                                            >
                                                <Zap className="w-3 h-3 mr-1.5" /> {mod.id === 'defense' ? 'EXPERIMENTAL REPAIR (70% Succeed)' : 'REPAIR (500cr, 100comp)'}
                                            </button>
                                            
                                            {(mod.id === 'defense' || mod.id === 'cognitive') && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); interactCCN(mod.id, 'UPGRADE'); }}
                                                    className="px-3 py-1.5 bg-blue-900/20 hover:bg-blue-900/40 border border-blue-800/50 rounded text-blue-400 transition-colors flex items-center whitespace-nowrap"
                                                >
                                                    <Shield className="w-3 h-3 mr-1.5" /> UPGRADE {mod.name.toUpperCase()} (2000cr, 500comp)
                                                </button>
                                            )}

                                            {(mod.id === 'cognitive' || mod.id === 'sync') && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); interactCCN(mod.id, 'OPTIMIZE'); }}
                                                    className="px-3 py-1.5 bg-amber-900/20 hover:bg-amber-900/40 border border-amber-800/50 rounded text-amber-400 transition-colors flex items-center whitespace-nowrap"
                                                >
                                                    <Cpu className="w-3 h-3 mr-1.5" /> OPTIMIZE ENERGY (1000cr)
                                                </button>
                                            )}

                                            {mod.id === 'defense' && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); interactCCN(mod.id, 'HACK'); }}
                                                    className="px-3 py-1.5 bg-rose-900/20 hover:bg-rose-900/40 border border-rose-800/50 rounded text-rose-400 transition-colors flex items-center whitespace-nowrap"
                                                >
                                                    <Terminal className="w-3 h-3 mr-1.5" /> HACK (60% Success)
                                                </button>
                                            )}
                                        </div>
                                        
                                        {mod.id === 'expansion' && (
                                            <div className="mt-4 p-3 border border-zinc-800 bg-zinc-950/50 rounded space-y-2">
                                                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Construct Sub-Node (3000cr, 200mat)</span>
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); interactCCN(mod.id, 'BUILD_SUBNODE', { type: 'COMPUTE' }); }} className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-300">
                                                        + COMPUTE NODE
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); interactCCN(mod.id, 'BUILD_SUBNODE', { type: 'ENERGY' }); }} className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-300">
                                                        + ENERGY RELAY
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); interactCCN(mod.id, 'BUILD_SUBNODE', { type: 'DEFENSE' }); }} className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-300">
                                                        + DEFENSE PLATFORM
                                                    </button>
                                                </div>
                                                {ccn.subNodes.length > 0 && (
                                                    <div className="pt-2 mt-2 border-t border-zinc-800">
                                                        <span className="text-[10px] uppercase text-zinc-500 mb-1 block">Active Sub-Nodes:</span>
                                                        <div className="flex flex-col gap-2">
                                                            {ccn.subNodes.map(sn => (
                                                                <div key={sn.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] p-2 bg-zinc-900 border border-zinc-800 rounded">
                                                                    <div>
                                                                        <span className="text-zinc-300 font-bold mr-2">{sn.name}</span>
                                                                        <span className="text-zinc-500">{sn.type} • {sn.status}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                                                        <span className="text-zinc-500 mr-1">PRIORITY: {sn.priority}</span>
                                                                        {sn.id === 'sub-def-1' ? (
                                                                            <input 
                                                                                type="range" min="1" max="5" value={sn.priority}
                                                                                onChange={(e) => interactCCN('expansion', 'SET_SUBNODE_PRIORITY', { subNodeId: sn.id, priority: parseInt(e.target.value) })}
                                                                                onClick={e => e.stopPropagation()}
                                                                                className="w-24 accent-cyan-500"
                                                                            />
                                                                        ) : (
                                                                            <div className="flex items-center gap-1">
                                                                                {[1, 2, 3, 4, 5].map(lvl => (
                                                                                    <button 
                                                                                        key={lvl}
                                                                                        onClick={(e) => { e.stopPropagation(); interactCCN('expansion', 'SET_SUBNODE_PRIORITY', { subNodeId: sn.id, priority: lvl }); }}
                                                                                        className={cn("w-4 h-4 rounded text-[8px] flex items-center justify-center border", sn.priority === lvl ? "bg-cyan-900/50 border-cyan-500/50 text-cyan-400" : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:bg-zinc-700")}
                                                                                    >
                                                                                        {lvl}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                                    {mod.id === 'cognitive' && <Cpu className="w-32 h-32" />}
                                    {mod.id === 'sync' && <Radio className="w-32 h-32" />}
                                    {mod.id === 'defense' && <Shield className="w-32 h-32" />}
                                    {mod.id === 'security' && <Shield className="w-32 h-32 text-cyan-500" />}
                                    {mod.id === 'memory' && <Database className="w-32 h-32" />}
                                    {mod.id === 'quantumMemoryVault' && <Database className="w-32 h-32 text-purple-500" />}
                                    {mod.id === 'energy' && <Zap className="w-32 h-32 text-amber-500" />}
                                    {mod.id === 'expansion' && <ArrowUpRight className="w-32 h-32" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Intelligence & Metrics */}
                <div className="col-span-1 space-y-6">
                    {/* Civilization Intelligence Panel */}
                    <div className="p-4 border border-cyan-900/50 bg-gradient-to-b from-cyan-950/20 to-transparent rounded shadow-inner relative overflow-hidden">
                        <div className="flex items-center space-x-2 mb-4">
                            <Cpu className="w-5 h-5 text-cyan-400" />
                            <h2 className="text-sm font-bold tracking-widest uppercase text-cyan-400 font-mono">
                                Civilization Intelligence
                            </h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                                <span className="text-xs text-zinc-500 font-mono uppercase">Designation</span>
                                <span className="text-xs text-white font-mono">{ccn.civilizationIntelligence.autonomyId}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                                <span className="text-xs text-zinc-500 font-mono uppercase">Alignment</span>
                                <span className={cn("text-xs font-bold font-mono tracking-widest", getAlignmentColor(ccn.civilizationIntelligence.alignment))}>
                                    {ccn.civilizationIntelligence.alignment}
                                </span>
                            </div>
                            <div className="flex flex-col border-b border-zinc-800/50 pb-2 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-zinc-500 font-mono uppercase">Awareness</span>
                                    <span className="text-xs text-cyan-400 font-mono">{ccn.civilizationIntelligence.awarenessLevel.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-zinc-950 rounded-full h-1 overflow-hidden">
                                    <div className="h-full bg-cyan-400" style={{ width: `${ccn.civilizationIntelligence.awarenessLevel}%` }} />
                                </div>
                            </div>
                            <div className="flex flex-col pt-2 space-y-2">
                                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Active Agenda Directive</span>
                                <div className="p-2 border border-zinc-800 bg-zinc-900/50 rounded text-xs text-zinc-300 font-mono">
                                    {'> '} {ccn.civilizationIntelligence.currentAgenda}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Telemetry Panel */}
                    <div className="p-4 border border-zinc-800 bg-zinc-950 rounded">
                        <h2 className="text-sm font-bold tracking-widest uppercase text-zinc-400 font-mono mb-4 flex items-center">
                            <Activity className="w-4 h-4 mr-2" /> Global Telemetry
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-zinc-500 font-mono uppercase">Energy Reserves</span>
                                <span className={cn("text-xs font-mono", ccn.metrics.energyReserves < 2000 ? "text-red-400" : "text-zinc-300")}>
                                    {Math.floor(ccn.metrics.energyReserves)} / 99999 MW
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-zinc-500 font-mono uppercase">Thermal Output</span>
                                <span className={cn("text-xs font-mono", ccn.metrics.thermalOutput > 80 ? "text-red-400" : "text-amber-400")}>
                                    {ccn.metrics.thermalOutput.toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-zinc-500 font-mono uppercase">Orbital Integrity</span>
                                <span className="text-xs text-emerald-400 font-mono">
                                    {ccn.metrics.orbitalIntegrity.toFixed(1)}%
                                </span>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-zinc-800">
                                <button
                                    onClick={() => interactCCN('all', 'SUPPLY')}
                                    className="w-full px-4 py-2 bg-amber-900/20 hover:bg-amber-900/40 border border-amber-800/50 rounded text-amber-500 transition-colors flex justify-center items-center text-xs font-mono"
                                >
                                    <Zap className="w-3 h-3 mr-2" /> UPLINK EMERGENCY ENERGY (1000cr, 500en)
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Security Warning Log */}
                    {ccn.civilizationIntelligence.alignment !== 'ALIGNED' && (
                        <div className="p-4 border border-red-500/50 bg-red-500/10 rounded animate-pulse">
                            <div className="flex items-center space-x-2 text-red-500 mb-2">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="font-bold font-mono tracking-widest text-sm">SECURITY ALERT</span>
                            </div>
                            <p className="text-xs font-mono text-red-400 leading-relaxed">
                                Autonomous Intelligence anomaly detected. Behavioral drift exceeds safety parameters. 
                                Predictability models failing. Recommended action: Manual override protocol.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Analytics Dashboard */}
            {ccn.metricHistory && ccn.metricHistory.length > 0 && (
                <div className="mt-8 p-6 border border-zinc-800 bg-zinc-950/80 rounded-lg">
                    <h2 className="text-sm font-bold tracking-widest uppercase text-cyan-400 font-mono mb-6">
                        Node Telemetry Analysis
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="h-[250px] w-full">
                            <h3 className="text-xs text-zinc-500 font-mono uppercase mb-4 text-center">Compute & Stability</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={ccn.metricHistory} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis dataKey="time" stroke="#52525b" fontSize={10} tick={{fill: '#71717a'}} tickMargin={8} />
                                    <YAxis stroke="#52525b" fontSize={10} domain={[0, 100]} tick={{fill: '#71717a'}} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '12px', fontFamily: 'monospace' }}
                                        itemStyle={{ color: '#d4d4d8' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                    <Line type="monotone" dataKey="computeLoad" name="Compute Load" stroke="#a855f7" strokeWidth={2} dot={false} isAnimationActive={false} />
                                    <Line type="monotone" dataKey="syncStability" name="Sync Stability" stroke="#06b6d4" strokeWidth={2} dot={false} isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="h-[250px] w-full">
                            <h3 className="text-xs text-zinc-500 font-mono uppercase mb-4 text-center">Thermal & Energy Metrics</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={ccn.metricHistory} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis dataKey="time" stroke="#52525b" fontSize={10} tick={{fill: '#71717a'}} tickMargin={8} />
                                    <YAxis yAxisId="left" stroke="#52525b" fontSize={10} domain={[0, 100]} tick={{fill: '#71717a'}} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#52525b" fontSize={10} domain={[0, 5000]} tick={{fill: '#71717a'}} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '12px', fontFamily: 'monospace' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                    <Line yAxisId="left" type="monotone" dataKey="thermalOutput" name="Thermal (%)" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
                                    <Line yAxisId="right" type="monotone" dataKey="energyReserves" name="Energy (MW)" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* National Memory Vault */}
            <div className="mt-8 p-6 border border-purple-900/40 bg-zinc-950/80 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-[0.02] pointer-events-none">
                    <Database className="w-64 h-64 -mt-10 -mr-10 text-purple-500" />
                </div>
                
                <h2 className="text-sm font-bold tracking-widest uppercase text-purple-400 font-mono mb-2 flex items-center">
                    <Database className="w-4 h-4 mr-2" /> National Memory Vault
                </h2>
                <p className="text-xs text-zinc-500 font-mono mb-6 max-w-3xl">
                    Archival database of historical civilization events. Memory signatures decay over time, 
                    affecting their long-term social and political weight. Immutable ledger of societal progression and crises.
                </p>

                {society.nationalMemory.length === 0 ? (
                    <div className="text-center py-8 text-zinc-600 font-mono text-sm border border-dashed border-zinc-800 rounded">
                        No historical engrams recorded in this cycle.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {society.nationalMemory.map(mem => (
                            <div key={mem.id} className="p-4 border border-zinc-800 bg-zinc-900/50 rounded flex flex-col relative group">
                                <div className={cn(
                                    "absolute top-0 right-0 px-2 py-1 text-[9px] font-bold tracking-wider rounded-bl border-b border-l",
                                    mem.sentiment === 'POSITIVE' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 
                                    mem.sentiment === 'NEGATIVE' ? 'bg-amber-900/30 text-amber-400 border-amber-800/50' : 
                                    'bg-red-900/30 text-red-400 border-red-800/50'
                                )}>
                                    {mem.sentiment}
                                </div>
                                <span className="text-[10px] text-zinc-500 font-mono mb-1">{mem.date}</span>
                                <h3 className="text-sm font-bold text-zinc-300 font-sans mb-3">{mem.eventTitle}</h3>
                                
                                <div className="space-y-2 mt-auto">
                                    <div className="flex justify-between items-center text-xs font-mono">
                                        <span className="text-zinc-500">Base Impact</span>
                                        <span className="text-zinc-300">{mem.impactScore.toFixed(1)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-mono">
                                        <span className="text-purple-500/70">Current Weight (Decay)</span>
                                        <span className="text-purple-400 font-bold">{mem.currentWeight?.toFixed(1) || mem.impactScore.toFixed(1)}</span>
                                    </div>
                                    <div className="pt-2 mt-2 border-t border-zinc-800/50">
                                        <span className="text-[10px] text-zinc-500 uppercase block mb-1">Societal Scars</span>
                                        <ul className="text-xs text-zinc-400 space-y-1 list-disc pl-4">
                                            {mem.currentEffects.map((effect, idx) => (
                                                <li key={idx}>{effect}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
