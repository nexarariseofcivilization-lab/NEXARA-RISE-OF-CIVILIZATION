/**
 * Nexara: Rise of Civilization 
 * Global Simulation Engine Orchestrator
 */

export const simulationTickIntervals = {
    ECONOMY_TICK: '0 * * * *', // Hourly
    POPULATION_TICK: '0 0 * * *', // Daily 
    ELECTION_TICK: '0 12 * * *', // Mid-day
    MARKET_FLUCTUATION: '*/15 * * * *' // Every 15 minutes
};

// ... further business logic 
