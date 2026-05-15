'use client';

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Crosshair, Zap, Activity, Brain } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function AgentsDashboard() {
  const supabase = getSupabase();
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      // Load Agents
      const { data } = await supabase.from('agents').select('*, regions(name)').eq('life_status', 'ACTIVE');
      if (data) setAgents(data);
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
              <Brain className="w-8 h-8 text-fuchsia-500" />
              Agent Personality Kernel
            </h1>
            <p className="text-zinc-400">Persistence of intent, strategic inertia, memory, and ambition curves.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono bg-zinc-950 text-fuchsia-500 border-fuchsia-900">KERNEL OVERSIGHT: ACTIVE</Badge>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 flex-1 items-start">
          
          {agents.length === 0 ? <div className="col-span-full text-zinc-500 p-4 border border-dashed border-zinc-800 rounded text-center">INITIALIZING AGENTS / WAITING FOR KERNEL SYNC</div> : null}
          
          {agents.map(agent => (
            <Card key={agent.id} className={`bg-zinc-950/40 border-zinc-800/60 ${agent.fatigue > 80 ? 'border-red-900/50' : ''}`}>
              <CardHeader className="pb-4 border-b border-zinc-800/50 bg-zinc-900/20">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-zinc-200 flex items-center gap-2 text-base">
                      {agent.name}
                    </CardTitle>
                    <CardDescription className="text-zinc-500 mt-1">{agent.role} &bull; {agent.regions?.name}</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-zinc-950 text-zinc-400 border-zinc-800">
                    {agent.affiliation_faction_id}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                
                {/* Current Intent */}
                <div className="bg-fuchsia-950/10 border border-fuchsia-900/30 p-3 rounded-md">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold mb-2 flex items-center gap-2">
                    <Crosshair className="w-3 h-3 text-fuchsia-500" />
                    Dominant Intent
                  </div>
                  <div className="font-bold text-fuchsia-400">{agent.current_intent_type || 'IDLE'}</div>
                  <div className="text-xs text-zinc-400 mt-1">Target: {agent.current_intent_target || 'N/A'}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Dynamic State */}
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase mb-1">Power Projection</div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-lg text-zinc-200 font-bold">{Number(agent.current_power).toFixed(1)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase mb-1">Fatigue / Burnout</div>
                    <div className="flex items-center gap-2">
                      <Activity className={`w-4 h-4 ${agent.fatigue > 80 ? 'text-red-500' : 'text-emerald-500'}`} />
                      <span className={`text-lg font-bold ${agent.fatigue > 80 ? 'text-red-400' : 'text-zinc-200'}`}>{Number(agent.fatigue).toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Genome Details */}
                <div className="pt-2 border-t border-zinc-800/50 mt-2">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold mb-3">Personality Genome</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Ambition Curve</span>
                      <span className="font-mono text-zinc-200">{Number(agent.ambition).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Ideological Rigidity</span>
                      <span className="font-mono text-zinc-200">{Number(agent.ideological_rigidity).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Strategic Inertia</span>
                      <span className="font-mono text-zinc-200">{agent.strategic_inertia} Ticks</span>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}

        </div>
      </div>
    </MainLayout>
  )
}