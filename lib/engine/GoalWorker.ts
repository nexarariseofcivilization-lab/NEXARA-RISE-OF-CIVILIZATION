import { getSupabaseAdmin } from '../supabase-admin';

export class GoalWorker {
    private supabase: any = getSupabaseAdmin();

    async processGoalTick(tickId: number, tickCounter: number) {
        // Runs every 5 ticks to process strategic goals and faction agendas
        if (tickCounter % 5 !== 0) return;

        console.log(`[GOAL ENGINE] Processing autonomous faction strategies for tick ${tickId}...`);

        const { error: goalErr } = await (this.supabase.rpc as any)('process_goal_conflict_tick', {
            p_tick_id: tickId
        });

        if (goalErr) {
            console.error(`[GOAL ENGINE] Strategy processing failed:`, goalErr);
        }
        
        console.log(`[GOAL ENGINE] Goal cycle completed.`);
    }
}
