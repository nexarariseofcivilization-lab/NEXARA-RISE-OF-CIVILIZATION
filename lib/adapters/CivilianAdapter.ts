// lib/adapters/CivilianAdapter.ts
import { AppStore } from '../store';

/**
 * CIVILIAN ADAPTER
 * Transforms WorldState into a purely numeric CivilianPerceptionState vector.
 * No semantic narrative or UI logic here.
 */

export interface CivilianPerceptionState {
    inflation_pressure: number;
    shortage_intensity: number;
    power_stability: number;
    water_stability: number;
    transport_stability: number;
    logistics_friction: number;
    social_unrest: number;
    neighborhood_tension: number;
    polarization_index: number;
}

export class CivilianAdapter {
    static transform(worldState: any): CivilianPerceptionState {
        // Economy
        let inflation_pressure = 0;
        let shortage_intensity = 0;
        
        if (worldState.markets && worldState.markets.length > 0) {
            const avgPriceChange = worldState.markets.reduce((acc: number, m: any) => acc + (m.price_change_pct || 0), 0) / worldState.markets.length;
            inflation_pressure = Math.min(Math.max(avgPriceChange / 20, 0), 1.0); // 20% is max pressure
            
            const maxSeverity = Math.max(...worldState.markets.map((m: any) => m.shortage_severity || 0));
            shortage_intensity = Math.min(maxSeverity / 50, 1.0); // 50 severity is max intensity
        }

        // Infrastructure
        let power_stability = 1.0;
        let water_stability = 1.0;
        let transport_stability = 1.0;

        if (worldState.infra_nodes) {
            const powerNode = worldState.infra_nodes.find((n: any) => n.node_type === 'POWER_PLANT');
            if (powerNode) power_stability = powerNode.status === 'OFFLINE' ? 0.0 : Math.max(powerNode.health / 100, 0);

            const waterNode = worldState.infra_nodes.find((n: any) => n.node_type === 'WATER_FACILITY');
            if (waterNode) water_stability = waterNode.status === 'OFFLINE' ? 0.0 : Math.max(waterNode.health / 100, 0);

            const transportNode = worldState.infra_nodes.find((n: any) => n.node_type === 'LOGISTICS_HUB');
            if (transportNode) transport_stability = transportNode.status === 'OFFLINE' ? 0.0 : Math.max(transportNode.health / 100, 0);
        }

        const logistics_friction = 1.0 - transport_stability;

        // Societal
        let social_unrest = 0;
        let neighborhood_tension = 0;
        
        if (worldState.demographics && worldState.demographics.length > 0) {
            const demo = worldState.demographics[0];
            social_unrest = Math.min((demo.unrest_pressure || 0) / 100, 1.0);
            neighborhood_tension = Math.min((demo.avg_stress || 0) / 100, 1.0);
        }

        // Polarization / Epistemics
        let polarization_index = 0;
        if (worldState.social_identity_clusters && worldState.social_identity_clusters.length > 0) {
           const avgRadicalization = worldState.social_identity_clusters.reduce((acc: number, c: any) => acc + (c.radicalization_level || 0), 0) / worldState.social_identity_clusters.length;
           polarization_index = Math.min(avgRadicalization / 100, 1.0);
        }

        return {
            inflation_pressure,
            shortage_intensity,
            power_stability,
            water_stability,
            transport_stability,
            logistics_friction,
            social_unrest,
            neighborhood_tension,
            polarization_index
        };
    }
}

