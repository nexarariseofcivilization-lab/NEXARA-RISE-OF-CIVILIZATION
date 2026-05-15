import { AppStore } from '../../store';
import { PerceptionInterpretation } from '../../engine/PerceptionInterpreter';

export class WealthExecutor {
    static tick(
        player: AppStore['player'],
        interpretation: PerceptionInterpretation
    ): Partial<AppStore['player']> {
        let deltaCash = 0;

        // Apply ambient living costs depending on interpretation cost-of-living stress
        const ambientCost = interpretation.costOfLivingStress > 0.7 ? 0.15 : 0.05;
        deltaCash -= ambientCost; // Living expenses per tick

        return {
            cash: player.cash + deltaCash
        };
    }
}
