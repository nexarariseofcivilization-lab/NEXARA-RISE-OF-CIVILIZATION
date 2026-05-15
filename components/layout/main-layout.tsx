/**
 * The main layout component for the application, providing navigation and a responsive structure.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
    LayoutDashboard, Coins, Users, Landmark, Newspaper, Settings, 
    Globe, Radio, Bell, Search, Activity, ChevronRight, User, 
    Terminal, AlertTriangle, Menu, Map, Home, Briefcase, Car, Zap, Database,
    ChevronDown, ChevronUp, Sliders, Code, EyeOff, Brain, BookOpen, Lock, ShieldAlert
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useEffect, useState } from 'react';

const SIDEBAR_ITEMS = [
    { label: 'Command Center', href: '/', icon: LayoutDashboard, category: 'CORE', status: 'ACTIVE' },
    { label: 'Personal Ecosystem', href: '/life', icon: Activity, category: 'CORE', status: 'ACTIVE' },
    { label: 'Work & Career', href: '/career', icon: Briefcase, category: 'CORE', status: 'ACTIVE' },
    { label: 'Property & Wealth', href: '/property', icon: Home, category: 'CORE', status: 'ACTIVE' },
    { label: 'Global Economy', href: '/economy', icon: Coins, category: 'SYSTEMS', status: 'ACTIVE' },
    { label: 'Shadow Market', href: '/shadow-market', icon: Terminal, category: 'SYSTEMS', status: 'RESTRICTED' },
    { label: 'Infrastructure', href: '/infrastructure', icon: Zap, category: 'SYSTEMS', status: 'ACTIVE' },
    { label: 'Causal Engine', href: '/causality', icon: AlertTriangle, category: 'SYSTEMS', status: 'ACTIVE' },
    { label: 'Entropy & Scaling', href: '/entropy', icon: AlertTriangle, category: 'SYSTEMS', status: 'ACTIVE' },
    { label: 'Meta-Governance DSL', href: '/settings', icon: Sliders, category: 'SYSTEMS', status: 'ACTIVE' },
    { label: 'Policy Compiler', href: '/policies', icon: Code, category: 'SYSTEMS', status: 'ACTIVE' },
    { label: 'Epistemics & Memory', href: '/truth', icon: EyeOff, category: 'SYSTEMS', status: 'LOCKED' },
    { label: 'Agent Kernel', href: '/agents', icon: Brain, category: 'SYSTEMS', status: 'LOCKED' },
    { label: 'Historiography', href: '/history', icon: BookOpen, category: 'SYSTEMS', status: 'ACTIVE' },
    { label: 'Institutions', href: '/institutions', icon: Landmark, category: 'SYSTEMS', status: 'ACTIVE' },
    { label: 'National Politics', href: '/politics', icon: Landmark, category: 'SYSTEMS', status: 'ACTIVE' },
    { label: 'Society & Citizens', href: '/society', icon: Users, category: 'SYSTEMS', status: 'ACTIVE' },
    { label: 'World Map', href: '/map', icon: Map, category: 'SYSTEMS', status: 'ACTIVE' },
    { label: 'Core Civ Node', href: '/ccn', icon: Database, category: 'MEGASTRUCTURE', status: 'ENCRYPTED' },
    { label: 'AI News Network', href: '/media', icon: Newspaper, category: 'INTELLIGENCE', status: 'ACTIVE' },
    { label: 'Settings', href: '/settings', icon: Settings, category: 'USER', status: 'ACTIVE' },
];

function SidebarItem({ label, href, icon: Icon, category, status, onClick }: { label: string, href: string, icon: any, category: string, status: string, onClick?: () => void }) {
    const pathname = usePathname();
    const isActive = pathname === href;
    const isLocked = status === 'LOCKED' || status === 'ENCRYPTED' || status === 'RESTRICTED';
    
    return (
        <Link 
            href={isLocked ? '#' : href}
            onClick={onClick}
            className={cn(
                "group flex items-center justify-between px-3 py-2 rounded-none text-[11px] font-mono transition-all relative border-l-2",
                isActive 
                    ? "bg-zinc-900/50 text-emerald-400 border-emerald-500" 
                    : isLocked
                        ? "text-zinc-600 border-transparent hover:bg-zinc-950 cursor-not-allowed opacity-50"
                        : "text-zinc-400 hover:bg-zinc-900/30 hover:text-zinc-200 border-transparent hover:border-zinc-700"
            )}
        >
            <div className="flex items-center space-x-3">
                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-emerald-500 animate-pulse" : "text-zinc-500")} />
                <span className={cn("tracking-wide uppercase", isLocked && "line-through decoration-zinc-700")}>{label}</span>
            </div>
            {isLocked && <Lock className="w-3 h-3 text-zinc-600" />}
        </Link>
    );
}

export function MainLayout({ children }: { children: React.ReactNode }) {
    const globalTime = useAppStore(state => state.globalTime);
    const logs = useAppStore(state => state.logs);
    const tickGlobalTime = useAppStore(state => state.tickGlobalTime);
    const player = useAppStore(state => state.player);
    const economy = useAppStore(state => state.economy);

    const [mounted, setMounted] = useState(false);
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setMounted(true);
        
        const savedPanelState = localStorage.getItem('rightPanelOpen');
        if (savedPanelState !== null) {
            try {
                setRightPanelOpen(JSON.parse(savedPanelState));
            } catch (e) {
                // Ignore parse errors
            }
        }
        
        // This is the Core Simulation Engine Loop
        // Runs 1 simulation minute every real 1 second
        const simInterval = setInterval(() => {
            tickGlobalTime();
        }, 1000);

        return () => clearInterval(simInterval);
    }, [tickGlobalTime]);

    const toggleRightPanel = () => {
        setRightPanelOpen(prev => {
            const nextState = !prev;
            localStorage.setItem('rightPanelOpen', JSON.stringify(nextState));
            return nextState;
        });
    };

    const toggleCategory = (category: string) => {
        setCollapsedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const categories = Array.from(new Set(SIDEBAR_ITEMS.map(i => i.category)));

    const formatGlobalDate = (date: Date) => {
        return date.toISOString().split('T')[0] + " " + 
               date.getHours().toString().padStart(2, '0') + ":" + 
               date.getMinutes().toString().padStart(2, '0');
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-black text-gray-300 font-sans selection:bg-emerald-500/30">
            {/* Top Bar - High Density */}
            <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-20">
                <div className="flex items-center space-x-4 md:space-x-8">
                    <button 
                        className="md:hidden p-1 rounded text-zinc-400 hover:text-white"
                        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex items-center space-x-3 md:border-r md:border-zinc-800 md:pr-8">
                        <div className="flex items-center justify-center font-bold font-mono tracking-widest text-emerald-500 text-lg sm:text-xl relative group">
                            <span className="opacity-70 group-hover:opacity-100 transition-opacity">[</span>
                            <span className="mx-1">NXR</span>
                            <span className="opacity-70 group-hover:opacity-100 transition-opacity">]</span>
                            <div className="absolute -right-2 top-0 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:block"></div>
                        </div>
                        <span className="text-zinc-600 font-mono text-[10px] sm:text-[11px] hidden sm:block tracking-widest uppercase">
                            {'//'} KERNEL v1.0.4
                        </span>
                    </div>
                    
                    {/* Command Search */}
                    <div className="hidden md:flex items-center space-x-2 bg-zinc-950 border border-zinc-800 rounded px-3 py-1 w-72 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
                        <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                        <input 
                            type="text" 
                            placeholder="Execute command..." 
                            className="bg-transparent border-none outline-none text-xs w-full text-zinc-300 placeholder:text-zinc-600 font-mono"
                        />
                        <div className="flex items-center space-x-1 opacity-50">
                            <kbd className="bg-zinc-800 px-1 rounded text-[9px] font-mono text-zinc-400">⌘K</kbd>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2 md:space-x-6 text-xs uppercase tracking-widest text-zinc-500 font-mono">
                    <div className="hidden xl:flex items-center space-x-6 border-r border-zinc-800 pr-6">
                        <div className="flex items-center space-x-2">
                            <span className="text-zinc-600">POPULATION:</span>
                            <span className="text-zinc-300 font-medium">278.4M</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-zinc-600">STABILITY:</span>
                            <span className="text-emerald-500 font-medium flex items-center">
                                78.4%
                                <Activity className="w-3 h-3 ml-1" />
                            </span>
                        </div>
                        {mounted && globalTime && (
                            <div className="flex items-center space-x-2 bg-zinc-900/50 px-2 py-0.5 rounded border border-zinc-800">
                                <span className="text-emerald-500 animate-pulse text-[14px] leading-none mb-0.5">●</span>
                                <span className="text-zinc-300 tracking-wider">
                                    CYCLE {formatGlobalDate(globalTime)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-4">
                        <button className="text-zinc-500 hover:text-amber-400 transition-colors relative p-1">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="absolute 1 top-0 right-0 w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                        </button>
                        <div className="flex items-center space-x-3 bg-zinc-900/40 border border-zinc-800/80 px-2 py-1 rounded">
                            <div className="w-6 h-6 rounded-sm bg-red-950 border border-red-900 flex items-center justify-center text-red-500 shadow-[0_0_10px_rgba(220,38,38,0.2)]">
                                <ShieldAlert className="w-3.5 h-3.5" />
                            </div>
                            <div className="hidden sm:flex flex-col items-start leading-none py-0.5">
                                <span className="text-[10px] text-red-400 font-bold tracking-widest">AUTH: OMEGA</span>
                                <span className="text-[9px] text-zinc-500 tracking-wider mt-0.5">ROOT OVERRIDE</span>
                            </div>
                        </div>
                        <button 
                            onClick={toggleRightPanel}
                            className={cn("hidden lg:block p-1.5 rounded transition-colors", rightPanelOpen ? "text-emerald-500 bg-zinc-900/50" : "text-zinc-500 hover:text-white")}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Mobile Sidebar Overlay */}
                {mobileSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/80 z-40 md:hidden" 
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                )}
                
                {/* Left Sidebar Navigation */}
                <aside className={cn(
                    "w-56 border-r border-zinc-800 bg-zinc-950/95 md:bg-zinc-950/80 flex flex-col shrink-0 overflow-y-auto custom-scrollbar z-50 absolute md:static h-full transition-transform duration-300 md:translate-x-0 inset-y-0 left-0",
                    mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    <div className="p-4 space-y-4">
                        {categories.map(category => {
                            const isCollapsed = collapsedCategories[category];
                            return (
                                <div key={category} className="mb-4">
                                    <button 
                                        onClick={() => toggleCategory(category)}
                                        className="w-full flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2 px-2 py-1 hover:text-zinc-300 transition-colors bg-zinc-900/20"
                                    >
                                        <span>{'// '} {category}</span>
                                        {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                                    </button>
                                    {!isCollapsed && (
                                        <nav className="space-y-0.5">
                                            {SIDEBAR_ITEMS.filter(i => i.category === category).map((item) => (
                                                <SidebarItem 
                                                    key={item.href}
                                                    label={item.label}
                                                    href={item.href}
                                                    icon={item.icon}
                                                    category={item.category}
                                                    status={item.status}
                                                    onClick={() => setMobileSidebarOpen(false)}
                                                />
                                            ))}
                                        </nav>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 h-full overflow-y-auto bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black custom-scrollbar">
                    <div className="h-full p-4 lg:p-6 max-w-[1600px] mx-auto min-w-0">
                        {children}
                    </div>
                </main>

                {/* Right Analytics Sidebar - Realtime Data */}
                {rightPanelOpen && (
                    <aside className="w-80 border-l border-zinc-800/80 bg-zinc-950/95 hidden lg:flex flex-col shrink-0 overflow-y-auto custom-scrollbar z-10 font-mono shadow-2xl relative">
                        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/10 via-transparent to-transparent"></div>
                        <div className="p-4 border-b border-zinc-800/80 sticky top-0 bg-zinc-950/95 backdrop-blur-md z-10">
                            <h3 className="text-[11px] uppercase tracking-widest font-bold text-zinc-400 flex items-center">
                                <Radio className="w-3.5 h-3.5 mr-2 text-emerald-500 animate-pulse" />
                                TELEMETRY STREAM
                            </h3>
                        </div>
                        <div className="p-4 space-y-6 relative z-10">
                            {/* MACRO ALERTS */}
                            <div className="space-y-2">
                                <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-2 border-b border-zinc-800/50 pb-1">MACRO EVENTS</div>
                                <div className="bg-red-950/20 border border-red-900/50 rounded p-3 relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-0.5 h-full bg-red-500 group-hover:shadow-[0_0_8px_rgba(239,68,68,0.8)] transition-shadow"></div>
                                    <div className="flex items-start space-x-3">
                                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                        <div className="w-full">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="text-[11px] font-bold text-red-400 uppercase tracking-wide">Sector 4 Unrest</h4>
                                                <span className="text-[9px] text-red-500/70 font-mono">SEV-1</span>
                                            </div>
                                            <p className="text-[10px] text-red-200/60 leading-relaxed font-sans cursor-pointer hover:text-red-200">
                                                Crime rate spiked by 2.4% in the last hour. Public sentiment dropping. Projected GDP impact: -0.3%.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* MICRO FEED */}
                            <div className="space-y-2">
                                <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-3 border-b border-zinc-800/50 pb-1">MICRO FEED</div>
                                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[5px] before:translate-x-0 before:h-full before:w-[1px] before:bg-zinc-800/50">
                                    {logs.map((log, i) => (
                                        <div key={i} className="relative flex items-start group">
                                            <div className={`flex items-center justify-center w-3 h-3 rounded-full border bg-zinc-950 z-10 shrink-0 mt-1 mr-3 transition-colors ${log.type === 'error' ? 'border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' : log.type === 'warn' ? 'border-amber-500' : 'border-zinc-700'}`}>
                                                <div className={`w-1 h-1 rounded-full ${log.type === 'error' ? 'bg-red-500' : log.type === 'warn' ? 'bg-amber-500' : 'bg-zinc-600'}`} />
                                            </div>
                                            <div className="w-full">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className={cn("text-[9px] font-bold uppercase tracking-wider", 
                                                        log.type === 'error' ? 'text-red-400' : 
                                                        log.type === 'warn' ? 'text-amber-400' : 'text-zinc-500'
                                                    )}>{log.type} {'// SYSTEM'}</span>
                                                    <time className="text-[9px] text-zinc-600 font-mono">{log.time}</time>
                                                </div>
                                                <h5 className={cn("text-[11px] mb-0.5 font-sans", log.type === 'error' ? 'text-red-200' : 'text-zinc-300')}>{log.msg.substring(0, 30)}...</h5>
                                                <p className="text-[10px] text-zinc-500 font-sans cursor-pointer hover:text-zinc-300 transition-colors" title={log.msg}>{log.msg}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                )}
            </div>
            
            {/* Bottom Ticker */}
            <footer className="h-8 border-t border-zinc-800/80 bg-zinc-950 flex items-center px-4 overflow-hidden shrink-0 z-20 text-[10px] font-mono whitespace-nowrap shadow-[0_-5px_15px_-10px_rgba(0,0,0,0.5)]">
                <div className="text-emerald-500 font-bold tracking-widest flex items-center mr-4 border-r border-zinc-800/80 pr-4 shrink-0 bg-zinc-950 z-10 w-[120px]">
                    <Sliders className="w-3.5 h-3.5 mr-2" />
                    LIVE DATA
                </div>
                <div className="flex items-center space-x-8 animate-ticker text-zinc-400 opacity-90">
                    <span className="flex items-center"><span className="text-zinc-600 mr-2 tracking-widest">POLL</span> 42.5% <span className="text-red-500 ml-2">▼ 1.5%</span></span>
                    <span className="flex items-center"><span className="text-zinc-600 mr-2 tracking-widest">GDP</span> ${economy.gdp.toFixed(2)}T <span className="text-emerald-500 ml-2">▲ 0.2%</span></span>
                    <span className="flex items-center"><span className="text-zinc-600 mr-2 tracking-widest">INFLATION</span> <span className={economy.global_inflation > 5 ? "text-red-400 ml-1" : "text-emerald-400 ml-1"}>{economy.global_inflation.toFixed(2)}%</span></span>
                    <span className="flex items-center"><span className="text-zinc-600 mr-2 tracking-widest">UNEMPLOYMENT</span> <span className="text-amber-400">{economy.global_unemployment.toFixed(2)}%</span></span>
                    <span className="flex items-center"><span className="text-zinc-600 mr-2 tracking-widest">GRID LOAD</span> <span className="text-amber-400 ml-1">88.2%</span></span>
                </div>
            </footer>
        </div>
    );
}


