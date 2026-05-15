'use client';

import { useAppStore } from '@/lib/store';
import { Terminal, ShieldAlert, Cpu, AlertTriangle, Coins, TrendingUp, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function ShadowMarketPage() {
    const { infra, player, interactShadowMarket } = useAppStore();
    
    // Check if formal banking is down globally or in key regions
    const isBankingDown = Object.values(infra.regions).some(r => r.nodes.BANKING.health < 20);

    const [selectedDeal, setSelectedDeal] = useState<string | null>(null);

    const handleTransaction = (dealId: string) => {
        if (interactShadowMarket) {
            interactShadowMarket(dealId);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 md:p-8 overflow-y-auto space-y-8 bg-[#0a0a0a] text-gray-300 font-mono custom-scrollbar">
            
            {/* Header */}
            <div className="border-b border-rose-900/30 pb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-[0.03] pointer-events-none">
                    <Terminal className="w-64 h-64 -mt-10 -mr-10 text-rose-500" />
                </div>
                <div>
                    <div className="flex items-center space-x-3 text-rose-500 mb-2">
                        <ShieldAlert className="w-5 h-5" />
                        <span className="text-xs uppercase tracking-widest font-bold">Encrypted P2P Network / Sector 4</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-zinc-200 tracking-widest uppercase shadow-rose-500 drop-shadow-md">
                        Shadow Economy
                    </h1>
                    <p className="text-zinc-500 mt-2 text-sm max-w-2xl">
                        Unregulated decentralised exchange. Transactions are anonymous, irreversible, and volatile.
                        This network thrives when formal infrastructural systems collapse.
                    </p>
                </div>
            </div>

            {/* Network Status */}
            <div className={cn(
                "p-4 border rounded relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center",
                isBankingDown ? "border-emerald-900/50 bg-emerald-950/20" : "border-rose-900/30 bg-rose-950/10"
            )}>
                <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-1 pb-1 border-b border-zinc-800 flex items-center">
                        <Activity className={cn("w-3 h-3 mr-2", isBankingDown ? "text-emerald-500" : "text-rose-500")} />
                        Network State
                    </h2>
                    {isBankingDown ? (
                        <p className="text-xs text-emerald-400 mt-2">
                            [OPTIMAL] Formal banking infrastructure is currently offline or degraded. Shadow liquidity is high. Fees are normalized.
                        </p>
                    ) : (
                        <p className="text-xs text-rose-400 mt-2">
                            [HIGH RISK] Formal banking is fully operational. Committing shadow transactions carries extreme investigation risks and steep latency fees.
                        </p>
                    )}
                </div>
                <div className="mt-4 md:mt-0 flex text-xs flex-col items-end">
                    <span className="text-zinc-500">Current Traceability:</span>
                    <span className={cn("font-bold tracking-wider", isBankingDown ? "text-emerald-500" : "text-rose-500")}>
                        {isBankingDown ? "0.02% (GHOST)" : "85.4% (EXPOSED)"}
                    </span>
                </div>
            </div>

            {/* Deal Board */}
            <div className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center">
                    <Cpu className="w-4 h-4 mr-2" /> Dark Pool Liquidity Deals
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* Deal 1 */}
                    <div className="p-4 border border-zinc-800 bg-zinc-900/30 rounded flex flex-col relative group hover:border-rose-500/50 transition-colors">
                        <div className="absolute top-0 right-0 px-2 py-1 bg-zinc-800 text-[9px] text-zinc-400 border-b border-l border-zinc-700 rounded-bl">
                            EXPIRES: 4h 12m
                        </div>
                        <h3 className="text-sm font-bold text-zinc-200 mb-2 mt-2">Smuggled GPU Cluster</h3>
                        <p className="text-[10px] text-zinc-500 mb-4 h-12">
                            Acquire untraceable quantum compute nodes. Significantly boosts orbital defense module, but bypasses all import tariffs.
                        </p>
                        <div className="flex justify-between text-xs mb-4">
                            <span className="text-zinc-600">Cost:</span>
                            <span className="text-red-400 font-bold">12,000 CR</span>
                        </div>
                        <div className="flex justify-between text-xs mb-6">
                            <span className="text-zinc-600">Reward:</span>
                            <span className="text-emerald-400 font-bold">+500 Components</span>
                        </div>
                        <button 
                            onClick={() => handleTransaction('deal-1')}
                            className="mt-auto w-full py-2 bg-zinc-800 hover:bg-rose-900/50 text-zinc-300 hover:text-rose-400 text-xs tracking-widest font-bold transition-colors border border-zinc-700 rounded"
                        >
                            EXECUTE TRANSACTION
                        </button>
                    </div>

                    {/* Deal 2 */}
                    <div className="p-4 border border-zinc-800 bg-zinc-900/30 rounded flex flex-col relative group hover:border-amber-500/50 transition-colors">
                        <div className="absolute top-0 right-0 px-2 py-1 bg-zinc-800 text-[9px] text-zinc-400 border-b border-l border-zinc-700 rounded-bl">
                            EXPIRES: 1h 05m
                        </div>
                        <h3 className="text-sm font-bold text-zinc-200 mb-2 mt-2">Off-the-Books Loan</h3>
                        <p className="text-[10px] text-zinc-500 mb-4 h-12">
                            Immediate liquidity injection from unregulated syndicates. No credit check, extreme compounding interest rates.
                        </p>
                        <div className="flex justify-between text-xs mb-4">
                            <span className="text-zinc-600">Receive:</span>
                            <span className="text-emerald-400 font-bold">50,000 CR</span>
                        </div>
                        <div className="flex justify-between text-xs mb-6">
                            <span className="text-zinc-600">Cost:</span>
                            <span className="text-red-400 font-bold">+75,000 Debt</span>
                        </div>
                        <button 
                            onClick={() => handleTransaction('deal-2')}
                            className="mt-auto w-full py-2 bg-zinc-800 hover:bg-amber-900/50 text-zinc-300 hover:text-amber-400 text-xs tracking-widest font-bold transition-colors border border-zinc-700 rounded"
                        >
                            ACCEPT SYNDICATE TERMS
                        </button>
                    </div>

                    {/* Deal 3 */}
                    <div className="p-4 border border-zinc-800 bg-zinc-900/30 rounded flex flex-col relative group hover:border-cyan-500/50 transition-colors">
                        <div className="absolute top-0 right-0 px-2 py-1 bg-zinc-800 text-[9px] text-zinc-400 border-b border-l border-zinc-700 rounded-bl">
                            EXPIRES: 12h 00m
                        </div>
                        <h3 className="text-sm font-bold text-zinc-200 mb-2 mt-2">Identity Scrub</h3>
                        <p className="text-[10px] text-zinc-500 mb-4 h-12">
                            Erase minor infractions and warnings from the civic employment database via backdoor access.
                        </p>
                        <div className="flex justify-between text-xs mb-4">
                            <span className="text-zinc-600">Cost:</span>
                            <span className="text-red-400 font-bold">15,000 CR</span>
                        </div>
                        <div className="flex justify-between text-xs mb-6">
                            <span className="text-zinc-600">Reward:</span>
                            <span className="text-cyan-400 font-bold">Clear HR Warnings</span>
                        </div>
                        <button 
                            onClick={() => handleTransaction('deal-3')}
                            className="mt-auto w-full py-2 bg-zinc-800 hover:bg-cyan-900/50 text-zinc-300 hover:text-cyan-400 text-xs tracking-widest font-bold transition-colors border border-zinc-700 rounded"
                        >
                            INITIATE WIPER WORM
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
}
