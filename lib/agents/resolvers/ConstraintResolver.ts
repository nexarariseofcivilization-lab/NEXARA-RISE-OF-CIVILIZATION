import { AppStore } from '../../store';
import { PerceptionInterpretation } from '../../engine/PerceptionInterpreter';

export interface ActionConstraintResult {
    allowed: boolean;
    errorCode?: string;
    reason?: string;
}

export type PlayerAction = AppStore['player']['pendingActions'][0];

export class ConstraintResolver {
    static evaluate(
        action: PlayerAction,
        player: AppStore['player'],
        interpretation: PerceptionInterpretation
    ): ActionConstraintResult {
        // 1. Digital Access Constraints (EADL - External Access Dependency Layer)
        const requiresInternet = ['BUY_GROCERIES', 'SEARCH_JOB', 'CHECK_NEWS', 'WORK_REMOTE'].includes(action.type);
        const requiresBattery = ['BUY_GROCERIES', 'SEARCH_JOB', 'CHECK_NEWS', 'WORK_REMOTE', 'CALL_FAMILY'].includes(action.type);

        if (requiresBattery && player.deviceAccess.battery <= 0) {
            return { allowed: false, errorCode: 'DEVICE_DEAD', reason: 'Smartphone battery is dead.' };
        }

        if (requiresInternet && (!player.deviceAccess.hasInternet || player.deviceAccess.signalStrength < 10)) {
            return { allowed: false, errorCode: 'NO_CONNECTIVITY', reason: 'No internet connection available.' };
        }

        // 2. Physical & Biological Constraints
        if (action.type === 'GO_TO_WORK') {
            if (player.stamina < 10) {
                return { allowed: false, errorCode: 'PHYSICAL_COLLAPSE', reason: 'Too exhausted to work.' };
            }
            if (interpretation.isHighFriction) {
                // E.g., blocked roads
                // Depending on severity, we could block it entirely or just apply penalty (handled in executor).
                // Let's block it if stamina is also low.
                if (player.stamina < 30) {
                    return { allowed: false, errorCode: 'LOGISTICS_BLOCKED', reason: 'Roads are blocked and stamina is too low to walk.' };
                }
            }
        }

        // 3. Wealth / Liquidity Constraints
        if (action.type === 'BUY_GROCERIES') {
            const cost = action.payload.amount * (1 + interpretation.costOfLivingStress);
            if (player.cash < cost) {
                return { allowed: false, errorCode: 'INSUFFICIENT_FUNDS', reason: 'Not enough cash liquid.' };
            }
        }

        return { allowed: true };
    }
}
