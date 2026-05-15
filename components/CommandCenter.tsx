'use client';

import { useState, useEffect } from 'react';
import { getSimulationState } from '@/lib/actions';
import { Activity, AlertTriangle, Play, Server, Shield, ShoppingCart, Users, Database, Globe, Zap, Warehouse, Factory, Building2, Workflow, Radio, Flame, Crosshair, Rewind } from 'lucide-react';
import Link from 'next/link';

export default function CommandCenter() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const fetchState = async () => {
    const data = await getSimulationState();
    setState(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTick = async () => {
    setTriggering(true);
    try {
      await fetch('/api/cron/tick', { method: 'POST' });
      await fetchState();
    } catch(e) {
      console.error(e);
    }
    setTriggering(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-black text-green-500 font-mono flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Server className="w-12 h-12 animate-pulse" />
        <p>INITIALIZING NEXARA CORE...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-300 font-mono p-4 sm:p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter text-white flex items-center gap-3">
            <Globe className="text-blue-500" />
            NEXARA COMMAND CENTER
          </h1>
          <p className="text-slate-500 text-sm mt-1">EMERGENT CIVILIZATION ENGINE V1.0</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 uppercase">Global Tick</span>
            <span className="text-2xl font-bold text-amber-400">{state.currentTickId}</span>
          </div>
          <Link href="/replay" className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-500/30 px-4 py-2 rounded text-sm transition-colors">
            <Rewind className="w-4 h-4" />
            CAUSALITY REPLAY
          </Link>
          <button 
            onClick={handleTick}
            disabled={triggering}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm transition-colors disabled:opacity-50"
          >
            {triggering ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            FORCE TICK
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* System Health Meta Layer */}
        {state.tick_metrics && state.tick_metrics.length > 0 && (
          <section className="bg-[#121216] border border-blue-900/50 rounded-lg p-5 lg:col-span-4">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-4 uppercase">
              <Activity className="w-4 h-4 text-blue-400" />
              Civilization Pressure Graph (Meta-Governance)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {(() => {
                const latest = state.tick_metrics[0];
                return (
                  <>
                    <div className="bg-black/50 p-3 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 mb-1 uppercase">Tick Processing</div>
                      <div className="text-lg font-bold text-slate-300">{latest.processing_time_ms}ms</div>
                      <div className="text-xs text-slate-500">{latest.events_processed} events/tick</div>
                    </div>
                    <div className="bg-black/50 p-3 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 mb-1 uppercase">Econ Pressure</div>
                      <div className={`text-lg font-bold ${latest.economic_pressure > 70 ? 'text-red-400' : 'text-blue-400'}`}>{Number(latest.economic_pressure).toFixed(1)}</div>
                    </div>
                    <div className="bg-black/50 p-3 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 mb-1 uppercase">Social Pressure</div>
                      <div className={`text-lg font-bold ${latest.social_pressure > 80 ? 'text-red-400' : 'text-amber-400'}`}>{Number(latest.social_pressure).toFixed(1)}</div>
                    </div>
                    <div className="bg-black/50 p-3 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 mb-1 uppercase">Pol Fragmentation</div>
                      <div className={`text-lg font-bold ${latest.political_fragmentation > 60 ? 'text-fuchsia-400' : 'text-purple-400'}`}>{Number(latest.political_fragmentation).toFixed(1)}</div>
                    </div>
                    <div className="bg-black/50 p-3 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 mb-1 uppercase">Infra Fragility</div>
                      <div className={`text-lg font-bold ${latest.infrastructure_fragility > 50 ? 'text-red-400' : 'text-emerald-400'}`}>{Number(latest.infrastructure_fragility).toFixed(1)}</div>
                    </div>
                  </>
                );
              })()}
            </div>
          </section>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Macro State */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Demographics & Unrest */}
          <section className="bg-[#121216] border border-slate-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-4 uppercase">
              <Users className="w-4 h-4 text-emerald-400" />
              Population & Sentiment
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {state.demographics.map((demo: any) => {
                const rs = state.region_states?.find((r:any) => r.region_id === demo.region_id);
                return (
                <div key={demo.region_id} className="bg-black/50 p-4 rounded border border-slate-800/50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs text-slate-500">REGION: {demo.region_id.substring(0,8)}</div>
                    {rs && (
                      <div className="flex items-center gap-1 text-xs">
                        <Workflow className="w-3 h-3 text-slate-400" />
                        <span className={rs.infrastructure_health < 50 ? 'text-red-400' : 'text-slate-400'}>{Number(rs.infrastructure_health).toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-white mb-4">{demo.total_population?.toLocaleString() || 0} <span className="text-xs text-slate-500 font-normal">pop</span></div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Trust Index</span>
                        <span className={demo.avg_trust < 30 ? 'text-red-400' : 'text-emerald-400'}>{demo.avg_trust ? Number(demo.avg_trust).toFixed(1) : 0}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${demo.avg_trust}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Stress Level</span>
                        <span className={demo.avg_stress > 70 ? 'text-red-400' : 'text-amber-400'}>{demo.avg_stress ? Number(demo.avg_stress).toFixed(1) : 0}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded overflow-hidden">
                        <div className={`h-full ${demo.avg_stress > 70 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${demo.avg_stress}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-purple-400">Panic Level</span>
                        <span className={demo.panic_level > 20 ? 'text-purple-400 font-bold' : 'text-purple-400'}>{demo.panic_level ? Number(demo.panic_level).toFixed(1) : 0}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded overflow-hidden">
                        <div className={`h-full ${demo.panic_level > 20 ? 'bg-purple-500' : 'bg-purple-500/50'}`} style={{ width: `${demo.panic_level}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-rose-400 font-bold">Unrest Pressure</span>
                        <span className="text-rose-400 font-bold">{demo.unrest_pressure ? Number(demo.unrest_pressure).toFixed(1) : 0}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded overflow-hidden">
                        <div className="h-full bg-rose-500" style={{ width: `${demo.unrest_pressure}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Social Fatigue</span>
                        <span className={demo.social_fatigue > 50 ? 'text-indigo-400' : 'text-slate-500'}>{demo.social_fatigue ? Number(demo.social_fatigue).toFixed(1) : 0}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded overflow-hidden">
                        <div className="h-full bg-indigo-500/50" style={{ width: `${demo.social_fatigue || 0}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-pink-400 font-bold">Cult. Polarization</span>
                        <span className={demo.cultural_polarization > 50 ? 'text-pink-400 font-bold' : 'text-pink-400'}>{demo.cultural_polarization ? Number(demo.cultural_polarization).toFixed(1) : 0}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded overflow-hidden">
                        <div className="h-full bg-pink-500" style={{ width: `${demo.cultural_polarization || 0}%` }}></div>
                      </div>
                    </div>
                    {demo.dominant_ideology && (
                      <div className="mt-2 text-[10px] text-slate-500 uppercase tracking-wider text-center">
                        Dom Ideology: <span className="text-slate-300 font-bold">{demo.dominant_ideology}</span>
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
              {state.demographics.length === 0 && <div className="text-slate-500 text-sm">No active population data.</div>}
            </div>
          </section>

          {/* Economy & Markets */}
          <section className="bg-[#121216] border border-slate-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-4 uppercase">
              <ShoppingCart className="w-4 h-4 text-purple-400" />
              Regional Markets
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-black/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl">Resource</th>
                    <th className="px-4 py-3">Region</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Supply</th>
                    <th className="px-4 py-3">Demand</th>
                    <th className="px-4 py-3 rounded-tr">Shortage</th>
                  </tr>
                </thead>
                <tbody>
                  {state.markets.map((m: any, i: number) => (
                    <tr key={i} className="border-b border-slate-800/50 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-medium text-slate-200">{m.resource_id}</td>
                      <td className="px-4 py-3 text-slate-500">{m.region_id.substring(0,8)}</td>
                      <td className="px-4 py-3">
                        ${m.current_price} 
                        {m.price_change_pct > 10 && <span className="ml-2 text-xs text-red-400 bg-red-400/10 px-1 rounded">+{Number(m.price_change_pct).toFixed(1)}%</span>}
                      </td>
                      <td className="px-4 py-3 text-emerald-400">{m.available_supply}</td>
                      <td className="px-4 py-3 text-amber-400">{m.daily_demand}</td>
                      <td className="px-4 py-3">
                        {m.shortage_severity > 0 
                          ? <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {Number(m.shortage_severity).toFixed(1)}%</span> 
                          : <span className="text-slate-600">Stable</span>}
                      </td>
                    </tr>
                  ))}
                  {state.markets.length === 0 && <tr><td colSpan={6} className="px-4 py-3 text-slate-500">No market data available.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          {/* Governance & Treasury */}
          <section className="bg-[#121216] border border-slate-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-4 uppercase">
              <Shield className="w-4 h-4 text-blue-400" />
              Governance & Policies
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs text-slate-500 mb-3 border-b border-slate-800 pb-2">TREASURY STATE</h3>
                {state.treasuries.map((t: any) => (
                  <div key={t.region_id} className="bg-black/50 p-3 rounded mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Fiscal Reserve</span>
                      <span className="text-emerald-400">${Number(t.fiscal_reserve).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Debt Level</span>
                      <span className={t.debt_level > 0 ? 'text-red-400' : 'text-slate-500'}>${Number(t.debt_level).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Inst. Trust</span>
                      <span className="text-blue-400">{t.institutional_trust ? Number(t.institutional_trust).toFixed(1) : 0}%</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1 border-t border-slate-800 pt-1 mt-1">
                      <span className="text-slate-400">Security Force</span>
                      <span className={t.coercive_force_capacity < 50 ? 'text-amber-400' : 'text-blue-400'}>{t.coercive_force_capacity ? Number(t.coercive_force_capacity).toFixed(1) : 0}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Bureauc. Paralysis</span>
                      <span className={t.bureaucratic_paralysis > 20 ? 'text-red-400' : 'text-slate-500'}>{t.bureaucratic_paralysis ? Number(t.bureaucratic_paralysis).toFixed(1) : 0}%</span>
                    </div>
                  </div>
                ))}
                {state.treasuries.length === 0 && <div className="text-slate-500 text-sm">No treasury data.</div>}
              </div>
              
              <div>
                <h3 className="text-xs text-slate-500 mb-3 border-b border-slate-800 pb-2">ACTIVE POLICIES</h3>
                <div className="space-y-2">
                  {state.policies.map((p: any) => (
                    <div key={p.id} className="bg-black/50 p-3 rounded text-sm flex justify-between items-center border border-slate-800/50 border-l-2 border-l-blue-500">
                      <div>
                        <div className="font-medium text-slate-200">{p.policy_blueprints?.name || p.policy_id}</div>
                        <div className="text-xs text-slate-500 mt-1">Efficacy: {(p.efficacy*100).toFixed(0)}% • Cost: ${p.actual_cost}</div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${p.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : p.status === 'COMPLETED' ? 'bg-slate-800 text-slate-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {p.status}
                      </div>
                    </div>
                  ))}
                  {state.policies.length === 0 && <div className="text-slate-500 text-sm">No standard policies active.</div>}
                </div>
              </div>
            </div>
          </section>

          {/* Factions & Power Dynamics */}
          <section className="bg-[#121216] border border-slate-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-4 uppercase">
              <Crosshair className="w-4 h-4 text-red-500" />
              Power & Ideology
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <h3 className="text-xs text-slate-500 border-b border-slate-800 pb-1 mb-2 uppercase">Faction Influence</h3>
                {state.factions?.map((f: any) => (
                  <div key={`${f.faction_id}-${f.region_id}`} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">{f.factions?.name || f.faction_id}</span>
                      <span className="text-slate-400">{Number(f.influence_score).toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded overflow-hidden">
                      <div className="h-full bg-slate-400" style={{ width: `${f.influence_score}%` }}></div>
                    </div>
                  </div>
                ))}
                {(!state.factions || state.factions.length === 0) && (
                  <div className="text-slate-500 text-sm">No factions identified.</div>
                )}
              </div>
              
              <div>
                <h3 className="text-xs text-slate-500 border-b border-slate-800 pb-1 mb-2 uppercase">Active Strategic Goals</h3>
                <div className="space-y-2">
                  {state.faction_objectives?.filter((o:any) => o.status === 'ACTIVE').map((obj: any) => (
                    <div key={obj.id} className="bg-black/50 border border-slate-800/50 rounded p-2 text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold text-blue-400">{obj.objective_type.replace('_', ' ')}</span>
                        <span className="text-slate-500">{Number(obj.progress).toFixed(0)}%</span>
                      </div>
                      <div className="text-slate-400 mb-1 truncate">{obj.factions?.name}</div>
                      <div className="text-slate-500 text-[10px] uppercase">Target: {obj.target_name || obj.target_ref}</div>
                      <div className="h-1 w-full bg-slate-800 rounded mt-1.5 overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${obj.progress}%` }}></div>
                      </div>
                    </div>
                  ))}
                  {(!state.faction_objectives || state.faction_objectives.filter((o:any) => o.status === 'ACTIVE').length === 0) && (
                    <div className="text-slate-500 text-sm">No active unguided agendas.</div>
                  )}
                </div>
              </div>

              <div>
                  <h3 className="text-xs text-slate-500 border-b border-slate-800 pb-1 mb-2 uppercase">Physical Mobilizations</h3>
                  <div className="space-y-2">
                    {state.mobilizations?.filter((m:any) => m.status === 'ACTIVE').map((m: any) => (
                      <div key={m.id} className="bg-red-500/10 border border-red-500/20 rounded p-2 text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="font-bold text-red-400 flex items-center gap-1"><Flame className="w-3 h-3"/> {m.mobilization_type}</span>
                          <span className="text-slate-500">Int: {Number(m.intensity).toFixed(0)}</span>
                        </div>
                        <div className="text-slate-400 truncate">{m.factions?.name || m.faction_id}</div>
                      </div>
                    ))}
                    {(!state.mobilizations || state.mobilizations.filter((m:any) => m.status === 'ACTIVE').length === 0) && (
                      <div className="text-slate-500 text-sm">No active uprisings or strikes.</div>
                    )}
                  </div>
              </div>

              <div>
                <h3 className="text-xs text-slate-500 border-b border-slate-800 pb-1 mb-2 uppercase">Diplomatic Pacts</h3>
                <div className="space-y-2 mb-4">
                  {state.faction_relations?.filter((r:any) => r.pact_type !== 'NONE').map((rel: any, idx: number) => (
                    <div key={idx} className={`border rounded p-2 text-xs ${rel.pact_type === 'COALITION' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                      <div className="flex justify-between mb-1">
                         <span className={`font-bold ${rel.pact_type === 'COALITION' ? 'text-indigo-400' : 'text-red-400'}`}>{rel.pact_type}</span>
                         <span className="text-slate-500">Aff: {Number(rel.affinity_score).toFixed(0)}</span>
                      </div>
                      <div className="text-slate-300 text-[10px] uppercase truncate">{rel.faction_id_a}</div>
                      <div className="text-slate-500 text-[10px] uppercase">vs</div>
                      <div className="text-slate-300 text-[10px] uppercase truncate">{rel.faction_id_b}</div>
                    </div>
                  ))}
                  {(!state.faction_relations || state.faction_relations.filter((r:any) => r.pact_type !== 'NONE').length === 0) && (
                    <div className="text-slate-500 text-sm">No formal treaties.</div>
                  )}
                </div>

                <h3 className="text-xs text-slate-500 border-b border-slate-800 pb-1 mb-2 uppercase mt-4">Cultural Myths</h3>
                <div className="space-y-2">
                  {state.cultural_myths?.map((myth: any) => (
                    <div key={myth.id} className="bg-pink-500/10 border border-pink-500/20 rounded p-2 text-xs">
                       <div className="flex justify-between mb-1">
                          <span className="font-bold text-pink-400 truncate">{myth.myth_type}</span>
                          <span className="text-slate-400">Sym: {Number(myth.symbolism_score).toFixed(0)}</span>
                       </div>
                       <div className="text-slate-300 font-serif italic mb-1">&quot;{myth.myth_name}&quot;</div>
                       <div className="text-slate-500 text-[9px] uppercase">By {myth.factions?.name}</div>
                    </div>
                  ))}
                  {(!state.cultural_myths || state.cultural_myths.length === 0) && (
                    <div className="text-slate-500 text-sm">No prevailing myths.</div>
                  )}
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column: Event Stream & Timeline */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Infrastructure Topology */}
          <section className="bg-[#121216] border border-slate-800 rounded-lg p-5 flex flex-col">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-4 uppercase">
              <Workflow className="w-4 h-4 text-orange-400" />
              Network Topology
            </h2>
            <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 pr-2">
              {state.infra_nodes?.map((node: any) => (
                <div key={node.id} className="text-xs bg-black/40 border border-slate-800 rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {node.node_type === 'POWER_PLANT' && <Zap className="w-3 h-3 text-yellow-400" />}
                      {node.node_type === 'WATER_FACILITY' && <Database className="w-3 h-3 text-cyan-400" />}
                      {node.node_type === 'LOGISTICS_HUB' && <Warehouse className="w-3 h-3 text-amber-500" />}
                      {node.node_type === 'HOSPITAL' && <Activity className="w-3 h-3 text-rose-400" />}
                      <span className="text-slate-200 font-bold">{node.name}</span>
                      {node.controlling_faction_id && (
                        <span className="px-1 py-0.5 rounded text-[9px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase">
                          Ctrl: {node.controlling_faction_id.substring(0,6)}
                        </span>
                      )}
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold 
                      ${node.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 
                        node.status === 'CRITICAL' ? 'bg-amber-500/10 text-amber-400 animate-pulse' : 
                        'bg-red-500/20 text-red-400'}`}>
                      {node.status}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Health</span>
                      <span className={node.health < 40 ? 'text-red-400' : 'text-emerald-400'}>{Number(node.health).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Efficiency</span>
                      <span className={node.operational_efficiency < 100 ? 'text-amber-400' : 'text-blue-400'}>{Number(node.operational_efficiency).toFixed(1)}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 mt-1 rounded overflow-hidden">
                      <div className={`h-full ${node.health < 10 ? 'bg-red-500' : node.health < 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.max(node.health, 5)}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
              {(!state.infra_nodes || state.infra_nodes.length === 0) && (
                <div className="text-slate-500 text-sm">No infrastructure nodes simulated.</div>
              )}
            </div>
          </section>

          <section className="bg-[#121216] border border-slate-800 rounded-lg p-5 flex-1 flex flex-col">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-4 uppercase">
              <Activity className="w-4 h-4 text-cyan-400" />
              Live Event Stream
            </h2>
            <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 space-y-3">
              {state.events.filter((e: any) => e.status !== 'ARCHIVED' && e.status !== 'PROCESSING').map((evt: any) => (
                <div key={evt.id} className="text-xs bg-black/40 border border-slate-800 rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-cyan-400 font-bold truncate max-w-[70%]">{evt.topic}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${evt.priority_class === 'CRITICAL_SYSTEM' || evt.priority_class === 'CRITICAL_SOCIAL' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                      {evt.status}
                    </span>
                  </div>
                  <pre className="text-slate-500 text-[10px] bg-[#0a0a0c] p-2 rounded overflow-x-auto">
                    {JSON.stringify(evt.payload, null, 2)}
                  </pre>
                </div>
              ))}
              {state.events.length === 0 && <div className="text-slate-500 text-sm">Event queue empty. Waiting for tick...</div>}
            </div>
          </section>

          <section className="bg-[#121216] border border-slate-800 rounded-lg p-5 flex-1 flex flex-col">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-4 uppercase">
              <Database className="w-4 h-4 text-slate-400" />
              Causality Log
            </h2>
            <div className="flex-1 overflow-y-auto max-h-[400px] pr-2">
              <div className="relative border-l border-slate-800 ml-3 space-y-4 pb-4">
                {state.history.map((hist: any, i: number) => (
                  <div key={hist.id} className="relative pl-6">
                    <div className="absolute w-2 h-2 bg-slate-700 rounded-full -left-[4.5px] top-1.5"></div>
                    <div className="text-xs">
                      <div className="text-slate-400 mb-1 flex justify-between">
                        <span>Tick {hist.tick_id}</span>
                        <span className="text-slate-600">{new Date(hist.created_at).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-slate-200 font-medium">{hist.topic}</div>
                      {(hist.topic.includes('POPULATION') || hist.topic.includes('POLITICS')) && (
                        <div className="text-rose-400/80 mt-1">{JSON.stringify(hist.payload)}</div>
                      )}
                    </div>
                  </div>
                ))}
                {state.history.length === 0 && <div className="text-slate-500 text-sm pl-6">No historical data recorded.</div>}
              </div>
            </div>
          </section>

          {/* Narrative & Perception Network */}
          <section className="bg-[#121216] border border-slate-800 rounded-lg p-5 flex-1 flex flex-col">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-4 uppercase">
              <Radio className="w-4 h-4 text-fuchsia-400" />
              Information Network
            </h2>
            <div className="flex-1 overflow-y-auto max-h-[300px] space-y-3 pr-2">
              <h3 className="text-xs text-slate-500 border-b border-slate-800 pb-1 mb-2">ACTIVE NARRATIVES</h3>
              {state.narratives?.filter((n:any) => n.is_active).map((narr: any) => (
                <div key={narr.id} className="text-xs bg-black/40 border border-slate-800 rounded p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-fuchsia-400 font-bold">{narr.topic}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold 
                      ${narr.narrative_type === 'RUMOR' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-400'}`}>
                      {narr.narrative_type}
                    </span>
                  </div>
                  <div className="space-y-1 mt-2">
                    <div className="flex justify-between text-slate-400">
                      <span>Penetration</span>
                      <span className={narr.penetration_pct > 20 ? 'text-red-400' : 'text-blue-400'}>{Number(narr.penetration_pct).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Severity / Spread V.</span>
                      <span className="text-slate-500">{Number(narr.severity).toFixed(0)} / {Number(narr.spread_velocity).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!state.narratives || state.narratives.filter((n:any) => n.is_active).length === 0) && (
                <div className="text-slate-500 text-sm">No prominent narratives tracked.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
