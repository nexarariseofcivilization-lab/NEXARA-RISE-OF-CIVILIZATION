'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Home, Car, Sofa, Droplet, Zap, Wrench, DollarSign, TrendingUp, ShieldAlert, ArrowUpRight, ArrowDownRight, Package, Lightbulb, MapPin, Building, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';

interface RealEstate {
    id: string;
    type: 'HOUSE' | 'APARTMENT' | 'VILLA' | 'LAND';
    name: string;
    location: string;
    value: number;
    monthlyTax: number;
    maintenanceLvl: number; // 0-100
    securityLvl: number; // 0-100
    utilities: {
        power: number; // monthly cost
        water: number;
        internet: number;
    };
    rooms: Room[];
}

interface Room {
    name: string;
    cleanliness: number;
    items: Furniture[];
}

interface Furniture {
    name: string;
    type: 'SEATING' | 'BED' | 'ELECTRONIC' | 'PLUMBING' | 'KITCHEN';
    quality: number;
    condition: number;
}

interface Vehicle {
    id: string;
    name: string;
    type: 'CAR' | 'MOTORCYCLE' | 'BICYCLE';
    value: number;
    condition: number;
    fuelLevel: number;
    insurance: number;
}

const mockNetWorthHistory = Array.from({ length: 12 }).map((_, i) => ({
    month: `M${i + 1}`,
    value: 120000 + (Math.random() * 20000) + (i * 15000),
}));

