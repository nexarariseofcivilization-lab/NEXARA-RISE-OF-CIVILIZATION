import { getSupabaseAdmin } from '../supabase-admin';

export class DiplomacyWorker {
    private supabase: any = getSupabaseAdmin();

    async processDiplomacyTick(tickId: number, tickCounter: number) {
        // Runs every 6 ticks (slow strategic layer)
        if (tickCounter % 6 !== 0) return;

        console.log(`[DIPLOMACY ENGINE] Processing coalitions, fatigue, and strategic memory for tick ${tickId}...`);

        const { error } = await (this.supabase.rpc as any)('process_diplomacy_and_fatigue_tick', {
            p_tick_id: tickId
        });

        if (error) {
            console.error(`[DIPLOMACY ENGINE] Diplomacy processing failed:`, error);
        }
        
        console.log(`[DIPLOMACY ENGINE] Diplomacy cycle completed.`);
    }
}
