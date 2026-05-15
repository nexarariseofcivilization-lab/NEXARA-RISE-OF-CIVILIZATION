'use client';

import { useState, useEffect } from 'react';
import { getSimulationState } from '@/lib/actions';
import { CivilianAdapter } from '@/lib/adapters/CivilianAdapter';
import { PerceptionInterpreter } from '@/lib/engine/PerceptionInterpreter';
import { TruthLayer } from '@/lib/adapters/TruthLayer';
import { PersonalSimulationEngine } from '@/lib/agents/PersonalSimulationEngine';
import { Briefcase, Building2, Battery, AlertTriangle, Coffee, MapPin, Bus, Radio, Info, Lock, Wifi, WifiOff, Terminal } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function CivilianDashboard({ truthLayer }: { truthLayer: TruthLayer }) {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const player = useAppStore(s => s.player);
  const globalTime = useAppStore(s => s.globalTime);
  const addLog = useAppStore(s => s.addLog);

  const fetchState = async () => {
    const data = await getSimulationState();
    setState(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchState();
    // For Civilian, checking macro reality every 10s is enough
    const interval = setInterval(fetchState, 10000);
    return () => clearInterval(interval);
  }, []);

  // Sync PersonalSimulationEngine execution with the FAST Local Engine Tick (from SimulationEngine.tsx)
  useEffect(() => {
    if (!state) return;
    
    // Evaluate Reality
    const perception = CivilianAdapter.transform(state);
    const interpretation = PerceptionInterpreter.interpret(perception);
    
    // Evaluate Local Work Actions (e.g., player clicks)
    const currentPlayer = useAppStore.getState().player;
    const activeActions = { isWorking: currentPlayer.isWorking }; 

    // Compute Deltas
    const ecosystemDeltas = PersonalSimulationEngine.processAgentTick(
       currentPlayer, 
       interpretation, 
       activeActions
    );
    
    // Apply Deltas to Local Truth
    useAppStore.getState().setPlayerState(ecosystemDeltas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalTime]); // triggers whenever tickGlobalTime() advances local clock every 5s

  if (loading || !state) return (
    <div className="min-h-screen bg-black text-slate-500 font-sans flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-t-2 border-emerald-500 animate-spin" />
        <p className="text-xs uppercase tracking-widest">Waking up...</p>
      </div>
    </div>
  );

  // Apply Semantic Interpretation Layer
  const perception = CivilianAdapter.transform(state);
  const interpretation = PerceptionInterpreter.interpret(perception);

  // Phase 47: Cognitive Deformation Effect
  const isOverloaded = player.cognitiveLoad > 80;
  const isApathetic = player.apathy > 60;
  
  // Phase 49: Polarization effect
  const isPolarized = perception.polarization_index > 0.6 && player.stress > 50;

  // Render templates based on interpreted numeric state (UI logic)
  const livedExperiences = [];
  if (interpretation.isCrisisMode) livedExperiences.push({ id: 1, text: "The tension in the air is palpable. Everyone is rushing." });
  else if (interpretation.isHighFriction) livedExperiences.push({ id: 2, text: "Just commuting took hours today. The system feels sluggish." });
  else if (interpretation.costOfLivingStress > 0.6) livedExperiences.push({ id: 3, text: "Prices are creeping up. Basic groceries are becoming a luxury." });
  else livedExperiences.push({ id: 4, text: "A routine day. The city machinery grinds on quietly." });

  if (interpretation.isSociallyIsolated) livedExperiences.push({ id: 5, text: "People avoid eye contact out here. The social fabric is fraying." });

  const inflationLevel = perception.inflation_pressure > 0.7 ? "CRITICAL" : perception.inflation_pressure > 0.4 ? "ELEVATED" : "STABLE";

  const rumors = [];
  if (perception.social_unrest > 0.6) rumors.push("They're organizing again in the industrial sectors.");
  if (perception.power_stability < 0.5) rumors.push("Rolling blackouts expected tonight. Grab some batteries.");
  if (perception.logistics_friction > 0.5) rumors.push("The major supply depots are empty. Nothing is arriving.");

  return (
    <div className={`min-h-screen bg-[#0a0a0c] text-slate-300 font-sans p-4 sm:p-8 ${isApathetic ? 'grayscale-[0.5] contrast-75' : ''}`}>
      {/* Civilian Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 pb-6 border-b border-zinc-800/80 gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-mono font-bold tracking-widest text-zinc-200 mb-2 uppercase flex items-center">
            <span className="text-emerald-500 mr-3">CYCLE {globalTime ? new Date(globalTime).toISOString().split('T')[0] : '...'}</span> 
            — OPERATOR: {player?.name.split(' ')[0]} AUTHENTICATED
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-500">
            <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-emerald-400">CIVIC TIER: 1</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {player?.jobTitle} @ {player?.employer}</span>
            <span className="flex items-center gap-1.5 ml-2 text-zinc-400"><Info className="w-3 h-3" /> CIVILIZATION STATUS: NOMINAL</span>
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end p-3 bg-zinc-900/40 border border-zinc-800/80 rounded w-full md:w-auto">
          <span className="text-zinc-600 uppercase tracking-widest text-[10px] font-bold mb-1">Purchasing Power</span>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-zinc-200 font-mono">${Math.floor(player?.cash || 0).toLocaleString()}</span>
            <span className={cn("text-[10px] mb-1 font-mono", perception.inflation_pressure > 0.5 ? "text-red-400" : "text-emerald-400")}>
              {perception.inflation_pressure > 0.5 ? '▼ VALUE DEGRADING' : '▲ STABLE'}
            </span>
          </div>
        </div>
      </header>

      {/* Constraints EADL Layer - Smartphone Access */}
      <div className="mb-8 border border-zinc-800 bg-zinc-900/50 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-black/60 rounded-full border border-zinc-800">
             <Battery className={`w-3.5 h-3.5 ${player.deviceAccess?.battery < 20 ? 'text-red-500' : 'text-emerald-500'}`} />
             <span className="text-xs font-mono text-slate-300">{player.deviceAccess?.battery || 0}%</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-black/60 rounded-full border border-zinc-800">
             {player.deviceAccess?.hasInternet ? (
               <Wifi className={`w-3.5 h-3.5 text-emerald-500`} />
             ) : (
               <WifiOff className={`w-3.5 h-3.5 text-red-500`} />
             )}
             <span className="text-xs font-mono text-slate-300">
               {player.deviceAccess?.hasInternet ? `${player.deviceAccess?.signalStrength || 0}% Signal` : 'OFFLINE'}
             </span>
          </div>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-slate-500">
           Digital Access Subsystem
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Personal State */}
        <section className="col-span-1 lg:col-span-2 space-y-6">
          {/* Experiential Life Stream */}
          <div className="relative border border-zinc-800 bg-zinc-950/80 rounded shadow-xl overflow-hidden min-h-[120px] flex items-center p-6 group">
            <div className={cn("absolute inset-0 opacity-20 pointer-events-none transition-all duration-1000",
                interpretation.isCrisisMode ? "bg-gradient-to-r from-red-900 via-red-950 to-black animate-pulse" :
                isApathetic ? "bg-gradient-to-r from-zinc-900 via-zinc-950 to-black grayscale" :
                "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"
            )}></div>
            <div className="relative z-10 w-full space-y-4">
              <h2 className="text-[10px] font-bold text-zinc-500 flex items-center gap-2 tracking-[0.2em] uppercase">
                <Coffee className="w-3.5 h-3.5 text-zinc-400" />
                Lived Reality Feed
              </h2>
              <div className="space-y-3 font-serif">
                {livedExperiences.length > 0 ? livedExperiences.map((exp: any) => (
                  <div key={exp.id} className={cn("text-sm transition-all text-zinc-300 border-l border-zinc-700/50 pl-4 py-1",
                    isApathetic ? "opacity-50 blur-[0.5px]" : 
                    isPolarized ? "text-red-300 border-red-900/50" : 
                    ""
                  )}>
                    &quot;{exp.text}&quot;
                  </div>
                )) : (
                  <div className="text-sm text-zinc-600 italic border-l border-zinc-800 pl-4 py-1">
                    &quot;A routine day. The city machinery grinds on quietly.&quot;
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-950 border border-zinc-800/80 rounded p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10"><Battery className="w-16 h-16" /></div>
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-3">Operator Stamina</div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-mono font-bold text-zinc-200">{Math.floor(player.stamina)}%</span>
                <span className={cn("text-[9px] mb-1 font-mono font-bold px-1.5 py-0.5 rounded", player.stamina < 30 ? "bg-red-950/50 text-red-400 border border-red-900/50" : "bg-emerald-950/50 text-emerald-400 border border-emerald-900/50")}>
                  {player.stamina < 30 ? 'CRITICAL' : 'NOMINAL'}
                </span>
              </div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800/80 rounded p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10"><AlertTriangle className="w-16 h-16" /></div>
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-3">Stress Level</div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-mono font-bold text-zinc-200">{player.stress.toFixed(1)}%</span>
                <span className={cn("text-[9px] mb-1 font-mono font-bold px-1.5 py-0.5 rounded", player.stress > 80 ? "bg-red-950/50 text-red-400 border border-red-900/50" : player.stress > 50 ? "bg-amber-950/50 text-amber-400 border border-amber-900/50" : "bg-emerald-950/50 text-emerald-400 border border-emerald-900/50")}>
                  {player.stress > 80 ? 'CRITICAL' : player.stress > 50 ? 'ELEVATED' : 'NOMINAL'}
                </span>
              </div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800/80 rounded p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10"><Coffee className="w-16 h-16" /></div>
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-3">Hunger Index</div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-mono font-bold text-zinc-200">{Math.floor(player.hunger)}%</span>
                <span className={cn("text-[9px] mb-1 font-mono font-bold px-1.5 py-0.5 rounded bg-blue-950/50 text-blue-400 border border-blue-900/50")}>
                  TRACKING
                </span>
              </div>
            </div>
            
            <div className={cn("border rounded p-4 relative overflow-hidden transition-colors", isOverloaded ? 'bg-fuchsia-950/20 border-fuchsia-900/50' : 'bg-zinc-950 border-zinc-800/80')}>
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-2 flex items-center justify-between">
                <span>Cognitive Load</span>
                <div className={`w-1.5 h-1.5 rounded-full ${isOverloaded ? 'bg-fuchsia-500 animate-pulse' : 'bg-zinc-600'}`} />
              </div>
              <div className="mt-1 space-y-1.5 font-mono text-[10px]">
                 <div className="flex justify-between items-center text-zinc-400">
                    <span>Fatigue:</span>
                    <span className={isOverloaded ? 'text-fuchsia-400 font-bold' : ''}>{player.cognitiveLoad.toFixed(1)}%</span>
                 </div>
                 <div className="flex justify-between items-center text-zinc-400">
                    <span>Apathy:</span>
                    <span className={isApathetic ? 'text-red-400 font-bold' : ''}>{player.apathy.toFixed(1)}%</span>
                 </div>
                 <div className="flex justify-between items-center text-zinc-400">
                    <span>Polarization:</span>
                    <span className={isPolarized ? 'text-amber-400 font-bold' : ''}>{Math.floor(perception.polarization_index * 100)}%</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800/80 rounded p-6">
            <h2 className="text-[10px] font-bold text-zinc-500 flex items-center gap-2 mb-6 tracking-[0.2em] uppercase">
              <Terminal className="w-3.5 h-3.5" />
              Action Execution Environment
            </h2>
            <div className="flex flex-col gap-3 font-mono">
              <button 
                className="w-full text-left bg-zinc-900/30 hover:bg-zinc-900 border border-zinc-800/80 p-4 rounded transition-colors flex flex-col md:flex-row justify-between items-start md:items-center group"
                onClick={() => { window.location.href = '/career'; }}
              >
                <div className="mb-2 md:mb-0">
                  <div className="text-sm font-bold text-zinc-300 mb-1 group-hover:text-emerald-400 transition-colors uppercase flex items-center">
                    <span className="text-emerald-500/50 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span>
                    Commit_Work ({player.employer})
                  </div>
                  <div className="text-[10px] text-zinc-500 tracking-wider">EXECUTION TIME: 8 HOURS {isOverloaded && <span className="text-fuchsia-400 ml-1"> [WARN: FOCUS DEGRADED]</span>}</div>
                </div>
                <div className="flex gap-4 text-[9px] text-zinc-500 uppercase tracking-widest text-right">
                    <div className="flex flex-col"><span>Proj. Income</span> <span className="text-emerald-400 group-hover:text-emerald-300">+$120</span></div>
                    <div className="flex flex-col"><span>Stamina Cost</span> <span className="text-red-400 group-hover:text-red-300">-35%</span></div>
                    <div className="flex flex-col"><span>Stress Delta</span> <span className="text-amber-400 group-hover:text-amber-300">+8%</span></div>
                </div>
              </button>
              <button 
                className={cn("w-full text-left bg-zinc-900/30 hover:bg-zinc-900 border border-zinc-800/80 p-4 rounded transition-colors flex flex-col md:flex-row justify-between items-start md:items-center group", isApathetic ? 'opacity-50 grayscale' : '')}
                onClick={() => useAppStore.getState().queuePlayerAction('BUY_GROCERIES', { amount: 50 })}
              >
                <div className="mb-2 md:mb-0">
                  <div className="text-sm font-bold text-zinc-300 mb-1 group-hover:text-amber-400 transition-colors uppercase flex items-center">
                    <span className="text-amber-500/50 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span>
                    Execute_Purchase (Groceries)
                  </div>
                  <div className="text-[10px] text-zinc-500 tracking-wider">LOCAL PRICE LEVEL: {inflationLevel}. {isApathetic && <span className="text-zinc-600 block mt-1">WARN: APATHY. AVOIDING DISCRETIONARY SPEND.</span>}</div>
                </div>
                <div className="flex gap-4 text-[9px] text-zinc-500 uppercase tracking-widest text-right">
                    <div className="flex flex-col"><span>Cost Estim.</span> <span className="text-red-400 group-hover:text-red-300">-$50.00</span></div>
                    <div className="flex flex-col"><span>Hunger Delta</span> <span className="text-blue-400 group-hover:text-blue-300">-70%</span></div>
                </div>
              </button>
              <button 
                className="w-full text-left bg-zinc-900/30 hover:bg-zinc-900 border border-zinc-800/80 p-4 rounded transition-colors flex flex-col md:flex-row justify-between items-start md:items-center group"
                onClick={() => useAppStore.getState().queuePlayerAction('REST_AT_HOME', { duration: 120 })}
              >
                <div className="mb-2 md:mb-0">
                  <div className="text-sm font-bold text-zinc-300 mb-1 group-hover:text-blue-400 transition-colors uppercase flex items-center">
                    <span className="text-blue-500/50 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span>
                    Initiate_Rest_Sequence
                  </div>
                  <div className="text-[10px] text-zinc-500 tracking-wider">EXECUTION TIME: 2 HOURS</div>
                </div>
                <div className="flex gap-4 text-[9px] text-zinc-500 uppercase tracking-widest text-right">
                    <div className="flex flex-col"><span>Stamina Gain</span> <span className="text-emerald-400 group-hover:text-emerald-300">+25%</span></div>
                    <div className="flex flex-col"><span>Stress Delta</span> <span className="text-emerald-400 group-hover:text-emerald-300">-15%</span></div>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Environmental Reality Envelope */}
        <section className="col-span-1 space-y-6">
          <div className="bg-zinc-950 border border-zinc-800/80 rounded p-6">
            <h2 className="text-[10px] font-bold text-zinc-500 flex items-center gap-2 mb-4 tracking-[0.2em] uppercase">
              <Radio className="w-3.5 h-3.5 text-zinc-400" />
              Live Street Chatter
            </h2>
            <div className="space-y-3 font-mono text-[10px]">
              {rumors.length > 0 ? rumors.map((r: string, i: number) => (
                <div key={i} className="flex gap-3 items-start border-b border-zinc-900 pb-2">
                  <span className="text-zinc-600 mt-0.5">[{new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}]</span>
                  <div className="text-zinc-400">&gt; {r}</div>
                </div>
              )) : (
                <div className="flex gap-3 items-start">
                  <span className="text-zinc-600">[{new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}]</span>
                  <div className="text-zinc-600">No significant local chatter detected.</div>
                </div>
              )}
            </div>
          </div>

          {truthLayer > TruthLayer.WORKER ? (
             <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-4">
               <div className="flex items-start gap-2 text-xs text-blue-400">
                 <Info className="w-4 h-4 shrink-0" />
                 <p>Your clearance allows you to perceive macro-economic shifts. Market warnings active.</p>
               </div>
             </div>
          ) : (
             <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-lg p-4 relative overflow-hidden group">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-4">
                  <Lock className="w-5 h-5 text-slate-600 mb-2" />
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Encrypted Terminal</p>
                  <p className="text-[9px] text-slate-600 mt-1">Data access restricted. Upgrade civic tier.</p>
               </div>
               <div className="opacity-20 blur-[2px] pointer-events-none">
                 <h3 className="text-xs font-bold text-slate-400 mb-2">Macro-Economic Indicators</h3>
                 <div className="space-y-2">
                    <div className="h-2 w-full bg-slate-800 rounded"></div>
                    <div className="h-2 w-3/4 bg-slate-800 rounded"></div>
                 </div>
               </div>
             </div>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-4 uppercase tracking-widest">
              <AlertTriangle className="w-4 h-4 text-emerald-400" />
              Offline Directives 
            </h2>
            <p className="text-xs text-slate-500 mb-4 block">
              Set your AI Proxy behavior for when you are offline. The civilization continues without you.
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-black/40 border border-zinc-800 rounded cursor-pointer hover:bg-zinc-800 transition-colors">
                <input 
                  type="radio" 
                  name="proxy_directive" 
                  className="text-emerald-500 bg-black border-zinc-700" 
                  checked={player.offlineDirectives?.mode === 'SURVIVAL'}
                  onChange={() => useAppStore.getState().setPlayerState({ offlineDirectives: { mode: 'SURVIVAL', lastUpdated: new Date() } })}
                />
                <div>
                  <div className="text-sm text-slate-200">Survival Baseline</div>
                  <div className="text-xs text-slate-500">Go to work, buy food, pay rent. No risks.</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-black/40 border border-zinc-800 rounded cursor-pointer hover:bg-zinc-800 transition-colors">
                <input 
                  type="radio" 
                  name="proxy_directive" 
                  className="text-emerald-500 bg-black border-zinc-700" 
                  checked={player.offlineDirectives?.mode === 'CAREER'}
                  onChange={() => useAppStore.getState().setPlayerState({ offlineDirectives: { mode: 'CAREER', lastUpdated: new Date() } })}
                />
                <div>
                  <div className="text-sm text-slate-200">Career Focus</div>
                  <div className="text-xs text-slate-500">Overtime work. Higher stress & burnout risk.</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-black/40 border border-zinc-800 rounded cursor-pointer hover:bg-zinc-800 transition-colors">
                <input 
                  type="radio" 
                  name="proxy_directive" 
                  className="text-emerald-500 bg-black border-zinc-700" 
                  checked={player.offlineDirectives?.mode === 'ACTIVIST'}
                  onChange={() => useAppStore.getState().setPlayerState({ offlineDirectives: { mode: 'ACTIVIST', lastUpdated: new Date() } })}
                />
                <div>
                  <div className="text-sm text-slate-200">Activist Participation</div>
                  <div className="text-xs text-slate-500">Join protests if local unrest is high. Risk of arrest.</div>
                </div>
              </label>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
