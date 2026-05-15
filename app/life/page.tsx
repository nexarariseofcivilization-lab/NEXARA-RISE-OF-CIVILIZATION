'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Apple, Coffee, Moon, Tv, Dumbbell, Droplet, BookOpen, Users, Brain, HeartPulse, Zap, Clock, CalendarDays, Flame, Smile, ArrowRightCircle, CheckCircle2, Terminal, Car } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';

// Activity Types
type ActivityType = 'SLEEP' | 'EAT' | 'DRINK' | 'WORKOUT' | 'SHOWER' | 'ENTERTAINMENT' | 'SOCIALIZE' | 'STUDY' | 'COMMUTE';

interface StandardActivity {
    id: ActivityType;
    name: string;
    icon: any;
    durationMins: number; // how many mins it takes (sim time)
    color: string;
    effects: {
        stamina?: number;
        hunger?: number;
        stress?: number;
    };
}

const ACTIVITIES: StandardActivity[] = [
    { id: 'SLEEP', name: 'Sleep Cycle', icon: Moon, durationMins: 480, color: 'text-indigo-400', effects: { stamina: +80, stress: -40, hunger: -20 } },
    { id: 'EAT', name: 'Nutritional Meal', icon: Apple, durationMins: 30, color: 'text-emerald-400', effects: { hunger: +50, stamina: +5, stress: -5 } },
    { id: 'DRINK', name: 'Hydration', icon: Coffee, durationMins: 5, color: 'text-blue-400', effects: { stamina: +2 } },
    { id: 'WORKOUT', name: 'Physical Training', icon: Dumbbell, durationMins: 60, color: 'text-rose-400', effects: { stamina: -20, stress: -15 } },
    { id: 'SHOWER', name: 'Hygiene Routine', icon: Droplet, durationMins: 15, color: 'text-cyan-400', effects: { stress: -5 } },
    { id: 'COMMUTE', name: 'Transit / Commute', icon: Car, durationMins: 45, color: 'text-orange-400', effects: { stamina: -10, stress: +15 } },
    { id: 'ENTERTAINMENT', name: 'Digital Entertainment', icon: Tv, durationMins: 120, color: 'text-purple-400', effects: { stress: -20, stamina: -5 } },
    { id: 'SOCIALIZE', name: 'Networking/Friends', icon: Users, durationMins: 90, color: 'text-amber-400', effects: { stress: -25, stamina: -10 } },
    { id: 'STUDY', name: 'Skill Acquisition', icon: BookOpen, durationMins: 120, color: 'text-zinc-400', effects: { stamina: -15, stress: +10 } }
];

interface ActiveSession {
    activity: StandardActivity;
    startTime: Date;
    progress: number; // 0 to 100
    completed: boolean;
}