export default function PropertyWealthDashboard() {
    const [mounted, setMounted] = useState(false);
    
    const player = useAppStore(state => state.player);
    const finances = {
        cash: player.cash,
        stocksValue: player.stocksValue,
        debt: player.debt
    };

    const properties: RealEstate[] = player.properties;
    const vehicles: Vehicle[] = player.vehicles;

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const totalAssets = finances.cash + finances.stocksValue + properties.reduce((acc, p) => acc + p.value, 0) + vehicles.reduce((acc, v) => acc + v.value, 0);
    const netWorth = totalAssets - finances.debt;

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    const renderConditionBar = (value: number, criticalAt = 30) => (
        <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
            <div className={`h-full transition-all ${value < criticalAt ? 'bg-rose-500' : value < 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${value}%` }} />
        </div>
    );

    return (
        <div className="space-y-6 pb-20 max-w-7xl mx-auto h-full overflow-y-auto custom-scrollbar pr-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-zinc-800 pb-4 shrink-0">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white uppercase font-sans flex items-center">
                        <Home className="w-8 h-8 mr-3 text-indigo-500" />
                        Property & Wealth
                    </h1>
                    <p className="text-zinc-400 mt-2 font-mono text-sm">Asset management, real estate portfolio, and private ecosystem tracking.</p>
                </div>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-zinc-950/60 border-zinc-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Total Net Worth</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white tracking-tight">{formatCurrency(netWorth)}</div>
                        <div className="flex items-center text-xs text-emerald-400 mt-2 font-mono bg-emerald-400/10 w-fit px-2 py-1 rounded">
                            <TrendingUp className="w-3 h-3 mr-1" /> +2.4% vs last month
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-950/60 border-zinc-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Total Assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-300 tracking-tight">{formatCurrency(totalAssets)}</div>
                        <div className="text-xs text-zinc-500 mt-2 font-mono">Liquid & Fixed combined</div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-950/60 border-zinc-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs text-rose-500/70 uppercase tracking-widest font-mono">Total Liabilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-400 tracking-tight">{formatCurrency(finances.debt)}</div>
                        <div className="text-xs text-zinc-500 mt-2 font-mono">Mortgages & Loans</div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-950/60 border-zinc-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Monthly Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-400 tracking-tight">
                            {formatCurrency(properties.reduce((acc, p) => acc + p.monthlyTax + p.utilities.power + p.utilities.internet + p.utilities.water, 0) + vehicles.reduce((a, v) => a + v.insurance, 0))}
                        </div>
                        <div className="text-xs text-zinc-500 mt-2 font-mono">Taxes, utilities, maintenance</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Property & Real Estate */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-bold text-white flex items-center border-b border-zinc-800 pb-2">
                        <Building className="w-5 h-5 mr-2 text-indigo-400" /> Real Estate Portfolio
                    </h2>
                    
                    {properties.map(property => (
                        <Card key={property.id} className="bg-zinc-950/80 border-zinc-800/80 overflow-hidden">
                            <div className="md:flex">
                                <div className="p-6 md:w-1/3 bg-zinc-900/30 border-r border-zinc-800/50">
                                    <div className="flex items-center space-x-2 text-zinc-400 mb-4">
                                        <Home className="w-5 h-5 text-indigo-400" />
                                        <h3 className="text-lg font-bold text-white uppercase tracking-wide">{property.name}</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest block mb-1">Valuation</span>
                                            <div className="text-xl font-bold text-indigo-400">{formatCurrency(property.value)}</div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest block mb-1 flex items-center"><MapPin className="w-3 h-3 mr-1"/> Location</span>
                                            <div className="text-xs text-zinc-300">{property.location}</div>
                                        </div>
                                        
                                        <div className="pt-4 border-t border-zinc-800/50 space-y-3">
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-zinc-500 flex items-center"><Wrench className="w-3 h-3 mr-1"/> Maintenance</span>
                                                    <span className="text-zinc-300 font-mono">{property.maintenanceLvl}%</span>
                                                </div>
                                                {renderConditionBar(property.maintenanceLvl)}
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-zinc-500 flex items-center"><ShieldAlert className="w-3 h-3 mr-1"/> Security</span>
                                                    <span className="text-zinc-300 font-mono">{property.securityLvl}%</span>
                                                </div>
                                                {renderConditionBar(property.securityLvl)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-6 md:w-2/3 flex flex-col">
                                    {/* Utilities & Costs */}
                                    <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-zinc-800/50">
                                        <div className="text-center p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                                            <Zap className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                                            <div className="text-sm font-bold text-white">{formatCurrency(property.utilities.power)}</div>
                                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Power/mo</div>
                                        </div>
                                        <div className="text-center p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                                            <Droplet className="w-4 h-4 mx-auto text-cyan-400 mb-1" />
                                            <div className="text-sm font-bold text-white">{formatCurrency(property.utilities.water)}</div>
                                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Water/mo</div>
                                        </div>
                                        <div className="text-center p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                                            <DollarSign className="w-4 h-4 mx-auto text-rose-400 mb-1" />
                                            <div className="text-sm font-bold text-white">{formatCurrency(property.monthlyTax)}</div>
                                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Tax/mo</div>
                                        </div>
                                    </div>

                                    {/* Rooms & Furniture */}
                                    <div className="flex-1">
                                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Interior Conditions</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {property.rooms.map((room, idx) => (
                                                <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded p-3">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm font-semibold text-zinc-200">{room.name}</span>
                                                        <span className="text-[10px] text-zinc-500">Clean: {room.cleanliness}%</span>
                                                    </div>
                                                    <div className="space-y-2 mt-3">
                                                        {room.items.map((item, i) => (
                                                            <div key={i} className="flex justify-between items-center bg-zinc-950 p-2 rounded group">
                                                                <div className="flex items-center">
                                                                    <Sofa className="w-3 h-3 text-zinc-600 mr-2 group-hover:text-amber-400 transition-colors" />
                                                                    <span className="text-xs text-zinc-400">{item.name}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="w-16">
                                                                        {renderConditionBar(item.condition)}
                                                                    </div>
                                                                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] uppercase tracking-widest font-mono bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded hover:bg-emerald-500/20 hover:text-emerald-400">
                                                                        Use
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end gap-2">
                                        <button className="px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-widest bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 transition">Pay Bills</button>
                                        <button className="px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-widest bg-indigo-600 text-white rounded hover:bg-indigo-500 transition">Hire Cleaners</button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Right Column: Vehicles & Wealth Chart */}
                <div className="col-span-1 space-y-6">
                    <h2 className="text-lg font-bold text-white flex items-center border-b border-zinc-800 pb-2">
                        <DollarSign className="w-5 h-5 mr-2 text-emerald-400" /> Wealth Analytics
                    </h2>
                    <Card className="bg-zinc-950/60 border-zinc-800/80">
                        <CardHeader className="py-4">
                            <CardTitle className="text-xs text-zinc-400 uppercase tracking-widest font-mono">Net Worth Progression</CardTitle>
                        </CardHeader>
                        <CardContent className="px-2 pb-4">
                            <div className="h-[200px] w-full border border-dashed border-zinc-800 rounded flex items-center justify-center">
                                <span className="font-mono text-zinc-600 text-xs">CHART UNAVAILABLE</span>
                            </div>
                        </CardContent>
                    </Card>

                    <h2 className="text-lg font-bold text-white flex items-center border-b border-zinc-800 pb-2 mt-8">
                        <Car className="w-5 h-5 mr-2 text-orange-400" /> Garage & Vehicles
                    </h2>
                    {vehicles.map(vehicle => (
                        <Card key={vehicle.id} className="bg-zinc-950 border-zinc-800">
                            <div className="p-4 flex items-center border-b border-zinc-800">
                                <div className="p-3 rounded-full bg-zinc-900 border border-zinc-800 mr-4">
                                    <Car className="w-6 h-6 text-orange-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">{vehicle.name}</h4>
                                    <div className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest">{formatCurrency(vehicle.value)}</div>
                                </div>
                            </div>
                            <div className="p-4 space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-zinc-500">Condition</span>
                                        <span className="text-zinc-300 font-mono">{vehicle.condition}%</span>
                                    </div>
                                    {renderConditionBar(vehicle.condition)}
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-zinc-500">Fuel Level</span>
                                        <span className="text-zinc-300 font-mono">{vehicle.fuelLevel}%</span>
                                    </div>
                                    {renderConditionBar(vehicle.fuelLevel, 20)}
                                </div>
                                <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
                                    <div className="text-xs text-zinc-500">Insurance: <span className="text-zinc-300 font-mono">{formatCurrency(vehicle.insurance)}/mo</span></div>
                                    <button className="text-[10px] font-mono uppercase bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition">Service</button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
