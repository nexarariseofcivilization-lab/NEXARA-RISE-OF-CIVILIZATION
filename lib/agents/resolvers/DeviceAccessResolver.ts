import { AppStore } from '../../store';
import { PerceptionInterpretation } from '../../engine/PerceptionInterpreter';

export class DeviceAccessResolver {
    static tick(
        deviceAccess: AppStore['player']['deviceAccess'],
        interpretation: PerceptionInterpretation
    ): AppStore['player']['deviceAccess'] {
        const nextDevice = { ...deviceAccess };

        // 1. Power & Battery Logic
        // If power reliability is good, the phone is charging
        if (interpretation.powerReliability > 0.6) {
            nextDevice.battery = Math.min(100, nextDevice.battery + 2); // Fast charge if power is stable
        } else if (interpretation.powerReliability > 0.2) {
            nextDevice.battery = Math.min(100, nextDevice.battery + 0.5); // Slow charge if power is spotty
        } else {
            // Power grid down: battery drains
            nextDevice.battery = Math.max(0, nextDevice.battery - 0.5);
        }

        // 2. Connectivity Logic
        // Internet availability depends on Data Network Infrastructure Health AND Battery
        if (nextDevice.battery <= 0) {
            nextDevice.hasInternet = false;
            nextDevice.signalStrength = 0;
        } else {
            // Data network health map
            if (interpretation.dataReliability > 0.8) {
                nextDevice.signalStrength = 100;
                nextDevice.hasInternet = true;
            } else if (interpretation.dataReliability > 0.4) {
                nextDevice.signalStrength = 50;
                nextDevice.hasInternet = true;
            } else if (interpretation.dataReliability > 0.1) {
                nextDevice.signalStrength = 10;
                nextDevice.hasInternet = true; // Spotty but technically connected
            } else {
                nextDevice.signalStrength = 0;
                nextDevice.hasInternet = false;
            }
            
            // Local physical friction (like extreme weather or unrest blocking towers) might penalize it further
            if (interpretation.isHighFriction && nextDevice.signalStrength > 0) {
                nextDevice.signalStrength = Math.max(10, nextDevice.signalStrength - 20);
            }
        }

        return nextDevice;
    }
}