export default function LifeManagementDashboard() {
    const [mounted, setMounted] = useState(false);
    
    // Global Integration
    const globalTime = useAppStore(state => state.globalTime);
    const stats = useAppStore(state => state.player);
    const executeAction = useAppStore(state => state.executePlayerAction);
    const addLog = useAppStore(state => state.addLog);

    // Local Sessions
    const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
    const [timeline, setTimeline] = useState([
        { time: '17:00', title: 'Work Shift Ended', desc: 'Checked out of Capitol Node.' }
    ]);
    const [recentToast, setRecentToast] = useState<{ id: number; message: string } | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const startActivity = (activity: StandardActivity) => {
        if (activeSession) return;

        // Check conditions
        if (stats.stamina < 5 && activity.id !== 'SLEEP') {
            alert('Too exhausted to do anything else. Sleep required.');
            return;
        }
        
        // Fast-Forward Time
        executeAction({
            durationMins: activity.durationMins,
            staminaMod: activity.effects.stamina,
            hungerMod: activity.effects.hunger,
            stressMod: activity.effects.stress,
        }, `Completed: ${activity.name}`);

        // Build popup effect text
        const effectsMsg = [];
        if (activity.effects.stamina) effectsMsg.push(`${activity.effects.stamina > 0 ? '+' : ''}${activity.effects.stamina} Stamina`);
        if (activity.effects.hunger) effectsMsg.push(`${activity.effects.hunger > 0 ? '+' : ''}${activity.effects.hunger} Hunger`);
        if (activity.effects.stress) effectsMsg.push(`${activity.effects.stress > 0 ? '+' : ''}${activity.effects.stress} Stress`);
        const toastId = Date.now();
        setRecentToast({ id: toastId, message: effectsMsg.join(', ') });
        setTimeout(() => { setRecentToast(prev => prev?.id === toastId ? null : prev); }, 4000);

        // Visual sugar for completion
        setActiveSession({
            activity,
            startTime: globalTime,
            progress: 100,
            completed: true
        });

        const newTime = new Date(globalTime.getTime() + activity.durationMins * 60000);
        setTimeline(prev => [{
            time: `${newTime.getHours().toString().padStart(2,'0')}:${newTime.getMinutes().toString().padStart(2,'0')}`,
            title: `Completed: ${activity.name}`,
            desc: `Duration: ${activity.durationMins} mins.`
        }, ...prev].slice(0, 10));

        setTimeout(() => setActiveSession(null), 2000);
    };

    if (!mounted) return null;

    const renderStatBar = (label: string, value: number, icon: any, colorClass: string, isInverseBad = false) => {
        const isCritical = isInverseBad ? value > 80 : value < 20;
        const isWarning = isInverseBad ? (value > 50 && value <= 80) : (value >= 20 && value < 50);
        const barColor = isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-current ' + colorClass.replace('text-', 'bg-');
        const textColor = isCritical ? 'text-rose-500 animate-pulse font-black' : isWarning ? 'text-amber-500 font-bold' : 'text-zinc-400';

        return (
            <div className="space-y-1.5 px-3 py-2 bg-zinc-900/30 border border-zinc-800/30 rounded-lg">
                <div className="flex justify-between items-center">
                    <span className="flex items-center text-xs font-bold text-zinc-300 uppercase tracking-widest">
                        {icon && <icon.type {...icon.props} className={`w-3.5 h-3.5 mr-2 ${isCritical ? 'text-rose-500' : isWarning ? 'text-amber-500' : colorClass}`} />}
                        {label}
                    </span>
                    <span className={`text-xs font-mono font-bold ${textColor}`}>
                        {value.toFixed(1)}%
                    </span>
                </div>
                <div className="h-2 bg-zinc-950 rounded-full overflow-hidden shadow-inner border border-zinc-800/50">
                    <div className={`h-full transition-all duration-700 ${barColor}`} style={{ width: `${value}%` }}></div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-20 max-w-7xl mx-auto h-full overflow-y-auto custom-scrollbar pr-2 relative">
            {recentToast && (
                <div className="fixed top-12 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-950 border border-emerald-500/50 p-4 rounded-lg shadow-2xl flex items-center shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-in slide-in-from-top-10 fade-in duration-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-3" />
                    <div className="font-mono text-sm inline-block">
                        <span className="text-white font-bold opacity-80 mr-2 uppercase">Status Updated:</span>
                        <span className="text-emerald-400 font-bold">{recentToast.message}</span>
                    </div>
                </div>
            )}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-zinc-800 pb-4 shrink-0">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white uppercase font-sans flex items-center">
                        <Activity className="w-8 h-8 mr-3 text-emerald-500" />
                        Personal Ecosystem
                    </h1>
                    <p className="text-zinc-400 mt-2 font-mono text-sm">Life management, biological time orchestration, and persistent daily tracking.</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                    <div className="bg-zinc-900 border border-zinc-700 px-4 py-2 rounded flex flex-col items-end shadow-inner">
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest leading-none mb-1 flex items-center"><Clock className="w-3 h-3 mr-1"/> Global Std Time</span>
                        <div className="text-2xl font-black font-mono text-zinc-100 leading-none">
                            {globalTime.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()} {globalTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Biological Status (Span 4) */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-zinc-950/60 border-zinc-800/80 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                        <CardHeader className="border-b border-zinc-800/50 pb-4">
                            <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center justify-between">
                                <span className="flex items-center"><HeartPulse className="w-4 h-4 mr-2 text-rose-500"/> Biological Needs</span>
                                <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${stats.hunger < 20 || stats.thirst < 20 || stats.stamina < 20 ? 'bg-rose-950/80 text-rose-400 border border-rose-900/50 animate-pulse' : 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50'}`}>
                                    {stats.hunger < 20 || stats.thirst < 20 || stats.stamina < 20 ? 'Critical' : 'Stable'}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-5">
                            {renderStatBar('Stamina/Energy', stats.stamina, <Zap/>, 'text-emerald-400')}
                            {renderStatBar('Satiety (Food)', stats.hunger, <Apple/>, 'text-amber-500')}
                            {renderStatBar('Hydration', stats.thirst, <Droplet/>, 'text-blue-500')}
                            {renderStatBar('Hygiene', stats.hygiene, <Droplet/>, 'text-cyan-400')}
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-950/60 border-zinc-800/80">
                        <CardHeader className="border-b border-zinc-800/50 pb-4">
                            <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center">
                                <Brain className="w-4 h-4 mr-2 text-indigo-400"/> Mental & Physical State
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-5">
                            {renderStatBar('Happiness / Mood', stats.happiness, <Smile/>, 'text-purple-400')}
                            {renderStatBar('Mental Stress', stats.stress, <Flame/>, 'text-orange-500', true)}
                            {renderStatBar('Physical Fitness', stats.fitness, <Dumbbell/>, 'text-rose-400')}
                        </CardContent>
                    </Card>
                </div>

                {/* Center Column: Active Session & Action Terminal (Span 5) */}
                <div className="lg:col-span-5 flex flex-col h-full space-y-6">
                    {/* Active Session Display */}
                    <Card className={`border-zinc-800/80 flex-1 relative overflow-hidden transition-all duration-500 ${activeSession ? 'bg-indigo-950/20 shadow-[0_0_30px_rgba(79,70,229,0.1)]' : 'bg-zinc-950/30'}`}>
                        {activeSession && !activeSession.completed && (
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <activeSession.activity.icon className={`w-64 h-64 ${activeSession.activity.color}`} />
                            </div>
                        )}
                        <CardHeader className="border-b border-zinc-800/50 pb-4 relative z-10">
                            <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center justify-between">
                                <span className="uppercase tracking-widest font-mono text-xs">Activity Protocol</span>
                                {activeSession && !activeSession.completed && (
                                    <span className="flex items-center text-[10px] text-emerald-400 font-mono bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/50">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></div>
                                        SESSION ACTIVE
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 relative z-10 flex flex-col justify-center h-[280px]">
                            {activeSession ? (
                                <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
                                    <div className="inline-flex items-center justify-center p-4 rounded-full bg-zinc-900 border border-zinc-800 shadow-xl mb-2">
                                        <activeSession.activity.icon className={`w-10 h-10 ${activeSession.activity.color} ${!activeSession.completed ? 'animate-pulse' : ''}`} />
                                    </div>
                                    <div>
                                        <h3 className={`text-xl justify-center font-bold uppercase tracking-widest flex items-center ${activeSession.completed ? 'text-emerald-400' : 'text-white'}`}>
                                            {activeSession.activity.name}
                                            {activeSession.completed && <CheckCircle2 className="w-5 h-5 ml-2 text-emerald-500"/>}
                                        </h3>
                                        {!activeSession.completed && (
                                            <p className="text-xs font-mono text-zinc-400 mt-2">
                                                Consuming {activeSession.activity.durationMins} minutes of standard time...
                                            </p>
                                        )}
                                    </div>
                                    
                                    {!activeSession.completed ? (
                                        <div className="space-y-2 max-w-xs mx-auto">
                                            <div className="flex justify-between text-[10px] font-mono font-bold tracking-widest text-zinc-500">
                                                <span>PROGRESS</span>
                                                <span className="text-indigo-400">{activeSession.progress.toFixed(0)}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden shadow-inner border border-zinc-800">
                                                <div className={`h-full ${activeSession.activity.color.replace('text-', 'bg-')} transition-all duration-300`} style={{ width: `${activeSession.progress}%` }}></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm font-mono text-zinc-400 animate-in slide-in-from-bottom-2 fade-in">
                                            Vitals updated. Awaiting next command.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center opacity-40">
                                    <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                                    <p className="text-xs uppercase tracking-widest font-mono text-zinc-500">Awaiting Subroutine</p>
                                    <p className="text-[10px] font-mono text-zinc-600 mt-2">Select an activity from the terminal below.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Activity Selector Terminal */}
                    <Card className="bg-zinc-950 border-zinc-800 shrink-0">
                        <CardHeader className="py-3 px-4 border-b border-zinc-800 bg-zinc-900/30">
                            <CardTitle className="text-[10px] uppercase font-bold tracking-widest font-mono text-zinc-500 flex items-center">
                                <Terminal className="w-3 h-3 mr-2"/> Action Terminal
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {ACTIVITIES.map((act) => (
                                    <button 
                                        key={act.id}
                                        onClick={() => startActivity(act)}
                                        disabled={!!(activeSession && !activeSession.completed)}
                                        className={`flex flex-col items-center justify-center p-3 rounded border border-zinc-800 transition-all ${
                                            activeSession && !activeSession.completed 
                                                ? 'opacity-30 cursor-not-allowed bg-zinc-900' 
                                                : 'hover:bg-zinc-800 hover:border-zinc-600 bg-zinc-900 cursor-pointer active:scale-95'
                                        }`}
                                    >
                                        <act.icon className={`w-5 h-5 mb-2 ${act.color}`} />
                                        <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-400 text-center leading-tight">
                                            {act.name}
                                        </span>
                                        <span className="text-[9px] font-mono text-zinc-600 mt-1">{act.durationMins}m</span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Timeline & Schedule (Span 3) */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="bg-zinc-950/60 border-zinc-800/80 h-full flex flex-col">
                        <CardHeader className="border-b border-zinc-800/50 pb-4">
                            <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center justify-between">
                                <span className="flex items-center"><CalendarDays className="w-4 h-4 mr-2 text-zinc-400"/> Daily Log</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-auto custom-scrollbar relative">
                             <div className="absolute left-6 top-0 bottom-0 w-px bg-zinc-800/50 z-0"></div>
                             <div className="space-y-0 relative z-10">
                                {timeline.map((item, i) => (
                                    <div key={i} className="flex p-4 hover:bg-zinc-900/30 transition-colors border-b border-zinc-800/20 group">
                                        <div className="w-12 text-right pr-4 font-mono text-[10px] text-zinc-500 relative shrink-0 pt-0.5">
                                            {item.time}
                                            <div className="absolute right-[-4px] top-1.5 w-2 h-2 rounded-full bg-zinc-600 ring-4 ring-zinc-950 group-hover:bg-indigo-400 transition-colors" />
                                        </div>
                                        <div className="pl-4 pb-2">
                                            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wide leading-tight mb-1">
                                                {item.title}
                                            </h4>
                                            <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {timeline.length === 0 && (
                                    <div className="p-6 text-center text-xs text-zinc-600 font-mono">No entries today.</div>
                                )}
                             </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
