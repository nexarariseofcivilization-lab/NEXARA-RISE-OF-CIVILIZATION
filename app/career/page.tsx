'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Users, Briefcase, CalendarClock, Clock, Activity, AlertTriangle, ShieldCheck, FileWarning, Fingerprint, CalendarDays, HeartPulse, Brain, Zap, Plane, TrendingUp, DollarSign, Award, Target, CheckSquare, Bell, BarChart2, Battery, AlertOctagon, CheckCircle2, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAppStore } from '@/lib/store';

interface WorkSession {
    startSimTime: Date;
    tasksCompleted: number;
    incomeEarned: number;
    expEarned: number;
    productivity: number; 
    activeEvent: WorkEvent | null;
    shiftProgress: number; 
}

interface WorkEvent {
    id: string;
    title: string;
    description: string;
    type: string;
    choices: {
        label: string;
        action: () => void;
        variant: 'danger' | 'primary' | 'default';
    }[];
}

interface LastReport {
    totalMinutes: number;
    income: number;
    tax: number;
    staminaChange: number;
    stressChange: number;
    expEarned: number;
    score: string;
}

export default function CareerDashboard() {
    const [mounted, setMounted] = useState(false);
    
    // Global Integration
    const globalTime = useAppStore(state => state.globalTime);
    const setPlayerState = useAppStore(state => state.setPlayerState);
    const { stamina, stress, workPerformance: performance, professionalism, warnings, cash: money, careerExp, jobTitle, employer: department, vacationDays, skills, tasks, jobMarket } = useAppStore(state => state.player);
    const infra = useAppStore(state => state.infra);
    
    // Derived
    const careerLevel = Math.floor(careerExp / 1000) + 1;

    // Identity & Status
    const [status, setStatus] = useState('OFF_DUTY');

    const player = useAppStore(state => state.player);
    const isCheckedIn = player.isWorking;
    const setIsCheckedIn = (val: boolean) => setPlayerState({ isWorking: val });

    // Active Session
    const [session, setSession] = useState<WorkSession | null>(null);
    const [report, setReport] = useState<LastReport | null>(null);

    // Timeline events
    const [timelineEvents, setTimelineEvents] = useState([
        { time: '06:30', level: 'info', title: 'Cycle Start', icon: Clock, desc: 'Awoke and cleared biometrics.' },
        { time: '07:15', level: 'warning', title: 'Transport Alert', icon: AlertTriangle, desc: 'Traffic delay on Capitol Route.' }
    ]);

    // Active task reminders
    const [activeReminders, setActiveReminders] = useState<{id: string, title: string}[]>([]);

    // Job specs
    const officeLocation = "Sector 3, Capitol Node";
    const shiftStartHour = 8;
    const shiftStartMin = 0;
    const shiftEndHour = 17;
    const shiftEndMin = 0;
    const baseSalaryPerYear = 84500;
    const salaryPerMinute = (baseSalaryPerYear / 260 / 8 / 60);

    useEffect(() => {
        setMounted(true);
    }, []);

    const addTimelineEvent = (level: string, title: string, icon: any, desc: string) => {
        setTimelineEvents(prev => [{
            time: `${globalTime.getHours().toString().padStart(2, '0')}:${globalTime.getMinutes().toString().padStart(2, '0')}`,
            level, title, icon, desc
        }, ...prev].slice(0, 15));
    };

    // Simulation Engine Effect
    useEffect(() => {
        if (!mounted) return;
        
        const hour = globalTime.getHours();
        const minute = globalTime.getMinutes();
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const shiftEndStr = `${shiftEndHour.toString().padStart(2, '0')}:${shiftEndMin.toString().padStart(2, '0')}`;

        if (isCheckedIn && session) {
            // -- ACTIVE WORK SIMULATION LAYER --
            
            // Stamina/Stress drain and Productivity calculation
            let currProd = session.productivity;
            
            // Block work if infrastructure collapses. If ISP goes down, data architect is blocked.
            const capitolNodes = infra.regions['DKI_JAKARTA'].nodes;
            if (capitolNodes.ISP.status === 'OFFLINE' || capitolNodes.POWER.status === 'OFFLINE') {
                currProd = 0;
                setStatus('BLOCKED');
            } else {
                // Fatigue mechanics are now governed by the global PersonalSimulationEngine.
                // We only calculate productivity here.
                
                if (stamina < 30) currProd -= 0.5;
                if (stress > 70) currProd -= 0.5;
                if (stamina > 80 && stress < 40) currProd += 0.2;
                
                // Clamp productivity
                currProd = Math.max(10, Math.min(150, currProd));

                const isOvertime = timeStr > shiftEndStr;
                if (isOvertime) {
                    setStatus('OVERTIME');
                    setPlayerState({ stress: stress + 0.2 });
                } else {
                    setStatus('ON_DUTY');
                }
            }

            // Financial & Exp Gain
            const incomeTick = salaryPerMinute * (currProd / 100) * ((status === 'OVERTIME') ? 1.5 : 1);
            const expTick = (currProd > 80 ? 1.5 : 1) * ((status === 'OVERTIME') ? 0.5 : 1);

            // Shift Progress
            const totalShiftMins = (shiftEndHour - shiftStartHour) * 60;
            const elapsedMins = Math.max(0, (globalTime.getTime() - session.startSimTime.getTime()) / 60000);
            const progress = Math.min(100, (elapsedMins / totalShiftMins) * 100);

            // Task completion auto-tick
            let tasksAdd = 0;
            if (Math.random() < (currProd / 100) * 0.05) tasksAdd = 1;

            // Work Event Spawner
            let newEvent = session.activeEvent;
            if (currProd > 0 && !newEvent && Math.random() < 0.03) {
                newEvent = generateRandomWorkEvent();
            }

            setSession(prev => prev ? {
                ...prev,
                productivity: currProd,
                incomeEarned: prev.incomeEarned + incomeTick,
                expEarned: prev.expEarned + (currProd > 0 ? expTick : 0),
                tasksCompleted: prev.tasksCompleted + tasksAdd,
                shiftProgress: progress,
                activeEvent: newEvent
            } : null);

        } else {
            // -- OFF DUTY SIMULATION LAYER --
            const shiftStartStr = `${shiftStartHour.toString().padStart(2, '0')}:${shiftStartMin.toString().padStart(2, '0')}`;
            
            if (timeStr >= shiftStartStr && timeStr <= shiftEndStr && status !== 'SICK_LEAVE') {
                setStatus('LATE');
                setPlayerState({ professionalism: professionalism - 0.2 });
                if (minute === 0) setPlayerState({ warnings: warnings + 1 });
            } else if (status !== 'SICK_LEAVE') {
                setStatus('OFF_DUTY');
                // Natural recovery during off-duty handled somewhat by tickGlobalTime or manually here
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [globalTime, isCheckedIn]);

    const generateRandomWorkEvent = (): WorkEvent => {
        const events = [
            {
                id: Math.random().toString(),
                title: 'System Code Red: Network Outage',
                description: 'Sector 3 nodes are failing. Immediate diagnostic required. High stress impact.',
                type: 'urgent',
                choices: [
                    { label: 'Fix Immediately (High Stress)', variant: 'primary' as const, action: () => handleEventAction('Fix Immediately', 2, 10, -5) },
                    { label: 'Delegate to Junior (Prod Drop)', variant: 'default' as const, action: () => handleEventAction('Delegate', -10, 0, 0) },
                ]
            },
            {
                id: Math.random().toString(),
                title: 'Ministerial Request',
                description: 'The Minister requested an impromptu brief on the infrastructure budget.',
                type: 'boss',
                choices: [
                    { label: 'Prepare Brief (Exp++, Stress+)', variant: 'primary' as const, action: () => handleEventAction('Prepare Brief', 5, 8, -3) },
                    { label: 'Evade / Ignore (Warn)', variant: 'danger' as const, action: () => handleEventAction('Evade', -5, 0, 0, true) },
                ]
            },
            {
                id: Math.random().toString(),
                title: 'Colleague Dispute',
                description: 'Two analysts are arguing over resource allocation. Your intervention is expected.',
                type: 'social',
                choices: [
                    { label: 'Mediate (Time Consuming)', variant: 'default' as const, action: () => handleEventAction('Mediate', 0, 5, -2) },
                    { label: 'Ignore (Office Tension)', variant: 'default' as const, action: () => handleEventAction('Ignore', -2, -2, 0) },
                ]
            }
        ];
        return events[Math.floor(Math.random() * events.length)];
    };

    const handleEventAction = (actionName: string, prodMod: number, stressMod: number, staminaMod: number, warning = false) => {
        setSession(prev => {
            if (!prev) return null;
            return {
                ...prev,
                productivity: Math.max(10, Math.min(150, prev.productivity + prodMod)),
                activeEvent: null
            };
        });
        setPlayerState({ 
            stress: stress + stressMod,
            stamina: stamina + staminaMod,
            warnings: warnings + (warning ? 1 : 0)
        });
        
        addTimelineEvent('decision', 'Work Event Resolved', Target, `Action taken: ${actionName}.`);
    };

    const handleCheckIn = () => {
        if (stamina < 15) {
            alert('Cannot check in. Stamina critically low.');
            return;
        }
        setIsCheckedIn(true);
        setSession({
            startSimTime: globalTime,
            tasksCompleted: 0,
            incomeEarned: 0,
            expEarned: 0,
            productivity: 100,
            activeEvent: null,
            shiftProgress: 0
        });
        addTimelineEvent('success', 'Biometric Check-In', Fingerprint, `Session sequence initiated at Capitol Node.`);
    };

    const handleCheckOut = () => {
        setIsCheckedIn(false);
        const timeStr = `${globalTime.getHours().toString().padStart(2, '0')}:${globalTime.getMinutes().toString().padStart(2, '0')}`;
        
        let repChange = 0;
        let perfMod = 0;
        if (timeStr < `${shiftEndHour.toString().padStart(2, '0')}:${shiftEndMin.toString().padStart(2, '0')}`) {
            repChange = -5;
            perfMod = -5;
            addTimelineEvent('warning', 'Early Departure', AlertTriangle, `Checked out before shift protocol matched.`);
        } else {
            addTimelineEvent('success', 'Shift Complete', CheckCircle2, `Successfully transferred out of shift duties.`);
        }

        if (session) {
            const taxValue = session.incomeEarned * 0.18; // 18% flat tax
            
            // Note: `incomeEarned` was already streamed directly to `player.cash` by PersonalSimulationEngine 
            // as gross income during the work ticks. We only deduct the tax here upon checkout closing.
            // Also careerExp was streamed incrementally.
            
            setPlayerState({ 
                cash: money - taxValue,
                workPerformance: performance + perfMod
            });
            
            // Calculate Level up implicitly via derived state
            const newLevel = Math.floor(careerExp / 1000) + 1;
            if (newLevel > careerLevel) {
                addTimelineEvent('success', 'Career Level Up!', Star, `Rank increased to Level ${newLevel}.`);
            }

            setReport({
                totalMinutes: Math.floor((globalTime.getTime() - session.startSimTime.getTime())/60000),
                income: session.incomeEarned,
                tax: taxValue,
                staminaChange: -15, // simplified for report
                stressChange: +20,
                expEarned: session.expEarned,
                score: session.productivity > 90 ? 'A' : session.productivity > 70 ? 'B' : 'C'
            });
        }
        
        setSession(null);
    };

    const handleSickLeave = () => {
        setIsCheckedIn(false);
        setStatus('SICK_LEAVE');
        setPlayerState({ stress: Math.max(0, stress - 30) });
        addTimelineEvent('info', 'Medical Leave Active', HeartPulse, `Leave designated for recovery.`);
    };

    const handleVacation = () => {
        if (vacationDays <= 0) {
            alert('No vacation days remaining.');
            return;
        }
        setIsCheckedIn(false);
        setStatus('VACATION');
        setPlayerState({ 
            stress: Math.max(0, stress - 40), 
            stamina: Math.min(100, stamina + 50),
            happiness: 100,
            vacationDays: vacationDays - 1,
            workPerformance: Math.max(0, performance - 2) // slight drop for missing work
        });
        addTimelineEvent('success', 'PTO Approved', Plane, `Vacation day utilized. Days remaining: ${vacationDays - 1}`);
    };

    const toggleTaskPriority = (id: string) => {
        const priorityOrder: ('HIGH' | 'MEDIUM' | 'LOW')[] = ['HIGH', 'MEDIUM', 'LOW'];
        const newTasks = tasks.map(t => {
            if (t.id === id) {
                const currentIdx = priorityOrder.indexOf(t.priority);
                const nextIdx = (currentIdx + 1) % priorityOrder.length;
                return { ...t, priority: priorityOrder[nextIdx] };
            }
            return t;
        });
        setPlayerState({ tasks: newTasks });
    };

    const toggleTaskCompleted = (id: string) => {
        const newTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        setPlayerState({ tasks: newTasks });
    };

    const toggleTaskReminder = (id: string) => {
        const newTasks = tasks.map(t => t.id === id ? { ...t, reminder: !t.reminder } : t);
        setPlayerState({ tasks: newTasks });
    };

    const sortedTasks = [...(tasks || [])].sort((a, b) => {
        const pts = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return pts[b.priority] - pts[a.priority];
    });

    // Check deadlines
    useEffect(() => {
        const now = globalTime.getTime();
        const pendingReminders = tasks.filter(t => t.reminder && !t.completed && t.deadline && (t.deadline.getTime() - now) < 3600000 * 24); // next 24h
        setActiveReminders(pendingReminders.map(t => ({ id: t.id, title: t.title })));
    }, [globalTime, tasks]);

    const handleLevelUpSkill = (skillId: string) => {
        const skill = skills.find(s => s.id === skillId);
        if (!skill) return;
        if (careerExp < skill.cost) {
            alert('Not enough Career Exp');
            return;
        }
        if (skill.level >= skill.maxLevel) return;
        if (!skill.unlocked) {
            // Unlocking
            const newSkills = skills.map(s => {
                if (s.id === skillId) return { ...s, unlocked: true, level: 1, cost: Math.floor(s.cost * 1.5) };
                if (s.parentId === skillId) return { ...s, unlocked: true }; // unlock children
                return s;
            });
            setPlayerState({ skills: newSkills, careerExp: careerExp - skill.cost });
            addTimelineEvent('success', 'Skill Unlocked', Brain, `Unlocked research path: ${skill.name}`);
        } else {
            // Leveling up
            const newSkills = skills.map(s => s.id === skillId ? { ...s, level: s.level + 1, cost: Math.floor(s.cost * 1.5) } : s);
            setPlayerState({ skills: newSkills, careerExp: careerExp - skill.cost, workPerformance: Math.min(100, performance + 5) });
            addTimelineEvent('success', 'Skill Enhanced', TrendingUp, `Upgraded ${skill.name} to Level ${skill.level + 1}`);
        }
    };

    const handleApplyJob = (jobId: string) => {
        const job = jobMarket.find(j => j.id === jobId);
        if(!job) return;
        // Basic match check based on required skills
        const requirementsMet = job.reqSkills.every(reqSkill => {
            const playerSkill = skills.find(s => s.id === reqSkill);
            return playerSkill && playerSkill.unlocked && playerSkill.level > 0;
        });

        if (requirementsMet) {
            addTimelineEvent('success', 'Application Sent', Briefcase, `Applied for ${job.title} at ${job.company}. Good match!`);
            // we could update the job status in store to "APPLIED" but we'll just show event for now
            const newMarket = jobMarket.map(j => j.id === jobId ? { ...j, matched: true } : j);
            setPlayerState({ jobMarket: newMarket, stress: Math.min(100, stress + 5) });
        } else {
            addTimelineEvent('warning', 'Application Auto-Rejected', AlertTriangle, `Lacking required skills for ${job.title}. Focus on research.`);
        }
    };

    if (!mounted) return null;

    return (
        <div className="space-y-6 pb-20 max-w-7xl mx-auto h-full overflow-y-auto custom-scrollbar pr-2 relative">
            
            {/* CHECK-OUT REPORT MODAL */}
            {report && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <Card className="max-w-md w-full bg-zinc-950 border-zinc-800 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500"></div>
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-2xl font-bold uppercase tracking-widest text-white">Workday Report</CardTitle>
                            <p className="text-zinc-400 font-mono text-xs">Session Terminal Data Log</p>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded">
                                <div>
                                    <h4 className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Overall Rating</h4>
                                    <div className="text-3xl font-black text-white">{report.score}</div>
                                </div>
                                <div className="text-right">
                                    <h4 className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Time Logged</h4>
                                    <div className="text-xl font-mono text-indigo-400">{Math.floor(report.totalMinutes / 60)}h {report.totalMinutes % 60}m</div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <h5 className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest border-b border-zinc-800 pb-1">Economics</h5>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-zinc-400">Gross Pay</span>
                                        <span className="text-xs font-mono text-emerald-400">+${report.income.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-zinc-400">Tax & Ducs</span>
                                        <span className="text-xs font-mono text-rose-400">-${report.tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h5 className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest border-b border-zinc-800 pb-1">Progression</h5>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-zinc-400">Exp Earned</span>
                                        <span className="text-xs font-mono text-indigo-400">+{Math.floor(report.expEarned)} XP</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-zinc-400">Perf. Change</span>
                                        <span className="text-xs font-mono text-emerald-400">Match Target</span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setReport(null)}
                                className="w-full py-3 bg-white text-zinc-950 font-bold uppercase tracking-widest rounded hover:bg-zinc-200 transition-colors mt-4 text-xs font-mono"
                            >
                                Acknowledge & Archive
                            </button>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-zinc-800 pb-4 shrink-0">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white uppercase font-sans flex items-center">
                        <User className="w-8 h-8 mr-3 text-indigo-500" />
                        Career & Life
                    </h1>
                    <p className="text-zinc-400 mt-2 font-mono text-sm">Workforce life simulation, attendance protocol, and biometric surveillance.</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-4">
                    <div className="text-right">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mb-1 block">Bank Balance</span>
                        <div className="text-xl font-mono text-emerald-400 leading-none">${money.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-700 px-4 py-2 rounded flex flex-col items-end">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mb-1">Standard Cycle Time</span>
                        <div className="text-xl font-mono text-zinc-100 leading-none">
                            {globalTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Action & Status Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* ID & Duty Status OR ACTIVE WORK SESSION */}
                <Card className="col-span-1 lg:col-span-2 bg-gradient-to-br from-zinc-950 to-zinc-900 border-zinc-800/80 relative overflow-hidden flex flex-col justify-between">
                    {!isCheckedIn ? (
                        <>
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <Fingerprint className="w-48 h-48 text-indigo-500" />
                            </div>
                            <CardContent className="p-6 h-full flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="flex space-x-6 items-center z-10">
                                        <div className="w-20 h-20 bg-zinc-800 rounded border-2 border-indigo-500 flex items-center justify-center shrink-0 relative overflow-hidden">
                                            <User className="w-10 h-10 text-indigo-400 relative z-10" />
                                            <div className="absolute inset-0 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"></div>
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className="text-2xl font-bold text-white uppercase tracking-wide">Lvl {careerLevel}: 849-B-112</h2>
                                            <p className="text-sm text-indigo-400 font-mono flex items-center">
                                                <Briefcase className="w-4 h-4 mr-2" />
                                                {jobTitle}
                                            </p>
                                            <p className="text-xs text-zinc-500 font-mono">{department} | {officeLocation}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right z-10">
                                        <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-bold font-mono border uppercase tracking-widest ${
                                            status === 'OFF_DUTY' ? 'bg-zinc-900 text-zinc-400 border-zinc-700' :
                                            status === 'LATE' ? 'bg-red-950/50 text-red-500 border-red-800/50' :
                                            status === 'SICK_LEAVE' ? 'bg-blue-950/50 text-blue-400 border-blue-800/50' :
                                            'bg-zinc-900 text-zinc-400 border-zinc-700'
                                        }`}>
                                            <span className={`w-2 h-2 rounded-full mr-2 ${
                                                status === 'OFF_DUTY' ? 'bg-zinc-500' :
                                                status === 'LATE' ? 'bg-red-500 animate-bounce' :
                                                status === 'SICK_LEAVE' ? 'bg-blue-500' :
                                                'bg-zinc-500'
                                            }`}></span>
                                            {status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 z-10 relative">
                                    <div>
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Shift Schedule</div>
                                        <div className="text-sm font-mono text-zinc-300">{shiftStartHour.toString().padStart(2,'0')}:{shiftStartMin.toString().padStart(2,'0')} - {shiftEndHour.toString().padStart(2,'0')}:{shiftEndMin.toString().padStart(2,'0')}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Exp to Next Level</div>
                                        <div className="text-sm font-mono text-indigo-400">{careerExp}/{careerLevel*1200}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Base Salary</div>
                                        <div className="text-sm font-mono text-emerald-400">${baseSalaryPerYear.toLocaleString()}/yr</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Disciplinary Points</div>
                                        <div className="text-sm font-mono text-red-400 flex items-center">
                                            <FileWarning className="w-3 h-3 mr-1" />
                                            {warnings}/10
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </>
                    ) : (
                        // ACTIVE WORK SESSION DASHBOARD
                        <div className="flex flex-col h-full bg-zinc-950/80 border border-zinc-800/80 shadow-[inset_0_0_40px_rgba(30,20,80,0.1)] relative">
                            {/* Scanning line animation */}
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500/30 animate-scan pointer-events-none z-50"></div>
                            
                            <div className="p-4 border-b border-indigo-900/30 bg-indigo-950/20 flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-3"></div>
                                    <h3 className="font-bold text-zinc-100 uppercase tracking-widest text-sm flex items-center">
                                        <Activity className="w-4 h-4 mr-2 text-indigo-400" />
                                        Active Work Session
                                    </h3>
                                </div>
                                <div className="text-xs font-mono text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/50">
                                    {status === 'OVERTIME' ? 'OVERTIME ACTIVE (1.5x)' : 'ON DUTY'}
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-2 gap-8 flex-1">
                                <div className="space-y-6">
                                    {/* Progress Bars */}
                                    <div>
                                        <div className="flex justify-between mb-1.5">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Shift Progress</span>
                                            <span className="text-[10px] font-mono text-indigo-400">{session?.shiftProgress.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-2 bg-zinc-900 rounded overflow-hidden">
                                            <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${session?.shiftProgress}%` }}></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1.5">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Current Productivity</span>
                                            <span className={`text-[10px] font-mono ${session && session.productivity > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{session?.productivity.toFixed(0)}%</span>
                                        </div>
                                        <div className="h-2 bg-zinc-900 rounded overflow-hidden">
                                            <div className="h-full transition-all duration-300 bg-gradient-to-r from-amber-500 to-emerald-500" style={{ width: `${Math.min(100, session?.productivity || 0)}%` }}></div>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-2">
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-bold">Session Yield</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded">
                                                <div className="text-xs text-zinc-400 mb-1 flex items-center"><DollarSign className="w-3 h-3 mr-1"/> Income</div>
                                                <div className="text-lg font-mono text-emerald-400">${session?.incomeEarned.toFixed(2)}</div>
                                            </div>
                                            <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded">
                                                <div className="text-xs text-zinc-400 mb-1 flex items-center"><CheckSquare className="w-3 h-3 mr-1"/> Tasks</div>
                                                <div className="text-lg font-mono text-indigo-400">{session?.tasksCompleted}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Event Panel */}
                                <div className="border-l border-zinc-800/50 pl-8 h-full flex flex-col justify-center">
                                    {session?.activeEvent ? (
                                        <div className="bg-zinc-900 border border-amber-900/50 rounded-lg p-4 shadow-lg animate-in fade-in slide-in-from-right-4">
                                            <div className="flex items-center mb-2">
                                                <AlertOctagon className="w-4 h-4 text-amber-500 mr-2" />
                                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">{session.activeEvent.title}</h4>
                                            </div>
                                            <p className="text-xs text-zinc-300 mb-4 leading-relaxed">{session.activeEvent.description}</p>
                                            <div className="space-y-2 relative z-50">
                                                {session.activeEvent.choices.map((choice, i) => (
                                                    <button 
                                                        key={i}
                                                        onClick={choice.action}
                                                        className={`w-full text-xs font-mono py-2 px-3 block rounded border transition-colors ${
                                                            choice.variant === 'primary' ? 'bg-indigo-950/40 border-indigo-800 text-indigo-300 hover:bg-indigo-900' :
                                                            choice.variant === 'danger' ? 'bg-rose-950/40 border-rose-800 text-rose-300 hover:bg-rose-900' :
                                                            'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                                                        }`}
                                                    >
                                                        {choice.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center opacity-50 flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 rounded-full border border-dashed border-zinc-600 flex items-center justify-center mb-3 animate-[spin_10s_linear_infinite]">
                                                <Activity className="w-5 h-5 text-zinc-500" />
                                            </div>
                                            <p className="text-xs font-mono text-zinc-500">Monitoring operations...</p>
                                            <p className="text-[10px] text-zinc-600 mt-1">No active events.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Clock In/Out Terminal */}
                <Card className="col-span-1 bg-zinc-950/60 border-zinc-800 flex flex-col justify-between">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center text-zinc-300">
                            <CalendarClock className="w-4 h-4 mr-2 text-indigo-500" />
                            Attendance Terminal
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-end pb-6 pt-2 h-full">
                        {status === 'SICK_LEAVE' ? (
                            <div className="bg-blue-950/30 border border-blue-900/50 p-4 rounded text-center mb-4">
                                <HeartPulse className="w-8 h-8 text-blue-500 mx-auto mb-2 opacity-50" />
                                <p className="text-xs text-blue-400 font-mono">Medical leave active. Clearance required to resume duties.</p>
                            </div>
                        ) : !isCheckedIn ? (
                            <button 
                                onClick={handleCheckIn}
                                className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 transition-colors text-white font-bold rounded flex items-center justify-center font-mono shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                            >
                                <Fingerprint className="w-5 h-5 mr-3" />
                                BIOMETRIC CHECK-IN
                            </button>
                        ) : (
                            <button 
                                onClick={handleCheckOut}
                                className="w-full py-5 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-colors text-zinc-300 font-bold rounded flex items-center justify-center font-mono border border-zinc-600"
                            >
                                <Fingerprint className="w-5 h-5 mr-3 opacity-50" />
                                INITIATE CHECK-OUT
                            </button>
                        )}

                        <div className="flex justify-between mt-auto pt-6">
                            <button 
                                onClick={handleSickLeave}
                                disabled={isCheckedIn || status === 'SICK_LEAVE'}
                                className="text-[10px] font-mono px-3 py-2 border border-zinc-700 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors w-1/2 mr-2"
                            >
                                MEDICAL LEAVE
                            </button>
                            <button 
                                onClick={handleVacation}
                                disabled={isCheckedIn || status === 'SICK_LEAVE' || status === 'VACATION'}
                                className="text-[10px] font-mono px-3 py-2 border border-zinc-700 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors w-1/2 ml-2 flex flex-col items-center"
                            >
                                <span>TAKE PTO</span>
                                <span className="text-[8px] opacity-70">({vacationDays} DAYS REMAINING)</span>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Physical & Mental Health */}
                <Card className="col-span-1 border-zinc-800/80 bg-zinc-950/50">
                    <CardHeader className="border-b border-zinc-800/50 pb-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center">
                            <Activity className="w-4 h-4 mr-2 text-rose-500" />
                            Biotelemetry Logs
                        </CardTitle>
                        {status === 'SICK_LEAVE' && <span className="text-[10px] bg-blue-900/50 text-blue-400 px-2 py-0.5 rounded uppercase font-bold">RECOVERING</span>}
                    </CardHeader>
                    <CardContent className="p-5 space-y-6">
                        {/* Stamina */}
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center space-x-2">
                                    <Zap className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs font-bold text-zinc-200">Stamina Reserves</span>
                                </div>
                                <span className={`text-xs font-mono font-bold ${stamina > 30 ? 'text-emerald-400' : 'text-rose-500'}`}>
                                    {stamina.toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden shadow-inner">
                                <div className={`h-full transition-all duration-300 ${stamina > 30 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${stamina}%` }}></div>
                            </div>
                        </div>

                         {/* Stress Levels */}
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center space-x-2">
                                    <Brain className="w-4 h-4 text-amber-500" />
                                    <span className="text-xs font-bold text-zinc-200">Mental Stress Load</span>
                                </div>
                                <span className={`text-xs font-mono font-bold ${stress < 70 ? 'text-amber-400' : 'text-rose-500'}`}>
                                    {stress.toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden shadow-inner">
                                <div className={`h-full transition-all duration-300 ${stress < 70 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${stress}%` }}></div>
                            </div>
                        </div>

                         {/* Performance Rating */}
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center space-x-2">
                                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs font-bold text-zinc-200">Base Performance KPI</span>
                                </div>
                                <span className="text-xs font-mono font-bold text-blue-400">
                                    {performance.toFixed(1)} / 100
                                </span>
                            </div>
                            <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden shadow-inner">
                                <div className="h-full transition-all duration-300 bg-blue-500" style={{ width: `${performance}%` }}></div>
                            </div>
                        </div>

                        {/* Status Warning */}
                        {stress > 80 && (
                            <div className="mt-4 bg-rose-950/30 border border-rose-900/50 p-3 rounded flex items-start space-x-3">
                                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                <div className="text-xs text-rose-400">
                                    <strong className="block mb-1">Burnout Risk Warning</strong>
                                    Mental pressure critically high. Performance degradation expected. Strongly advise leave.
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Unexpected Life Events Log */}
                <Card className="col-span-1 lg:col-span-2 border-zinc-800/80 bg-zinc-950/50 flex flex-col h-[400px]">
                    <CardHeader className="border-b border-zinc-800/50 pb-4 shrink-0">
                        <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center justify-between">
                            <span className="flex items-center">
                                <CalendarDays className="w-4 h-4 mr-2 text-zinc-500" />
                                Decision & Event Timeline
                            </span>
                            <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">Realtime Feed</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-auto custom-scrollbar relative">
                        <div className="absolute left-6 top-0 bottom-0 w-px bg-zinc-800/50"></div>
                        
                        <div className="space-y-0 relative z-10">
                            {timelineEvents.map((event, i) => (
                                <div key={i} className="flex p-4 hover:bg-zinc-900/30 transition-colors border-b border-zinc-800/20">
                                    <div className="w-12 text-right pr-4 font-mono text-[10px] text-zinc-500 relative shrink-0 pt-1">
                                        {event.time}
                                        <div className={`absolute right-[-4px] top-1.5 w-2 h-2 rounded-full ring-4 ring-zinc-950 ${
                                            event.level === 'danger' ? 'bg-rose-500' :
                                            event.level === 'warning' ? 'bg-amber-500' :
                                            event.level === 'success' ? 'bg-emerald-500' :
                                            event.level === 'decision' ? 'bg-indigo-500' :
                                            'bg-zinc-600'
                                        }`} />
                                    </div>
                                    <div className="pl-6 pb-2">
                                        <h4 className={`text-sm font-bold flex items-center ${
                                            event.level === 'danger' ? 'text-rose-400' :
                                            event.level === 'warning' ? 'text-amber-400' :
                                            event.level === 'success' ? 'text-emerald-400' :
                                            event.level === 'decision' ? 'text-indigo-400' :
                                            'text-zinc-300'
                                        }`}>
                                            <event.icon className="w-3.5 h-3.5 mr-2" />
                                            {event.title}
                                        </h4>
                                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                                            {event.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Tasks List */}
                <Card className="bg-zinc-950/40 border-zinc-800/60">
                    <CardHeader className="pb-4 border-b border-zinc-800/50 bg-zinc-900/20">
                        <CardTitle className="text-sm font-semibold text-zinc-300 flex justify-between items-center">
                            <span className="flex items-center">
                                Assigned Tasks
                                {activeReminders.length > 0 && (
                                    <span className="ml-3 flex items-center text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/30 animate-pulse">
                                        <Bell className="w-3 h-3 mr-1" />
                                        {activeReminders.length} Due Soon
                                    </span>
                                )}
                            </span>
                            <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-mono">PRIORITIZE</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-zinc-800/30">
                            {sortedTasks.map(task => (
                                <div key={task.id} className={`flex items-center p-4 transition-colors ${task.completed ? 'opacity-50' : ''}`}>
                                    <button 
                                        onClick={() => toggleTaskCompleted(task.id)}
                                        className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${
                                            task.completed ? 'bg-emerald-500/20 border-emerald-500' : 'bg-zinc-900 border-zinc-700 hover:border-zinc-500'
                                        }`}
                                    >
                                        {task.completed && <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />}
                                    </button>
                                    <div className="flex-1">
                                        <p className={`text-sm ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>{task.title}</p>
                                        {(task.deadline || task.reminder) && (
                                            <p className="text-[10px] mt-1 text-zinc-500 font-mono flex items-center">
                                                {task.deadline && <span>DUE: {new Date(task.deadline).toLocaleDateString()} </span>}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => toggleTaskReminder(task.id)}
                                            className={`p-1.5 rounded border transition-colors ${task.reminder ? 'bg-indigo-900/30 border-indigo-500/50 text-indigo-400' : 'bg-zinc-900 border-zinc-700 text-zinc-600 hover:text-zinc-400'}`}
                                            title="Toggle Reminder"
                                        >
                                            <Bell className="w-3 h-3" />
                                        </button>
                                        <button 
                                            onClick={() => toggleTaskPriority(task.id)}
                                            className={`text-xs font-mono px-2 py-1 rounded border transition-colors min-w-[50px] text-center ${
                                                task.priority === 'HIGH' ? 'bg-rose-950/30 border-rose-800 text-rose-400 hover:bg-rose-900/50' :
                                                task.priority === 'MEDIUM' ? 'bg-amber-950/30 border-amber-800 text-amber-400 hover:bg-amber-900/50' :
                                                'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                                            }`}
                                        >
                                            P: {task.priority}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Career Development Research Tree */}
                <Card className="bg-zinc-950/40 border-zinc-800/60 lg:col-span-2">
                    <CardHeader className="pb-4 border-b border-zinc-800/50 bg-zinc-900/20 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center">
                            <Brain className="w-4 h-4 mr-2 text-indigo-500" />
                            Research & Development
                        </CardTitle>
                        <div className="text-[10px] font-mono tracking-widest text-zinc-500">
                            XP AVAIL: <span className="text-indigo-400 font-bold">{Math.floor(careerExp)}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {skills?.filter(s => s.parentId === null).map(rootSkill => (
                                <div key={rootSkill.id} className="space-y-4">
                                    <div className={`p-4 border rounded-lg transition-colors shadow-sm relative ${rootSkill.unlocked ? 'bg-zinc-900/50 border-indigo-900/50 shadow-indigo-900/10' : 'bg-zinc-950/50 border-zinc-800/50 opacity-60'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className={`text-sm font-bold flex items-center ${rootSkill.unlocked ? 'text-indigo-300' : 'text-zinc-500'}`}>
                                                    {rootSkill.name}
                                                </h4>
                                                <p className="text-[10px] text-zinc-500 mt-1">{rootSkill.description}</p>
                                            </div>
                                            {rootSkill.unlocked && (
                                                <div className="text-right">
                                                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-0.5">Level</span>
                                                    <div className="flex space-x-1">
                                                        {Array.from({length: rootSkill.maxLevel}).map((_, idx) => (
                                                            <div key={idx} className={`w-2 h-2 rounded-full ${idx < rootSkill.level ? 'bg-indigo-500' : 'bg-zinc-800'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-4 flex justify-end">
                                            <button 
                                                onClick={() => handleLevelUpSkill(rootSkill.id)}
                                                disabled={careerExp < rootSkill.cost || rootSkill.level >= rootSkill.maxLevel}
                                                className={`text-xs font-mono px-3 py-1.5 rounded transition-colors flex items-center justify-center min-w-[120px] ${
                                                    rootSkill.level >= rootSkill.maxLevel ? 'bg-zinc-900/50 text-zinc-600 cursor-not-allowed border border-zinc-800/50' :
                                                    careerExp >= rootSkill.cost 
                                                        ? 'bg-indigo-900/30 text-indigo-400 hover:bg-indigo-800/40 border border-indigo-500/30' 
                                                        : 'bg-zinc-900/50 text-zinc-600 disabled:opacity-50 border border-zinc-800/50'
                                                }`}
                                            >
                                                {rootSkill.level >= rootSkill.maxLevel ? 'MAX LEVEL' : rootSkill.unlocked ? `UPGRADE (${rootSkill.cost} XP)` : `UNLOCK (${rootSkill.cost} XP)`}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Children Skills */}
                                    {skills?.filter(s => s.parentId === rootSkill.id).length > 0 && (
                                        <div className="pl-6 border-l-2 border-zinc-800/50 space-y-4 ml-4">
                                            {skills?.filter(s => s.parentId === rootSkill.id).map(childSkill => (
                                                <div key={childSkill.id} className={`p-4 border rounded-lg transition-colors relative ${childSkill.unlocked ? 'bg-zinc-900/50 border-emerald-900/50 shadow-sm shadow-emerald-900/10' : 'bg-zinc-950/50 border-zinc-800/50 opacity-60'}`}>
                                                    <div className="absolute top-1/2 -left-6 w-6 h-0.5 bg-zinc-800/50"></div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className={`text-sm font-bold flex items-center ${childSkill.unlocked ? 'text-emerald-300' : 'text-zinc-500'}`}>
                                                                {childSkill.name}
                                                            </h4>
                                                            <p className="text-[10px] text-zinc-500 mt-1">{childSkill.description}</p>
                                                        </div>
                                                        {childSkill.unlocked && (
                                                            <div className="text-right">
                                                                <div className="flex space-x-1 mt-1">
                                                                    {Array.from({length: childSkill.maxLevel}).map((_, idx) => (
                                                                        <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx < childSkill.level ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mt-3">
                                                        <button 
                                                            onClick={() => handleLevelUpSkill(childSkill.id)}
                                                            disabled={!rootSkill.unlocked || careerExp < childSkill.cost || childSkill.level >= childSkill.maxLevel}
                                                            className={`text-[10px] font-mono px-2 py-1 rounded w-full transition-colors flex items-center justify-center ${
                                                                childSkill.level >= childSkill.maxLevel ? 'bg-zinc-900/50 text-zinc-600 cursor-not-allowed border border-zinc-800/50' :
                                                                (rootSkill.unlocked && careerExp >= childSkill.cost)
                                                                    ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-800/40 border border-emerald-500/30' 
                                                                    : 'bg-zinc-900/50 text-zinc-600 disabled:opacity-50 border border-zinc-800/50'
                                                            }`}
                                                        >
                                                            {!rootSkill.unlocked ? 'LOCKED BY PARENT' : childSkill.level >= childSkill.maxLevel ? 'MAX LEVEL' : childSkill.unlocked ? `UPGRADE (${childSkill.cost} XP)` : `UNLOCK (${childSkill.cost} XP)`}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 mt-6">
                {/* Job Market */}
                <Card className="bg-zinc-950/40 border-zinc-800/60">
                    <CardHeader className="pb-4 border-b border-zinc-800/50 bg-zinc-900/20">
                        <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center">
                            <Briefcase className="w-4 h-4 mr-2" />
                            Dynamic Job Market
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-zinc-800/30">
                            {jobMarket?.map(job => {
                                const requirementsMet = job.reqSkills.every(reqSkill => {
                                    const playerSkill = skills.find(s => s.id === reqSkill);
                                    return playerSkill && playerSkill.unlocked && playerSkill.level > 0;
                                });
                                
                                return (
                                    <div key={job.id} className={`p-4 flex justify-between items-center transition-colors ${job.matched ? 'bg-emerald-950/20 cursor-default' : 'hover:bg-zinc-900/30'}`}>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-1">
                                                <h4 className="text-sm font-bold text-zinc-200">{job.title}</h4>
                                                {job.matched && <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-mono uppercase">Applied</span>}
                                                {requirementsMet && !job.matched && <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] px-2 py-0.5 rounded font-mono uppercase">Match</span>}
                                            </div>
                                            <p className="text-xs text-zinc-500 font-mono mb-2">{job.company} • {job.location}</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {job.reqSkills.map(rs => {
                                                    const sData = skills.find(s => s.id === rs);
                                                    const hasSkill = sData && sData.unlocked && sData.level > 0;
                                                    return (
                                                        <span key={rs} className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${hasSkill ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-500' : 'bg-rose-950/30 border-rose-800/50 text-rose-500'}`}>
                                                            {sData?.name || rs}
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end space-y-3">
                                            <div className="text-sm font-mono text-emerald-400 font-bold">${job.salary.toLocaleString()}/yr</div>
                                            <button 
                                                onClick={() => handleApplyJob(job.id)}
                                                disabled={job.matched}
                                                className={`text-xs font-mono px-4 py-1.5 rounded transition-colors ${
                                                    job.matched ? 'bg-zinc-900 text-zinc-500 border border-zinc-700 opacity-50 cursor-not-allowed' :
                                                    requirementsMet ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow shadow-emerald-900/50' :
                                                    'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                                                }`}
                                            >
                                                {job.matched ? 'PENDING' : 'APPLY'}
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            {/* Historical Attendance Analytics */}
            <Card className="bg-zinc-950/40 border-zinc-800/60 mt-6">
                <CardHeader className="pb-4 border-b border-zinc-800/50 bg-zinc-900/20">
                    <CardTitle className="text-sm font-semibold text-zinc-300">Workforce History & Promotion Track</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-900/50 text-zinc-500 font-mono border-b border-zinc-800/50">
                            <tr>
                                <th className="px-4 py-3 font-medium tracking-wide">Category</th>
                                <th className="px-4 py-3 font-medium tracking-wide">Current Status</th>
                                <th className="px-4 py-3 font-medium tracking-wide">Requirement</th>
                                <th className="px-4 py-3 font-medium tracking-wide text-right">Eligibility</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/30 text-zinc-300">
                            <tr>
                                <td className="px-4 py-4 flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-2 text-zinc-500"/> Promotion Readiness</td>
                                <td className="px-4 py-4 font-mono text-indigo-400">Level {careerLevel}</td>
                                <td className="px-4 py-4 font-mono text-zinc-400">Level 5</td>
                                <td className="px-4 py-4 text-right text-amber-500 font-bold tracking-wider">PENDING EXP</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-4 flex items-center"><Target className="w-3.5 h-3.5 mr-2 text-zinc-500"/> Performance Score</td>
                                <td className="px-4 py-4 font-mono text-emerald-400">{performance.toFixed(1)} / 100</td>
                                <td className="px-4 py-4 font-mono text-zinc-400">&gt; 90.0</td>
                                <td className="px-4 py-4 text-right text-emerald-500 font-bold tracking-wider">CLEARED</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-4 flex items-center"><CheckSquare className="w-3.5 h-3.5 mr-2 text-zinc-500"/> Discipline Record</td>
                                <td className="px-4 py-4 font-mono text-emerald-400">{warnings} Warnings</td>
                                <td className="px-4 py-4 font-mono text-zinc-400">&lt; 3 Warnings</td>
                                <td className="px-4 py-4 text-right text-emerald-500 font-bold tracking-wider">CLEARED</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>

            <style jsx>{`
                @keyframes scan {
                    0% { top: 0; opacity: 0; }
                    5% { opacity: 1; }
                    95% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 3s linear infinite;
                }
            `}</style>
        </div>
    )
}
