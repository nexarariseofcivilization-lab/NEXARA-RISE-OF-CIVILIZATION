'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, Users, Vote, Scale, TrendingDown, Clock, ShieldAlert, FileText, UserCog, AlertCircle, Building2, TrendingUp, History, User2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export default function PoliticsDashboard() {
    const [mounted, setMounted] = useState(false);
    
    const economy = useAppStore(state => state.economy);
    const infra = useAppStore(state => state.infra);
    const politics = useAppStore(state => state.politics);
    
    // Calculate a dynamic approval rating based on economic & infrastructure health
    const baseApproval = 60;
    const economicPenalty = (economy.global_inflation * 1.5) + (economy.global_unemployment * 1.2);
    const capitolNodes = infra.regions['DKI_JAKARTA'].nodes;
    const infraPenalty = (100 - capitolNodes.POWER.health) * 0.1 + (100 - capitolNodes.ISP.health) * 0.1;
    const dynamicApproval = Math.max(0, Math.min(100, baseApproval - economicPenalty - infraPenalty));
    
    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-zinc-800 pb-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white uppercase font-sans flex items-center">
                        <Landmark className="w-8 h-8 mr-3 text-purple-500" />
                        Civilization Governance
                    </h1>
                    <p className="text-zinc-400 mt-2 font-mono text-sm max-w-2xl">
                        Operational political engine. Institutional bureaucracy, procedural legitimacy, and historical memory. Power is negotiated, not assumed.
                    </p>
                </div>
            </div>

            {/* Top Level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-zinc-950/50 border-zinc-800/80 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Public Opinion</CardTitle>
                        <Vote className="w-4 h-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-mono font-bold ${politics.publicOpinion < 40 ? 'text-rose-400' : politics.publicOpinion < 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {politics.publicOpinion.toFixed(1)}%
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-2 flex items-center justify-between">
                            <span className="flex items-center">
                                {politics.publicOpinion < 40 && <TrendingDown className="w-3 h-3 text-rose-500 mr-1" />}
                                {politics.publicOpinion >= 40 && politics.publicOpinion < 60 && <TrendingUp className="w-3 h-3 text-amber-500 mr-1" />}
                                {politics.publicOpinion >= 60 && <TrendingUp className="w-3 h-3 text-emerald-500 mr-1" />}
                                Base Sentiment
                            </span>
                            <span className={`font-mono ${dynamicApproval < 40 ? 'text-rose-500/70' : 'text-zinc-500'}`} title="Presidential Approval Based on Economy & Infra">
                                Exec. Appvl: {dynamicApproval.toFixed(1)}%
                            </span>
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-950/50 border-zinc-800/80 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Gov. Doctrine</CardTitle>
                        <Building2 className="w-4 h-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-purple-400 tracking-tight leading-tight mt-1">{politics.government.doctrine}</div>
                        <p className="text-[10px] text-zinc-500 mt-2 flex items-center">
                            Current Bureaucratic Model
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-950/50 border-zinc-800/80 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Budget Status</CardTitle>
                        <Scale className="w-4 h-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-mono font-bold text-amber-400 mt-1">{politics.budget.activeBudget ? 'ACTIVE' : 'DEADLOCKED'}</div>
                        <p className="text-[10px] text-zinc-500 mt-2 flex items-center">
                            Total Approved: <span className="ml-1 text-zinc-400">${politics.budget.activeBudget?.totalAmount || 0}B</span>
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-950/50 border-zinc-800/80 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Regime Stability</CardTitle>
                        <ShieldAlert className="w-4 h-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-mono font-bold ${politics.government.stability < 40 ? 'text-rose-400' : politics.government.stability < 60 ? 'text-amber-400' : 'text-indigo-400'}`}>
                            {politics.government.stability.toFixed(1)}%
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-2 flex items-center">
                            Institutional Resilience
                        </p>
                    </CardContent>
                </Card>
            </div>

            {useAppStore.getState().activeCrises.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight text-white border-b border-rose-900/50 pb-2 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 text-rose-500" />
                        Active System Crises
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {useAppStore.getState().activeCrises.map(crisis => (
                            <Card key={crisis.id} className="bg-rose-950/20 border-rose-900/50 backdrop-blur">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-sm font-bold text-rose-200">{crisis.title}</CardTitle>
                                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-900/50 text-rose-400 uppercase">{crisis.category}</span>
                                    </div>
                                    <CardDescription className="text-xs text-rose-300/70 mt-1">Severity: Level {crisis.severity}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-zinc-300">{crisis.description}</p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {crisis.options.map(opt => (
                                            <button 
                                                key={opt.id}
                                                onClick={() => useAppStore.getState().resolveCrisis(crisis.id, opt.id)}
                                                className={`text-[10px] uppercase font-mono font-bold px-3 py-1.5 rounded transition ${
                                                    opt.style === 'danger' 
                                                    ? 'bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-800' 
                                                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-700'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ROLE HIERARCHY */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight text-zinc-200 border-b border-zinc-800 pb-2 flex items-center">
                        <UserCog className="w-5 h-5 mr-2 text-zinc-500" />
                        Government Appointments
                    </h2>
                    <div className="grid gap-3">
                        {politics.government.roles.map(role => (
                            <div key={role.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">{role.title}</div>
                                        <div className="text-sm font-bold text-zinc-300">{role.holderName}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-zinc-500 font-mono mb-1">Influence</div>
                                        <div className="text-sm font-bold font-mono text-cyan-400">{role.influence}%</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <div className="text-[9px] text-zinc-500 uppercase font-mono">Loyalty</div>
                                        <div className="w-full bg-zinc-900 h-1.5 mt-1 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500" style={{ width: `${role.loyalty}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-zinc-500 uppercase font-mono">Competence</div>
                                        <div className="w-full bg-zinc-900 h-1.5 mt-1 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500" style={{ width: `${role.competence}%` }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-zinc-800/50 flex justify-end gap-2">
                                    <button className="text-[10px] uppercase font-mono font-bold bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 px-3 py-1.5 rounded transition">
                                        Communicate
                                    </button>
                                    <button className="text-[10px] uppercase font-mono font-bold bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-400 px-3 py-1.5 rounded transition shadow shadow-indigo-900/20">
                                        Assign Task
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* BILLS */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight text-zinc-200 border-b border-zinc-800 pb-2 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-zinc-500" />
                        Pending Bills
                    </h2>
                    <Card className="bg-zinc-950 border-zinc-800">
                        <CardContent className="p-5">
                            {politics.budget.pendingBudget && (
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <div className="text-2xl font-mono font-bold text-zinc-200">${politics.budget.pendingBudget?.totalAmount.toFixed(1) || 0}B</div>
                                    <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">Pending Proposal Rev {politics.budget.pendingBudget?.revNumber || 0}</div>
                                </div>
                                <div className="px-3 py-1 bg-amber-950/30 border border-amber-800/50 text-amber-500 text-xs font-mono font-bold rounded">
                                    {politics.budget.pendingBudget?.status || 'NO DRAFT'}
                                </div>
                            </div>
                            )}

                            <div className="relative mt-8">
                                <div className="absolute left-3 top-2 bottom-2 w-px bg-zinc-800"></div>
                                <div className="space-y-4 relative">
                                    {politics.bills.map(bill => (
                                        <div key={bill.id} className="flex items-start">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 shrink-0 z-10 ${
                                                bill.status === 'PASSED_WAITING_SIGN' ? 'bg-amber-950 border-amber-500 animate-pulse' : 'bg-emerald-950 border-emerald-500'
                                            }`}>
                                                <div className={`w-2 h-2 rounded-full ${bill.status === 'PASSED_WAITING_SIGN' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="text-sm font-bold text-zinc-300">{bill.name}</div>
                                                        <div className="text-xs text-zinc-500">{bill.id}</div>
                                                    </div>
                                                    <div className="text-[10px] font-mono text-zinc-500 uppercase">Support: <span className="text-zinc-300">{(bill as any).supportLevel || bill.support}%</span></div>
                                                </div>
                                                <div className="mt-3 flex gap-2">
                                                    <button 
                                                        className="text-[10px] uppercase font-mono font-bold bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 px-3 py-1.5 rounded transition shadow shadow-emerald-900/20 disabled:opacity-50 flex items-center justify-center gap-1"
                                                        onClick={() => useAppStore.getState().supportBill(bill.id)}
                                                    >
                                                        Support <span className="text-emerald-200">+{Math.round((bill as any).supportLevel || bill.support)}%</span>
                                                    </button>
                                                    <button 
                                                        className="text-[10px] uppercase font-mono font-bold bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-400 px-3 py-1.5 rounded transition shadow shadow-rose-900/20 disabled:opacity-50 flex items-center justify-center gap-1"
                                                        onClick={() => useAppStore.getState().opposeBill(bill.id)}
                                                    >
                                                        Oppose <span className="text-rose-200">-{Math.round((bill as any).supportLevel || bill.support)}%</span>
                                                    </button>
                                                    {bill.status === 'PASSED_WAITING_SIGN' && (
                                                        <button 
                                                            onClick={() => useAppStore.getState().signBill(bill.id)}
                                                            className="text-[10px] uppercase font-mono font-bold bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-400 px-3 py-1.5 rounded transition shadow shadow-amber-900/20"
                                                        >
                                                            Sign Bill
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {politics.bills.length === 0 && (
                                        <div className="text-xs text-zinc-500 italic p-4 text-center">No active bills in circulation.</div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                {/* PARTIES & IDEOLOGY */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight text-zinc-200 border-b border-zinc-800 pb-2 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-zinc-500" />
                        Party Platforms & Ideology
                    </h2>
                    <div className="grid gap-4">
                        {politics.parties.map(party => (
                            <div key={party.id} className="p-4 bg-zinc-950/80 border border-zinc-800 rounded relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <Users className="w-16 h-16" />
                                </div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <div className="text-sm font-bold text-zinc-200">{party.name}</div>
                                        <div className="text-[10px] text-zinc-400 font-mono mt-1">{party.ideology}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-mono font-bold text-zinc-300">{party.influence}%</div>
                                        <div className="text-[9px] text-zinc-600 uppercase font-mono">Influence</div>
                                    </div>
                                </div>
                                <div className="mt-3 bg-zinc-900/50 rounded p-3">
                                    <div className="text-[9px] text-zinc-500 uppercase font-mono mb-2">Ideological Leanings</div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-[10px] font-mono">
                                            <span className="text-amber-500">Left</span>
                                            <div className="flex-1 mx-2 h-1 bg-zinc-800 rounded-full relative">
                                                {/* Left to right spectrum */}
                                                <div className="absolute top-1/2 -mt-1.5 w-1 h-3 bg-zinc-400 rounded-sm shadow-[0_0_5px_rgba(255,255,255,0.5)]" 
                                                     style={{ left: `${party.ideology === 'PROGRESSIVE' ? 20 : party.ideology === 'CONSERVATIVE' ? 80 : party.ideology === 'NATIONALIST' ? 70 : 50}%` }}></div>
                                            </div>
                                            <span className="text-indigo-500">Right</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] font-mono">
                                            <span className="text-emerald-500">Auth</span>
                                            <div className="flex-1 mx-2 h-1 bg-zinc-800 rounded-full relative">
                                                <div className="absolute top-1/2 -mt-1.5 w-1 h-3 bg-zinc-400 rounded-sm shadow-[0_0_5px_rgba(255,255,255,0.5)]" 
                                                     style={{ left: `${party.ideology === 'NATIONALIST' ? 80 : party.ideology === 'PROGRESSIVE' ? 30 : 50}%` }}></div>
                                            </div>
                                            <span className="text-sky-500">Lib</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 relative z-10">
                                    <div className="text-[9px] text-zinc-500 uppercase font-mono mb-2">Active Policy Demands</div>
                                    <div className="flex flex-wrap gap-2">
                                        {party.activePolicies.map((pol, idx) => (
                                            <span key={idx} className="text-[10px] px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded">
                                                {pol}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ELECTIONS AND POLLING */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight text-zinc-200 border-b border-zinc-800 pb-2 flex items-center">
                        <Vote className="w-5 h-5 mr-2 text-zinc-500" />
                        Election Analytics & Candidates
                    </h2>
                    
                    <div className="grid gap-4">
                        {politics.elections.isActive && (
                            <div className="bg-amber-950/20 border border-amber-900/50 p-4 rounded text-center mb-4">
                                <div className="text-amber-500 font-bold mb-1 tracking-wider uppercase flex items-center justify-center">
                                    <Vote className="w-5 h-5 mr-2 animate-pulse" />
                                    Active Election Cycle
                                </div>
                                <div className="text-xs text-zinc-400 font-mono">
                                    Polls close in 48 hours. Influence and funding are permitted.
                                </div>
                            </div>
                        )}
                        {politics.elections.candidates.map(candidate => {
                            const party = politics.parties.find(p => p.id === candidate.partyId);
                            const poll = politics.elections.polling.find(p => p.candidateId === candidate.id);
                            return (
                                <Card key={candidate.id} className="bg-zinc-950 border-zinc-800">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start border-b border-zinc-800/50 pb-3 mb-3">
                                            <div className="flex items-start space-x-3">
                                                <div className="p-2 bg-zinc-900 rounded border border-zinc-800 mt-1">
                                                    <User2 className="w-6 h-6 text-zinc-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-zinc-200">{candidate.name}</h3>
                                                    <p className="text-[10px] text-zinc-500 font-mono">{party?.name}</p>
                                                    <p className="text-[10px] text-indigo-400 font-mono mt-1 w-full line-clamp-1 italic">&quot;{candidate.historicalReputation}&quot;</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-mono font-bold text-emerald-400">{poll?.percentage.toFixed(1)}%</div>
                                                <div className="text-[10px] flex items-center justify-end font-mono mt-1">
                                                    {poll && poll.trend > 0 ? <span className="text-emerald-500 flex items-center"><TrendingUp className="w-3 h-3 mr-0.5"/>+{poll.trend}</span> : 
                                                     poll && poll.trend < 0 ? <span className="text-rose-500 flex items-center"><TrendingDown className="w-3 h-3 mr-0.5"/>{poll.trend}</span> : 
                                                     <span className="text-zinc-500">0.0</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-xs text-zinc-400 leading-relaxed">
                                                {candidate.bio}
                                            </p>
                                            
                                            {candidate.scandals.length > 0 && (
                                                <div className="bg-rose-950/20 border border-rose-900/50 p-2 rounded">
                                                    <div className="text-[9px] text-rose-500 uppercase font-mono font-bold mb-1 flex items-center"><History className="w-3 h-3 mr-1" /> National Memory Archive</div>
                                                    <ul className="list-disc list-inside text-[10px] text-rose-300/80">
                                                        {candidate.scandals.map((scandal, i) => <li key={i}>{scandal}</li>)}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center pt-2">
                                                <div className="flex gap-2">
                                                    {candidate.traits.map((trait, i) => (
                                                        <span key={i} className="text-[9px] uppercase font-mono bg-zinc-900 border border-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">
                                                            {trait}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="text-[10px] font-mono text-zinc-500 flex items-center" title="Public Trust Score">
                                                    <ShieldAlert className="w-3 h-3 mr-1 text-amber-500/70" /> Trust: {candidate.publicTrust}%
                                                </div>
                                            </div>
                                            {politics.elections.isActive && (
                                                <div className="pt-3 mt-3 border-t border-zinc-800/50 flex justify-end gap-2">
                                                    <button 
                                                        className="text-[10px] uppercase font-mono font-bold bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 px-3 py-1.5 rounded transition"
                                                        onClick={() => useAppStore.getState().smearCampaign(candidate.id)}
                                                    >
                                                        Smear Campaign
                                                    </button>
                                                    <button 
                                                        className="text-[10px] uppercase font-mono font-bold bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-400 px-3 py-1.5 rounded transition shadow shadow-indigo-900/20 disabled:opacity-50"
                                                        onClick={() => useAppStore.getState().fundCampaign(candidate.id)}
                                                        disabled={useAppStore.getState().player.cash < 5000}
                                                    >
                                                        Fund Campaign ($5k)
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                    <div className="mt-4 p-3 bg-zinc-900/40 border-l-2 border-amber-500 text-xs text-zinc-400 flex items-start">
                        <AlertCircle className="w-4 h-4 text-amber-500 mr-2 shrink-0 mt-0.5" />
                        <p>Polling data operates with a systemic noise margin of ±3.4%. Regional distortions and undecided voter panic states may suddenly invert trajectories just before election day.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

