'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Hash, Users, ArrowRight, Save } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function HistoriographyDashboard() {
  const supabase = getSupabase();
  const [syntheses, setSyntheses] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('historical_syntheses').select('*, regions(name)').order('generated_at_tick', { ascending: false }).limit(20);
      if (data) setSyntheses(data);
    }
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [supabase]);

  return (
    <>
      <div className="flex flex-col gap-6 p-6 font-mono text-sm max-w-7xl mx-auto h-full overflow-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6 shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-amber-500" />
              Semantic Historiography Engine
            </h1>
            <p className="text-zinc-400">Automated structural synthesis and civilization narrative compression.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono bg-zinc-950 text-amber-500 border-amber-900">SYNTHESIS LAYER: ACTIVE</Badge>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {syntheses.length === 0 ? (
             <div className="text-zinc-500 p-8 border border-dashed border-zinc-800 rounded bg-zinc-900/20 text-center">
                AWAITING EPOCH COMPACTION & SYNTHESIS
             </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {syntheses.map(syn => (
                <Card key={syn.id} className="bg-zinc-950/40 border-zinc-800/60">
                  <CardHeader className="pb-4 border-b border-zinc-800/50 bg-zinc-900/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-amber-500 flex items-center gap-2 text-xl font-bold">
                          {syn.era_name}
                        </CardTitle>
                        <CardDescription className="text-zinc-400 mt-1 uppercase text-xs tracking-wider">
                          Epoch {syn.epoch_id} &bull; {syn.regions?.name || 'Global'}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-zinc-950 text-zinc-500 border-zinc-800">
                        TICK {syn.generated_at_tick}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    
                    <div>
                        <div className="text-[10px] text-zinc-500 uppercase font-bold mb-2">Structural Narrative</div>
                        <div className="text-sm text-zinc-300 leading-relaxed italic border-l-2 border-amber-500/50 pl-3">
                           &quot;{syn.structural_narrative}&quot;
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-[10px] text-zinc-500 uppercase font-bold mb-2 flex items-center gap-2">
                                <Hash className="w-3 h-3 text-amber-500" /> Primary Causes
                            </div>
                            <ul className="space-y-1 text-xs text-zinc-400">
                                {syn.primary_causes?.map((cause: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0 mt-0.5" /> {cause}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <div className="text-[10px] text-zinc-500 uppercase font-bold mb-2 flex items-center gap-2">
                                <Users className="w-3 h-3 text-cyan-500" /> Dominant Factions
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {syn.dominant_factions?.map((fac: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="text-[10px] bg-cyan-950/30 text-cyan-500">
                                        {fac}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-zinc-800/50 text-xs text-zinc-600">
                        <div className="flex items-center gap-2">
                            <Save className="w-3 h-3" />
                            <span>Written to National Memory Archival</span>
                        </div>
                        <span className="font-mono">{syn.id.split('-')[0]}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
