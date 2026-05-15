import { NextResponse } from 'next/server';
import { TickDispatcher } from '@/lib/engine/TickDispatcher';

// Typically this would be protected by a static bearer token configured in Vercel Cron.
// For now, we allow GET/POST for development triggering.

export async function GET(req: Request) {
    try {
        const dispatcher = new TickDispatcher();
        const result = await dispatcher.executeTick();
        return NextResponse.json({ success: true, result });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    return GET(req);
}
