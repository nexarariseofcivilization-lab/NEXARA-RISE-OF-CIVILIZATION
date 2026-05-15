'use client';

import { useState, useEffect } from 'react';
import { getSimulationState } from '@/lib/actions';
import { CivilianAdapter } from '@/lib/adapters/CivilianAdapter';
import { PerceptionInterpreter } from '@/lib/engine/PerceptionInterpreter';
import { TruthLayer } from '@/lib/adapters/TruthLayer';
import { PersonalSimulationEngine } from '@/lib/agents/PersonalSimulationEngine';
import { Briefcase, Building2, Battery, AlertTriangle, Coffee, MapPin, Bus, Radio, Info, Lock, Wifi, WifiOff } from 'lucide-react';
import { useAppStore } from '@/lib/store';

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
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Good Morning, {player?.name.split(' ')[0]}
          </h1>
          <p className="text-slate-500 text-sm flex items-center gap-2">
            <MapPin className="w-3 h-3" /> {player?.jobTitle} at {player?.employer}
          </p>
        </div>
        <div className="flex flex-col items-end text-sm">
          <span className="text-slate-500 uppercase tracking-widest text-xs">Current Balance</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono">${player?.cash.toLocaleString()}</span>
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-4 uppercase tracking-widest">
              <Coffee className="w-4 h-4 text-amber-500" />
              Lived Reality
            </h2>
            <div className="space-y-3">
              {livedExperiences.length > 0 ? livedExperiences.map((exp: any) => (
                <div key={exp.id} className={`bg-black/30 p-3 rounded text-sm text-slate-300 transition-all ${
                  isApathetic ? 'blur-[1px] opacity-60 pointer-events-none border-l-2 border-zinc-700' : 
                  isPolarized ? 'border-l-[4px] border-y border-y-zinc-900 border-r border-r-zinc-900 bg-red-950/10 border-l-red-600' : 
                  'border-l-2 border-zinc-700'
                }`}>
                  {exp.text}
                </div>
              )) : (
                <div className="bg-black/30 p-3 rounded text-sm text-slate-500 italic">
                  Pagi yang biasa. Tidak ada hal istimewa terjadi kemarin.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Battery className={`w-4 h-4 ${player.stamina < 30 ? 'text-red-400' : 'text-emerald-400'}`} />
                <span className="text-xs text-slate-400 uppercase tracking-widest">Stamina</span>
              </div>
              <div className="text-xl font-bold text-white">{player.stamina}%</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className={`w-4 h-4 ${player.stress > 80 ? 'text-red-400' : 'text-amber-400'}`} />
                <span className="text-xs text-slate-400 uppercase tracking-widest">Stress</span>
              </div>
              <div className="text-xl font-bold text-white">{player.stress}%</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <Coffee className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-400 uppercase tracking-widest">Hunger</span>
              </div>
              <div className="text-xl font-bold text-white">{player.hunger}%</div>
            </div>
            
            {/* Cognitive Layer Metrics */}
            <div className={`border rounded-lg p-4 col-span-2 md:col-span-3 transition-colors ${isOverloaded ? 'bg-fuchsia-950/40 border-fuchsia-900/50' : 'bg-zinc-900 border-zinc-800'}`}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isOverloaded ? 'bg-fuchsia-500 animate-pulse' : 'bg-slate-500'}`} />
                  <span className="text-xs uppercase tracking-widest text-slate-400">Mental Bandwidth</span>
                </div>
                <span className="text-xs text-slate-500">Fatigue: {player.cognitiveLoad}% | Apathy: {player.apathy}%</span>
              </div>
              <div className="w-full bg-black/50 h-2 rounded overflow-hidden mt-3 max-w-xs">
                 <div className="bg-gradient-to-r from-slate-600 to-fuchsia-500 h-full" style={{ width: `${player.cognitiveLoad}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-4 uppercase tracking-widest">
              <Building2 className="w-4 h-4 text-blue-400" />
              Daily Routine & Actions
            </h2>
            <div className="flex flex-col gap-3">
              <button 
                className="w-full text-left bg-black/40 hover:bg-zinc-800 border border-zinc-800/50 p-4 rounded transition-colors flex justify-between items-center group"
                onClick={() => {
                  window.location.href = '/career';
                }}
              >
                <div>
                  <div className="font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">Go to Work ({player.employer})</div>
                  <div className="text-xs text-slate-500">Takes 8 hours. Restores cash, drains stamina. {isOverloaded && <span className="text-fuchsia-400 ml-1">Hard to focus.</span>}</div>
                </div>
                <div className="text-slate-600 group-hover:text-emerald-500">→</div>
              </button>
              <button 
                className={`w-full text-left bg-black/40 hover:bg-zinc-800 border border-zinc-800/50 p-4 rounded transition-colors flex justify-between items-center group ${isApathetic ? 'opacity-50' : ''}`}
                onClick={() => useAppStore.getState().queuePlayerAction('BUY_GROCERIES', { amount: 50 })}
              >
                <div>
                  <div className="font-semibold text-white mb-1 group-hover:text-amber-400 transition-colors">Buy Groceries</div>
                  <div className="text-xs text-slate-500">Current Local Price Level: {inflationLevel}. {isApathetic && <span className="text-slate-400 block mt-1">&quot;Why even bother, prices will just keep rising.&quot;</span>}</div>
                </div>
                <div className="text-slate-600 group-hover:text-amber-500">→</div>
              </button>
              <button 
                className="w-full text-left bg-black/40 hover:bg-zinc-800 border border-zinc-800/50 p-4 rounded transition-colors flex justify-between items-center group"
                onClick={() => useAppStore.getState().queuePlayerAction('REST_AT_HOME', { duration: 120 })}
              >
                <div>
                  <div className="font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">Rest at Home</div>
                  <div className="text-xs text-slate-500">Recovers stamina and reduces stress.</div>
                </div>
                <div className="text-slate-600 group-hover:text-blue-500">→</div>
              </button>
            </div>
          </div>
        </section>

        {/* Environmental Reality Envelope */}
        <section className="col-span-1 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-4 uppercase tracking-widest">
              <Radio className="w-4 h-4 text-fuchsia-400" />
              Street Buzz
            </h2>
            <div className="space-y-3">
              {rumors.length > 0 ? rumors.map((r: string, i: number) => (
                <div key={i} className="bg-black/30 p-2 rounded text-xs text-slate-400 italic border-l border-fuchsia-500/30">
                  &quot;{r}&quot;
                </div>
              )) : (
                <div className="bg-black/30 p-2 rounded text-xs text-slate-500">
                  Street chatter is unusually quiet today.
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
