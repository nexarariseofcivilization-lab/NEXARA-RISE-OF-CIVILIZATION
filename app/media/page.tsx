'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, Radio } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function MediaDashboard() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-100">AI News Network</h1>
                    <p className="text-zinc-400 mt-1">Live coverage of simulated events and public sentiment.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-zinc-950 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                            <span>Breaking News Feed</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-xs font-bold uppercase rounded">Critical</span>
                                        <span className="text-xs text-zinc-500 font-mono">15 mins ago</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-zinc-200">Markets tumble as new tax regulations pass</h3>
                                    <p className="text-sm text-zinc-400 mt-2">The national assembly narrowly passed the controversial corporate tax hike, sending the capital markets into a frenzy...</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
