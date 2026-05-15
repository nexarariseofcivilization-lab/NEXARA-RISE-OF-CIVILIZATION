'use client';

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, BookOpen, AlertCircle, ShieldCheck } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function PolicyCompilerDashboard() {
  const supabase = getSupabase();
  const [policies, setPolicies] = useState<any[]>([]);

  useEffect(() => {
    async function loadPolicies() {
      const { data, error } = await supabase.from('policy_directives').select('*');
      if (data && !error) {
        setPolicies(data);
      }
    }
    loadPolicies();
  }, [supabase]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 p-6 font-mono text-sm max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
              <Code className="w-8 h-8 text-purple-500" />
              Policy Compiler Graph
            </h1>
            <p className="text-muted-foreground">Declarative Governance execution layer. Worker bypass interface.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono bg-background text-purple-500 border-purple-900">BYTECODE: ACTIVE</Badge>
          </div>
        </header>

        <div className="grid gap-6">
          {policies.map(policy => (
            <Card key={policy.id} className="border-purple-900/40 bg-zinc-950/50">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-purple-400 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {policy.name}
                    </CardTitle>
                    <CardDescription className="mt-1">{policy.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <Badge variant={policy.is_active ? "default" : "secondary"} className="mb-2">
                      {policy.is_active ? 'ACTIVE TRACE' : 'DORMANT'}
                    </Badge>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="w-3 h-3 text-blue-400" /> 
                      Legitimacy Cost: <span className="text-blue-400 font-mono font-bold">{policy.legitimacy_cost}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-2">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      Trigger Syntax
                    </div>
                    <pre className="bg-black text-green-400 p-3 rounded-md border border-zinc-800 text-xs overflow-x-auto min-h-[120px]">
                      {JSON.stringify(policy.trigger_conditions, null, 2)}
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-2">
                      <Code className="w-3 h-3 text-purple-500" />
                      Mutation Graph Bytecode
                    </div>
                    <pre className="bg-black text-purple-300 p-3 rounded-md border border-zinc-800 text-[10px] overflow-x-auto min-h-[120px]">
                      {policy.bytecode ? (
                         policy.bytecode.map((step: any, i: number) => (
                           <div key={i} className="mb-1 border-b border-purple-900/30 pb-1">
                             <span className="text-muted-foreground mr-2">{String(i).padStart(2, '0')}</span>
                             <span className="font-bold text-white">{step.opcode}</span>
                             {Object.entries(step).filter(([k]) => k !== 'opcode').map(([k, v]) => (
                               <span key={k} className="ml-2">
                                 <span className="text-purple-500">{k}=</span>{JSON.stringify(v)}
                               </span>
                             ))}
                           </div>
                         ))
                      ) : (
                        JSON.stringify(policy.effects, null, 2)
                      )}
                    </pre>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-black/40 border-t border-purple-900/30 text-xs text-muted-foreground flex justify-between">
                <span>ID: {policy.id}</span>
                <span>Base Cooldown: {policy.base_cooldown_ticks} Ticks</span>
              </CardFooter>
            </Card>
          ))}
          
          {policies.length === 0 && (
            <div className="p-8 text-center text-muted-foreground border border-zinc-800 rounded-md border-dashed">
              Loading compiler registry...
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
