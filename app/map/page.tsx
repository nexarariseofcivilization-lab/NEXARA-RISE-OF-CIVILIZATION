'use client';

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map as MapIcon, Route, Compass, Mountain, ThermometerSun, AlertOctagon, Send, Sword } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function WorldMapDashboard() {
  const supabase = getSupabase();
  const [spatialNodes, setSpatialNodes] = useState<any[]>([]);
  const [transitQueue, setTransitQueue] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      // Load Spatial Attributes
      const { data: sData } = await supabase.from('region_spatial_attributes').select('*, regions(name)');
      if (sData) setSpatialNodes(sData);

      // Load active cross queue
      const { data: tData } = await supabase.from('cross_shard_transit_queue').select('*, source:regions!source_region_id(name), target:regions!target_region_id(name)').eq('status', 'IN_TRANSIT').order('arrival_tick_id', { ascending: true }).limit(50);
      if (tData) setTransitQueue(tData);

      // Load active conflicts
      const { data: cData } = await supabase.from('systemic_conflicts').select('*, source:regions!source_region_id(name), target:regions!target_region_id(name), source_faction_id').eq('status', 'ACTIVE').order('started_at_tick', { ascending: false }).limit(20);
      if (cData) setConflicts(cData);
    }
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [supabase]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 p-6 font-mono text-sm max-w-7xl mx-auto h-full overflow-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6 shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
              <MapIcon className="w-8 h-8 text-emerald-500" />
              Spatial Topology & Logistics
            </h1>
            <p className="text-zinc-400">Geographic fragmentation, terrain friction, and federated cross-shard transit queues.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono bg-zinc-950 text-emerald-500 border-emerald-900">FEDERATION BUS: ONLINE</Badge>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 flex-1">
          
          <Card className="bg-zinc-950/40 border-zinc-800/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-emerald-500 flex items-center gap-2">
                <Compass className="w-5 h-5" />
                Regional Spatial Nodes
              </CardTitle>
              <CardDescription className="text-zinc-400">Anchored coordinates and geophysical friction constraints.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {spatialNodes.length === 0 ? <div className="text-zinc-500 p-4">Loading topology...</div> : null}
              {spatialNodes.map(node => (
                <div key={node.region_id} className="border border-zinc-800 bg-zinc-900/40 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-bold flex items-center gap-2">
                      <span className="text-emerald-400">{node.regions?.name || node.region_id.split('-')[0]}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-zinc-950 text-zinc-300 border-zinc-700">
                      {node.climate_zone}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="bg-black/40 p-2 rounded flex items-center gap-3 border border-zinc-800/50">
                      <Mountain className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-zinc-500">Terrain Roughness</div>
                        <div className="font-mono text-zinc-200">{Number(node.terrain_roughness).toFixed(2)}x</div>
                      </div>
                    </div>
                    <div className="bg-black/40 p-2 rounded flex items-center gap-3 border border-zinc-800/50">
                      <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0" />
                      <div>
                        <div className="text-[10px] text-zinc-500">Strategic Value</div>
                        <div className="font-mono text-zinc-200">{Number(node.strategic_value).toFixed(1)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-zinc-950/40 border-zinc-800/60 flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="text-cyan-500 flex items-center gap-2">
                <Route className="w-5 h-5" />
                Inter-Shard Activity Vectors
              </CardTitle>
              <CardDescription className="text-zinc-400">Asynchronous transit queues and structural conflict projections.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 overflow-y-auto">
             <Tabs defaultValue="transit" className="w-full">
               <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-zinc-800">
                 <TabsTrigger value="transit" className="data-[state=active]:bg-cyan-950 data-[state=active]:text-cyan-400">Transit Logs</TabsTrigger>
                 <TabsTrigger value="warfare" className="data-[state=active]:bg-rose-950 data-[state=active]:text-rose-400">Systemic Conflicts</TabsTrigger>
               </TabsList>
               
               <TabsContent value="transit" className="space-y-4 pt-4">
                 {transitQueue.length === 0 ? <div className="text-zinc-500 p-4 border border-dashed border-zinc-800 rounded bg-zinc-900/20 text-center">No active transit payloads in flight.</div> : null}
                 {transitQueue.map(t => (
                   <div key={t.id} className="border-l-2 border-cyan-500 pl-4 py-2 relative bg-zinc-900/40 rounded-r-md border border-y-zinc-800/50 border-r-zinc-800/50">
                     <div className="absolute w-2 h-2 bg-cyan-500 rounded-full -left-[5px] top-4"></div>
                     
                     <div className="flex justify-between items-start mb-2">
                       <Badge variant="outline" className="text-[10px] bg-cyan-950/30 text-cyan-500 border-cyan-900/50">
                         {t.transit_type}
                       </Badge>
                       <div className="text-xs font-mono text-zinc-500">
                         ARRIVES @ TICK {t.arrival_tick_id}
                       </div>
                     </div>
                     
                     <div className="flex items-center gap-3 mt-2 text-sm">
                       <span className="font-bold text-zinc-300 truncate w-1/3">{t.source?.name || 'LOCAL'}</span>
                       <Send className="w-3 h-3 text-cyan-500/50 shrink-0" />
                       <span className="font-bold text-zinc-300 truncate w-1/3 text-right">{t.target?.name || 'UNKNOWN'}</span>
                     </div>

                     <pre className="mt-3 bg-black p-2 rounded text-[10px] text-cyan-300/70 font-mono overflow-hidden border border-zinc-800/50">
                       {JSON.stringify(t.payload)}
                     </pre>
                   </div>
                 ))}
                 
                 <div className="bg-cyan-950/20 border border-cyan-900/30 p-4 rounded-md mt-6">
                   <div className="flex gap-3">
                     <AlertOctagon className="w-5 h-5 text-cyan-500 shrink-0" />
                     <div className="text-xs text-cyan-200/70 leading-relaxed">
                       <strong className="text-cyan-400 block mb-1">Federated Runtime Doctrine:</strong>
                       To prevent queue-poisoning and tight coupling between execution shards, direct regional state mutation is forbidden across borders. All interplay travels through the asynchronous transit bus and is bounded by topological travel times.
                     </div>
                   </div>
                 </div>
               </TabsContent>

               <TabsContent value="warfare" className="space-y-4 pt-4">
                 {conflicts.length === 0 ? <div className="text-zinc-500 p-4 border border-dashed border-zinc-800 rounded bg-zinc-900/20 text-center">No systemic conflicts detected in the runtime.</div> : null}
                 {conflicts.map(c => (
                   <div key={c.id} className="border-l-2 border-rose-500 pl-4 py-2 relative bg-zinc-900/40 rounded-r-md border border-y-zinc-800/50 border-r-zinc-800/50">
                     <div className="flex justify-between items-start mb-2">
                       <div className="flex flex-col gap-1">
                         <Badge variant="outline" className="text-[10px] bg-rose-950/30 text-rose-500 border-rose-900/50 w-fit">
                           {c.conflict_doctrine} / {c.escalation_level}
                         </Badge>
                         <div className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Initiator: {c.source_faction_id}</div>
                       </div>
                       <div className="text-xs font-mono text-zinc-500 flex items-center gap-1">
                         <Sword className="w-3 h-3 text-rose-500/70" /> INT {Number(c.intensity).toFixed(1)}
                       </div>
                     </div>
                     
                     <div className="flex items-center gap-3 mt-2 text-sm bg-black/50 p-2 rounded border border-zinc-800/80">
                       <span className="font-bold text-zinc-300 truncate w-1/3">{c.source?.name || 'LOCAL'}</span>
                       <div className="flex-1 flex justify-center">
                          <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0" />
                       </div>
                       <span className="font-bold text-zinc-300 truncate w-1/3 text-right">{c.target?.name || 'UNKNOWN'}</span>
                     </div>
                   </div>
                 ))}
               </TabsContent>
             </Tabs>
            </CardContent>
          </Card>

        </div>
      </div>
    </MainLayout>
  )
}

