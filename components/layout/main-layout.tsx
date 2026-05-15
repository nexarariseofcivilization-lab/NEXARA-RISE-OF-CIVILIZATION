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
    ChevronDown, ChevronUp, Sliders, Code, EyeOff, Brain, BookOpen
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useEffect, useState } from 'react';

const SIDEBAR_ITEMS = [
    { label: 'Command Center', href: '/', icon: LayoutDashboard, category: 'CORE' },
    { label: 'Personal Ecosystem', href: '/life', icon: Activity, category: 'CORE' },
    { label: 'Work & Career', href: '/career', icon: Briefcase, category: 'CORE' },
    { label: 'Property & Wealth', href: '/property', icon: Home, category: 'CORE' },
    { label: 'Global Economy', href: '/economy', icon: Coins, category: 'SYSTEMS' },
    { label: 'Shadow Market', href: '/shadow-market', icon: Terminal, category: 'SYSTEMS' },
    { label: 'Infrastructure', href: '/infrastructure', icon: Zap, category: 'SYSTEMS' },
    { label: 'Causal Engine', href: '/causality', icon: AlertTriangle, category: 'SYSTEMS' },
    { label: 'Entropy & Scaling', href: '/entropy', icon: AlertTriangle, category: 'SYSTEMS' },
    { label: 'Meta-Governance DSL', href: '/settings', icon: Sliders, category: 'SYSTEMS' },
    { label: 'Policy Compiler', href: '/policies', icon: Code, category: 'SYSTEMS' },
    { label: 'Epistemics & Memory', href: '/truth', icon: EyeOff, category: 'SYSTEMS' },
    { label: 'Agent Kernel', href: '/agents', icon: Brain, category: 'SYSTEMS' },
    { label: 'Historiography', href: '/history', icon: BookOpen, category: 'SYSTEMS' },
    { label: 'Institutions', href: '/institutions', icon: Landmark, category: 'SYSTEMS' },
    { label: 'National Politics', href: '/politics', icon: Landmark, category: 'SYSTEMS' },
    { label: 'Society & Citizens', href: '/society', icon: Users, category: 'SYSTEMS' },
    { label: 'World Map', href: '/map', icon: Map, category: 'SYSTEMS' },
    { label: 'Core Civ Node', href: '/ccn', icon: Database, category: 'MEGASTRUCTURE' },
    { label: 'AI News Network', href: '/media', icon: Newspaper, category: 'INTELLIGENCE' },
    { label: 'Settings', href: '/settings', icon: Settings, category: 'USER' },
];

