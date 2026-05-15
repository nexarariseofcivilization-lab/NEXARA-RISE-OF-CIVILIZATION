'use server'

import { getSupabaseAdmin } from './supabase-admin';

export async function getSimulationState() {
    const supabase = getSupabaseAdmin();

    const { data: ticks } = await supabase.from('global_ticks').select('*').order('id', { ascending: false }).limit(1) as any;
    const currentTickId = ticks?.[0]?.id || 0;

    const { data: regions } = await supabase.from('regions').select('*') as any;
    const { data: region_states } = await supabase.from('region_state_current').select('*') as any;
    const { data: infra_nodes } = await supabase.from('infrastructure_nodes').select('*') as any;
    const { data: demographics } = await supabase.from('region_demographics').select('*') as any;
    const { data: markets } = await supabase.from('regional_market').select('*') as any;
    const { data: treasuries } = await supabase.from('government_treasury').select('*') as any;
    const { data: policies } = await supabase.from('active_policies').select('*, policy_blueprints(name)') as any;
    const { data: channels } = await supabase.from('information_channels').select('*') as any;
    const { data: narratives } = await supabase.from('public_narratives').select('*') as any;
    const { data: factions } = await supabase.from('regional_factions').select('*, factions(name)') as any;
    const { data: faction_objectives } = await supabase.from('faction_objectives').select('*, factions(name)') as any;
    const { data: faction_relations } = await supabase.from('faction_relations').select('*') as any;
    const { data: faction_memory } = await supabase.from('faction_memory').select('*, factions(name)') as any;
    const { data: cultural_myths } = await supabase.from('cultural_myths').select('*, factions(name)') as any;
    const { data: tick_metrics } = await supabase.from('tick_health_metrics').select('*').order('created_at', { ascending: false }).limit(60) as any;
    const { data: mobilizations } = await supabase.from('organized_mobilizations').select('*, factions(name)') as any;
    const { data: events } = await supabase.from('event_queue').select('*').order('created_at', { ascending: false }).limit(20) as any;
    const { data: history } = await supabase.from('event_log').select('*').order('created_at', { ascending: false }).limit(20) as any;

    return {
        currentTickId,
        regions: regions || [],
        region_states: region_states || [],
        infra_nodes: infra_nodes || [],
        demographics: demographics || [],
        markets: markets || [],
        treasuries: treasuries || [],
        policies: policies || [],
        channels: channels || [],
        narratives: narratives || [],
        factions: factions || [],
        faction_objectives: faction_objectives || [],
        faction_relations: faction_relations || [],
        faction_memory: faction_memory || [],
        cultural_myths: cultural_myths || [],
        tick_metrics: tick_metrics || [],
        mobilizations: mobilizations || [],
        events: events || [],
        history: history || [],
    };
}

export async function executeTickManual() {
    try {
        const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + '/api/cron/tick', {
            method: 'POST',
        });
        return await res.json();
    } catch (err: any) {
        console.error(err);
        return { success: false, error: err.message };
    }
}

export async function getReplayData(regionId: string, startTick: number, endTick: number) {
    const supabase = getSupabaseAdmin();
    const { data: snapshots } = await supabase
        .from('region_state_snapshots')
        .select('*')
        .eq('region_id', regionId)
        .gte('tick_id', startTick)
        .lte('tick_id', endTick)
        .order('tick_id', { ascending: true }) as any;

    const { data: events } = await supabase
        .from('event_log')
        .select('*')
        .eq('region_id', regionId)
        .gte('tick_id', startTick)
        .lte('tick_id', endTick)
        .order('tick_id', { ascending: true }) as any;

    return { snapshots: snapshots || [], events: events || [] };
}
