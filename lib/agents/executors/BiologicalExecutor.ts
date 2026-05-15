import { AppStore } from '../../store';
import { PerceptionInterpretation } from '../../engine/PerceptionInterpreter';

export class BiologicalExecutor {
    static tick(
        player: AppStore['player'],
        interpretation: PerceptionInterpretation,
        actions: { isWorking: boolean }
    ): Partial<AppStore['player']> {
        let deltaStamina = 0;
        let deltaStress = 0;
        let deltaCognitiveLoad = 0;
        let deltaApathy = 0;
        let hungerMod = 0.5;
        let thirstMod = 1.0;
        let hygieneMod = 0.2;

        // Base Recovery (if not working)
        if (!actions.isWorking) {
            deltaStamina += 0.5; // slow ambient recovery
            deltaStress -= 0.2;
        }

        // Environmental Reality (Infrastructure & Logistics)
        if (interpretation.isHighFriction) { 
            deltaStamina -= 0.5;
            deltaStress += 0.8;
        }

        // Economic Pressures
        if (interpretation.costOfLivingStress > 0.5) {
            deltaStress += 1.2;
            hungerMod += interpretation.costOfLivingStress * 0.5; 
        }

        // Social and Existential Threat
        if (interpretation.socialThreatLevel > 0.6) {
            deltaStress += 1.0;
        }

        if (interpretation.existentialBurnout > 0.6) {
            deltaCognitiveLoad += 1.0;
        }

        if (interpretation.isCrisisMode) {
            deltaStress += 2;
            deltaCognitiveLoad += 2;
        }

        // Burnout cascades
        if (player.stress + deltaStress > 80 || player.cognitiveLoad + deltaCognitiveLoad > 80) {
            deltaApathy += 1.0;
        }

        return {
            stamina: Math.max(0, Math.min(100, player.stamina + deltaStamina)),
            stress: Math.max(0, Math.min(100, player.stress + deltaStress)),
            cognitiveLoad: Math.max(0, Math.min(100, player.cognitiveLoad + deltaCognitiveLoad)),
            apathy: Math.max(0, Math.min(100, player.apathy + deltaApathy)),
            hunger: Math.max(0, Math.min(100, player.hunger - hungerMod)),
            thirst: Math.max(0, Math.min(100, player.thirst - thirstMod)),
            hygiene: Math.max(0, Math.min(100, player.hygiene - hygieneMod))
        };
    }
}
