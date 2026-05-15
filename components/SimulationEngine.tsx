'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export function SimulationEngine() {
    const tickGlobalTime = useAppStore(state => state.tickGlobalTime);

    useEffect(() => {
        // Run tick every 5 seconds to simulate the "world engine"
        const interval = setInterval(() => {
            tickGlobalTime();
        }, 5000);

        return () => clearInterval(interval);
    }, [tickGlobalTime]);

    return null;
}
