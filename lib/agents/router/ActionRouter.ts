import { AppStore } from '../../store';
import { PerceptionInterpretation } from '../../engine/PerceptionInterpreter';
import { ConstraintResolver, PlayerAction } from '../resolvers/ConstraintResolver';

export interface ActionRoutingResult {
    processedActionIds: string[];
    deltas: Partial<AppStore['player']>;
    logs: Array<{ msg: string; type: 'info' | 'warn' | 'error' }>;
}

export class ActionRouter {
    static routeAndExecute(
        player: AppStore['player'],
        interpretation: PerceptionInterpretation
    ): ActionRoutingResult {
        const pendingActions = player.pendingActions || [];
        const processedActionIds: string[] = [];
        
        let deltaCash = 0;
        let deltaHunger = 0;
        let deltaStamina = 0;
        let deltaStress = 0;
        const logs: Array<{ msg: string; type: 'info' | 'warn' | 'error' }> = [];

        pendingActions.filter(a => a.status === 'PENDING').forEach(action => {
            // 1. Evaluate Constraints
            const constraintResult = ConstraintResolver.evaluate(action, player, interpretation);
            
            if (!constraintResult.allowed) {
                logs.push({ 
                    msg: `Action failed: ${constraintResult.reason || constraintResult.errorCode}`, 
                    type: 'error' 
                });
                processedActionIds.push(action.id);
                deltaStress += 5; // Failing actions causes frustration
                return;
            }

            // 2. Route to domain logic (Simplified here, could be delegated to DomainExecutors)
            switch (action.type) {
                case 'BUY_GROCERIES': {
                    const cost = action.payload.amount * (1 + interpretation.costOfLivingStress);
                    deltaCash -= cost;
                    deltaHunger += 30; // Negative hunger is fuller, wait: hunger is 0-100 where 100 is starving or satisfied? 
                    // In store.ts: p.hunger = Math.max(0, p.hunger - 0.05); meaning it goes down.
                    // Oh wait! In PersonalSimulationEngine, hunger is dropping. So 100 means full.
                    // Let's verify: In store.ts: p.hunger = Math.max(0, p.hunger - 0.05)
                    // If hunger goes DOWN over time, then 0 is starving, 100 is full.
                    // In calculateInternalEcosystem: hungerMod is subtracted.
                    // Wait, calculateInternalEcosystem says: hunger: player.hunger - hungerMod. So indeed 100 = full.
                    deltaHunger += 30;
                    logs.push({ msg: `Purchased groceries for $${cost.toFixed(2)}.`, type: 'info' });
                    break;
                }
                case 'REST_AT_HOME': {
                    deltaStamina += 20;
                    deltaStress -= 15;
                    logs.push({ msg: `Rested at home. Recovered stamina.`, type: 'info' });
                    break;
                }
                // Add more cases here as we expand
                default: {
                    logs.push({ msg: `Unknown action: ${action.type}`, type: 'warn' });
                    break;
                }
            }

            processedActionIds.push(action.id);
        });

        return {
            processedActionIds,
            deltas: {
                cash: deltaCash,
                hunger: deltaHunger,
                stamina: deltaStamina,
                stress: deltaStress
            },
            logs
        };
    }
}
