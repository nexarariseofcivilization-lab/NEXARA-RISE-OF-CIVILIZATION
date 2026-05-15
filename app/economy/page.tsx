'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Coins, TrendingUp, DollarSign, Store, PieChart, TrendingDown, ArrowRight, Server, Box, Plane } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';

const budgetData = [
    { department: 'Defense', allocated: 450, spent: 410 },
    { department: 'Healthcare', allocated: 380, spent: 395 }, // Over budget
    { department: 'Education', allocated: 320, spent: 280 },
    { department: 'Infrastructure', allocated: 250, spent: 150 },
    { department: 'Social Sec', allocated: 500, spent: 480 },
    { department: 'Admin', allocated: 120, spent: 110 },
];

export default function EconomyDashboard() {
    const economy = useAppStore(state => state.economy);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-zinc-800 pb-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white uppercase font-sans flex items-center">
                        <Coins className="w-8 h-8 mr-3 text-blue-500" />
                        National Economy Network
                    </h1>
                    <p className="text-zinc-400 mt-2 font-mono text-sm">Realtime APBN, market simulation, and labor metrics.</p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-blue-900/30 hover:bg-blue-900/50 transition-colors border border-blue-800/50 rounded text-xs font-mono text-blue-300 flex-1 sm:flex-none text-center justify-center flex items-center">
                        TREASURY SETTINGS
                    </button>
                    <button className="px-4 py-2 bg-emerald-900/30 hover:bg-emerald-900/50 transition-colors border border-emerald-800/50 rounded text-xs font-mono text-emerald-300 flex-1 sm:flex-none text-center justify-center flex items-center">
                        EXPORT REPORT
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-zinc-950/50 border-zinc-800/80 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Gross Domestic Product</CardTitle>
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-mono text-emerald-400 font-bold">${economy.gdp.toFixed(2)}<span className="text-base text-zinc-500">T</span></div>
                        <p className="text-[10px] text-zinc-500 mt-2 flex items-center">
                            <TrendingUp className="w-3 h-3 text-emerald-500 mr-1" />
                            +2.4% vs last quarter
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-950/50 border-zinc-800/80 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Inflation Rate</CardTitle>
                        <TrendingUp className="w-4 h-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-mono text-red-400 font-bold">{economy.global_inflation.toFixed(2)}%</div>
                        <p className="text-[10px] text-zinc-500 mt-2 flex items-center">
                            <TrendingDown className="w-3 h-3 text-emerald-500 mr-1" />
                            -0.1% vs last month (Target: 2.0%)
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-950/50 border-zinc-800/80 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Trade Balance</CardTitle>
                        <Plane className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-mono text-blue-400 font-bold">-$42.8<span className="text-base text-zinc-500">B</span></div>
                        <p className="text-[10px] text-zinc-500 mt-2 flex items-center">
                            <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                            Deficit expanding
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-950/50 border-zinc-800/80 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Active Businesses</CardTitle>
                        <Store className="w-4 h-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-mono text-purple-400 font-bold">142,891</div>
                        <p className="text-[10px] text-zinc-500 mt-2 flex items-center">
                            <ArrowRight className="w-3 h-3 text-zinc-500 mr-1" />
                            +12 net today
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                 {/* APBN Department Budget Overview */}
                 <Card className="col-span-1 xl:col-span-2 bg-zinc-950/40 border-zinc-800/60 max-h-[500px] flex flex-col">
                    <CardHeader className="border-b border-zinc-800/50 pb-4">
                        <CardTitle className="text-sm flex items-center text-zinc-300">
                            <PieChart className="w-4 h-4 mr-2 text-zinc-500" />
                            APBN Expenditure Analysis
                        </CardTitle>
                        <CardDescription className="text-[10px] font-mono">Vs. Allocated Budget (in Billions)</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-4 min-h-[300px]">
                        <div className="w-full h-full">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={budgetData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis dataKey="department" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '12px' }}
                                        itemStyle={{ color: '#d4d4d8' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                                    <Bar dataKey="allocated" name="Allocated" fill="#10b981" radius={[2, 2, 0, 0]} />
                                    <Bar dataKey="spent" name="Spent" fill="#3f3f46" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                 </Card>

                 {/* Commodity Markets */}
                 <Card className="col-span-1 bg-zinc-950/40 border-zinc-800/60 flex flex-col max-h-[500px]">
                    <CardHeader className="border-b border-zinc-800/50 pb-4">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-sm flex items-center text-zinc-300">
                                <Box className="w-4 h-4 mr-2 text-zinc-500" />
                                Resource Markets
                            </CardTitle>
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-900/30 text-emerald-400 rounded-sm border border-emerald-800/50">LIVE</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto custom-scrollbar">
                         <div className="divide-y divide-zinc-800/50">
                            {[
                                { symbol: 'OIL', name: 'Crude Oil', price: 84.12, change: 1.2, stock: 'High' },
                                { symbol: 'WHT', name: 'Wheat', price: 21.50, change: -0.4, stock: 'Low' },
                                { symbol: 'ELC', name: 'Electronics', price: 540.20, change: 3.1, stock: 'Medium' },
                                { symbol: 'STL', name: 'Steel', price: 112.50, change: 0.8, stock: 'High' },
                                { symbol: 'NRG', name: 'Energy', price: 45.80, change: 5.2, stock: 'Critical' },
                                { symbol: 'MED', name: 'Medical Supp.', price: 890.00, change: -1.2, stock: 'Medium' },
                            ].map((item, i) => (
                                <div key={i} className="p-4 hover:bg-zinc-900/30 transition-colors flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs font-bold font-mono text-zinc-300">{item.symbol}</span>
                                            <span className="text-[10px] text-zinc-500 uppercase">{item.name}</span>
                                        </div>
                                        <div className="flex items-center mt-1">
                                            <span className="text-[10px] text-zinc-500 mr-2">Stock:</span>
                                            <span className={`text-[10px] font-bold ${item.stock === 'High' ? 'text-blue-400' : item.stock === 'Critical' ? 'text-red-400' : 'text-amber-400'}`}>{item.stock}</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className="text-sm font-mono text-zinc-200">${item.price.toFixed(2)}</span>
                                        <span className={`text-[10px] font-mono mt-1 ${item.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {item.change >= 0 ? '+' : ''}{item.change}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </CardContent>
                 </Card>
            </div>
            
            {/* Tax Brackets & Policy */}
            <Card className="bg-zinc-950/40 border-zinc-800/60 overflow-hidden">
                <CardHeader className="pb-4 border-b border-zinc-800/50 bg-zinc-900/20">
                    <CardTitle className="text-sm font-semibold text-zinc-300">National Taxation Policy</CardTitle>
                    <CardDescription className="text-xs">Current effective tax brackets and proposed changes</CardDescription>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-900/50 text-zinc-500 font-mono">
                            <tr>
                                <th className="px-4 py-3 font-medium">Demographic / Sector</th>
                                <th className="px-4 py-3 font-medium">Current Rate</th>
                                <th className="px-4 py-3 font-medium">Compliance</th>
                                <th className="px-4 py-3 font-medium text-right">Proj. Revenue</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                            <tr>
                                <td className="px-4 py-3">Corporate (Tier 1)</td>
                                <td className="px-4 py-3 font-mono text-amber-400">24.5%</td>
                                <td className="px-4 py-3">
                                    <div className="w-full bg-zinc-800 rounded-full h-1.5 max-w-[100px]"><div className="bg-amber-500 h-1.5 rounded-full w-[82%]"></div></div>
                                </td>
                                <td className="px-4 py-3 text-right font-mono">$1.2T</td>
                                <td className="px-4 py-3 text-right"><button className="text-zinc-500 hover:text-white transition-colors">Adjust</button></td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3">Income (Upper Class)</td>
                                <td className="px-4 py-3 font-mono">32.0%</td>
                                <td className="px-4 py-3">
                                    <div className="w-full bg-zinc-800 rounded-full h-1.5 max-w-[100px]"><div className="bg-emerald-500 h-1.5 rounded-full w-[94%]"></div></div>
                                </td>
                                <td className="px-4 py-3 text-right font-mono">$840B</td>
                                <td className="px-4 py-3 text-right"><button className="text-zinc-500 hover:text-white transition-colors">Adjust</button></td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3">Income (Working Class)</td>
                                <td className="px-4 py-3 font-mono">12.0%</td>
                                <td className="px-4 py-3">
                                    <div className="w-full bg-zinc-800 rounded-full h-1.5 max-w-[100px]"><div className="bg-emerald-500 h-1.5 rounded-full w-[96%]"></div></div>
                                </td>
                                <td className="px-4 py-3 text-right font-mono">$420B</td>
                                <td className="px-4 py-3 text-right"><button className="text-zinc-500 hover:text-white transition-colors">Adjust</button></td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3">Sales / VAT</td>
                                <td className="px-4 py-3 font-mono">10.0%</td>
                                <td className="px-4 py-3">
                                    <div className="w-full bg-zinc-800 rounded-full h-1.5 max-w-[100px]"><div className="bg-emerald-500 h-1.5 rounded-full w-[89%]"></div></div>
                                </td>
                                <td className="px-4 py-3 text-right font-mono">$960B</td>
                                <td className="px-4 py-3 text-right"><button className="text-zinc-500 hover:text-white transition-colors">Adjust</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
