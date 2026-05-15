'use client';

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EyeOff, BrainCircuit, History, AlertTriangle, ScrollText } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function TruthDashboard() {
  const supabase = getSupabase();
  const [epistemicState, setEpistemicState] = useState<any[]>([]);
  const [historicalEvents, setHistoricalEvents] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: eData } = await supabase.from('region_epistemic_state').select('*, regions(name)');
      if (eData) setEpistemicState(eData);

      const { data: hData } = await supabase.from('canonical_historical_events').select('*, regions(name)').order('created_at', { ascending: false }).limit(10);
      if (hData) setHistoricalEvents(hData);
    }
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [supabase]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 p-6 font-mono text-sm max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
              <EyeOff className="w-8 h-8 text-rose-500" />
              Epistemic Fragmentation & Historiography
            </h1>
            <p className="text-muted-foreground">Legitimacy of Truth: Monitoring the gap between objective reality and public perception.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono bg-background text-rose-500 border-rose-900">MEMORY_ENGINE: ONLINE</Badge>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-rose-500 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5" />
                Truth Divergence Index (TDI)
              </CardTitle>
              <CardDescription>Regional gaps between empirical system states and population perception.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {epistemicState.length === 0 ? <div className="text-muted-foreground p-4">Loading states...</div> : null}
              {epistemicState.map(state => (
                <div key={state.region_id} className="border border-border bg-secondary/10 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-4">
                    <div className="font-bold">{state.regions?.name || state.region_id.split('-')[0]}</div>
                    <Badge variant={state.truth_divergence_index > 50 ? "destructive" : state.truth_divergence_index > 20 ? "secondary" : "outline"}>
                      {state.dominant_narrative}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Truth Divergence (TDI)</span>
                        <span className="font-mono text-rose-400">{Number(state.truth_divergence_index).toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500" style={{ width: `${state.truth_divergence_index}%` }} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-2 border-t border-border/50 pt-2">
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase">Perceived Economy</div>
                        <div className="font-mono">{Number(state.perceived_economy).toFixed(1)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase">Perceived Stability</div>
                        <div className="font-mono">{Number(state.perceived_stability).toFixed(1)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-amber-500 flex items-center gap-2">
                <History className="w-5 h-5" />
                Civilization Memory & Myths
              </CardTitle>
              <CardDescription>Canonical historical events and their ongoing narrative decay.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {historicalEvents.length === 0 ? <div className="text-muted-foreground p-4">No historical memories indexed yet. Wait for epistemic or regime shocks.</div> : null}
               {historicalEvents.map(event => (
                 <div key={event.id} className="border-l-2 border-amber-500 pl-4 py-2 relative">
                   <div className="absolute w-2 h-2 bg-amber-500 rounded-full -left-[5px] top-4"></div>
                   <div className="flex items-center gap-2 mb-1">
                     <Badge variant="outline" className="text-[10px] bg-background text-amber-500 border-amber-900 bg-amber-500/10">TICK: {event.tick_id}</Badge>
                     <span className="text-xs text-muted-foreground">{event.event_classification}</span>
                   </div>
                   <div className="font-bold text-amber-100">{event.canonical_name}</div>
                   <div className="text-xs text-muted-foreground mt-1">Region: {event.regions?.name}</div>
                   
                   <div className="flex gap-4 mt-3 bg-black/40 p-2 rounded border border-border">
                     <div className="flex-1">
                       <div className="text-[10px] text-muted-foreground">Historical Weight</div>
                       <div className="font-mono text-xs">{Number(event.historical_weight).toFixed(1)}</div>
                     </div>
                     <div className="flex-1">
                       <div className="text-[10px] text-muted-foreground">Mythologization</div>
                       <div className="font-mono text-xs text-purple-400">{Number(event.mythologization_index).toFixed(1)}</div>
                     </div>
                   </div>
                 </div>
               ))}
               
               <div className="bg-amber-500/10 border border-amber-900/50 p-4 rounded-md mt-6">
                 <div className="flex gap-3">
                   <ScrollText className="w-5 h-5 text-amber-500 shrink-0" />
                   <div className="text-xs text-amber-200/70 leading-relaxed">
                     <strong className="text-amber-400 block mb-1">Historiographical Note:</strong>
                     As Historical Weight approaches 0, the event transitions from &quot;Lived Memory&quot; to &quot;Myth&quot;. Mythologized events have higher truth divergence but lower immediate unrest impact, entering the cultural baseline.
                   </div>
                 </div>
               </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </MainLayout>
  )
}