function SidebarItem({ label, href, icon: Icon, category, onClick }: { label: string, href: string, icon: any, category: string, onClick?: () => void }) {
    const pathname = usePathname();
    const isActive = pathname === href;
    
    return (
        <Link 
            href={href}
            onClick={onClick}
            className={cn(
                "group flex items-center space-x-3 px-3 py-2 rounded-md text-xs transition-all relative",
                isActive 
                    ? "bg-zinc-900 text-emerald-400 font-medium border border-zinc-800/50" 
                    : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 border border-transparent"
            )}
        >
            {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-emerald-500 rounded-r-full" />}
            <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-emerald-500" : "text-zinc-500 group-hover:text-zinc-300")} />
            <span>{label}</span>
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
            <header className="h-12 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-20">
                <div className="flex items-center space-x-2 md:space-x-6">
                    <button 
                        className="md:hidden p-1 rounded text-zinc-400 hover:text-white"
                        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex items-center space-x-2 md:space-x-3 md:border-r md:border-zinc-800 md:pr-6">
                        <Radio className="w-4 h-4 text-emerald-500 animate-pulse hidden sm:block" />
                        <span className="font-bold tracking-widest text-emerald-500 text-sm hidden sm:block">NEXARA_OS</span>
                        <span className="text-emerald-500 font-bold sm:hidden">NX</span>
                        <span className="text-zinc-600 font-mono text-[10px] sm:text-xs">v1.0.4a</span>
                    </div>
                    
                    {/* Command Search */}
                    <div className="hidden md:flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 w-64">
                        <Search className="w-3.5 h-3.5 text-zinc-500" />
                        <input 
                            type="text" 
                            placeholder="Run command or search..." 
                            className="bg-transparent border-none outline-none text-xs w-full text-zinc-300 placeholder:text-zinc-600"
                        />
                        <div className="flex items-center space-x-1">
                            <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-400">⌘</kbd>
                            <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-400">K</kbd>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2 md:space-x-6 text-xs uppercase tracking-widest text-zinc-500">
                    <div className="hidden lg:flex items-center space-x-4 border-r border-zinc-800 pr-6">
                        <div className="flex items-center space-x-2">
                            <span>Status:</span>
                            <span className="text-emerald-500 font-bold flex items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></div>
                                SECURE
                            </span>
                        </div>
                        {mounted && globalTime && (
                            <div className="flex items-center space-x-2">
                                <span>Cycle:</span>
                                <span className="text-zinc-300 font-mono">{formatGlobalDate(globalTime)}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-4">
                        <button className="text-zinc-400 hover:text-white transition-colors relative">
                            <Bell className="w-4 h-4" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="flex items-center space-x-2 cursor-pointer hover:bg-zinc-900 pr-2 md:px-2 py-1 rounded transition-colors border border-transparent hover:border-zinc-800">
                            <div className="w-6 h-6 rounded bg-emerald-900 border border-emerald-700 flex items-center justify-center text-emerald-400">
                                <User className="w-3.5 h-3.5" />
                            </div>
                            <div className="hidden sm:flex flex-col items-start leading-none">
                                <span className="text-[10px] text-zinc-300 font-bold">ADMIN ROOT</span>
                                <span className="text-[9px] text-zinc-500">Presidential access</span>
                            </div>
                        </div>
                        <button 
                            onClick={toggleRightPanel}
                            className={cn("hidden xl:block p-1.5 rounded transition-colors", rightPanelOpen ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white")}
                        >
                            <Menu className="w-4 h-4" />
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
                                <div key={category} className="mb-2">
                                    <button 
                                        onClick={() => toggleCategory(category)}
                                        className="w-full flex items-center justify-between text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-1 px-2 py-1 hover:text-zinc-300 transition-colors"
                                    >
                                        <span>{category}</span>
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
                    <aside className="w-72 border-l border-zinc-800 bg-zinc-950/80 hidden xl:flex flex-col shrink-0 overflow-y-auto custom-scrollbar z-10 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.5)]">
                        <div className="p-4 border-b border-zinc-800 sticky top-0 bg-zinc-950/90 backdrop-blur-sm z-10">
                            <h3 className="text-xs uppercase tracking-widest font-bold text-zinc-300 flex items-center">
                                <Activity className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                                Realtime Stream
                            </h3>
                        </div>
                        <div className="p-4 space-y-4">
                            {/* Alert Box */}
                            <div className="bg-red-950/20 border border-red-900/30 p-3 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-bold text-red-400 uppercase">Sector 4 Unrest</h4>
                                        <p className="text-[11px] text-zinc-400 mt-1">Crime rate spiked by 2.4% in the last hour. Public sentiment dropping.</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Live Feed */}
                            <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[9px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
                                {logs.map((log, i) => (
                                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className={`flex items-center justify-center w-5 h-5 rounded-full border border-zinc-700 bg-zinc-900 z-10 mx-auto shrink-0 transition-colors ${log.type === 'error' ? 'text-red-500 border-red-500' : log.type === 'warn' ? 'text-amber-500 border-amber-500' : 'text-emerald-500 border-emerald-500'}`}>
                                            <div className="w-1.5 h-1.5 bg-current rounded-full" />
                                        </div>
                                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/40 transition-colors">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={cn("text-[10px] font-bold uppercase", 
                                                    log.type === 'error' ? 'text-red-500' : 
                                                    log.type === 'warn' ? 'text-amber-500' : 'text-emerald-500'
                                                )}>{log.type}</span>
                                                <time className="text-[10px] text-zinc-500 font-mono">{log.time}</time>
                                            </div>
                                            <h5 className="text-[11px] font-semibold text-zinc-200">System Log</h5>
                                            <p className="text-[10px] text-zinc-400 mt-0.5 truncate" title={log.msg}>{log.msg}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                )}
            </div>
            
            {/* Bottom Ticker */}
            <footer className="h-8 border-t border-zinc-800 bg-zinc-950 flex items-center px-4 overflow-hidden shrink-0 z-20 text-[10px] font-mono whitespace-nowrap">
                <div className="text-zinc-500 flex items-center mr-4 border-r border-zinc-800 pr-4 shrink-0">
                    <Activity className="w-3 h-3 mr-1" />
                    TICKER
                </div>
                <div className="flex items-center space-x-6 animate-ticker text-zinc-400">
                    <span className="flex items-center"><span className="text-zinc-500 mr-2">POLL</span> 42.5% <span className="text-red-500 ml-2">▼ 1.5%</span></span>
                    <span className="flex items-center"><span className="text-zinc-500 mr-2">GDP</span> ${economy.gdp.toFixed(2)}T</span>
                    <span className="flex items-center"><span className="text-zinc-500 mr-2">INFLATION</span> {economy.global_inflation.toFixed(2)}%</span>
                    <span className="flex items-center"><span className="text-zinc-500 mr-2">UNEMPLOYMENT</span> {economy.global_unemployment.toFixed(2)}%</span>
                </div>
            </footer>
        </div>
    );
}


