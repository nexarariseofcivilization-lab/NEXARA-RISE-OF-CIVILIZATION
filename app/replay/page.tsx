'use client';

import { useState, useEffect } from 'react';
import { getReplayData } from '@/lib/actions';
import { Activity, Play, Pause, ChevronLeft, ChevronRight, FastForward, Rewind, AlertTriangle, Crosshair, Users, Globe } from 'lucide-react';
import Link from 'next/link';

export default function CausalityReplay() {
    const [regionId, setRegionId] = useState<string>('');
    const [startTick, setStartTick] = useState<number>(0);
    const [endTick, setEndTick] = useState<number>(100);
    const [data, setData] = useState<{snapshots: any[], events: any[]}>({ snapshots: [], events: [] });
    const [loading, setLoading] = useState(false);
    
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Derived causality array combining snapshots and events sequentially
    const [timeline, setTimeline] = useState<any[]>([]);

    useEffect(() => {
        // Just fetch regions from local if possible or let user type. 
        // For simplicity, we can fetch simulation state briefly to get a region.
        fetch('/api/cron/tick', {method: 'GET'}) // Just to wake up / checking
          .catch(e => console.log(e));
          
        fetchState();
    }, []);

    const fetchState = async () => {
        const res = await fetch('/api/cron/tick', { method: 'POST' }); // tick to ensure state
        // fetch regions from a simpler custom endpoint if needed, but lets just load the global state
        const stateRes = await fetch('/api/state?demo=true', { method: 'POST' }).catch(() => null); // not real route, let's just make region input manual for now or load first from basic query
    };

    const handleLoadData = async () => {
        setLoading(true);
        try {
            // we really need a region id. Let's assume the user knows it, or we fetch it.
            if (!regionId) {
                // Fetch first region
                const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + '/api/cron/tick'); // hack? no.
            }
            
            const r = await getReplayData(regionId, startTick, endTick);
            setData(r);
            
            // Combine and sort by tick_id
            const combined = [
                ...r.snapshots.map((s: any) => ({ type: 'SNAPSHOT', tick: s.tick_id, data: s })),
                ...r.events.map((e: any) => ({ type: 'EVENT', tick: e.tick_id, data: e }))
            ].sort((a, b) => a.tick - b.tick);
            
            setTimeline(combined);
            setCurrentStep(0);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };
    
    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentStep(curr => {
                    if (curr >= timeline.length - 1) {
                        setIsPlaying(false);
                        return curr;
                    }
                    return curr + 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, timeline.length]);

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 font-mono p-4 sm:p-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-slate-800 gap-4">
                <div>
                   <Link href="/" className="text-xs text-blue-500 hover:underline mb-2 inline-block">← Back to Command Center</Link>
                   <h1 className="text-2xl font-bold tracking-tighter text-white flex items-center gap-3">
                     <FastForward className="text-purple-500" />
                     CAUSALITY REPLAY ENGINE
                   </h1>
                   <p className="text-slate-500 text-sm mt-1">RECONSTRUCT SYSTEMIC CONTAGION EX-POST-FACTO</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="bg-[#121216] border border-slate-800 rounded-lg p-5 lg:col-span-1">
                    <h2 className="text-sm font-semibold text-slate-100 mb-4 uppercase">Query Parameters</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">REGION UUID</label>
                            <input 
                                type="text" 
                                value={regionId} 
                                onChange={e => setRegionId(e.target.value)} 
                                className="w-full bg-black border border-slate-800 rounded px-3 py-2 text-sm text-white"
                                placeholder="e.g. 1234-..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">START TICK</label>
                                <input 
                                    type="number" 
                                    value={startTick} 
                                    onChange={e => setStartTick(parseInt(e.target.value))} 
                                    className="w-full bg-black border border-slate-800 rounded px-3 py-2 text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">END TICK</label>
                                <input 
                                    type="number" 
                                    value={endTick} 
                                    onChange={e => setEndTick(parseInt(e.target.value))} 
                                    className="w-full bg-black border border-slate-800 rounded px-3 py-2 text-sm text-white"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={handleLoadData}
                            disabled={loading || !regionId}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded py-2 text-sm disabled:opacity-50"
                        >
                            {loading ? 'EXTRACTING...' : 'EXTRACT CAUSALITY TIMELINE'}
                        </button>
                    </div>
                </div>

                <div className="bg-[#121216] border border-slate-800 rounded-lg p-5 lg:col-span-3 flex flex-col">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
                        <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 uppercase">
                            <Activity className="w-4 h-4 text-purple-400" />
                            Simulation Reality Playback
                        </h2>
                        
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentStep(0)} className="p-2 hover:bg-slate-800 rounded text-slate-400"><Rewind className="w-4 h-4" /></button>
                            <button onClick={() => setCurrentStep(c => Math.max(0, c-1))} className="p-2 hover:bg-slate-800 rounded text-slate-400"><ChevronLeft className="w-4 h-4" /></button>
                            <button onClick={() => setIsPlaying(!isPlaying)} className={`p-2 rounded ${isPlaying ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </button>
                            <button onClick={() => setCurrentStep(c => Math.min(timeline.length-1, c+1))} className="p-2 hover:bg-slate-800 rounded text-slate-400"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="flex-1 min-h-[500px]">
                        {timeline.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                                {/* Current State View */}
                                <div className="border border-slate-800 rounded bg-black/50 p-4">
                                    <h3 className="text-xs text-slate-500 mb-3 border-b border-slate-800 pb-2">ACTIVE SNAPSHOT (TICK {timeline[currentStep]?.tick})</h3>
                                    {timeline.slice(0, currentStep + 1).reverse().find(t => t.type === 'SNAPSHOT') ? (
                                        <div className="space-y-4">
                                            {(() => {
                                                const snap = timeline.slice(0, currentStep + 1).reverse().find(t => t.type === 'SNAPSHOT')?.data.state_data;
                                                if(!snap) return null;
                                                return (
                                                    <>
                                                      <div className="grid grid-cols-2 gap-4">
                                                          <div className="bg-[#121216] p-3 rounded border border-slate-800 text-xs">
                                                              <div className="text-slate-500">Unrest Pressure</div>
                                                              <div className="text-xl text-rose-400 font-bold">{Number(snap.demography?.unrest_pressure || 0).toFixed(1)}%</div>
                                                          </div>
                                                          <div className="bg-[#121216] p-3 rounded border border-slate-800 text-xs">
                                                              <div className="text-slate-500">Infra Health</div>
                                                              <div className="text-xl text-emerald-400 font-bold">{Number(snap.region?.infrastructure_health || 0).toFixed(1)}%</div>
                                                          </div>
                                                          <div className="col-span-2 bg-[#121216] p-3 rounded border border-slate-800 text-xs text-slate-400 max-h-[300px] overflow-auto">
                                                              <pre>{JSON.stringify(snap, null, 2)}</pre>
                                                          </div>
                                                      </div>
                                                    </>
                                                )
                                            })()}
                                        </div>
                                    ) : (
                                        <div className="text-slate-500 text-xs">No snapshot available at this tick yet.</div>
                                    )}
                                </div>

                                {/* Event Sequence View */}
                                <div className="border border-slate-800 rounded bg-black/50 p-4 overflow-y-auto">
                                    <h3 className="text-xs text-slate-500 mb-3 border-b border-slate-800 pb-2">CAUSALITY CHAIN</h3>
                                    <div className="space-y-3">
                                        {timeline.slice(0, currentStep + 1).filter(t => t.type === 'EVENT').map((evt, i) => (
                                            <div key={i} className={`p-3 rounded border ${evt.data.priority_class === 'CRITICAL_SYSTEM' ? 'border-red-500/50 bg-red-500/10' : 'border-slate-800 bg-[#121216]'}`}>
                                                <div className="flex justify-between items-start text-xs mb-2">
                                                    <span className="text-blue-400 font-bold">{evt.data.topic}</span>
                                                    <span className="text-slate-500">Tick {evt.tick}</span>
                                                </div>
                                                <div className="text-slate-300 text-[10px] break-words">
                                                    {JSON.stringify(evt.data.payload)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                                Enter Query Parameters to extract Historical Causality
                            </div>
                        )}
                    </div>
                    
                    {timeline.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-800">
                            <input 
                                type="range" 
                                min="0" 
                                max={timeline.length - 1} 
                                value={currentStep} 
                                onChange={e => setCurrentStep(parseInt(e.target.value))}
                                className="w-full accent-purple-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-2">
                                <span>Tick {timeline[0]?.tick}</span>
                                <span>Tick {timeline[timeline.length-1]?.tick}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
