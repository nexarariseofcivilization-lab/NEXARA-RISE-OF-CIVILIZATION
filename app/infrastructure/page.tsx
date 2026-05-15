'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Zap, Wifi, Truck, Building2, Landmark, ShieldAlert, Cpu, Activity, AlertTriangle, Server, Box, Droplet, HeartPulse, HardDrive, DollarSign, Database, Fuel, Map } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppStore, InfraType, InfraNode } from '@/lib/store';

export default function InfrastructureDashboard() {
    const [mounted, setMounted] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState('DKI_JAKARTA');
    const [selectedNodeId, setSelectedNodeId] = useState<InfraType | null>(null);
    
    const infra = useAppStore(state => state.infra);
    const resources = useAppStore(state => state.resources);
    const triggerDisaster = useAppStore(state => state.triggerDisaster);
    const setInfraPolicy = useAppStore(state => state.setInfraPolicy);
    const logs = useAppStore(state => state.logs);

    useEffect(() => {
        setMounted(true);
    }, []);

    const getNodeDetails = (id: InfraType, name: string, icon: any, dependencies: string[]) => ({
        id, name, icon, dependencies
    });

            const nodeMeta: Record<InfraType, any> = {
        POWER: getNodeDetails('POWER', 'National Power Grid', Zap, []),
        ISP: getNodeDetails('ISP', 'Telecommunication & ISP', Wifi, ['POWER', 'DATA']),
        TRANSPORT: getNodeDetails('TRANSPORT', 'Roads & Logistics', Truck, ['POWER']),
        BANKING: getNodeDetails('BANKING', 'Financial & Banking', Landmark, ['ISP', 'POWER']),
        FOOD: getNodeDetails('FOOD', 'Food Distribution', Box, ['TRANSPORT']),
        DATA: getNodeDetails('DATA', 'Data Center Network', HardDrive, []),
        WATER: getNodeDetails('WATER', 'Water Reserves', Droplet, []),
        HEALTHCARE: getNodeDetails('HEALTHCARE', 'Medical Network', HeartPulse, ['POWER', 'WATER'])
    };

    const getConsumptionStats = (node: InfraType) => {
        switch(node) {
            case 'POWER': return { consumes: [{ label: 'Fuel', val: '10/tick' }], produces: [{ label: 'Energy', val: '20/tick' }], budget: '$5B' };
            case 'ISP': return { consumes: [{ label: 'Energy', val: '2/tick' }], produces: [], budget: '$2B' };
            case 'TRANSPORT': return { consumes: [{ label: 'Fuel', val: '5/tick' }], produces: [], budget: '$4B' };
            case 'BANKING': return { consumes: [{ label: 'Energy', val: '1/tick' }], produces: [], budget: '$5B' };
            case 'FOOD': return { consumes: [{ label: 'Water', val: '5/tick' }, { label: 'Materials', val: '1/tick' }], produces: [{ label: 'Food', val: '10/tick' }], budget: '$3B' };
            case 'DATA': return { consumes: [{ label: 'Energy', val: '5/tick' }], produces: [], budget: '$2B' };
            case 'WATER': return { consumes: [{ label: 'Energy', val: '2/tick' }], produces: [{ label: 'Water', val: '15/tick' }], budget: '$1B' };
            case 'HEALTHCARE': return { consumes: [{ label: 'Water', val: '2/tick' }, { label: 'Energy', val: '1/tick' }], produces: [], budget: '$8B' };
            default: return { consumes: [], produces: [], budget: '$0' };
        }
    };

    if (!mounted) return null;

    const getNodeColor = (status: string) => {
        if (status === 'ONLINE') return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
        if (status === 'DEGRADED') return 'text-amber-400 border-amber-500/30 bg-amber-500/10 animate-pulse';
        return 'text-rose-500 border-rose-500/50 bg-rose-500/20 animate-pulse';
    };

    const currentRegion = infra.regions[selectedRegion];
    const nodes = currentRegion?.nodes;
    const selectedNode: InfraNode | null = selectedNodeId ? nodes[selectedNodeId] : null;

    return (
        <div className="space-y-6 pb-20 max-w-7xl mx-auto h-full overflow-y-auto custom-scrollbar pr-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-zinc-800 pb-4 shrink-0 gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white uppercase font-sans flex items-center">
                        <Activity className="w-8 h-8 mr-3 text-cyan-500" />
                        Infrastructure Matrix
                    </h1>
                    <p className="text-zinc-400 mt-2 font-mono text-sm tracking-wide">Region-aware civilization support layer. Resource & degradation monitoring.</p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded p-1 flex overflow-x-auto whitespace-nowrap min-w-0 max-w-xl custom-scrollbar" style={{ scrollbarWidth: 'thin' }}>
                    {Object.values(infra.regions).map(r => (
                        <button key={r.id} onClick={() => { setSelectedRegion(r.id); setSelectedNodeId(null); }} className={`px-4 py-2 font-mono text-xs flex-shrink-0 font-bold uppercase transition ${selectedRegion === r.id ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-800 rounded' : 'text-zinc-500 hover:text-zinc-300'}`}>
                            {r.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* National Resource Ledger */}
            <Card className="bg-zinc-950/80 border-zinc-800">
                <CardHeader className="py-3 border-b border-zinc-800/50">
                    <CardTitle className="text-xs uppercase tracking-widest text-zinc-400 flex items-center">
                        <Database className="w-4 h-4 mr-2" /> National Resource Ledger
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 hover:border-cyan-900/50 transition">
                        <div className="text-[10px] text-zinc-500 font-mono uppercase flex items-center mb-1"><Zap className="w-3 h-3 mr-1 text-yellow-500"/> Energy</div>
                        <div className="font-mono text-lg text-emerald-400">{resources.energy.toLocaleString()}</div>
                    </div>
                    <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 hover:border-cyan-900/50 transition">
                        <div className="text-[10px] text-zinc-500 font-mono uppercase flex items-center mb-1"><Fuel className="w-3 h-3 mr-1 text-orange-500"/> Fuel</div>
                        <div className="font-mono text-lg text-emerald-400">{resources.fuel.toLocaleString()}</div>
                    </div>
                    <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 hover:border-cyan-900/50 transition">
                        <div className="text-[10px] text-zinc-500 font-mono uppercase flex items-center mb-1"><Droplet className="w-3 h-3 mr-1 text-blue-500"/> Water</div>
                        <div className="font-mono text-lg text-emerald-400">{resources.water.toLocaleString()}</div>
                    </div>
                    <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 hover:border-cyan-900/50 transition">
                        <div className="text-[10px] text-zinc-500 font-mono uppercase flex items-center mb-1"><Box className="w-3 h-3 mr-1 text-emerald-500"/> Food Supply</div>
                        <div className="font-mono text-lg text-emerald-400">{resources.food.toLocaleString()}</div>
                    </div>
                    <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 hover:border-cyan-900/50 transition">
                        <div className="text-[10px] text-zinc-500 font-mono uppercase flex items-center mb-1"><Cpu className="w-3 h-3 mr-1 text-zinc-400"/> Materials</div>
                        <div className="font-mono text-lg text-emerald-400">{resources.materials.toLocaleString()}</div>
                    </div>
                    <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 hover:border-cyan-900/50 transition">
                        <div className="text-[10px] text-zinc-500 font-mono uppercase flex items-center mb-1"><HardDrive className="w-3 h-3 mr-1 text-zinc-400"/> Components</div>
                        <div className="font-mono text-lg text-emerald-400">{resources.components.toLocaleString()}</div>
                    </div>
                    <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 hover:border-cyan-900/50 transition">
                        <div className="text-[10px] text-zinc-500 font-mono uppercase flex items-center mb-1"><DollarSign className="w-3 h-3 mr-1 text-emerald-500"/> Budget (B)</div>
                        <div className="font-mono text-lg text-emerald-400">${resources.budget.toLocaleString()}</div>
                    </div>
                    <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 hover:border-cyan-900/50 transition">
                        <div className="text-[10px] text-zinc-500 font-mono uppercase flex items-center mb-1"><ShieldAlert className="w-3 h-3 mr-1 text-red-500"/> Emergency (B)</div>
                        <div className="font-mono text-lg text-red-400">${resources.emergencyReserves.toLocaleString()}</div>
                    </div>
                </CardContent>
            </Card>

            {/* National Infrastructure Resource Consumption Panel */}
            <Card className="bg-zinc-950/80 border-zinc-800">
                <CardHeader className="py-3 border-b border-zinc-800/50">
                    <CardTitle className="text-xs uppercase tracking-widest text-zinc-400 flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-rose-500" /> Infrastructure Resource Metabolism
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {nodes && Object.entries(nodes).map(([key, node]) => {
                        const stats = getConsumptionStats(key as InfraType);
                        return (
                            <div key={key} className="bg-zinc-900/50 p-2 rounded border border-zinc-800 flex flex-col justify-between h-full">
                                <div className="text-[10px] text-zinc-300 font-bold font-mono uppercase mb-2 pb-1 border-b border-zinc-800">{nodeMeta[key as InfraType].name}</div>
                                <div className="space-y-1">
                                    {stats.consumes.map((c, i) => (
                                        <div key={i} className="flex justify-between items-center text-[9px] font-mono">
                                            <span className="text-rose-400 capitalize flex items-center"><span className="w-1 h-1 rounded-full bg-rose-500 mr-1"></span>{c.label}</span>
                                            <span className="text-zinc-500">{c.val}</span>
                                        </div>
                                    ))}
                                    {stats.produces.map((c, i) => (
                                        <div key={i} className="flex justify-between items-center text-[9px] font-mono mt-1 pt-1 border-t border-zinc-800/50">
                                            <span className="text-emerald-400 capitalize flex items-center"><span className="w-1 h-1 rounded-full bg-emerald-500 mr-1"></span>{c.label}</span>
                                            <span className="text-zinc-500">+{c.val}</span>
                                        </div>
                                    ))}
                                    {stats.consumes.length === 0 && stats.produces.length === 0 && <div className="text-[9px] font-mono text-zinc-600">No active load</div>}
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Infrastructure Dependency Visualization */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="bg-zinc-950/80 border-zinc-800/80">
                        <CardHeader className="pb-2 border-b border-zinc-800/50">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-sm font-semibold text-zinc-300 uppercase tracking-widest flex items-center">
                                    <Map className="w-4 h-4 mr-2 text-cyan-400" /> Dependency Topology: {currentRegion.name}
                                </CardTitle>
                                <span className="font-mono text-[10px] text-emerald-500 bg-emerald-900/30 px-2 py-1 rounded">RESILIENCE SCORE: {currentRegion.resilienceScore}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {nodes && Object.entries(nodes).map(([key, node]) => {
                                    const meta = nodeMeta[key as InfraType];
                                    const isSelected = selectedNodeId === key;
                                    const isUpstream = selectedNodeId && nodeMeta[selectedNodeId].dependencies.includes(key);
                                    const isDownstream = selectedNodeId && nodeMeta[key as InfraType].dependencies.includes(selectedNodeId);
                                    
                                    let ringClass = '';
                                    if (isSelected) ringClass = 'ring-2 ring-cyan-500 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.3)] z-10 scale-[1.02]';
                                    else if (isUpstream) ringClass = 'ring-2 ring-orange-500/80 bg-orange-950/20 opacity-100 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
                                    else if (isDownstream) ringClass = 'ring-2 ring-purple-500/80 bg-purple-950/20 opacity-100 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
                                    else if (selectedNodeId) ringClass = 'opacity-40 grayscale';

                                    return (
                                    <div key={meta.id} onClick={() => setSelectedNodeId(key as InfraType)} className={`p-4 rounded border cursor-pointer ${getNodeColor(node.status)} ${ringClass} hover:scale-[1.02] active:scale-95 transition-all duration-300 relative`}>
                                        {isUpstream && <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-orange-950 text-orange-400 text-[8px] font-mono font-bold px-2 py-0.5 rounded border border-orange-500/50 uppercase">UPSTREAM DEP</div>}
                                        {isDownstream && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-950 text-purple-400 text-[8px] font-mono font-bold px-2 py-0.5 rounded border border-purple-500/50 uppercase">DOWNSTREAM IMPACT</div>}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="p-2 bg-zinc-950/50 rounded inline-block">
                                                <meta.icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-zinc-950/50 px-2 py-0.5 rounded">
                                                {node.status}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-sm text-white mb-1 uppercase tracking-wide">{meta.name}</h3>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-[10px] font-mono opacity-80 uppercase">Lvl {node.level} • {node.doctrine.slice(0,4)}</span>
                                            <span className="text-xs font-mono font-bold">{node.health.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full h-1 bg-zinc-950/50 rounded-full mt-1 overflow-hidden">
                                            <div className={`h-full ${node.health < 30 ? 'bg-rose-500' : node.health < 70 ? 'bg-amber-500' : 'bg-emerald-500'} transition-all`} style={{ width: `${node.health}%`}} />
                                        </div>
                                        {meta.dependencies.length > 0 && (
                                            <div className="mt-3 text-[9px] font-mono opacity-80 border-t border-current pt-2 mt-auto">
                                                DEP: {meta.dependencies.join(' • ')}
                                            </div>
                                        )}
                                    </div>
                                )})}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Node Upgrade & Policy Panel */}
                    {selectedNodeId && selectedNode && (
                        <Card className="bg-cyan-950/10 border-cyan-900/30">
                            <CardHeader className="py-3 border-b border-cyan-900/30">
                                <CardTitle className="text-sm font-semibold text-cyan-400 uppercase tracking-widest flex items-center">
                                    <Server className="w-4 h-4 mr-2" /> Node Terminal: {nodeMeta[selectedNodeId].name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    {/* Progressive Info Density & Strain Panel based on Node type */}
                                    <div className={`p-4 rounded border ${selectedNode.health < 30 ? 'bg-rose-950/30 border-rose-900/50' : selectedNode.health < 70 ? 'bg-amber-950/20 border-amber-900/30' : 'bg-black/40 border-zinc-800'}`}>
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className={`text-[10px] font-mono tracking-widest uppercase ${selectedNode.health < 30 ? 'text-rose-400' : selectedNode.health < 70 ? 'text-amber-400' : 'text-zinc-500'}`}>Systemic Stress Profile</h4>
                                            {selectedNode.health < 30 && <span className="bg-rose-900 text-rose-200 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">CASCADING FAILURE RISK</span>}
                                            {(selectedNode.health >= 30 && selectedNode.health < 70) && <span className="text-amber-500 text-[9px] font-bold uppercase">STRAINED</span>}
                                            {selectedNode.health >= 70 && <span className="text-emerald-500 text-[9px] font-bold uppercase">STABLE</span>}
                                        </div>
                                        
                                        {/* POWER or Default */}
                                        {(selectedNodeId === 'POWER' || !['POWER','HEALTHCARE','ISP', 'TRANSPORT'].includes(selectedNodeId)) && (
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-xs font-mono">
                                                    <span className="text-zinc-400">Current Monthly Maintenance</span>
                                                    <span className="text-rose-400">{getConsumptionStats(selectedNodeId).budget}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs font-mono">
                                                    <span className="text-zinc-400">Projected Resource Strain</span>
                                                    {selectedNode.health < 70 ? <span className="text-amber-400">Escalating</span> : <span className="text-emerald-400">Nominal</span>}
                                                </div>
                                                <div className="p-2 bg-black/30 rounded border border-zinc-800/50 mt-2">
                                                    <p className="text-[10px] text-zinc-400 font-mono leading-relaxed">
                                                        {selectedNode.health >= 70 ? 'Grid maintenance burden operating within sustainable thresholds.' : 
                                                         selectedNode.health >= 30 ? 'Deferred repairs beginning to impact national energy stability. Power infrastructure spending reducing other subsidy flexibility.' :
                                                         'National reserve sustainability projected to fall below safe threshold within operational cycles. High risk of systemic blackout.'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* HEALTHCARE */}
                                        {selectedNodeId === 'HEALTHCARE' && (
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-xs font-mono">
                                                    <span className="text-zinc-400">Deferred Maint. Risk</span>
                                                    {selectedNode.health < 70 ? <span className="text-rose-400">High</span> : <span className="text-emerald-400">Low</span>}
                                                </div>
                                                <div className="flex justify-between items-center text-xs font-mono">
                                                    <span className="text-zinc-400">Facility Overload</span>
                                                    {selectedNode.health < 30 ? <span className="text-rose-400 animate-pulse">Critical</span> : selectedNode.health < 70 ? <span className="text-amber-400">Elevated</span> : <span className="text-emerald-400">Nominal</span>}
                                                </div>
                                                <div className="p-2 bg-black/30 rounded border border-zinc-800/50 mt-2">
                                                    <p className="text-[10px] text-zinc-400 font-mono leading-relaxed">
                                                        {selectedNode.health >= 70 ? 'Medical network reserves stable. Staffing and institutional health secure.' : 
                                                         selectedNode.health >= 30 ? 'Silent institutional exhaustion accumulating. Rising treatment delays and creeping mortality impact.' :
                                                         'HOSPITAL NETWORK COLLAPSE. Severe workforce shortages and uncontrolled public trust erosion. High political destabilization imminent.'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* TRANSPORT */}
                                        {selectedNodeId === 'TRANSPORT' && (
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-xs font-mono">
                                                    <span className="text-zinc-400">Logistics Capacity</span>
                                                    {selectedNode.health < 30 ? <span className="text-rose-400 animate-pulse">Degraded</span> : selectedNode.health < 70 ? <span className="text-amber-400">Strained</span> : <span className="text-emerald-400">Optimal</span>}
                                                </div>
                                                <div className="flex justify-between items-center text-xs font-mono">
                                                    <span className="text-zinc-400">Supply Chain Overhead</span>
                                                    <span className="text-amber-400">{getConsumptionStats(selectedNodeId).consumes.map(c => c.label).join(' & ')} Dependency</span>
                                                </div>
                                                <div className="p-2 bg-black/30 rounded border border-zinc-800/50 mt-2">
                                                    <p className="text-[10px] text-zinc-400 font-mono leading-relaxed">
                                                        {selectedNode.health >= 70 ? 'National logistics throughput operating cleanly.' : 
                                                         selectedNode.health >= 30 ? 'Regional chokepoints developing. Economic friction scaling.' :
                                                         'LOGISTICS PARALYSIS. Food and material distribution failing nationwide.'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* ISP */}
                                        {selectedNodeId === 'ISP' && (
                                            <div className="space-y-3">
                                                <div className="p-2 bg-black/30 rounded border border-zinc-800/50 mt-2">
                                                    <p className="text-[10px] text-zinc-400 font-mono leading-relaxed mb-2">
                                                        {selectedNode.health >= 70 ? 'Telecommunications baseline stable. Upstream dependency routing healthy.' : 
                                                         selectedNode.health >= 30 ? 'Upstream data/power fluctuations detected. Service instability projected.' :
                                                         'CASCADING DATA COLLAPSE. Financial transactions and operational comms failing. Economic disruption severe.'}
                                                    </p>
                                                    
                                                    {/* Critical Dependency Highlight */}
                                                    {(selectedNode.health < 70) && (
                                                        <div className="mt-3 pt-3 border-t border-zinc-800/50 space-y-1">
                                                            <div className="text-[9px] uppercase tracking-widest text-orange-400 mb-1">Upstream Vulnerability:</div>
                                                            <div className="flex justify-between font-mono text-xs">
                                                                <span className="text-zinc-500">POWER GRID</span>
                                                                <span className={nodes['POWER'].health < 50 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}>{nodes['POWER'].health < 50 ? 'CRITICAL' : 'DEGRADED'}</span>
                                                            </div>
                                                            <div className="flex justify-between font-mono text-xs">
                                                                <span className="text-zinc-500">DATA CENTER NETWORK</span>
                                                                <span className={nodes['DATA'].health < 50 ? 'text-rose-400 flex items-center' : 'text-amber-400 flex items-center'}>{nodes['DATA'].health < 50 ? 'CRITICAL' : 'DEGRADED'}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2">Current Doctrine</h4>
                                        <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded">
                                            <div className="font-mono text-sm text-amber-400 mb-1">{selectedNode.doctrine}</div>
                                            <p className="text-xs text-zinc-400">Dictates resource efficiency and systemic vulnerability type.</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <h4 className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Maintenance Policy</h4>
                                            <span className="text-[9px] font-mono text-zinc-400">Budget Impact: <span className="text-rose-400">-{getConsumptionStats(selectedNodeId).budget}</span></span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {['PREVENTIVE', 'BALANCED', 'REACTIVE', 'EMERGENCY'].map(policy => (
                                                <button 
                                                    key={policy}
                                                    onClick={() => setInfraPolicy(selectedRegion, selectedNodeId, { maintenancePolicy: policy as any })}
                                                    className={`p-2 text-xs font-mono uppercase tracking-wide text-left rounded border transition ${selectedNode.maintenancePolicy === policy ? 'bg-indigo-900/40 border-indigo-600' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}`}
                                                >
                                                    <div className={`font-bold ${selectedNode.maintenancePolicy === policy ? 'text-indigo-300' : 'text-zinc-400'}`}>{policy}</div>
                                                    {policy === 'PREVENTIVE' && <div className="text-[9px] text-zinc-500 mt-1 flex justify-between"><span>Max Cost, No Decay</span><span className="text-rose-400">+$0.5B/tick</span></div>}
                                                    {policy === 'BALANCED' && <div className="text-[9px] text-zinc-500 mt-1 flex justify-between"><span>Med Cost, Slow Decay</span><span className="text-amber-400">+$0.1B/tick</span></div>}
                                                    {policy === 'REACTIVE' && <div className="text-[9px] text-zinc-500 mt-1 flex justify-between"><span>Free, Fast Decay</span><span className="text-emerald-400">$0</span></div>}
                                                    {policy === 'EMERGENCY' && <div className="text-[9px] text-zinc-500 mt-1 flex justify-between"><span>Extreme Cost, Rescue &lt;40%</span><span className="text-rose-500">+$2.0B/tick</span></div>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2">Doctrine Philosophy Upgrades (Lvl {selectedNode.level})</h4>
                                        <div className="flex flex-col gap-2">
                                            <button 
                                                onClick={() => { if(resources.budget >= 10) setInfraPolicy(selectedRegion, selectedNodeId, { doctrine: 'CENTRALIZED', level: selectedNode.level + 1 }); }}
                                                className={`p-3 bg-zinc-900/50 hover:bg-zinc-800 border ${selectedNode.doctrine === 'CENTRALIZED' ? 'border-cyan-500/50 relative overflow-hidden' : 'border-zinc-800'} rounded text-left transition disabled:opacity-50`}
                                                disabled={resources.budget < 10}
                                            >
                                                {selectedNode.doctrine === 'CENTRALIZED' && <div className="absolute top-0 right-0 bg-cyan-900/50 text-cyan-300 text-[8px] font-bold px-1.5 py-0.5 rounded-bl">CURRENT</div>}
                                                <div className="text-xs font-bold text-zinc-300 flex justify-between"><span>{selectedNodeId === 'TRANSPORT' ? 'CENTRALIZED LOGISTIC CORRIDOR' : 'CENTRALIZED PROTOCOL'}</span> <span>$10B</span></div>
                                                <div className="text-[10px] mt-1 text-zinc-400">Low operating cost, efficient national coordination, rapid throughput.</div>
                                                <div className="text-[9px] mt-2 space-y-0.5 grid grid-cols-2 gap-x-2 gap-y-1 text-zinc-500 font-mono p-2 bg-black/20 rounded">
                                                    <div className="flex justify-between">Maint. Burden <span className="text-emerald-400">LOW</span></div>
                                                    <div className="flex justify-between">Cascade Risk <span className="text-rose-400">CRITICAL</span></div>
                                                    <div className="flex justify-between">Resilience <span className="text-amber-400">STABLE</span></div>
                                                </div>
                                            </button>

                                            <button 
                                                onClick={() => { if(resources.budget >= 15) setInfraPolicy(selectedRegion, selectedNodeId, { doctrine: 'DISTRIBUTED', level: selectedNode.level + 1 }); }}
                                                className={`p-3 bg-zinc-900/50 hover:bg-zinc-800 border ${selectedNode.doctrine === 'DISTRIBUTED' ? 'border-cyan-500/50 relative overflow-hidden' : 'border-zinc-800'} rounded text-left transition disabled:opacity-50`}
                                                disabled={resources.budget < 15}
                                            >
                                                {selectedNode.doctrine === 'DISTRIBUTED' && <div className="absolute top-0 right-0 bg-cyan-900/50 text-cyan-300 text-[8px] font-bold px-1.5 py-0.5 rounded-bl">CURRENT</div>}
                                                <div className="text-xs font-bold text-zinc-300 flex justify-between"><span>{selectedNodeId === 'TRANSPORT' ? 'DISTRIBUTED REGIONAL TRANSIT' : 'DISTRIBUTED SMART GRID'}</span> <span>$15B</span></div>
                                                <div className="text-[10px] mt-1 text-zinc-400">Localized redundancy, strong regional autonomy, high disaster resistance.</div>
                                                <div className="text-[9px] mt-2 space-y-0.5 grid grid-cols-2 gap-x-2 gap-y-1 text-zinc-500 font-mono p-2 bg-black/20 rounded">
                                                    <div className="flex justify-between">Maint. Burden <span className="text-rose-400">HIGH</span></div>
                                                    <div className="flex justify-between">Cascade Risk <span className="text-emerald-400">LOW</span></div>
                                                    <div className="flex justify-between">Resilience <span className="text-emerald-400">EXTREME</span></div>
                                                </div>
                                            </button>

                                            <button 
                                                onClick={() => { if(resources.budget >= 20) setInfraPolicy(selectedRegion, selectedNodeId, { doctrine: 'RENEWABLE', level: selectedNode.level + 1 }); }}
                                                className={`p-3 bg-zinc-900/50 hover:bg-zinc-800 border ${selectedNode.doctrine.includes('RENEWABLE') ? 'border-cyan-500/50 relative overflow-hidden' : 'border-zinc-800'} rounded text-left transition disabled:opacity-50`}
                                                disabled={resources.budget < 20}
                                            >
                                                {selectedNode.doctrine.includes('RENEWABLE') && <div className="absolute top-0 right-0 bg-cyan-900/50 text-cyan-300 text-[8px] font-bold px-1.5 py-0.5 rounded-bl">CURRENT</div>}
                                                <div className="text-xs font-bold text-zinc-300 flex justify-between"><span>{selectedNodeId === 'TRANSPORT' ? 'GREEN MOBILITY NETWORK' : 'RENEWABLE HYBRID'}</span> <span>$20B</span></div>
                                                <div className="text-[10px] mt-1 text-zinc-400">Sustainable, independent, lower long-term ecological pressure.</div>
                                                <div className="text-[9px] mt-2 space-y-0.5 grid grid-cols-2 gap-x-2 gap-y-1 text-zinc-500 font-mono p-2 bg-black/20 rounded">
                                                    <div className="flex justify-between">Maint. Burden <span className="text-amber-400">MED</span></div>
                                                    <div className="flex justify-between">Cascade Risk <span className="text-amber-400">MED</span></div>
                                                    <div className="flex justify-between">Resilience <span className="text-emerald-400">STABLE</span></div>
                                                    <div className="flex justify-between col-span-2">Social Sentiment <span className="text-emerald-400">HIGH</span></div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-zinc-600 font-mono mt-4 p-2 bg-zinc-900/50 rounded">
                                        Note: Changing doctrine costs resources dynamically and may temporarily destabilize the node.
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Actions & Event Log */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Disaster Control (Admin/God mode for testing) */}
                    <Card className="bg-red-950/20 border-red-900/50">
                        <CardHeader className="py-4 border-b border-red-900/30">
                            <CardTitle className="text-xs uppercase tracking-widest text-red-500 flex items-center">
                                <ShieldAlert className="w-3 h-3 mr-2" /> Cascade Stress Testing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <p className="text-[10px] text-red-400 mb-4 font-mono">Trigger regional failures to observe dependency cascade.</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => triggerDisaster(selectedRegion, 'POWER')} className="bg-red-900/50 hover:bg-red-800 text-red-200 text-[10px] uppercase font-bold tracking-widest py-2 rounded transition">
                                    Blackout
                                </button>
                                <button onClick={() => triggerDisaster(selectedRegion, 'ISP')} className="bg-red-900/50 hover:bg-red-800 text-red-200 text-[10px] uppercase font-bold tracking-widest py-2 rounded transition">
                                    ISP Outage
                                </button>
                                <button onClick={() => triggerDisaster(selectedRegion, 'BANKING')} className="bg-red-900/50 hover:bg-red-800 text-red-200 text-[10px] uppercase font-bold tracking-widest py-2 rounded transition">
                                    Bank Run
                                </button>
                                <button onClick={() => triggerDisaster(selectedRegion, 'TRANSPORT')} className="bg-red-900/50 hover:bg-red-800 text-red-200 text-[10px] uppercase font-bold tracking-widest py-2 rounded transition">
                                    Road Strike
                                </button>
                                <button onClick={() => triggerDisaster(selectedRegion, 'WATER')} className="bg-red-900/50 hover:bg-red-800 text-red-200 text-[10px] uppercase font-bold tracking-widest py-2 rounded transition">
                                    Drought
                                </button>
                                <button onClick={() => triggerDisaster(selectedRegion, 'FOOD')} className="bg-red-900/50 hover:bg-red-800 text-red-200 text-[10px] uppercase font-bold tracking-widest py-2 rounded transition">
                                    Food Shortage
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Event Log */}
                    <Card className="bg-zinc-950/80 border-zinc-800 h-[300px] flex flex-col">
                        <CardHeader className="py-4 border-b border-zinc-800/50 shrink-0">
                            <CardTitle className="text-xs uppercase tracking-widest text-zinc-400 flex items-center">
                                <AlertTriangle className="w-3 h-3 mr-2" /> Operations Event Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 overflow-auto custom-scrollbar flex-1 relative">
                             <div className="p-4 space-y-3">
                                {logs.map((e, idx) => (
                                    <div key={idx} className={`flex space-x-3 items-start p-2 rounded border ${e.type === 'error' ? 'bg-rose-950/30 border-rose-900/30' : e.type === 'warn' ? 'bg-amber-950/30 border-amber-900/30' : 'bg-zinc-900/50 border-zinc-800/30'}`}>
                                        <span className="text-[10px] font-mono text-zinc-500 pt-0.5 shrink-0">{e.time}</span>
                                        <span className={`text-[10px] font-mono font-bold leading-relaxed ${e.type === 'error' ? 'text-rose-400' : e.type === 'warn' ? 'text-amber-400' : 'text-zinc-300'}`}>
                                            {e.msg}
                                        </span>
                                    </div>
                                ))}
                             </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
