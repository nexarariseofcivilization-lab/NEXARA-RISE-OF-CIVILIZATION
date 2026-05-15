'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';

export function Providers({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const tickGlobalTime = useAppStore(state => state.tickGlobalTime);

    useEffect(() => {
        setMounted(true);
        
        // Setup central simulation heartbeat
        const ticker = setInterval(() => {
            tickGlobalTime();
        }, 1000); // 1 real sec = 1 sim min
        
        return () => clearInterval(ticker);
    }, [tickGlobalTime]);

    if (!mounted) {
        return null; // Prevents hydration mismatch
    }

    return <>{children}</>;
}
