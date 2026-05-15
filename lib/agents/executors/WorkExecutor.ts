import { AppStore } from '../../store';
import { PerceptionInterpretation } from '../../engine/PerceptionInterpreter';

export class WorkExecutor {
    static tick(
        player: AppStore['player'],
        interpretation: PerceptionInterpretation,
        actions: { isWorking: boolean }
    ): Partial<AppStore['player']> {
        let deltaCash = 0;
        let deltaCareerExp = 0;
        let deltaStress = 0;
        let deltaStamina = 0;
        let workPerformanceMod = 0;

        if (actions.isWorking) {
            // Fatigue Cost Model
            const effortDrain = player.cognitiveLoad > 70 ? 0.3 : 0.15;
            deltaStamina -= effortDrain;
            deltaStress += 0.2;

            // Income Flow Model
            let productivity = 1.0;
            if (player.apathy > 60) productivity -= 0.4;
            if (player.stress > 80) productivity -= 0.3;

            // Productivity hit due to infra / friction
            if (interpretation.isHighFriction) {
                productivity -= 0.2;
                workPerformanceMod -= 3;
            }

            // Salary approximation
            const tickIncome = 0.67 * productivity; 
            deltaCash += tickIncome;

            // Experience Growth Model
            if (productivity > 0.5) {
                deltaCareerExp += 0.1 * productivity;
            }

            if (player.stamina > 50 && player.stress < 50) {
                workPerformanceMod += 1;
            }
        }

        // Skill / Performance Decay Model (Entropy)
        if (player.apathy > 80) {
            workPerformanceMod -= 2;
        }

        return {
            cash: player.cash + deltaCash,
            careerExp: player.careerExp + deltaCareerExp,
            stress: Math.max(0, Math.min(100, player.stress + deltaStress)),
            stamina: Math.max(0, Math.min(100, player.stamina + deltaStamina)),
            workPerformance: Math.max(0, Math.min(100, player.workPerformance + workPerformanceMod))
        };
    }
}
