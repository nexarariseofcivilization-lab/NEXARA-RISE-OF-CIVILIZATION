import { CivilianPerceptionState } from '../adapters/CivilianAdapter';

/**
 * PERCEPTION INTERPRETER
 * This layer classifies raw perception vectors into semantic weightings and categories 
 * that are understood by the Agent Simulation Engine.
 */

export interface PerceptionInterpretation {
    costOfLivingStress: number;     // Impact of inflation and shortages
    environmentalStress: number;    // Impact of infra failure
    socialThreatLevel: number;      // Impact of unrest and tensions
    existentialBurnout: number;     // Impact of polarization and general friction
    
    powerReliability: number;       // Direct pass of power grid health
    dataReliability: number;        // Direct pass of data network health

    // Categorical tags
    isCrisisMode: boolean;
    isHighFriction: boolean;
    isSociallyIsolated: boolean;
}

export class PerceptionInterpreter {
    static interpret(perception: CivilianPerceptionState): PerceptionInterpretation {
        const costOfLivingStress = (perception.inflation_pressure * 0.7) + (perception.shortage_intensity * 0.3);
        
        const infraFailure = 1.0 - ((perception.power_stability + perception.water_stability + perception.transport_stability) / 3);
        const environmentalStress = infraFailure + (perception.logistics_friction * 0.5);

        const socialThreatLevel = (perception.social_unrest * 0.6) + (perception.neighborhood_tension * 0.4);

        const existentialBurnout = perception.polarization_index;

        const isCrisisMode = (costOfLivingStress > 0.8 || environmentalStress > 0.8 || socialThreatLevel > 0.8);
        const isHighFriction = (perception.logistics_friction > 0.6 || infraFailure > 0.5);
        const isSociallyIsolated = (perception.polarization_index > 0.7 && perception.neighborhood_tension > 0.7);

        return {
            costOfLivingStress: Math.min(costOfLivingStress, 1.0),
            environmentalStress: Math.min(environmentalStress, 1.0),
            socialThreatLevel: Math.min(socialThreatLevel, 1.0),
            existentialBurnout: Math.min(existentialBurnout, 1.0),
            powerReliability: perception.power_stability,
            dataReliability: (perception as any).data_stability !== undefined ? (perception as any).data_stability : perception.power_stability, // Assuming data stability is correlated with power if not provided
            
            isCrisisMode,
            isHighFriction,
            isSociallyIsolated
        };
    }
}
