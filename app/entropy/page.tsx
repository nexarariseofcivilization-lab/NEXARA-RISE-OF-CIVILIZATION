'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, FastForward, Activity, AlertTriangle, Network, Search, Flame, Cpu, Gauge, Thermometer, Disc, Zap } from "lucide-react"
import { getSupabase } from "@/lib/supabase";

export default function EntropyDashboard() {
  const supabase = getSupabase();
  const [regions, setRegions] = useState<any[]>([]);
  const [governors, setGovernors] = useState<any[]>([]);
  const [metaData, setMetaData] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: rData } = await supabase.from('regions').select('*');
      if (rData) setRegions(rData);

      const { data: gData } = await supabase.from('region_compute_governor').select('*');
      if (gData) setGovernors(gData);

      const { data: mData } = await supabase.from('region_execution_metadata').select('*');
      if (mData) setMetaData(mData);
    }
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [supabase]);

  const totalLoad = governors.reduce((acc: number, curr: any) => acc + Number(curr.current_entropy_load), 0) || 0;
  const maxLoad = governors.reduce((acc: number, curr: any) => acc + Number(curr.max_entropy_budget), 0) || 1;

  return (
    <>
      <div className="flex flex-col gap-6 p-6 font-mono text-sm max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
              <Cpu className="text-indigo-500 w-8 h-8" />
              Civilization Compute Governor
            </h1>
            <p className="text-muted-foreground">Dynamic simulation orchestration, runtime fidelity shifting, and systemic load shedding.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono bg-background text-indigo-400 border-indigo-400/50">HYPERVISOR_ACTIVE</Badge>
            <Badge variant="secondary" className="font-mono bg-emerald-500/10 text-emerald-500">FIDELITY: ADAPTIVE</Badge>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-500" />
                Global Entropy Load
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{totalLoad.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground mt-1">/ {maxLoad.toFixed(1)} MAX</p>
              <div className="h-1 w-full bg-secondary mt-3 rounded-full overflow-hidden">
                <div className={`h-full ${totalLoad > maxLoad * 0.8 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${Math.min((totalLoad / maxLoad) * 100, 100)}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-500" />
                Active Regions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{regions.length}</div>
              <p className="text-xs text-muted-foreground mt-1 text-cyan-500/80">Under governance</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Degraded Shards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{governors.filter(g => g.fidelity_mode === 'DEGRADED').length}</div>
              <p className="text-xs text-muted-foreground mt-1">In load-shedding mode</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Disc className="w-4 h-4 text-purple-500" />
                Event Compression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">
                {governors.filter(g => g.event_compression_active).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Regions compressing events</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          <Card className="md:col-span-8">
            <CardHeader>
              <CardTitle>Regional Execution Bounds & Fidelity States</CardTitle>
              <CardDescription>Regions are dynamically throttled to prevent runtime queue poison.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regions.map(r => {
                  const gov = governors.find(g => g.region_id === r.id);
                  const meta = metaData.find(m => m.region_id === r.id);
                  
                  if (!gov) return null;
                  
                  const load = Number(gov.current_entropy_load);
                  const max = Number(gov.max_entropy_budget);
                  const ratio = Math.min((load / max) * 100, 100);

                  const fidelityColors: Record<string, string> = {
                    'LOW': 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
                    'MEDIUM': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                    'HIGH': 'bg-amber-500/20 text-amber-500 border-amber-500/30',
                    'CRITICAL': 'bg-red-500/20 text-red-500 border-red-500/30',
                    'DEGRADED': 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
                  };
                  
                  return (
                    <div key={r.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors gap-4">
                      <div className="w-full md:w-1/3">
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-1 opacity-70 truncate">{r.id}</div>
                      </div>
                      
                      <div className="flex-1 space-y-1 w-full relative">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Thermal Load</span>
                          <span className="font-mono text-zinc-300">{load.toFixed(1)} <span className="opacity-40">/ {max.toFixed(0)}</span></span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                          <div className={`h-full ${ratio > 90 ? 'bg-red-500' : ratio > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${ratio}%` }} />
                        </div>
                      </div>

                      <div className="w-full md:w-auto flex flex-col items-end gap-2 md:min-w-[150px]">
                        <Badge variant="outline" className={`font-mono text-xs ${fidelityColors[gov.fidelity_mode] || ''}`}>
                          {gov.fidelity_mode}
                        </Badge>
                        <div className="text-[10px] font-mono text-muted-foreground flex gap-3">
                           <span>THRO: {gov.tick_throttle_factor}x</span>
                           <span className={gov.event_compression_active ? 'text-purple-400' : 'opacity-40'}>COMP: {gov.event_compression_active ? 'ON' : 'OFF'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {(!regions || regions.length === 0) && (
                   <div className="text-center p-8 text-muted-foreground border border-dashed rounded bg-secondary/10">No regions active in simulation.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle>Causality Diagnostics</CardTitle>
              <CardDescription>Snapshot and replay graph optimizations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1 p-3 border border-border bg-card rounded-md">
                  <span className="text-xs text-muted-foreground">Snapshot Strategy</span>
                  <span className="text-xs font-mono font-semibold text-purple-400 mt-1">DELTA_ANCHORS</span>
                </div>
                <div className="flex flex-col space-y-1 p-3 border border-border bg-card rounded-md">
                  <span className="text-xs text-muted-foreground">Queue Leak</span>
                  <span className="text-lg font-mono font-semibold text-emerald-500">SAFE</span>
                </div>
              </div>

              <div className="rounded-md border border-border p-4 bg-zinc-950 text-indigo-400 font-mono text-xs overflow-x-auto space-y-2">
                <div className="flex gap-2"><Zap className="w-4 h-4 shrink-0 text-amber-500" /> SYSTEM_CTL: DYNAMIC OVERRIDE ENABLED</div>
                <div>{">"} Bypassing narrative fanout for stable shards.</div>
                <div>{">"} Compression protocol activated for LOW fidelity targets.</div>
                <div>{">"} Thermal budgets synced with Hypervisor DB.</div>
                <div className="text-zinc-500 pt-2 border-t border-zinc-800 mt-2">The scheduler acts as an operating system kernel for the simulation runtime.</div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </>
  )
}

