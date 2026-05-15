import { PerceptionInterpretation } from '../engine/PerceptionInterpreter';
import { AppStore } from '../store';
import { ActionRouter } from './router/ActionRouter';
import { BiologicalExecutor } from './executors/BiologicalExecutor';
import { WorkExecutor } from './executors/WorkExecutor';
import { WealthExecutor } from './executors/WealthExecutor';
import { DeviceAccessResolver } from './resolvers/DeviceAccessResolver';
import { ConstraintResolver } from './resolvers/ConstraintResolver';

/**
 * AGENT EXECUTION ENGINE
 * Orchestrates constraints, routing, and domain execution.
 */
export class PersonalSimulationEngine {
    
    /**
     * CORE TICK ENTRY POINT
     */
    static processAgentTick(
        player: AppStore['player'], 
        interpretation: PerceptionInterpretation,
        activeActions: { isWorking: boolean }
    ): Partial<AppStore['player']> {
        // 0. Update EADL (External Access Dependency Layer)
        // Resolves device access (battery, internet) against macro truth
        const deviceAccess = DeviceAccessResolver.tick(player.deviceAccess, interpretation);
        const playerWithUpdatedDevice = { ...player, deviceAccess };

        // 1. Action Routing & Constraints Evaluation
        const routingResult = ActionRouter.routeAndExecute(playerWithUpdatedDevice, interpretation);

        
        // Log results
        if (typeof window !== 'undefined' && routingResult.logs.length > 0) {
            const addLog = require('../store').useAppStore.getState().addLog;
            routingResult.logs.forEach(log => addLog(log.msg, log.type));
        }

        // 2. Prepare Interim State
        const interimPlayer = { 
            ...playerWithUpdatedDevice, 
            ...routingResult.deltas,
            hunger: Math.max(0, Math.min(100, (player.hunger || 0) + (routingResult.deltas.hunger || 0))),
            cash: player.cash + (routingResult.deltas.cash || 0),
            stamina: Math.max(0, Math.min(100, (player.stamina || 0) + (routingResult.deltas.stamina || 0))),
            stress: Math.max(0, Math.min(100, (player.stress || 0) + (routingResult.deltas.stress || 0))),
        };

        const newPendingActions = (player.pendingActions || []).filter(a => !routingResult.processedActionIds.includes(a.id));

        // 3. Domain Execution: Biology
        const bioResult = BiologicalExecutor.tick(interimPlayer, interpretation, activeActions);
        const bioPlayer = { ...interimPlayer, ...bioResult };

        // 4. Domain Execution: Work & Career
        // First, check if the continuous state 'isWorking' is valid
        const continuousWorkAllowed = activeActions.isWorking 
            ? ConstraintResolver.evaluate({ id: '0', type: 'GO_TO_WORK', payload: {}, status: 'PENDING' }, interimPlayer, interpretation).allowed
            : false;
        
        const workResult = WorkExecutor.tick(bioPlayer, interpretation, { isWorking: continuousWorkAllowed });
        const workPlayer = { ...bioPlayer, ...workResult };

        // If work was forcefully stopped, we should update the player's isWorking state
        let finalIsWorkingState = {};
        if (activeActions.isWorking && !continuousWorkAllowed) {
            finalIsWorkingState = { isWorking: false };
            if (typeof window !== 'undefined') {
                require('../store').useAppStore.getState().addLog('You were forcefully checked out from work due to exhausted constraints or disruptions.', 'error');
            }
        }

        // 5. Domain Execution: Wealth
        const wealthResult = WealthExecutor.tick(workPlayer, interpretation);

        return {
            ...bioResult,
            ...workResult,
            ...wealthResult,
            ...finalIsWorkingState,
            deviceAccess,
            pendingActions: newPendingActions
        };
    }
}
