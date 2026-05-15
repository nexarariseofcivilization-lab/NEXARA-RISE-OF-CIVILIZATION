'use client';

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ShieldAlert, Settings2, Sliders, Activity, Scale, Zap, Database, History } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function SettingsDashboard() {
  const supabase = getSupabase();
  const [isSaving, setIsSaving] = useState(false);
  const [adminLegitimacy, setAdminLegitimacy] = useState(100.0);
  const [epochName, setEpochName] = useState("NEW_ERA");
  
  const [config, setConfig] = useState({
    max_inflation_velocity: 5.0,
    max_deflation_velocity: 2.0,
    max_ideology_swing: 2.5,
    max_migration_rate: 2.0,
    collapse_cooldown_ticks: 1440,
    circuit_breaker_enabled: true,
    circuit_breaker_chaos_threshold: 95.0
  });

  useEffect(() => {
    async function loadConfig() {
      const { data, error } = await supabase.from('simulation_constitution').select('*').eq('id', 1).single() as any;
      if (data && !error) {
        setConfig({
          max_inflation_velocity: Number(data.max_inflation_velocity),
          max_deflation_velocity: Number(data.max_deflation_velocity),
          max_ideology_swing: Number(data.max_ideology_swing),
          max_migration_rate: Number(data.max_migration_rate),
          collapse_cooldown_ticks: Number(data.collapse_cooldown_ticks),
          circuit_breaker_enabled: Boolean(data.circuit_breaker_enabled),
          circuit_breaker_chaos_threshold: Number(data.circuit_breaker_chaos_threshold)
        });
        if (data.admin_legitimacy !== undefined) {
          setAdminLegitimacy(Number(data.admin_legitimacy));
        }
      }
    }
    loadConfig();
  }, [supabase]);

  const handleSave = async () => {
    setIsSaving(true);
    // 1. Update constitution constraints
    await (supabase.from('simulation_constitution') as any).update(config).eq('id', 1);
    
    // 2. Transition epoch with legitimacy penalty
    const legitimacyCost = 5.0; // Fixed cost for simplicity
    await (supabase.rpc as any)('transition_simulation_epoch', {
      p_new_name: epochName,
      p_legitimacy_cost: legitimacyCost
    });
    
    // 3. Reload legitimacy state locally
    setAdminLegitimacy(prev => Math.max(0, prev - legitimacyCost));
    
    setTimeout(() => setIsSaving(false), 500);
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 p-6 font-mono text-sm max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
              <Settings2 className="w-8 h-8 text-blue-500" />
              Meta-System Governance
            </h1>
            <p className="text-muted-foreground">Simulation Constitution: Tunable systemic invariants and failure containment policies.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end mr-4">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Admin Legitimacy</span>
              <span className={`text-lg font-bold font-mono ${adminLegitimacy < 30 ? 'text-red-500' : 'text-green-500'}`}>
                {adminLegitimacy.toFixed(1)}%
              </span>
            </div>
            <Badge variant="outline" className="font-mono bg-background">DSL: ACTIVE</Badge>
            <Button onClick={handleSave} disabled={isSaving} size="sm" className="font-mono bg-blue-600 hover:bg-blue-700">
              {isSaving ? "SYNCING..." : "COMMIT & INITIATE EPOCH"}
            </Button>
          </div>
        </header>

        <div className="grid gap-6">

          {/* Epoch Transition */}
          <Card className="border-blue-900/50">
            <CardHeader>
              <CardTitle className="text-blue-500 flex items-center gap-2">
                <History className="w-5 h-5" />
                Constitutional Epoch Transition
              </CardTitle>
              <CardDescription>Every configuration save transitions the simulation into a new historical epoch.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">New Epoch Designation</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="text" 
                    value={epochName}
                    onChange={(e) => setEpochName(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm font-mono ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="e.g. LATE_CAPITALISM_RECOVERY"
                  />
                  <div className="shrink-0 text-sm font-mono text-red-400">
                    Cost: -5.0 Legitimacy
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Admin-forced constitutional changes shock the simulation and erode institutional trust globally.</p>
              </div>
            </CardContent>
          </Card>

          {/* Fault Containment */}
          <Card className="border-red-900/50 bg-black/40">
            <CardHeader>
              <CardTitle className="text-red-500 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                Failure Containment Zones (Circuit Breakers)
              </CardTitle>
              <CardDescription>Anti-cascade limits to prevent global runaway chaos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Global Circuit Breaker</div>
                  <div className="text-xs text-muted-foreground mt-1">If enabled, pauses mutation propagation when chaos threshold is breached.</div>
                </div>
                <Switch 
                  checked={config.circuit_breaker_enabled} 
                  onCheckedChange={(v) => setConfig({...config, circuit_breaker_enabled: v})}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Chaos Threshold Breaker</span>
                  <span className="text-red-400">{config.circuit_breaker_chaos_threshold} / 100</span>
                </div>
                <Slider 
                  max={100} step={1} 
                  value={[config.circuit_breaker_chaos_threshold]} 
                  onValueChange={(v) => setConfig({...config, circuit_breaker_chaos_threshold: v[0]})}
                  className="[&_[role=slider]]:bg-red-500"
                />
                <p className="text-xs text-muted-foreground">Threshold at which region execution shifts to safe mode isolating fault domains.</p>
              </div>
            </CardContent>
          </Card>

          {/* Institutional Invariants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-500" />
                Institutional Stability Constraints
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Collapse Cooldown (Ticks)</span>
                  <span className="text-primary">{config.collapse_cooldown_ticks}</span>
                </div>
                <Slider 
                  max={10000} step={100} 
                  value={[config.collapse_cooldown_ticks]} 
                  onValueChange={(v) => setConfig({...config, collapse_cooldown_ticks: v[0]})}
                />
                <p className="text-xs text-muted-foreground">Minimum ticks between regime mutations. Prevents rapid ping-ponging of failed states.</p>
              </div>
            </CardContent>
          </Card>

          {/* Demographic & Economic Invariants */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  Economic Velocity Limits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Max Inflation / Tick</span>
                    <span className="text-green-500">{config.max_inflation_velocity}%</span>
                  </div>
                  <Slider 
                    max={15} step={0.1} 
                    value={[config.max_inflation_velocity]} 
                    onValueChange={(v) => setConfig({...config, max_inflation_velocity: v[0]})}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Max Deflation / Tick</span>
                    <span className="text-green-500">{config.max_deflation_velocity}%</span>
                  </div>
                  <Slider 
                    max={15} step={0.1} 
                    value={[config.max_deflation_velocity]} 
                    onValueChange={(v) => setConfig({...config, max_deflation_velocity: v[0]})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Demographic Drift Limits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Max Ideology Swing</span>
                    <span className="text-yellow-500">{config.max_ideology_swing} pts/tick</span>
                  </div>
                  <Slider 
                    max={10} step={0.1} 
                    value={[config.max_ideology_swing]} 
                    onValueChange={(v) => setConfig({...config, max_ideology_swing: v[0]})}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Max Migration Capacity</span>
                    <span className="text-yellow-500">{config.max_migration_rate}% pop/tick</span>
                  </div>
                  <Slider 
                    max={10} step={0.1} 
                    value={[config.max_migration_rate]} 
                    onValueChange={(v) => setConfig({...config, max_migration_rate: v[0]})}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-md flex items-start gap-4">
            <Database className="w-5 h-5 mt-1 text-muted-foreground" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <strong>System Integrity Notice:</strong> Changes to the Simulation Constitution directly modify the deterministic evaluation limits of the worker pods. Use caution when altering invariants, as removing cooling buffers may result in irreversible attractor states and permanent civilization lock.
            </div>
          </div>
          
        </div>
      </div>
    </MainLayout>
  )
}

