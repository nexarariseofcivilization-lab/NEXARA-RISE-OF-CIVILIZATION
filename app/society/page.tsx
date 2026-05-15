'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, HeartPulse, ShieldAlert, Activity, ArrowUpRight, Filter, Brain, Frown, AlertTriangle, Cpu, History, Flame, Home, Radio, TrendingUp, TrendingDown, Clock, GitCommit } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const socialIndexData = [
  { subject: 'Education', A: 72, fullMark: 100 },
  { subject: 'Healthcare', A: 65, fullMark: 100 },
  { subject: 'Security', A: 48, fullMark: 100 },
  { subject: 'Mobility', A: 85, fullMark: 100 },
  { subject: 'Housing', A: 55, fullMark: 100 },
  { subject: 'Equality', A: 60, fullMark: 100 },
];

export default function SocietyDashboard() {
    const [mounted, setMounted] = useState(false);
    const society = useAppStore(state => state.society);

    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-zinc-800 pb-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white uppercase font-sans flex items-center">
                        <Users className="w-8 h-8 mr-3 text-amber-500" />
                        Civilization Engine
                    </h1>
                    <p className="text-zinc-400 mt-2 font-mono text-sm">Synthetic population behavioral monitoring, psychological telemetry, and civilization health.</p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-amber-900/30 hover:bg-amber-900/50 transition-colors border border-amber-800/50 rounded text-xs font-mono text-amber-300 flex-1 sm:flex-none text-center justify-center flex items-center">
                        OPEN CENSUS DATA
                    </button>
                    <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-700 rounded text-xs font-mono text-zinc-300 flex items-center flex-1 sm:flex-none text-center justify-center">
                        <Filter className="w-3 h-3 mr-2" /> FILTER DEMOGRAPHICS
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-zinc-950/50 border-zinc-800/80 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Total Population</CardTitle>
                        <Users className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-mono font-bold text-blue-400">{society.population.toLocaleString()}</div>
                        <p className="text-[10px] text-zinc-500 mt-2 flex items-center">
                            <ArrowUpRight className="w-3 h-3 text-emerald-500 mr-1" />
                            +0.8% YoY growth
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-950/50 border-zinc-800/80 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Education Index</CardTitle>
                        <GraduationCap className="w-4 h-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-mono font-bold text-emerald-400">{society.educationIndex.toFixed(1)}</div>
                        <p className="text-[10px] text-zinc-500 mt-2 flex items-center">
                            <ArrowUpRight className="w-3 h-3 text-emerald-500 mr-1" />
                            Target: 80.0
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-950/50 border-zinc-800/80 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Healthcare Quality</CardTitle>
                        <HeartPulse className="w-4 h-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-mono font-bold text-red-400">{society.healthcareQuality.toFixed(1)}</div>
                        <p className="text-[10px] text-zinc-500 mt-2 flex items-center text-red-500/80">
                            Declining due to budget cuts
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-950/50 border-zinc-800/80 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Crime Rate</CardTitle>
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-mono font-bold text-amber-400">{society.crimeRate.toFixed(1)}%</div>
                        <p className="text-[10px] text-zinc-500 mt-2 flex items-center text-amber-500/80">
                            Spike in Sector 4
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-950/50 border-cyan-900/50 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-cyan-500">Systemic Confidence</CardTitle>
                        <Activity className="w-4 h-4 text-cyan-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-mono font-bold text-cyan-400">{society.systemicConfidenceIndex?.toFixed(1) || 50.0}</div>
                        <p className="text-[10px] text-cyan-500/80 mt-2 flex items-center">
                            AI Citizen Trust Baseline
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Social Quality Index Radar */}
                <Card className="col-span-1 bg-zinc-950/40 border-zinc-800/60 flex flex-col h-[400px]">
                    <CardHeader className="pb-0 border-b border-zinc-800/50 shrink-0">
                        <CardTitle className="text-sm font-semibold text-zinc-300">Social Quality Index (SQI)</CardTitle>
                        <CardDescription className="text-xs font-mono mt-1 mb-4">Multidimensional living standard metric</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 flex items-center justify-center relative">
                         <div className="absolute top-4 left-4 text-2xl font-mono font-bold text-amber-500">{society.socialQualityIndex.toFixed(1)}</div>
                         <div className="w-full h-4/5 flex items-center justify-center border border-zinc-800 border-dashed rounded bg-zinc-900/10 mx-6">
                            <span className="font-mono text-zinc-600 text-xs text-center px-4">SQI RADAR UNAVAILABLE</span>
                         </div>
                    </CardContent>
                </Card>

                {/* Class Distribution & Mobility */}
                <Card className="col-span-1 lg:col-span-2 bg-zinc-950/40 border-zinc-800/60 h-[400px] flex flex-col">
                    <CardHeader className="pb-4 border-b border-zinc-800/50 shrink-0">
                        <CardTitle className="text-sm font-semibold text-zinc-300">Socioeconomic Class Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-4 flex flex-col justify-center space-y-6">
                        {/* Upper Class */}
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <h4 className="text-sm font-bold text-zinc-200">Upper Class (Tier 1)</h4>
                                    <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">Wealth &gt; $10M // {society.classes.upper.toFixed(1)}% of Population</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs font-mono ${society.classes.upperGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        Growth: {society.classes.upperGrowth > 0 ? '+' : ''}{society.classes.upperGrowth.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden shadow-inner flex">
                                <div className="bg-emerald-500 h-full transition-all" style={{ width: `${society.classes.upper}%` }}></div>
                            </div>
                        </div>

                        {/* Middle Class */}
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <h4 className="text-sm font-bold text-zinc-200">Middle Class (Tier 2)</h4>
                                    <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">Wealth $100k - $10M // {society.classes.middle.toFixed(1)}% of Population</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs font-mono ${society.classes.middleGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        Growth: {society.classes.middleGrowth > 0 ? '+' : ''}{society.classes.middleGrowth.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden shadow-inner flex">
                                <div className="bg-blue-500 h-full transition-all" style={{ width: `${society.classes.middle}%` }}></div>
                            </div>
                            {society.classes.middleGrowth < 0 && <p className="text-[10px] text-red-400/80 mt-1">Warning: Middle class shrinking due to inflation pressure.</p>}
                        </div>

                        {/* Working Class */}
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <h4 className="text-sm font-bold text-zinc-200">Working Class (Tier 3)</h4>
                                    <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">Wealth &lt; $100k // {society.classes.working.toFixed(1)}% of Population</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs font-mono ${society.classes.workingGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        Growth: {society.classes.workingGrowth > 0 ? '+' : ''}{society.classes.workingGrowth.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden shadow-inner flex">
                                <div className="bg-amber-500 h-full transition-all" style={{ width: `${society.classes.working}%` }}></div>
                            </div>
                        </div>

                        {/* Poverty Line */}
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <h4 className="text-sm font-bold text-zinc-200">Below Poverty Line (Tier 4)</h4>
                                    <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">State Dependents // {society.classes.poverty.toFixed(1)}% of Population</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-mono text-red-500 font-bold">CRITICAL</span>
                                </div>
                            </div>
                            <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden shadow-inner flex">
                                <div className="bg-red-500 h-full transition-all" style={{ width: `${society.classes.poverty}%` }}></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* LOD ACTIVE CITIZEN SAMPLE */}
            <Card className="bg-zinc-950/40 border-cyan-900/40">
                <CardHeader className="pb-3 border-b border-zinc-800/50 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center">
                            <Activity className="w-4 h-4 mr-2 text-cyan-400" />
                            Active Agent LOD Sample (Systemic Confidence Engine)
                        </CardTitle>
                        <CardDescription className="text-xs font-mono mt-1">
                            A live sample of Level-of-Detail synthesized citizens whose structural trust shifts dictate systemic confidence and election swings.
                        </CardDescription>
                    </div>
                    <div className="px-3 py-1 bg-cyan-950/30 border border-cyan-900/50 rounded text-xs font-mono text-cyan-400 font-bold">
                        GLOBAL C.I.: {society.systemicConfidenceIndex?.toFixed(1) || 50.0}
                    </div>
                </CardHeader>
                <CardContent className="pt-4 overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-800 text-zinc-500">
                                <th className="pb-2 font-normal uppercase tracking-widest pl-2">ID</th>
                                <th className="pb-2 font-normal uppercase tracking-widest">Name</th>
                                <th className="pb-2 font-normal uppercase tracking-widest">Class</th>
                                <th className="pb-2 font-normal uppercase tracking-widest">Ideology</th>
                                <th className="pb-2 font-normal uppercase tracking-widest">Baseline Trust</th>
                                <th className="pb-2 font-normal uppercase tracking-widest text-right pr-2">Current Trust</th>
                            </tr>
                        </thead>
                        <tbody>
                            {society.citizens?.map((c: any) => {
                                const diff = c.currentTrust - c.trustBaseline;
                                return (
                                    <tr key={c.id} className="border-b border-zinc-800/30 hover:bg-zinc-900/30 transition-colors">
                                        <td className="py-2 pl-2 text-zinc-600 font-bold">{c.id}</td>
                                        <td className="py-2 text-zinc-300">{c.name}</td>
                                        <td className="py-2">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded border text-[9px] uppercase tracking-wider",
                                                c.class === 'UPPER' ? "bg-emerald-950/50 border-emerald-900 text-emerald-500" :
                                                c.class === 'MIDDLE' ? "bg-blue-950/50 border-blue-900 text-blue-500" :
                                                c.class === 'WORKING' ? "bg-amber-950/50 border-amber-900 text-amber-500" :
                                                "bg-red-950/50 border-red-900 text-red-500"
                                            )}>
                                                {c.class}
                                            </span>
                                        </td>
                                        <td className="py-2">
                                            <span className="text-zinc-400">{c.ideology}</span>
                                        </td>
                                        <td className="py-2 text-zinc-500">{c.trustBaseline.toFixed(1)}</td>
                                        <td className="py-2 pr-2 text-right">
                                            <div className="flex items-center justify-end">
                                                <span className={cn(
                                                    "font-bold mr-2",
                                                    diff > 0 ? "text-emerald-400" : diff < 0 ? "text-red-400" : "text-zinc-300"
                                                )}>
                                                    {c.currentTrust.toFixed(1)}
                                                </span>
                                                <span className={cn("text-[9px]", diff > 0 ? "text-emerald-500" : diff < 0 ? "text-red-500" : "text-zinc-600")}>
                                                    ({diff > 0 ? '+' : ''}{diff.toFixed(1)})
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* CIVILIZATION ACTIVITY & HOUSEHOLD STRESS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                
                {/* LIVE CIVILIAN REACTION FEED */}
                <Card className="lg:col-span-7 bg-zinc-950/40 border-zinc-800/60 overflow-hidden flex flex-col">
                    <CardHeader className="pb-3 border-b border-zinc-800/50 bg-black/20 shrink-0">
                        <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center justify-between">
                            <div className="flex items-center">
                                <Radio className="w-4 h-4 mr-2 text-cyan-400" />
                                Live Civilian Behavioral Stream
                            </div>
                            <span className="flex items-center text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-2 animate-pulse"></div>
                                Live Sync
                            </span>
                        </CardTitle>
                        <CardDescription className="text-xs font-mono">Real-time autonomous reactions, migration, and societal shifts.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar h-[280px]">
                        <div className="divide-y divide-zinc-800/50">
                            {society.behavioralStream.map((event) => (
                                <div key={event.id} className="p-3 hover:bg-zinc-900/30 transition-colors group">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center">
                                            <span className="text-[10px] font-mono text-zinc-500 w-16">{event.timestamp}</span>
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ml-2 uppercase
                                                ${event.type === 'CRITICAL' ? 'bg-rose-950/50 text-rose-400 border border-rose-900/50' :
                                                event.type === 'POLITICAL' ? 'bg-orange-950/50 text-orange-400 border border-orange-900/50' :
                                                event.type === 'SOCIAL' ? 'bg-blue-950/50 text-blue-400 border border-blue-900/50' :
                                                event.type === 'MIGRATION' ? 'bg-cyan-950/50 text-cyan-400 border border-cyan-900/50' :
                                                'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50'}`}>
                                                {event.type}
                                            </span>
                                            <span className="text-[10px] text-zinc-500 ml-2 font-mono">{event.region}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-zinc-300 ml-16 mt-1 leading-snug">{event.message}</p>
                                    <div className="ml-16 mt-2 flex items-center">
                                        <GitCommit className="w-3 h-3 text-zinc-600 mr-1" />
                                        <span className="text-[10px] font-mono text-amber-500/80">Systemic Impact: {event.impact}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* STRESS AND ADAPTATION */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    {/* HOUSEHOLD-LEVEL CONSEQUENCE */}
                    <Card className="bg-zinc-950/40 border-zinc-800/60 overflow-hidden flex flex-col flex-1">
                        <CardHeader className="pb-3 border-b border-zinc-800/50 bg-black/20 shrink-0">
                            <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center">
                                <Home className="w-4 h-4 mr-2 text-rose-400" />
                                Household Pressure Index
                            </CardTitle>
                            <CardDescription className="text-xs font-mono">Micro-economic strain and daily survival friction.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 flex flex-col gap-3">
                            <div className="p-3 bg-zinc-900/50 rounded border border-zinc-800 flex justify-between items-center group hover:border-zinc-700 transition-colors">
                                <div>
                                    <div className="text-[10px] text-zinc-400 font-mono uppercase">Unpaid Utility Bills</div>
                                    <div className="text-[11px] text-zinc-500 mt-0.5 leading-tight">Rising due to industrial layoffs.</div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xl font-bold font-mono leading-none ${society.households.unpaidUtilityBills > 10 ? 'text-rose-500' : 'text-amber-500'}`}>{society.households.unpaidUtilityBills}%</div>
                                </div>
                            </div>

                            <div className="p-3 bg-zinc-900/50 rounded border border-zinc-800 flex justify-between items-center group hover:border-zinc-700 transition-colors">
                                <div>
                                    <div className="text-[10px] text-zinc-400 font-mono uppercase">Food Insecurity</div>
                                    <div className="text-[11px] text-zinc-500 mt-0.5 leading-tight">Struggles in tier 3 & 4 demographics.</div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xl font-bold font-mono leading-none ${society.households.foodInsecurityIndex > 20 ? 'text-rose-500' : 'text-emerald-500'}`}>{society.households.foodInsecurityIndex}</div>
                                </div>
                            </div>

                            <div className="p-3 bg-zinc-900/50 rounded border border-zinc-800 flex justify-between items-center group hover:border-zinc-700 transition-colors">
                                <div>
                                    <div className="text-[10px] text-zinc-400 font-mono uppercase">Avg. Workforce Burnout</div>
                                    <div className="text-[11px] text-zinc-500 mt-0.5 leading-tight">National productivity dragging.</div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xl font-bold font-mono leading-none ${society.households.averageBurnout > 75 ? 'text-orange-500 animate-pulse' : 'text-amber-500'}`}>{society.households.averageBurnout}/100</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* BEHAVIORAL ADAPTATION */}
                    <Card className="bg-zinc-950/40 border-zinc-800/60 overflow-hidden flex flex-col flex-1">
                        <CardHeader className="pb-3 border-b border-zinc-800/50 bg-black/20 shrink-0">
                            <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center">
                                <Users className="w-4 h-4 mr-2 text-blue-400" />
                                Active Civilian Adaptation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 grid grid-cols-2 gap-3">
                            <div className="p-3 bg-zinc-900/50 rounded border border-zinc-800/80">
                                <div className="text-[9px] text-zinc-400 uppercase font-mono">Job Seeking Surge</div>
                                <div className="text-lg font-mono font-bold text-amber-400 mt-1">+{society.adaptations.jobSeekingSurge}%</div>
                            </div>
                            <div className="p-3 bg-zinc-900/50 rounded border border-zinc-800/80">
                                <div className="text-[9px] text-zinc-400 uppercase font-mono">Migration Pressure</div>
                                <div className="text-lg font-mono font-bold text-cyan-400 mt-1">+{society.adaptations.migrationPressure}%</div>
                            </div>
                            <div className="p-3 bg-zinc-900/50 rounded border border-zinc-800/80">
                                <div className="text-[9px] text-zinc-400 uppercase font-mono">Healthcare Avoidance</div>
                                <div className="text-lg font-mono font-bold text-rose-400 mt-1">+{society.adaptations.healthcareAvoidance}%</div>
                            </div>
                            <div className="p-3 bg-zinc-900/50 rounded border border-zinc-800/80">
                                <div className="text-[9px] text-zinc-400 uppercase font-mono">Union Organization</div>
                                <div className="text-lg font-mono font-bold text-blue-400 mt-1">+{society.adaptations.unionOrganization}%</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>

            {/* AI CIVILIZATION ENGINE DATA */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                
                {/* PSYCHOLOGICAL LAYER */}
                <Card className="bg-zinc-950/40 border-zinc-800/60 overflow-hidden">
                    <CardHeader className="pb-3 border-b border-zinc-800/50 bg-black/20">
                        <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center">
                            <Brain className="w-4 h-4 mr-2 text-purple-400" />
                            Macro-Psychology & Ideology
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 bg-zinc-900/50 rounded border border-zinc-800">
                                <div className="text-[10px] text-zinc-500 uppercase font-mono mb-1">Stress Level</div>
                                <div className={`text-xl font-mono font-bold ${society.psychology.stressLevel > 80 ? 'text-rose-500 animate-pulse' : society.psychology.stressLevel > 60 ? 'text-amber-500' : 'text-emerald-500'}`}>{society.psychology.stressLevel}</div>
                            </div>
                            <div className="p-3 bg-zinc-900/50 rounded border border-zinc-800">
                                <div className="text-[10px] text-zinc-500 uppercase font-mono mb-1">Pol. Trust</div>
                                <div className={`text-xl font-mono font-bold ${society.psychology.politicalTrust < 40 ? 'text-rose-500' : 'text-emerald-500'}`}>{society.psychology.politicalTrust}</div>
                            </div>
                            <div className="p-3 bg-zinc-900/50 rounded border border-zinc-800">
                                <div className="text-[10px] text-zinc-500 uppercase font-mono mb-1">Volatility</div>
                                <div className={`text-xl font-mono font-bold ${society.psychology.emotionalVolatility > 70 ? 'text-orange-500' : 'text-zinc-300'}`}>{society.psychology.emotionalVolatility}</div>
                            </div>
                        </div>
                        
                        <div className="w-full">
                            <h4 className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 mb-3 flex items-center justify-between">
                                Ideological Shift Map
                                <span className="text-zinc-600 flex items-center"><Activity className="w-3 h-3 mr-1" /> Live Mapped</span>
                            </h4>
                            <div className="space-y-3">
                                {[
                                    { name: 'Nationalism', value: society.ideology.nationalism, color: 'bg-rose-400', shift: '+2.1%', trend: 'up', note: 'Rising post border incident' },
                                    { name: 'Conservatism', value: society.ideology.conservatism, color: 'bg-blue-400', shift: '-0.5%', trend: 'down', note: 'Slight demographic decay' },
                                    { name: 'Progressivism', value: society.ideology.progressivism, color: 'bg-emerald-400', shift: '+1.2%', trend: 'up', note: 'Youth districts shifting' },
                                    { name: 'Auth. Tolerance', value: society.ideology.authoritarianTolerance, color: 'bg-zinc-400', shift: '+4.0%', trend: 'up', note: 'Spike due to crime fear' },
                                    { name: 'Populism', value: society.ideology.populism, color: 'bg-amber-400', shift: '+5.5%', trend: 'up', note: 'Industrial collapse fallout' }
                                ].map((ideo, idx) => (
                                    <div key={idx} className="flex items-center text-sm">
                                        <div className="w-28 shrink-0 text-xs text-zinc-400">{ideo.name}</div>
                                        <div className="flex-1 mx-3 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                            <div className={`h-full ${ideo.color} rounded-full`} style={{ width: `${ideo.value}%` }}></div>
                                        </div>
                                        <div className="w-36 shrink-0 flex items-center justify-between">
                                            <span className={`text-[10px] font-mono font-bold flex items-center ${ideo.trend === 'up' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                {ideo.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                                {ideo.shift}
                                            </span>
                                            <span className="text-[9px] text-zinc-600 truncate max-w-[80px] group-hover:block" title={ideo.note}>
                                                {ideo.note}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6 flex flex-col h-full">
                    {/* SOCIAL UNREST SYSTEM */}
                    <Card className={`border-zinc-800/60 overflow-hidden ${society.unrest.level > 70 ? 'bg-rose-950/20 border-rose-900/50' : 'bg-zinc-950/40'}`}>
                        <CardHeader className={`pb-3 border-b ${society.unrest.level > 70 ? 'border-rose-900/50 bg-rose-950/40' : 'border-zinc-800/50 bg-black/20'}`}>
                            <CardTitle className="text-sm font-semibold text-zinc-300 flex justify-between items-center">
                                <span className="flex items-center"><Flame className={`w-4 h-4 mr-2 ${society.unrest.level > 70 ? 'text-rose-500 animate-pulse' : 'text-orange-500'}`} /> Social Unrest Escalation</span>
                                <span className={`font-mono ${society.unrest.level > 70 ? 'text-rose-400' : 'text-zinc-500'}`}>{society.unrest.level}/100</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">Current Stage</span>
                                <span className={`text-xs font-bold font-mono ${society.unrest.level > 70 ? 'text-rose-500' : 'text-amber-500'}`}>
                                    {society.unrest.stage.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden mb-4">
                                <div className={`h-full transition-all ${society.unrest.level > 80 ? 'bg-rose-500' : society.unrest.level > 50 ? 'bg-orange-500' : 'bg-amber-500' }`} style={{ width: `${society.unrest.level}%` }}></div>
                            </div>
                            {society.unrest.catalyst && (
                                <div className="p-2 bg-black/40 border border-zinc-800/50 rounded flex items-start mt-4">
                                    <AlertTriangle className="w-4 h-4 text-rose-500 mr-2 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-[10px] text-rose-400/80 font-mono uppercase mb-0.5">Primary Catalyst</div>
                                        <div className="text-sm text-zinc-300 leading-tight">{society.unrest.catalyst}</div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* AI SIMULATION LOD */}
                    <Card className="bg-zinc-950/40 border-zinc-800/60 overflow-hidden flex-1">
                        <CardHeader className="pb-3 border-b border-zinc-800/50 bg-black/20">
                            <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center">
                                <Cpu className="w-4 h-4 mr-2 text-cyan-500" />
                                Population Simulation Density
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 grid grid-cols-2 gap-3">
                            <div className="p-3 bg-zinc-900/50 rounded border border-zinc-800/80 text-center">
                                <div className="text-[10px] text-zinc-400 uppercase font-mono">Active Urban Hotspots</div>
                                <div className="text-lg font-mono font-bold text-cyan-400 mt-1">{society.simulationStatus.tierA_count.toLocaleString()}</div>
                                <div className="text-[8px] text-zinc-500 mt-0.5">Fully Simulated Behavior</div>
                            </div>
                            <div className="p-3 bg-zinc-900/50 rounded border border-zinc-800/80 text-center">
                                <div className="text-[10px] text-zinc-400 uppercase font-mono">Economic Regions</div>
                                <div className="text-lg font-mono font-bold text-blue-400 mt-1">{society.simulationStatus.tierB_count.toLocaleString()}</div>
                                <div className="text-[8px] text-zinc-500 mt-0.5">Macro-economic Agents</div>
                            </div>
                            <div className="p-3 bg-zinc-900/50 rounded border border-zinc-800/80 text-center">
                                <div className="text-[10px] text-zinc-400 uppercase font-mono">Aggregated Demog.</div>
                                <div className="text-lg font-mono font-bold text-indigo-400 mt-1">{(society.simulationStatus.tierC_count / 1000).toFixed(1)}k</div>
                                <div className="text-[8px] text-zinc-500 mt-0.5">Statistical Nodes</div>
                            </div>
                            <div className="p-3 bg-zinc-900/50 rounded border border-zinc-800/80 text-center">
                                <div className="text-[10px] text-zinc-400 uppercase font-mono">Dormant Rural Clusters</div>
                                <div className="text-lg font-mono font-bold text-zinc-500 mt-1">{(society.simulationStatus.tierD_count / 1000000).toFixed(1)}M</div>
                                <div className="text-[8px] text-zinc-500 mt-0.5">Suspended State</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* NATIONAL MEMORY */}
            <Card className="bg-zinc-950/40 border-zinc-800/60 overflow-hidden mt-6">
                <CardHeader className="pb-3 border-b border-zinc-800/50 bg-black/20">
                    <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center">
                        <History className="w-4 h-4 mr-2 text-zinc-400" />
                        National Historical Consciousness
                    </CardTitle>
                    <CardDescription className="text-xs font-mono">Past events driving current AI civilization behaviors and trust levels.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-zinc-800/50">
                        {society.nationalMemory.map((mem) => (
                            <div key={mem.id} className="p-4 flex flex-col md:flex-row justify-between md:items-start hover:bg-zinc-900/30 transition-colors">
                                <div className="mb-2 md:mb-0 max-w-2xl">
                                    <div className="flex items-center">
                                        {mem.sentiment === 'TRAUMATIC' && <div className="w-2 h-2 rounded-full bg-rose-500 mr-2 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>}
                                        {mem.sentiment === 'NEGATIVE' && <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>}
                                        {mem.sentiment === 'POSITIVE' && <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>}
                                        <h4 className={`text-sm font-bold ${mem.sentiment === 'TRAUMATIC' ? 'text-rose-400' : 'text-zinc-200'}`}>{mem.eventTitle}</h4>
                                        <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded ml-3 text-[10px] font-mono">{mem.date}</span>
                                    </div>
                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        {mem.currentEffects.map((effect, idx) => (
                                            <div key={idx} className="flex items-start text-[10px] font-mono">
                                                <GitCommit className={`w-3 h-3 mr-1 shrink-0 ${effect.includes('+') ? 'text-rose-400' : 'text-emerald-400'}`} />
                                                <span className="text-zinc-400 leading-tight">{effect}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end text-xs font-mono mt-3 md:mt-0">
                                    <div className="text-zinc-500 mb-1">Historic Impact Weight:</div>
                                    <div className={`font-bold text-lg ${mem.impactScore > 75 ? 'text-rose-400' : mem.impactScore > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>{mem.impactScore}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}
