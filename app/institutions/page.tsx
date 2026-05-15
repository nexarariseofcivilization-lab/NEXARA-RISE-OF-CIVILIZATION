'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Landmark, ShieldAlert, Zap, Activity } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function InstitutionsDashboard() {
  const supabase = getSupabase();
  const [institutions, setInstitutions] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('institutions').select('*, regions(name)');
      if (data) setInstitutions(data);
    }
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [supabase]);

  return (
    <>
      <div className="flex flex-col gap-6 p-6 font-mono text-sm max-w-7xl mx-auto h-full overflow-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6 shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
              <Landmark className="w-8 h-8 text-indigo-500" />
              Institutional Inertia Graph
            </h1>
            <p className="text-zinc-400">Semi-autonomous bureaucratic and military entities resisting reform.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono bg-zinc-950 text-indigo-500 border-indigo-900">INSTITUTIONAL LAYER: ACTIVE</Badge>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 flex-1 items-start">
          
          {institutions.length === 0 ? <div className="col-span-full text-zinc-500 p-4 border border-dashed border-zinc-800 rounded bg-zinc-900/20 text-center">INITIALIZING INSTITUTIONAL GRAPH</div> : null}
          
          {institutions.map(inst => (
            <Card key={inst.id} className={`bg-zinc-950/40 border-zinc-800/60 ${inst.corruption_index > 60 ? 'border-rose-900/50' : ''}`}>
              <CardHeader className="pb-4 border-b border-zinc-800/50 bg-zinc-900/20">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-indigo-400 flex items-center gap-2 text-base font-bold">
                      {inst.name}
                    </CardTitle>
                    <CardDescription className="text-zinc-500 mt-1 uppercase text-xs">{inst.institution_type} &bull; {inst.regions?.name}</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-zinc-950 text-zinc-400 border-zinc-800">
                    ALIGN: {inst.dominant_faction_id}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Structural Traits */}
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase mb-1 flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-indigo-500"/> Entrenchment</div>
                    <div className="text-lg font-bold text-zinc-200">{Number(inst.entrenchment_level).toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase mb-1 flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500"/> Inertia Mass</div>
                    <div className="text-lg font-bold text-zinc-200">{Number(inst.inertia_mass).toFixed(1)}</div>
                  </div>
                </div>

                <div className="bg-rose-950/10 border border-rose-900/30 p-3 rounded-md mt-4">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold mb-2 flex items-center gap-2">
                    <Activity className={`w-3 h-3 ${inst.corruption_index > 60 ? 'text-rose-500' : 'text-emerald-500'}`} />
                    Corruption / Decay Index
                  </div>
                  <div className={`font-bold ${inst.corruption_index > 60 ? 'text-rose-500' : 'text-emerald-400'}`}>
                      {Number(inst.corruption_index).toFixed(2)} %
                  </div>
                  {inst.corruption_index > 60 && (
                      <div className="text-[10px] text-rose-400/80 mt-1">WARNING: High systemic drift detected. Endemic graft actively bleeding regional treasury.</div>
                  )}
                  {inst.entrenchment_level > 60 && (
                      <div className="text-[10px] text-amber-400/80 mt-1">STRUCTURAL LOCK: Bureaucratic paralysis artificially inflated.</div>
                  )}
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
