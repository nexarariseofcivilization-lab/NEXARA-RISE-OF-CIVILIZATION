import { create } from 'zustand';

export type InfraStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE';
export type MaintenancePolicy = 'PREVENTIVE' | 'BALANCED' | 'REACTIVE' | 'EMERGENCY';
export type InfraType = 'POWER' | 'ISP' | 'TRANSPORT' | 'BANKING' | 'FOOD' | 'DATA' | 'WATER' | 'HEALTHCARE';

export interface InfraNode {
    health: number;
    status: InfraStatus;
    level: number;
    doctrine: string;
    maintenancePolicy: MaintenancePolicy;
    efficiency: number;
}

export interface RegionInfra {
    id: string;
    name: string;
    nodes: Record<InfraType, InfraNode>;
    resilienceScore: number;
    population?: number; // In millions
    area?: number; // In km2
}

export type BudgetStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'ACTIVE';

export interface GovRole {
    id: string;
    title: string;
    holderName: string;
    loyalty: number;
    influence: number;
    competence: number;
}

export interface Budget {
    id: string;
    status: BudgetStatus;
    totalAmount: number;
    revNumber: number;
    approverId: string | null;
    rejectedReason?: string;
}

export interface Party {
    id: string;
    name: string;
    ideology: string;
    influence: number;
    activePolicies: string[];
}

export interface Candidate {
    id: string;
    name: string;
    partyId: string;
    bio: string;
    scandals: string[];
    traits: string[];
    publicTrust: number;
    historicalReputation: string;
}

export interface Poll {
    candidateId: string;
    percentage: number;
    trend: number;
}


export interface ActionPayload {
    staminaMod?: number;
    stressMod?: number;
    hungerMod?: number;
    moneyMod?: number;
    durationMins: number; // how much time advances
}

export interface SystemCrisis {
    id: string;
    title: string;
    description: string;
    severity: number; // 1-3
    category: 'LABOR' | 'MEDIA' | 'INFRASTRUCTURE' | 'POLITICAL';
    options: {
        id: string;
        label: string;
        style: 'danger' | 'default';
        impactEffects: {
            budgetMod?: number; // In billions
            approvalMod?: number;
            unrestLevelMod?: number;
            logMsg: string;
        };
    }[];
}

export interface Bill {
    id: string;
    name: string;
    description: string;
    support: number;
    req: number;
    status: 'VOTING' | 'DEBATE' | 'PASSED_WAITING_SIGN';
    impactEffects: {
        budgetMod?: number;
        householdStressMod?: number;
        unrestMod?: number;
        inflationMod?: number;
        investorConfidenceMod?: number;
        publicOpinionMod?: number;
        logMsg: string;
    };
}

export interface SubNode {
    id: string;
    name: string;
    type: 'COMPUTE' | 'ENERGY' | 'DEFENSE';
    status: 'ONLINE' | 'OFFLINE';
    priority: number; // 1 (low) - 5 (high)
}

export interface MetricHistory {
    time: string;
    computeLoad: number;
    syncStability: number;
    thermalOutput: number;
    energyReserves: number;
}

export interface CCNModule {
    id: string;
    name: string;
    health: number; // 0-100
    level: number;
    status: 'OPTIMAL' | 'DEGRADED' | 'OFFLINE' | 'COMPROMISED';
    description: string;
    upstream?: string[];
    downstream?: string[];
}

export interface CCNState {
    civilizationIntelligence: {
        name: string;
        awarenessLevel: number; // 0-100
        autonomyId: string;
        currentAgenda: string;
        alignment: 'ALIGNED' | 'DRIFTING' | 'ROGUE';
    };
    modules: Record<string, CCNModule>;
    metrics: {
        computeLoad: number; // 0-100
        syncStability: number; // 0-100
        thermalOutput: number; // 0-100
        orbitalIntegrity: number; // 0-100
        energyReserves: number;
    };
    metricHistory: MetricHistory[];
    subNodes: SubNode[];
    activeEvents: string[];
}

export interface AppStore {
    // 1. GLOBAL TIME
    globalTime: Date;
    
    // 2. PLAYER STATE
    player: {
        name: string;
        age: number;
        gender: string;
        birthplace: string;
        stamina: number; // 0-100
        hunger: number; // 0-100
        thirst: number; // 0-100
        hygiene: number; // 0-100
        happiness: number; // 0-100
        fitness: number; // 0-100
        stress: number; // 0-100
        cognitiveLoad: number; // 0-100
        apathy: number; // 0-100
        cash: number;
        stocksValue: number;
        debt: number;
        workPerformance: number;
        jobTitle: string;
        employer: string;
        careerExp: number;
        professionalism: number;
        warnings: number;
        vacationDays: number;
        isWorking: boolean;
        pendingActions: { id: string; type: string; payload: any; status: 'PENDING' | 'EXECUTING' | 'FAILED' | 'COMPLETED', resolvedResult?: string }[];
        deviceAccess: {
            battery: number;
            hasInternet: boolean;
            signalStrength: number;
        };
        skills: { id: string; name: string; level: number; maxLevel: number; cost: number; parentId: string | null; icon: string; description: string; unlocked: boolean }[];
        tasks: { id: string; title: string; priority: 'HIGH' | 'MEDIUM' | 'LOW'; completed: boolean; deadline?: Date; reminder?: boolean }[];
        jobMarket: { id: string; title: string; company: string; location: string; salary: number; reqSkills: string[]; matched: boolean }[];
        properties: any[];
        vehicles: any[];
        offlineDirectives?: {
            mode: 'SURVIVAL' | 'CAREER' | 'ACTIVIST';
            lastUpdated: Date;
        };
    };
    
    // 3. INFRASTRUCTURE STATE
    infra: {
        regions: Record<string, RegionInfra>;
    };

    // 3.5 RESOURCE STATE
    resources: {
        energy: number;
        materials: number;
        components: number;
        fuel: number;
        food: number;
        water: number;
        budget: number;
        emergencyReserves: number;
    };

    // 4. ECONOMY STATE
    economy: {
        global_inflation: number;
        global_unemployment: number;
        gdp: number;
        tradeBalance: number;
    };

    // 5. SOCIETY STATE (AI CIVILIZATION ENGINE)
    society: {
        population: number;
        educationIndex: number;
        healthcareQuality: number;
        crimeRate: number;
        socialQualityIndex: number;
        
        // Psychological Layer
        psychology: {
            stressLevel: number;
            emotionalVolatility: number;
            politicalTrust: number;
            fearIndex: number;
            optimism: number;
            burnoutRisk: number;
        };

        // Social Unrest System
        unrest: {
            level: number; // 0-100
            stage: 'DISSATISFACTION' | 'ORGANIZED_CRITICISM' | 'LOCALIZED_PROTEST' | 'MASS_UNREST' | 'RIOTS' | 'INSTITUTIONAL_COLLAPSE';
            catalyst: string | null;
        };

        systemicConfidenceIndex: number;
        citizens: Array<{
            id: string;
            name: string;
            class: 'UPPER' | 'MIDDLE' | 'WORKING' | 'POVERTY';
            ideology: 'PROGRESSIVE' | 'CONSERVATIVE' | 'NATIONALIST' | 'GLOBALIST';
            trustBaseline: number; // 0-100
            currentTrust: number; // 0-100
        }>;
        
        // Political Dynamics
        ideology: {
            nationalism: number;
            conservatism: number;
            progressivism: number;
            authoritarianTolerance: number;
            populism: number;
        };
        
        // Level of Detail (LOD) Active Stats
        simulationStatus: {
            tierA_count: number;
            tierB_count: number;
            tierC_count: number;
            tierD_count: number;
        };

        // Active Historic Memories
        nationalMemory: Array<{
            id: string;
            date: string;
            eventTitle: string;
            impactScore: number; // 0-100
            sentiment: 'POSITIVE' | 'NEGATIVE' | 'TRAUMATIC';
            currentEffects: string[];
            currentWeight?: number;
        }>;

        // Household-Level Stress Metrics
        households: {
            unpaidUtilityBills: number; // percentage
            foodInsecurityIndex: number; // 0-100
            evictionRate: number; // percentage
            averageBurnout: number; // 0-100
        };

        // Active Behavioral Stream
        behavioralStream: Array<{
            id: string;
            timestamp: string;
            message: string;
            type: string;
            region: string;
            impact: string;
        }>;

        // Active Civilian Behavioral Adaptations
        adaptations: {
            jobSeekingSurge: number;
            migrationPressure: number;
            healthcareAvoidance: number;
            unionOrganization: number;
        };

        classes: {
            upper: number;
            middle: number;
            working: number;
            poverty: number;
            upperGrowth: number;
            middleGrowth: number;
            workingGrowth: number;
            povertyGrowth: number;
        }
    };

    // 6. POLITICS STATE
    politics: {
        president: {
            name: string;
            party: string;
            ideology: string;
            approvalRating: number;
            administrationAge: string;
            currentAgenda: string;
            publicTrust: number;
            historicalReputation: string;
            traits: string[];
        };
        government: {
            roles: GovRole[];
            doctrine: string;
            stability: number;
        };
        budget: {
            activeBudget: Budget | null;
            pendingBudget: Budget | null;
            history: Budget[];
        };
        parties: Party[];
        elections: {
            isActive: boolean;
            candidates: Candidate[];
            polling: Poll[];
        };
        publicOpinion: number;
        bills: Bill[];
    };

    // CORE CIVILIZATION NODE (CCN)
    ccn: CCNState;

    // 7. EVENT LOG OVERALL
    logs: { time: string; msg: string; type: 'info'|'warn'|'error' }[];

    // 8. ACTIVE CRISES
    activeCrises: SystemCrisis[];

    // ACTIONS
    tickGlobalTime: () => void;
    triggerDisaster: (regionId: string, nodeId: InfraType) => void;
    executePlayerAction: (payload: ActionPayload, msg: string) => void;
    resolveCrisis: (crisisId: string, optionId: string) => void;
    signBill: (billId: string) => void;
    opposeBill: (billId: string) => void;
    supportBill: (billId: string) => void;
    fundCampaign: (candidateId: string) => void;
    smearCampaign: (candidateId: string) => void;
    setPlayerState: (updates: Partial<AppStore['player']>) => void;
    queuePlayerAction: (type: string, payload: any) => void;
    addLog: (msg: string, type?: 'info'|'warn'|'error') => void;
    setInfraPolicy: (regionId: string, nodeId: InfraType, updates: Partial<InfraNode>) => void;
    interactCCN: (moduleId: string, action: 'REPAIR' | 'SUPPLY' | 'HACK' | 'UPGRADE' | 'OPTIMIZE' | 'BUILD_SUBNODE' | 'SET_SUBNODE_PRIORITY', payload?: any) => void;
    interactShadowMarket: (dealId: string) => void;
}

const INITIAL_STATE = {
    globalTime: new Date('2026-05-11T08:00:00'),
    player: {
        name: 'Rizky Pratama',
        age: 24,
        gender: 'Male',
        birthplace: 'Semarang, Central Java',
        stamina: 85,
        hunger: 40,
        thirst: 30,
        hygiene: 75,
        happiness: 45,
        fitness: 60,
        stress: 75,
        cognitiveLoad: 10,
        apathy: 0,
        cash: 850,
        stocksValue: 0,
        debt: 2500,
        workPerformance: 85,
        jobTitle: 'Junior Warehouse Staff',
        employer: 'Logistik Nusantara',
        careerExp: 120,
        professionalism: 70,
        warnings: 0,
        vacationDays: 14,
        isWorking: false,
        pendingActions: [],
        deviceAccess: {
            battery: 100,
            hasInternet: true,
            signalStrength: 100
        },
        offlineDirectives: {
            mode: 'SURVIVAL' as 'SURVIVAL' | 'CAREER' | 'ACTIVIST',
            lastUpdated: new Date()
        },
        skills: [
            { id: 'sk-1', name: 'Data Analysis', level: 1, maxLevel: 5, cost: 500, parentId: null, description: 'Base analytic capability', icon: 'Database', unlocked: true },
            { id: 'sk-2', name: 'Machine Learning', level: 0, maxLevel: 5, cost: 1000, parentId: 'sk-1', description: 'Advanced prediction models', icon: 'Brain', unlocked: false },
            { id: 'sk-3', name: 'Communication', level: 1, maxLevel: 5, cost: 400, parentId: null, description: 'Team synergy', icon: 'Users', unlocked: true },
            { id: 'sk-4', name: 'Negotiation', level: 0, maxLevel: 5, cost: 800, parentId: 'sk-3', description: 'Better salary bounds', icon: 'DollarSign', unlocked: false },
            { id: 'sk-5', name: 'Management', level: 1, maxLevel: 5, cost: 800, parentId: null, description: 'Leadership basics', icon: 'Briefcase', unlocked: true },
            { id: 'sk-6', name: 'Strategic Planning', level: 0, maxLevel: 5, cost: 1500, parentId: 'sk-5', description: 'Long-term vision', icon: 'Target', unlocked: false }
        ],
        tasks: [
            { id: 't-1', title: 'Submit quarterly report', priority: 'HIGH' as 'HIGH', completed: false, deadline: new Date(Date.now() + 86400000), reminder: true },
            { id: 't-2', title: 'Organize warehouse inventory', priority: 'MEDIUM' as 'MEDIUM', completed: false, deadline: new Date(Date.now() + 172800000), reminder: false },
            { id: 't-3', title: 'Reply to non-urgent emails', priority: 'LOW' as 'LOW', completed: false }
        ],
        jobMarket: [
            { id: 'j-1', title: 'Senior Data Analyst', company: 'Nexus Corp', location: 'Sector 3', salary: 110000, reqSkills: ['sk-1', 'sk-2'], matched: false },
            { id: 'j-2', title: 'Analytics Manager', company: 'Optima Logistics', location: 'Sector 5', salary: 145000, reqSkills: ['sk-1', 'sk-5'], matched: false },
            { id: 'j-3', title: 'Operations Director', company: 'Global Transport', location: 'Capitol Node', salary: 200000, reqSkills: ['sk-5', 'sk-6', 'sk-3'], matched: false }
        ],
        properties: [
            {
                id: 'prop-1',
                type: 'ROOM',
                name: 'Shared Rental Room (Kost)',
                location: 'Bekasi Barat, Jawa Barat',
                value: 0,
                monthlyTax: 0,
                rent: 800,
                maintenanceLvl: 40,
                securityLvl: 35,
                utilities: { power: 150, water: 50, internet: 100 },
                rooms: [
                    {
                        name: 'Single Room', cleanliness: 60, items: [
                            { name: 'Single Mattress', type: 'BED', quality: 40, condition: 50 },
                            { name: 'Cheap Fan', type: 'ELECTRONIC', quality: 30, condition: 40 }
                        ]
                    }
                ]
            }
        ],
        vehicles: [
            { id: 'v-1', name: 'Used 110cc Motorcycle', type: 'MOTORCYCLE', value: 4500, condition: 60, fuelLevel: 40, insurance: 0 }
        ]
    },
    infra: {
        regions: {
            'ACEH': {
                id: 'ACEH',
                name: 'Aceh',
                population: 5.5,
                area: 57956,
                resilienceScore: 65,
                nodes: {
                    POWER: { health: 66, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 61 },
                    ISP: { health: 70, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 65 },
                    TRANSPORT: { health: 60, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 50 },
                    BANKING: { health: 71, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 66 },
                    FOOD: { health: 75, status: 'ONLINE', level: 3, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 65 },
                    DATA: { health: 70, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 65 },
                    WATER: { health: 75, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 65 },
                    HEALTHCARE: { health: 65, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 60 },
                }
            },
            'SUMATERA_UTARA': {
                id: 'SUMATERA_UTARA',
                name: 'Sumatera Utara',
                population: 15.3,
                area: 72981,
                resilienceScore: 75,
                nodes: {
                    POWER: { health: 81, status: 'ONLINE', level: 4, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 76 },
                    ISP: { health: 76, status: 'ONLINE', level: 4, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 71 },
                    TRANSPORT: { health: 65, status: 'ONLINE', level: 4, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 55 },
                    BANKING: { health: 86, status: 'ONLINE', level: 4, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 81 },
                    FOOD: { health: 80, status: 'ONLINE', level: 4, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 70 },
                    DATA: { health: 76, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 71 },
                    WATER: { health: 85, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 75 },
                    HEALTHCARE: { health: 75, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 70 },
                }
            },
            'SUMATERA_BARAT': {
                id: 'SUMATERA_BARAT',
                name: 'Sumatera Barat',
                population: 5.7,
                area: 42012,
                resilienceScore: 70,
                nodes: {
                    POWER: { health: 70, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 65 },
                    ISP: { health: 67, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 62 },
                    TRANSPORT: { health: 64, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 54 },
                    BANKING: { health: 75, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 70 },
                    FOOD: { health: 79, status: 'ONLINE', level: 3, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 69 },
                    DATA: { health: 67, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 62 },
                    WATER: { health: 75, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 65 },
                    HEALTHCARE: { health: 65, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 60 },
                }
            },
            'RIAU': {
                id: 'RIAU',
                name: 'Riau',
                population: 6.7,
                area: 87023,
                resilienceScore: 75,
                nodes: {
                    POWER: { health: 81, status: 'ONLINE', level: 4, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 76 },
                    ISP: { health: 81, status: 'ONLINE', level: 4, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 76 },
                    TRANSPORT: { health: 65, status: 'ONLINE', level: 4, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 55 },
                    BANKING: { health: 86, status: 'ONLINE', level: 4, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 81 },
                    FOOD: { health: 80, status: 'ONLINE', level: 4, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 70 },
                    DATA: { health: 81, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 76 },
                    WATER: { health: 85, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 75 },
                    HEALTHCARE: { health: 75, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 70 },
                }
            },
            'KEPULAUAN_RIAU': {
                id: 'KEPULAUAN_RIAU',
                name: 'Kepulauan Riau',
                population: 2.2,
                area: 8201,
                resilienceScore: 72,
                nodes: {
                    POWER: { health: 72, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 67 },
                    ISP: { health: 67, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 62 },
                    TRANSPORT: { health: 62, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 52 },
                    BANKING: { health: 77, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 72 },
                    FOOD: { health: 77, status: 'ONLINE', level: 3, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 67 },
                    DATA: { health: 67, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 62 },
                    WATER: { health: 75, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 65 },
                    HEALTHCARE: { health: 65, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 60 },
                }
            },
            'JAMBI': {
                id: 'JAMBI',
                name: 'Jambi',
                population: 3.7,
                area: 50058,
                resilienceScore: 65,
                nodes: {
                    POWER: { health: 67, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 62 },
                    ISP: { health: 73, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 68 },
                    TRANSPORT: { health: 64, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 54 },
                    BANKING: { health: 72, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 67 },
                    FOOD: { health: 79, status: 'ONLINE', level: 3, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 69 },
                    DATA: { health: 73, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 68 },
                    WATER: { health: 75, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 65 },
                    HEALTHCARE: { health: 65, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 60 },
                }
            },
            'BENGKULU': {
                id: 'BENGKULU',
                name: 'Bengkulu',
                population: 2.1,
                area: 19919,
                resilienceScore: 60,
                nodes: {
                    POWER: { health: 58, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 53 },
                    ISP: { health: 62, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 57 },
                    TRANSPORT: { health: 47, status: 'DEGRADED', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 37 },
                    BANKING: { health: 63, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 58 },
                    FOOD: { health: 62, status: 'ONLINE', level: 2, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 52 },
                    DATA: { health: 62, status: 'ONLINE', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 57 },
                    WATER: { health: 65, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 55 },
                    HEALTHCARE: { health: 55, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 50 },
                }
            },
            'SUMATERA_SELATAN': {
                id: 'SUMATERA_SELATAN',
                name: 'Sumatera Selatan',
                population: 8.8,
                area: 91592,
                resilienceScore: 70,
                nodes: {
                    POWER: { health: 70, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 65 },
                    ISP: { health: 67, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 62 },
                    TRANSPORT: { health: 61, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 51 },
                    BANKING: { health: 75, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 70 },
                    FOOD: { health: 76, status: 'ONLINE', level: 3, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 66 },
                    DATA: { health: 67, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 62 },
                    WATER: { health: 75, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 65 },
                    HEALTHCARE: { health: 65, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 60 },
                }
            },
            'KEP_BANGKA_BELITUNG': {
                id: 'KEP_BANGKA_BELITUNG',
                name: 'Kep. Bangka Belitung',
                population: 1.5,
                area: 16424,
                resilienceScore: 65,
                nodes: {
                    POWER: { health: 72, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 67 },
                    ISP: { health: 69, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 64 },
                    TRANSPORT: { health: 64, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 54 },
                    BANKING: { health: 77, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 72 },
                    FOOD: { health: 79, status: 'ONLINE', level: 3, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 69 },
                    DATA: { health: 69, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 64 },
                    WATER: { health: 75, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 65 },
                    HEALTHCARE: { health: 65, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 60 },
                }
            },
            'LAMPUNG': {
                id: 'LAMPUNG',
                name: 'Lampung',
                population: 9.3,
                area: 34623,
                resilienceScore: 70,
                nodes: {
                    POWER: { health: 69, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 64 },
                    ISP: { health: 72, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 67 },
                    TRANSPORT: { health: 60, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 50 },
                    BANKING: { health: 74, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 69 },
                    FOOD: { health: 75, status: 'ONLINE', level: 3, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 65 },
                    DATA: { health: 72, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 67 },
                    WATER: { health: 75, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 65 },
                    HEALTHCARE: { health: 65, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 60 },
                }
            },
            'DKI_JAKARTA': {
                id: 'DKI_JAKARTA',
                name: 'DKI Jakarta',
                population: 10.7,
                area: 664,
                resilienceScore: 85,
                nodes: {
                    POWER: { health: 94, status: 'ONLINE', level: 5, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 89 },
                    ISP: { health: 92, status: 'ONLINE', level: 5, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 87 },
                    TRANSPORT: { health: 82, status: 'ONLINE', level: 5, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 72 },
                    BANKING: { health: 99, status: 'ONLINE', level: 5, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 94 },
                    FOOD: { health: 97, status: 'ONLINE', level: 5, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 87 },
                    DATA: { health: 92, status: 'ONLINE', level: 4, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 87 },
                    WATER: { health: 95, status: 'ONLINE', level: 4, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 85 },
                    HEALTHCARE: { health: 85, status: 'ONLINE', level: 4, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 80 },
                }
            },
            'JAWA_BARAT': {
                id: 'JAWA_BARAT',
                name: 'Jawa Barat',
                population: 50.3,
                area: 35377,
                resilienceScore: 80,
                nodes: {
                    POWER: { health: 79, status: 'ONLINE', level: 4, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 74 },
                    ISP: { health: 84, status: 'ONLINE', level: 4, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 79 },
                    TRANSPORT: { health: 67, status: 'ONLINE', level: 4, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 57 },
                    BANKING: { health: 84, status: 'ONLINE', level: 4, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 79 },
                    FOOD: { health: 82, status: 'ONLINE', level: 4, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 72 },
                    DATA: { health: 84, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 79 },
                    WATER: { health: 85, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 75 },
                    HEALTHCARE: { health: 75, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 70 },
                }
            },
            'BANTEN': {
                id: 'BANTEN',
                name: 'Banten',
                population: 12.4,
                area: 9662,
                resilienceScore: 78,
                nodes: {
                    POWER: { health: 81, status: 'ONLINE', level: 4, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 76 },
                    ISP: { health: 81, status: 'ONLINE', level: 4, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 76 },
                    TRANSPORT: { health: 73, status: 'ONLINE', level: 4, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 63 },
                    BANKING: { health: 86, status: 'ONLINE', level: 4, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 81 },
                    FOOD: { health: 88, status: 'ONLINE', level: 4, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 78 },
                    DATA: { health: 81, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 76 },
                    WATER: { health: 85, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 75 },
                    HEALTHCARE: { health: 75, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 70 },
                }
            },
            'JAWA_TENGAH': {
                id: 'JAWA_TENGAH',
                name: 'Jawa Tengah',
                population: 37.8,
                area: 32800,
                resilienceScore: 75,
                nodes: {
                    POWER: { health: 82, status: 'ONLINE', level: 4, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 77 },
                    ISP: { health: 80, status: 'ONLINE', level: 4, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 75 },
                    TRANSPORT: { health: 65, status: 'ONLINE', level: 4, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 55 },
                    BANKING: { health: 87, status: 'ONLINE', level: 4, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 82 },
                    FOOD: { health: 80, status: 'ONLINE', level: 4, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 70 },
                    DATA: { health: 80, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 75 },
                    WATER: { health: 85, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 75 },
                    HEALTHCARE: { health: 75, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 70 },
                }
            },
            'DI_YOGYAKARTA': {
                id: 'DI_YOGYAKARTA',
                name: 'DI Yogyakarta',
                population: 3.7,
                area: 3133,
                resilienceScore: 80,
                nodes: {
                    POWER: { health: 81, status: 'ONLINE', level: 4, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 76 },
                    ISP: { health: 75, status: 'ONLINE', level: 4, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 70 },
                    TRANSPORT: { health: 71, status: 'ONLINE', level: 4, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 61 },
                    BANKING: { health: 86, status: 'ONLINE', level: 4, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 81 },
                    FOOD: { health: 86, status: 'ONLINE', level: 4, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 76 },
                    DATA: { health: 75, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 70 },
                    WATER: { health: 85, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 75 },
                    HEALTHCARE: { health: 75, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 70 },
                }
            },
            'JAWA_TIMUR': {
                id: 'JAWA_TIMUR',
                name: 'Jawa Timur',
                population: 41.7,
                area: 47803,
                resilienceScore: 80,
                nodes: {
                    POWER: { health: 79, status: 'ONLINE', level: 4, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 74 },
                    ISP: { health: 79, status: 'ONLINE', level: 4, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 74 },
                    TRANSPORT: { health: 71, status: 'ONLINE', level: 4, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 61 },
                    BANKING: { health: 84, status: 'ONLINE', level: 4, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 79 },
                    FOOD: { health: 86, status: 'ONLINE', level: 4, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 76 },
                    DATA: { health: 79, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 74 },
                    WATER: { health: 85, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 75 },
                    HEALTHCARE: { health: 75, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 70 },
                }
            },
            'BALI': {
                id: 'BALI',
                name: 'Bali',
                population: 4.4,
                area: 5780,
                resilienceScore: 80,
                nodes: {
                    POWER: { health: 77, status: 'ONLINE', level: 4, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 72 },
                    ISP: { health: 79, status: 'ONLINE', level: 4, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 74 },
                    TRANSPORT: { health: 70, status: 'ONLINE', level: 4, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 60 },
                    BANKING: { health: 82, status: 'ONLINE', level: 4, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 77 },
                    FOOD: { health: 85, status: 'ONLINE', level: 4, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 75 },
                    DATA: { health: 79, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 74 },
                    WATER: { health: 85, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 75 },
                    HEALTHCARE: { health: 75, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 70 },
                }
            },
            'NUSA_TENGGARA_BARAT': {
                id: 'NUSA_TENGGARA_BARAT',
                name: 'Nusa Tenggara Barat',
                population: 5.6,
                area: 18572,
                resilienceScore: 65,
                nodes: {
                    POWER: { health: 70, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 65 },
                    ISP: { health: 68, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 63 },
                    TRANSPORT: { health: 61, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 51 },
                    BANKING: { health: 75, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 70 },
                    FOOD: { health: 76, status: 'ONLINE', level: 3, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 66 },
                    DATA: { health: 68, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 63 },
                    WATER: { health: 75, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 65 },
                    HEALTHCARE: { health: 65, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 60 },
                }
            },
            'NUSA_TENGGARA_TIMUR': {
                id: 'NUSA_TENGGARA_TIMUR',
                name: 'Nusa Tenggara Timur',
                population: 5.6,
                area: 48718,
                resilienceScore: 60,
                nodes: {
                    POWER: { health: 61, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 56 },
                    ISP: { health: 64, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 59 },
                    TRANSPORT: { health: 52, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 42 },
                    BANKING: { health: 66, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 61 },
                    FOOD: { health: 67, status: 'ONLINE', level: 2, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 57 },
                    DATA: { health: 64, status: 'ONLINE', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 59 },
                    WATER: { health: 65, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 55 },
                    HEALTHCARE: { health: 55, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 50 },
                }
            },
            'KALIMANTAN_BARAT': {
                id: 'KALIMANTAN_BARAT',
                name: 'Kalimantan Barat',
                population: 5.6,
                area: 147307,
                resilienceScore: 65,
                nodes: {
                    POWER: { health: 65, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 60 },
                    ISP: { health: 74, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 69 },
                    TRANSPORT: { health: 63, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 53 },
                    BANKING: { health: 70, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 65 },
                    FOOD: { health: 78, status: 'ONLINE', level: 3, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 68 },
                    DATA: { health: 74, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 69 },
                    WATER: { health: 75, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 65 },
                    HEALTHCARE: { health: 65, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 60 },
                }
            },
            'KALIMANTAN_TENGAH': {
                id: 'KALIMANTAN_TENGAH',
                name: 'Kalimantan Tengah',
                population: 2.8,
                area: 153564,
                resilienceScore: 60,
                nodes: {
                    POWER: { health: 64, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 59 },
                    ISP: { health: 58, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 53 },
                    TRANSPORT: { health: 50, status: 'DEGRADED', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 40 },
                    BANKING: { health: 69, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 64 },
                    FOOD: { health: 65, status: 'ONLINE', level: 2, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 55 },
                    DATA: { health: 58, status: 'ONLINE', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 53 },
                    WATER: { health: 65, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 55 },
                    HEALTHCARE: { health: 55, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 50 },
                }
            },
            'KALIMANTAN_SELATAN': {
                id: 'KALIMANTAN_SELATAN',
                name: 'Kalimantan Selatan',
                population: 4.3,
                area: 38744,
                resilienceScore: 70,
                nodes: {
                    POWER: { health: 73, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 68 },
                    ISP: { health: 67, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 62 },
                    TRANSPORT: { health: 59, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 49 },
                    BANKING: { health: 78, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 73 },
                    FOOD: { health: 74, status: 'ONLINE', level: 3, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 64 },
                    DATA: { health: 67, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 62 },
                    WATER: { health: 75, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 65 },
                    HEALTHCARE: { health: 65, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 60 },
                }
            },
            'KALIMANTAN_TIMUR': {
                id: 'KALIMANTAN_TIMUR',
                name: 'Kalimantan Timur',
                population: 4,
                area: 127346,
                resilienceScore: 75,
                nodes: {
                    POWER: { health: 84, status: 'ONLINE', level: 4, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 79 },
                    ISP: { health: 82, status: 'ONLINE', level: 4, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 77 },
                    TRANSPORT: { health: 70, status: 'ONLINE', level: 4, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 60 },
                    BANKING: { health: 89, status: 'ONLINE', level: 4, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 84 },
                    FOOD: { health: 85, status: 'ONLINE', level: 4, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 75 },
                    DATA: { health: 82, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 77 },
                    WATER: { health: 85, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 75 },
                    HEALTHCARE: { health: 75, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 70 },
                }
            },
            'KALIMANTAN_UTARA': {
                id: 'KALIMANTAN_UTARA',
                name: 'Kalimantan Utara',
                population: 0.7,
                area: 75467,
                resilienceScore: 60,
                nodes: {
                    POWER: { health: 60, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 55 },
                    ISP: { health: 56, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 51 },
                    TRANSPORT: { health: 45, status: 'DEGRADED', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 35 },
                    BANKING: { health: 65, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 60 },
                    FOOD: { health: 60, status: 'ONLINE', level: 2, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 50 },
                    DATA: { health: 56, status: 'ONLINE', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 51 },
                    WATER: { health: 65, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 55 },
                    HEALTHCARE: { health: 55, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 50 },
                }
            },
            'SULAWESI_UTARA': {
                id: 'SULAWESI_UTARA',
                name: 'Sulawesi Utara',
                population: 2.7,
                area: 13892,
                resilienceScore: 70,
                nodes: {
                    POWER: { health: 69, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 64 },
                    ISP: { health: 70, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 65 },
                    TRANSPORT: { health: 58, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 48 },
                    BANKING: { health: 74, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 69 },
                    FOOD: { health: 73, status: 'ONLINE', level: 3, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 63 },
                    DATA: { health: 70, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 65 },
                    WATER: { health: 75, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 65 },
                    HEALTHCARE: { health: 65, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 60 },
                }
            },
            'GORONTALO': {
                id: 'GORONTALO',
                name: 'Gorontalo',
                population: 1.2,
                area: 11257,
                resilienceScore: 65,
                nodes: {
                    POWER: { health: 71, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 66 },
                    ISP: { health: 70, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 65 },
                    TRANSPORT: { health: 61, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 51 },
                    BANKING: { health: 76, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 71 },
                    FOOD: { health: 76, status: 'ONLINE', level: 3, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 66 },
                    DATA: { health: 70, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 65 },
                    WATER: { health: 75, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 65 },
                    HEALTHCARE: { health: 65, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 60 },
                }
            },
            'SULAWESI_TENGAH': {
                id: 'SULAWESI_TENGAH',
                name: 'Sulawesi Tengah',
                population: 3.1,
                area: 61841,
                resilienceScore: 60,
                nodes: {
                    POWER: { health: 60, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 55 },
                    ISP: { health: 61, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 56 },
                    TRANSPORT: { health: 54, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 44 },
                    BANKING: { health: 65, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 60 },
                    FOOD: { health: 69, status: 'ONLINE', level: 2, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 59 },
                    DATA: { health: 61, status: 'ONLINE', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 56 },
                    WATER: { health: 65, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 55 },
                    HEALTHCARE: { health: 55, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 50 },
                }
            },
            'SULAWESI_BARAT': {
                id: 'SULAWESI_BARAT',
                name: 'Sulawesi Barat',
                population: 1.5,
                area: 16787,
                resilienceScore: 60,
                nodes: {
                    POWER: { health: 58, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 53 },
                    ISP: { health: 58, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 53 },
                    TRANSPORT: { health: 52, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 42 },
                    BANKING: { health: 63, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 58 },
                    FOOD: { health: 67, status: 'ONLINE', level: 2, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 57 },
                    DATA: { health: 58, status: 'ONLINE', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 53 },
                    WATER: { health: 65, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 55 },
                    HEALTHCARE: { health: 55, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 50 },
                }
            },
            'SULAWESI_SELATAN': {
                id: 'SULAWESI_SELATAN',
                name: 'Sulawesi Selatan',
                population: 9.4,
                area: 46717,
                resilienceScore: 75,
                nodes: {
                    POWER: { health: 81, status: 'ONLINE', level: 4, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 76 },
                    ISP: { health: 78, status: 'ONLINE', level: 4, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 73 },
                    TRANSPORT: { health: 68, status: 'ONLINE', level: 4, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 58 },
                    BANKING: { health: 86, status: 'ONLINE', level: 4, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 81 },
                    FOOD: { health: 83, status: 'ONLINE', level: 4, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 73 },
                    DATA: { health: 78, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 73 },
                    WATER: { health: 85, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 75 },
                    HEALTHCARE: { health: 75, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 70 },
                }
            },
            'SULAWESI_TENGGARA': {
                id: 'SULAWESI_TENGGARA',
                name: 'Sulawesi Tenggara',
                population: 2.7,
                area: 38067,
                resilienceScore: 65,
                nodes: {
                    POWER: { health: 73, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 68 },
                    ISP: { health: 73, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 68 },
                    TRANSPORT: { health: 63, status: 'ONLINE', level: 3, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 53 },
                    BANKING: { health: 78, status: 'ONLINE', level: 3, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 73 },
                    FOOD: { health: 78, status: 'ONLINE', level: 3, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 68 },
                    DATA: { health: 73, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 68 },
                    WATER: { health: 75, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 65 },
                    HEALTHCARE: { health: 65, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 60 },
                }
            },
            'MALUKU': {
                id: 'MALUKU',
                name: 'Maluku',
                population: 1.9,
                area: 46914,
                resilienceScore: 55,
                nodes: {
                    POWER: { health: 62, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 57 },
                    ISP: { health: 64, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 59 },
                    TRANSPORT: { health: 50, status: 'DEGRADED', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 40 },
                    BANKING: { health: 67, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 62 },
                    FOOD: { health: 65, status: 'ONLINE', level: 2, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 55 },
                    DATA: { health: 64, status: 'ONLINE', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 59 },
                    WATER: { health: 65, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 55 },
                    HEALTHCARE: { health: 55, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 50 },
                }
            },
            'MALUKU_UTARA': {
                id: 'MALUKU_UTARA',
                name: 'Maluku Utara',
                population: 1.3,
                area: 31982,
                resilienceScore: 55,
                nodes: {
                    POWER: { health: 61, status: 'ONLINE', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 56 },
                    ISP: { health: 61, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 56 },
                    TRANSPORT: { health: 50, status: 'DEGRADED', level: 2, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 40 },
                    BANKING: { health: 66, status: 'ONLINE', level: 2, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 61 },
                    FOOD: { health: 65, status: 'ONLINE', level: 2, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 55 },
                    DATA: { health: 61, status: 'ONLINE', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 56 },
                    WATER: { health: 65, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 55 },
                    HEALTHCARE: { health: 55, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 50 },
                }
            },
            'PAPUA': {
                id: 'PAPUA',
                name: 'Papua',
                population: 1,
                area: 81049,
                resilienceScore: 50,
                nodes: {
                    POWER: { health: 49, status: 'DEGRADED', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 44 },
                    ISP: { health: 48, status: 'DEGRADED', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 43 },
                    TRANSPORT: { health: 39, status: 'DEGRADED', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 29 },
                    BANKING: { health: 54, status: 'ONLINE', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 49 },
                    FOOD: { health: 54, status: 'ONLINE', level: 1, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 44 },
                    DATA: { health: 48, status: 'DEGRADED', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 43 },
                    WATER: { health: 55, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 45 },
                    HEALTHCARE: { health: 45, status: 'DEGRADED', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 40 },
                }
            },
            'PAPUA_BARAT': {
                id: 'PAPUA_BARAT',
                name: 'Papua Barat',
                population: 0.6,
                area: 64134,
                resilienceScore: 50,
                nodes: {
                    POWER: { health: 50, status: 'DEGRADED', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 45 },
                    ISP: { health: 45, status: 'DEGRADED', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 40 },
                    TRANSPORT: { health: 39, status: 'DEGRADED', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 29 },
                    BANKING: { health: 55, status: 'ONLINE', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 50 },
                    FOOD: { health: 54, status: 'ONLINE', level: 1, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 44 },
                    DATA: { health: 45, status: 'DEGRADED', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 40 },
                    WATER: { health: 55, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 45 },
                    HEALTHCARE: { health: 45, status: 'DEGRADED', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 40 },
                }
            },
            'PAPUA_SELATAN': {
                id: 'PAPUA_SELATAN',
                name: 'Papua Selatan',
                population: 0.5,
                area: 131493,
                resilienceScore: 45,
                nodes: {
                    POWER: { health: 46, status: 'DEGRADED', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 41 },
                    ISP: { health: 52, status: 'ONLINE', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 47 },
                    TRANSPORT: { health: 43, status: 'DEGRADED', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 33 },
                    BANKING: { health: 51, status: 'ONLINE', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 46 },
                    FOOD: { health: 58, status: 'ONLINE', level: 1, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 48 },
                    DATA: { health: 52, status: 'ONLINE', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 47 },
                    WATER: { health: 55, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 45 },
                    HEALTHCARE: { health: 45, status: 'DEGRADED', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 40 },
                }
            },
            'PAPUA_TENGAH': {
                id: 'PAPUA_TENGAH',
                name: 'Papua Tengah',
                population: 1.4,
                area: 66129,
                resilienceScore: 45,
                nodes: {
                    POWER: { health: 45, status: 'DEGRADED', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 40 },
                    ISP: { health: 53, status: 'ONLINE', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 48 },
                    TRANSPORT: { health: 39, status: 'DEGRADED', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 29 },
                    BANKING: { health: 50, status: 'ONLINE', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 45 },
                    FOOD: { health: 54, status: 'ONLINE', level: 1, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 44 },
                    DATA: { health: 53, status: 'ONLINE', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 48 },
                    WATER: { health: 55, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 45 },
                    HEALTHCARE: { health: 45, status: 'DEGRADED', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 40 },
                }
            },
            'PAPUA_PEGUNUNGAN': {
                id: 'PAPUA_PEGUNUNGAN',
                name: 'Papua Pegunungan',
                population: 1.4,
                area: 108476,
                resilienceScore: 40,
                nodes: {
                    POWER: { health: 53, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 48 },
                    ISP: { health: 51, status: 'ONLINE', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 46 },
                    TRANSPORT: { health: 44, status: 'DEGRADED', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 34 },
                    BANKING: { health: 58, status: 'ONLINE', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 53 },
                    FOOD: { health: 59, status: 'ONLINE', level: 1, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 49 },
                    DATA: { health: 51, status: 'ONLINE', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 46 },
                    WATER: { health: 55, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 45 },
                    HEALTHCARE: { health: 45, status: 'DEGRADED', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 40 },
                }
            },
            'PAPUA_BARAT_DAYA': {
                id: 'PAPUA_BARAT_DAYA',
                name: 'Papua Barat Daya',
                population: 0.6,
                area: 38820,
                resilienceScore: 45,
                nodes: {
                    POWER: { health: 45, status: 'DEGRADED', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 40 },
                    ISP: { health: 45, status: 'DEGRADED', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'BALANCED', efficiency: 40 },
                    TRANSPORT: { health: 42, status: 'DEGRADED', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 32 },
                    BANKING: { health: 50, status: 'ONLINE', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 45 },
                    FOOD: { health: 57, status: 'ONLINE', level: 1, doctrine: 'LOCAL', maintenancePolicy: 'BALANCED', efficiency: 47 },
                    DATA: { health: 45, status: 'DEGRADED', level: 1, doctrine: 'DISTRIBUTED', maintenancePolicy: 'PREVENTIVE', efficiency: 40 },
                    WATER: { health: 55, status: 'ONLINE', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'REACTIVE', efficiency: 45 },
                    HEALTHCARE: { health: 45, status: 'DEGRADED', level: 1, doctrine: 'CENTRALIZED', maintenancePolicy: 'PREVENTIVE', efficiency: 40 },
                }
            },
        } as Record<string, RegionInfra>
    },
    resources: {
        energy: 50000,
        materials: 12000,
        components: 8000,
        fuel: 25000,
        food: 30000,
        water: 40000,
        budget: 500, // in Billions
        emergencyReserves: 100 // in Billions
    },
    economy: {
        global_inflation: 4.12,
        global_unemployment: 5.2,
        gdp: 12.45, // in Trillions
        tradeBalance: -42.8
    },
    society: {
        population: 14235901,
        educationIndex: 72.4,
        healthcareQuality: 65.1,
        crimeRate: 8.3,
        socialQualityIndex: 63.3,
        systemicConfidenceIndex: 45,
        citizens: [
            { id: 'c-1', name: 'Alif', class: 'WORKING', ideology: 'NATIONALIST', trustBaseline: 40, currentTrust: 42 },
            { id: 'c-2', name: 'Budi (AI)', class: 'MIDDLE', ideology: 'PROGRESSIVE', trustBaseline: 55, currentTrust: 50 },
            { id: 'c-3', name: 'Cinta (AI)', class: 'UPPER', ideology: 'GLOBALIST', trustBaseline: 80, currentTrust: 75 },
            { id: 'c-4', name: 'Dedi (AI)', class: 'POVERTY', ideology: 'CONSERVATIVE', trustBaseline: 20, currentTrust: 18 },
            { id: 'c-5', name: 'Eka (AI)', class: 'WORKING', ideology: 'PROGRESSIVE', trustBaseline: 30, currentTrust: 35 },
            { id: 'c-6', name: 'Fikri (AI)', class: 'WORKING', ideology: 'CONSERVATIVE', trustBaseline: 50, currentTrust: 45 },
            { id: 'c-7', name: 'Gita (AI)', class: 'MIDDLE', ideology: 'GLOBALIST', trustBaseline: 60, currentTrust: 65 },
            { id: 'c-8', name: 'Hadi (AI)', class: 'UPPER', ideology: 'NATIONALIST', trustBaseline: 65, currentTrust: 70 },
        ] as any[],
        psychology: {
            stressLevel: 68,
            emotionalVolatility: 45,
            politicalTrust: 32,
            fearIndex: 55,
            optimism: 40,
            burnoutRisk: 72
        },
        unrest: {
            level: 35,
            stage: 'ORGANIZED_CRITICISM' as const,
            catalyst: 'Recent Healthcare Deficits'
        },
        ideology: {
            nationalism: 45,
            conservatism: 40,
            progressivism: 55,
            authoritarianTolerance: 30,
            populism: 60
        },
        simulationStatus: {
            tierA_count: 512, // Fully simulated currently active
            tierB_count: 12450, // Reduced simulation
            tierC_count: 852000, // Statistical simulation
            tierD_count: 13370939 // Dormant
        },
        nationalMemory: [
            { 
                id: 'mem-1', date: '2022-11-15', eventTitle: 'Fuel Subsidy Crisis of \'22', impactScore: 85, sentiment: 'TRAUMATIC' as const,
                currentEffects: ['+12% distrust in state infrastructure', '+8% support for alternative energy', 'inflationary pressure']
            },
            { 
                id: 'mem-2', date: '2023-05-20', eventTitle: 'Mass Labor Demonstrations of \'23', impactScore: 70, sentiment: 'NEGATIVE' as const,
                currentEffects: ['-5% corporate investment confidence', '+10% populist loyalty', 'strengthened union power']
            },
            { 
                id: 'mem-3', date: '2024-02-01', eventTitle: 'Jakarta Blackout Event', impactScore: 90, sentiment: 'TRAUMATIC' as const,
                currentEffects: ['-15% confidence in ruling coalition', 'increased private generator ownership', 'delayed infrastructure approvals']
            },
            { 
                id: 'mem-4', date: '2025-09-10', eventTitle: 'Corruption Scandal in Eastern Dev Authority', impactScore: 78, sentiment: 'NEGATIVE' as const,
                currentEffects: ['+20% media scrutiny on budgets', 'delayed regional projects', 'lower public trust']
            }
        ],
        households: {
            unpaidUtilityBills: 14.5,
            foodInsecurityIndex: 22.3,
            evictionRate: 1.2,
            averageBurnout: 76
        },
        behavioralStream: [
            { id: 'b-1', timestamp: '10:42 AM', message: 'Protest sentiment rising in industrial districts following recent utility price hikes.', type: 'POLITICAL' as const, region: 'Sector 4', impact: '+3% Populism' },
            { id: 'b-2', timestamp: '11:15 AM', message: '14,230 households delaying routine healthcare treatment due to budget deficits.', type: 'SOCIAL' as const, region: 'Sector 2', impact: '-2.1 Healthcare Index' },
            { id: 'b-3', timestamp: '11:58 AM', message: 'Upper-middle class capital flight detected. Small businesses reducing hiring rates.', type: 'ECONOMIC' as const, region: 'Capitol Sector', impact: 'Economic Friction' },
            { id: 'b-4', timestamp: '12:30 PM', message: 'Surge in rural-to-urban migration affecting housing availability.', type: 'MIGRATION' as const, region: 'Sector 7', impact: '+1.5% Eviction Rate' },
            { id: 'b-5', timestamp: '12:45 PM', message: 'Informal clinics emerging in eastern districts to bypass overloaded state systems.', type: 'CRITICAL' as const, region: 'East Sector', impact: 'Infrastructure Circumvention' }
        ],
        adaptations: {
            jobSeekingSurge: 14.2,
            migrationPressure: 8.5,
            healthcareAvoidance: 22.1,
            unionOrganization: 11.4
        },
        classes: {
            upper: 4.2,
            middle: 32.5,
            working: 45.1,
            poverty: 18.2,
            upperGrowth: 0.2,
            middleGrowth: -1.5,
            workingGrowth: 2.1,
            povertyGrowth: 0.8
        }
    },
    politics: {
        president: {
            name: 'Hadi Prasetyo (AI)',
            party: 'Partai Pembangunan Nasional',
            ideology: 'Economic Nationalist',
            approvalRating: 61,
            administrationAge: '2 years, 4 months',
            currentAgenda: 'National Infrastructure Stabilization',
            publicTrust: 55,
            historicalReputation: 'Pragmatic Stabilizer',
            traits: ['Pragmatic', 'Corporate Ties', 'Resilient', 'Autonomous Entity'],
        },
        government: {
            roles: [
                { id: 'govRole-pres', title: 'President', holderName: 'Hadi Prasetyo (AI)', loyalty: 100, influence: 95, competence: 80 },
                { id: 'govRole-1', title: 'Chief Economic Advisor', holderName: 'Dr. Alistair Vance (AI)', loyalty: 85, influence: 70, competence: 90 },
                { id: 'govRole-2', title: 'Minister of Infrastructure', holderName: 'Helena Rostova (AI)', loyalty: 60, influence: 85, competence: 75 },
                { id: 'govRole-3', title: 'Director of Public Communications', holderName: 'Marcus Thorne (AI)', loyalty: 95, influence: 50, competence: 80 }
            ],
            doctrine: 'Technocratic Cabinet',
            stability: 72
        },
        budget: {
            activeBudget: { id: 'b-2026', status: 'ACTIVE' as BudgetStatus, totalAmount: 420.5, revNumber: 2, approverId: 'govRole-1' },
            pendingBudget: { id: 'b-2027', status: 'DRAFT' as BudgetStatus, totalAmount: 450.0, revNumber: 1, approverId: null },
            history: []
        },
        parties: [
            { id: 'party-igp', name: 'Industrial Growth Party', ideology: 'Pro-Industry, Centralization', influence: 45, activePolicies: ['Heavy Industry Subsidy', 'Grid Centralization'] },
            { id: 'party-swc', name: 'Social Welfare Coalition', ideology: 'Welfare Expansion', influence: 35, activePolicies: ['Healthcare Expansion', 'Housing Subsidy'] },
            { id: 'party-gtm', name: 'Green Transition Movement', ideology: 'Renewables, Environment', influence: 20, activePolicies: ['Carbon Tax', 'Renewable Priority'] }
        ],
        elections: {
            isActive: true,
            candidates: [
                { id: 'cand-1', name: 'Senator Vance', partyId: 'party-igp', bio: 'Former Executive at Capitol Node Systems. Led the 2024 industrial overhaul.', scandals: ['Accused of corporate favoritism during energy privatization in 2025.'], traits: ['Pragmatic', 'Corporate Ties'], publicTrust: 55, historicalReputation: 'Architect of the Recovery' },
                { id: 'cand-2', name: 'Mayor Lin', partyId: 'party-swc', bio: 'Progressive mayor with a focus on public health and social equity. Handled the North Province crisis effectively.', scandals: [], traits: ['Charismatic', 'Populist'], publicTrust: 65, historicalReputation: 'Champion of the People' },
                { id: 'cand-3', name: 'Dr. Aris', partyId: 'party-gtm', bio: 'Scientist turned politician. Uncompromising on environmental limits.', scandals: ['Leaked emails showing disdain for working-class coal miners.'], traits: ['Idealistic', 'Elitist'], publicTrust: 40, historicalReputation: 'Radical Environmentalist' }
            ],
            polling: [
                { candidateId: 'cand-1', percentage: 42.5, trend: 1.2 },
                { candidateId: 'cand-2', percentage: 38.0, trend: -0.5 },
                { candidateId: 'cand-3', percentage: 19.5, trend: -0.7 }
            ]
        },
        publicOpinion: 60,
        bills: [
            { 
                id: 'BILL-405', 
                name: 'Emergency Energy Subsidy', 
                description: 'Inject direct budget capital to stabilize power prices and lower household stress. High inflation risk. Will affect investor confidence and public opinion.',
                support: 62, 
                req: 51, 
                status: 'PASSED_WAITING_SIGN' as const,
                impactEffects: {
                    budgetMod: -1500, // costs 1.5T
                    householdStressMod: -15, // stabilizes households
                    unrestMod: -10, // reduces unrest
                    inflationMod: 2.5, // increases inflation heavily
                    investorConfidenceMod: -5, // hurts investor sentiment
                    publicOpinionMod: +12, // populism 
                    logMsg: 'Presidential signature enacted Emergency Energy Subsidy. Markets volatile, public relieved.'
                }
            },
            { 
                id: 'BILL-402', 
                name: 'Corporate Tax Hike', 
                description: 'Increase base corporate tax rate to fund public infrastructure. Reduces investor confidence.',
                support: 42, 
                req: 51, 
                status: 'VOTING' as const,
                impactEffects: {
                    logMsg: 'Corporate Tax Hike remains in voting.'
                }
            }
        ]
    },
    logs: [
        { time: '08:00', msg: 'System initialized. Player logged into Nexara OS.', type: 'info' as const }
    ],
    activeCrises: [
        {
            id: 'crisis-1',
            title: 'Labor Strike: Sector 2 Logistics',
            description: 'Supply chain disruption causing 12% drop in manufacturing output. Estimated economic damage: $40M/day.',
            severity: 1,
            category: 'LABOR' as const,
            options: [
                { id: 'opt-1-1', label: 'Deploy Riot Police', style: 'danger' as const, impactEffects: { budgetMod: -5, unrestLevelMod: 15, approvalMod: -10, logMsg: 'Riot police deployed to Sector 2. Violence reported. Striking workers forcibly removed.' } },
                { id: 'opt-1-2', label: 'Negotiate Terms', style: 'default' as const, impactEffects: { budgetMod: -25, unrestLevelMod: -10, approvalMod: 5, logMsg: 'Government agreed to 15% wage hike for logistics workers. Budget strained.' } }
            ]
        },
        {
            id: 'crisis-2',
            title: 'Media Scandal: Tax Evasion Probe',
            description: 'Opposition party leveraging leaked documents. Approval rating suffering across all demographics.',
            severity: 2,
            category: 'MEDIA' as const,
            options: [
                { id: 'opt-2-1', label: 'Deny & Deflect', style: 'danger' as const, impactEffects: { approvalMod: -15, unrestLevelMod: 5, logMsg: 'Denial strategy backfired as more documents leaked. Public trust plummets.' } },
                { id: 'opt-2-2', label: 'Launch Inner Audit', style: 'default' as const, impactEffects: { budgetMod: -2, approvalMod: 5, logMsg: 'Internal audit launched. Public moderately satisfied, but political stability shaken.' } }
            ]
        }
    ],
    ccn: {
        civilizationIntelligence: {
            name: 'CIVILIZATION INTELLIGENCE',
            awarenessLevel: 85,
            autonomyId: 'CI-CORE-V9',
            currentAgenda: 'Maintain Global Equilibrium',
            alignment: 'ALIGNED' as const
        },
        modules: {
            'cognitive': { id: 'cognitive', name: 'Cognitive Core', health: 100, level: 6, status: 'OPTIMAL' as const, description: 'Quantum compute cluster with +15% predictive modeling accuracy and increased crisis anticipation capacity.', upstream: [], downstream: ['sync', 'security', 'memory'] },
            'memory': { id: 'memory', name: 'Memory Vault', health: 100, level: 5, status: 'OPTIMAL' as const, description: 'Immutable ledger of human history with data integrity protocol protecting against corruption and unauthorized access.', upstream: ['cognitive'], downstream: ['quantumMemoryVault'] },
            'quantumMemoryVault': { id: 'quantumMemoryVault', name: 'Quantum Memory Vault', health: 100, level: 1, status: 'OPTIMAL' as const, description: 'Expands historical archive capacity by 40% using quantum entanglement, improving data retrieval speeds.', upstream: ['memory'], downstream: [] },
            'sync': { id: 'sync', name: 'Reality Sync Engine', health: 95, level: 5, status: 'OPTIMAL' as const, description: 'Synchronizes physical infrastructure state with digital simulation arrays.', upstream: ['cognitive', 'energy'], downstream: [] },
            'defense': { id: 'defense', name: 'Autonomous Defense Grid', health: 100, level: 7, status: 'OPTIMAL' as const, description: 'Enhanced orbital planetary defense capabilities against kinetic and cyber threats.', upstream: ['security'], downstream: ['expansion'] },
            'security': { id: 'security', name: 'Sentinel Firewall', health: 100, level: 3, status: 'OPTIMAL' as const, description: 'Dedicated AI security subsystem neutralizing external anomalies and cyber attacks.', upstream: ['cognitive'], downstream: ['defense'] },
            'energy': { id: 'energy', name: 'Optimized Energy Protocol', health: 100, level: 1, status: 'OPTIMAL' as const, description: 'Refactored energy distribution and storage to ensure uptime during high loads and minimize thermal output.', upstream: [], downstream: ['sync'] },
            'expansion': { id: 'expansion', name: 'Expansion Dock', health: 80, level: 3, status: 'OPTIMAL' as const, description: 'Orbital dock for constructing secondary sub-nodes and managing resource transfers.', upstream: ['defense'], downstream: [] }
        },
        metrics: {
            computeLoad: 42,
            syncStability: 96,
            thermalOutput: 65,
            orbitalIntegrity: 100,
            energyReserves: 99999
        },
        metricHistory: [],
        subNodes: [
            { id: 'sub-def-1', name: 'Anti-Missile Battery Alpha', type: 'DEFENSE' as const, status: 'ONLINE' as const, priority: 3 },
            { id: 'sub-def-2', name: 'Cyber Warfare Sentinel', type: 'DEFENSE' as const, status: 'ONLINE' as const, priority: 4 }
        ],
        activeEvents: []
    }
};

export const useAppStore = create<AppStore>((set, get) => ({
    ...INITIAL_STATE,

    addLog: (msg, type = 'info') => {
        set(state => {
            const d = state.globalTime;
            const timeStr = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
            return {
                logs: [{ time: timeStr, msg, type }, ...state.logs].slice(0, 30) // keep last 30 logs
            };
        });
    },

    setInfraPolicy: (regionId, nodeId, updates) => {
        set(state => {
            const newInfra = { ...state.infra };
            if (newInfra.regions[regionId] && newInfra.regions[regionId].nodes[nodeId]) {
                newInfra.regions[regionId].nodes[nodeId] = {
                    ...newInfra.regions[regionId].nodes[nodeId],
                    ...updates
                };
            }
            return { infra: newInfra };
        });
    },

    setPlayerState: (updates) => {
        set(state => {
            const p = { ...state.player, ...updates };
            // clamp numeric bounds
            if (p.stamina !== undefined) p.stamina = Math.max(0, Math.min(100, p.stamina));
            if (p.stress !== undefined) p.stress = Math.max(0, Math.min(100, p.stress));
            if (p.hunger !== undefined) p.hunger = Math.max(0, Math.min(100, p.hunger));
            if (p.thirst !== undefined) p.thirst = Math.max(0, Math.min(100, p.thirst));
            if (p.hygiene !== undefined) p.hygiene = Math.max(0, Math.min(100, p.hygiene));
            if (p.happiness !== undefined) p.happiness = Math.max(0, Math.min(100, p.happiness));
            if (p.fitness !== undefined) p.fitness = Math.max(0, Math.min(100, p.fitness));
            if (p.professionalism !== undefined) p.professionalism = Math.max(0, Math.min(100, p.professionalism));
            if (p.workPerformance !== undefined) p.workPerformance = Math.max(0, Math.min(100, p.workPerformance));
            
            return { player: p };
        });
    },

    queuePlayerAction: (type, payload) => {
        set(state => {
            const action = { id: Math.random().toString(), type, payload, status: 'PENDING' as const };
            return {
                player: { ...state.player, pendingActions: [...state.player.pendingActions, action] }
            };
        });
    },

    resolveCrisis: (crisisId, optionId) => {
        set(state => {
            const crisis = state.activeCrises.find(c => c.id === crisisId);
            if (!crisis) return state;
            const option = crisis.options.find(o => o.id === optionId);
            if (!option) return state;

            const timeStr = `${state.globalTime.getHours().toString().padStart(2,'0')}:${state.globalTime.getMinutes().toString().padStart(2,'0')}`;
            const newLog = { time: timeStr, msg: option.impactEffects.logMsg, type: (option.style === 'danger' ? 'warn' : 'info') as 'warn'|'info' };

            const newResources = { ...state.resources };
            if (option.impactEffects.budgetMod) {
                newResources.budget = Math.max(0, newResources.budget + option.impactEffects.budgetMod);
            }

            const newSociety = { ...state.society };
            if (option.impactEffects.unrestLevelMod) {
                newSociety.unrest.level = Math.max(0, Math.min(100, newSociety.unrest.level + option.impactEffects.unrestLevelMod));
            }

            const newPolitics = { ...state.politics };
            if (option.impactEffects.approvalMod) {
                newPolitics.publicOpinion = Math.max(0, Math.min(100, newPolitics.publicOpinion + option.impactEffects.approvalMod));
            }

            return {
                activeCrises: state.activeCrises.filter(c => c.id !== crisisId),
                logs: [newLog, ...state.logs].slice(0, 30),
                resources: newResources,
                society: newSociety,
                politics: newPolitics
            };
        });
    },

    opposeBill: (billId) => {
        set(state => {
            const bill = state.politics.bills.find(b => b.id === billId);
            if (!bill) return state;

            const newSupportLevel = Math.max(0, bill.support - 5);
            return {
                politics: {
                    ...state.politics,
                    bills: state.politics.bills.map(b => b.id === billId ? { ...b, support: newSupportLevel } : b)
                }
            };
        });
    },

    supportBill: (billId) => {
        set(state => {
            const bill = state.politics.bills.find(b => b.id === billId);
            if (!bill) return state;

            const newSupportLevel = Math.min(100, bill.support + 5);
            return {
                politics: {
                    ...state.politics,
                    bills: state.politics.bills.map(b => b.id === billId ? { ...b, support: newSupportLevel } : b)
                }
            };
        });
    },

    fundCampaign: (candidateId) => {
        set(state => {
            if (state.player.cash < 5000) return state; // Needs funds
            
            const polling = state.politics.elections.polling;
            const newPolling = polling.map(p => 
                p.candidateId === candidateId 
                    ? { ...p, percentage: p.percentage + 2, trend: 2 } 
                    : { ...p, percentage: Math.max(0, p.percentage - (2 / (polling.length - 1))), trend: -1 }
            );
            
            const timeStr = `${state.globalTime.getHours().toString().padStart(2,'0')}:${state.globalTime.getMinutes().toString().padStart(2,'0')}`;
            return {
                player: { ...state.player, cash: state.player.cash - 5000 },
                logs: [{ time: timeStr, msg: `Funded campaign for candidate. Cash -$5000.`, type: 'info' as const }, ...state.logs].slice(0, 30),
                politics: {
                    ...state.politics,
                    elections: {
                        ...state.politics.elections,
                        polling: newPolling
                    }
                }
            };
        });
    },

    smearCampaign: (candidateId) => {
        set(state => {
            const polling = state.politics.elections.polling;
            const newPolling = polling.map(p => 
                p.candidateId === candidateId 
                    ? { ...p, percentage: Math.max(0, p.percentage - 3), trend: -3 } 
                    : { ...p, percentage: p.percentage + (3 / (polling.length - 1)), trend: 1 }
            );
            
            // Smear campaigns have a chance to backfire
            const backfire = Math.random() > 0.7;
            const timeStr = `${state.globalTime.getHours().toString().padStart(2,'0')}:${state.globalTime.getMinutes().toString().padStart(2,'0')}`;
            
            return {
                player: { ...state.player, professionalism: backfire ? Math.max(0, state.player.professionalism - 10) : state.player.professionalism },
                logs: [{ time: timeStr, msg: backfire ? `Smear campaign backfired! Reputation damaged.` : `Smear campaign executed. Polling altered.`, type: (backfire ? 'warn' : 'info') as 'warn'|'info' }, ...state.logs].slice(0, 30),
                politics: {
                    ...state.politics,
                    elections: {
                        ...state.politics.elections,
                        polling: newPolling
                    }
                }
            };
        });
    },

    signBill: (billId) => {
        set(state => {
            const bill = state.politics.bills.find(b => b.id === billId);
            if (!bill || bill.status !== 'PASSED_WAITING_SIGN') return state;

            const timeStr = `${state.globalTime.getHours().toString().padStart(2,'0')}:${state.globalTime.getMinutes().toString().padStart(2,'0')}`;
            const newLog = { 
                time: timeStr, 
                msg: bill.impactEffects.logMsg, 
                type: 'info' as const 
            };
            
            // Generate behavior feed event natively inside the engine (emulated by appending to behavioralStream)
            const behaviorEvent = {
                id: `beh-event-${Date.now()}`,
                timestamp: timeStr,
                message: `Mass population sentiment adjusted. AI Collective reacted to ${bill.name}.`,
                type: 'POLITICAL' as const,
                region: 'National',
                impact: bill.impactEffects.publicOpinionMod && bill.impactEffects.publicOpinionMod > 0 ? 'Public Opinion Rose' : 'Public Opinion Fell'
            };

            return {
                politics: {
                    ...state.politics,
                    publicOpinion: state.politics.publicOpinion + (bill.impactEffects.publicOpinionMod || 0),
                    bills: state.politics.bills.filter(b => b.id !== billId),
                },
                resources: {
                    ...state.resources,
                    budget: state.resources.budget + (bill.impactEffects.budgetMod || 0),
                },
                economy: {
                    ...state.economy,
                    global_inflation: state.economy.global_inflation + (bill.impactEffects.inflationMod || 0),
                },
                society: {
                    ...state.society,
                    unrest: {
                        ...state.society.unrest,
                        level: Math.max(0, state.society.unrest.level + (bill.impactEffects.unrestMod || 0)),
                    },
                    households: {
                        ...state.society.households,
                        averageBurnout: Math.max(0, state.society.households.averageBurnout + (bill.impactEffects.householdStressMod || 0)),
                    },
                    behavioralStream: [behaviorEvent, ...state.society.behavioralStream].slice(0, 50)
                },
                logs: [newLog, ...state.logs].slice(0, 30)
            };
        });
    },

    executePlayerAction: (payload, msg) => {
        set(state => {
            const nextTime = new Date(state.globalTime.getTime() + payload.durationMins * 60000);
            
            const newPlayer = { ...state.player };
            if (payload.staminaMod) newPlayer.stamina = Math.min(100, Math.max(0, newPlayer.stamina + payload.staminaMod));
            if (payload.stressMod) newPlayer.stress = Math.min(100, Math.max(0, newPlayer.stress + payload.stressMod));
            if (payload.hungerMod) newPlayer.hunger = Math.min(100, Math.max(0, newPlayer.hunger + payload.hungerMod));
            if (payload.moneyMod) newPlayer.cash += payload.moneyMod;
            
            const timeStr = `${nextTime.getHours().toString().padStart(2,'0')}:${nextTime.getMinutes().toString().padStart(2,'0')}`;
            const newLog = { time: timeStr, msg, type: 'info' as const };

            return {
                globalTime: nextTime,
                player: newPlayer,
                logs: [newLog, ...state.logs].slice(0, 30)
            };
        });
    },

    triggerDisaster: (regionId, nodeId) => {
        set(state => {
            const newInfra = { ...state.infra };
            if (newInfra.regions[regionId] && newInfra.regions[regionId].nodes[nodeId]) {
                newInfra.regions[regionId].nodes[nodeId].health = 10;
                newInfra.regions[regionId].nodes[nodeId].status = 'OFFLINE';
            }
            const timeStr = `${state.globalTime.getHours().toString().padStart(2,'0')}:${state.globalTime.getMinutes().toString().padStart(2,'0')}`;
            return {
                infra: newInfra,
                logs: [{ time: timeStr, msg: `CRITICAL: Catastrophic failure induced at ${nodeId} in ${regionId}`, type: 'error' as const }, ...state.logs].slice(0, 30)
            };
        });
    },

    tickGlobalTime: () => {
        set(state => {
            // Advance by 1 simulation minute per real second (or whatever interval calls this)
            const nextTime = new Date(state.globalTime.getTime() + 60000);
            const timeStr = `${nextTime.getHours().toString().padStart(2,'0')}:${nextTime.getMinutes().toString().padStart(2,'0')}`;
            const logsToAdd: Array<{id: string, time: string, msg: string, type: "info" | "error" | "warn"}> = [];
            
            // Player Biological Decay is now handled strictly via PersonalSimulationEngine.processAgentTick
            // called by CivilianDashboard/Civilization engine. We keep the raw pass-through reference here.
            const p = { ...state.player };

            // 2. Cascade Infrastructure Logic & Resource Consumption
            const nextInfra = { ...state.infra };
            // Make a deep copy to ensure reactivity
            nextInfra.regions = JSON.parse(JSON.stringify(state.infra.regions));
            const newResources = { ...state.resources };
            let nextActiveCrises = [...state.activeCrises];

            let totalPowerHealth = 0;
            let totalFoodHealth = 0;
            let totalTransportHealth = 0;
            let totalDataHealth = 0;
            let regionCount = 0;

            Object.values(nextInfra.regions).forEach(region => {
                regionCount++;
                const nodes = region.nodes;
                
                // RESOURCE CONSUMPTION
                // POWER consumes fuel, produces energy
                if (nodes.POWER.health > 20 && newResources.fuel > 10) {
                    newResources.fuel -= 10;
                    newResources.energy = Math.min(100000, newResources.energy + 20); // Produce energy
                } else if (nodes.POWER.health > 20) {
                    nodes.POWER.health -= 0.5; // Starts degrading if fuel empty
                }

                // DATA network consumes lots of energy
                if (nodes.DATA.health > 20 && newResources.energy > 5) {
                    newResources.energy -= 5;
                } else if (nodes.DATA.health > 20) {
                    nodes.DATA.health -= 1.0;
                }

                // WATER consumes energy
                if (nodes.WATER.health > 20 && newResources.energy > 2) {
                    newResources.energy -= 2;
                    newResources.water = Math.min(100000, newResources.water + 15);
                } else if (nodes.WATER.health > 20) {
                    nodes.WATER.health -= 1.0; 
                }

                // FOOD consumes water and materials
                if (nodes.FOOD.health > 20 && newResources.water > 5 && newResources.materials > 1) {
                    newResources.water -= 5;
                    newResources.materials -= 1;
                    newResources.food = Math.min(100000, newResources.food + 10);
                }

                // Generic Degradation vs Maintenance base
                const keys = Object.keys(nodes) as Array<InfraType>;
                keys.forEach(k => {
                    let h = nodes[k].health;
                    // Apply maintenance policy
                    let shift = 0;
                    let budgetCost = 0;
                    switch (nodes[k].maintenancePolicy) {
                        case 'PREVENTIVE': shift = 0.05; budgetCost = 0.005; break;
                        case 'BALANCED': shift = -0.01; budgetCost = 0.001; break;
                        case 'REACTIVE': shift = -0.05; budgetCost = 0; break;
                        case 'EMERGENCY': shift = (h < 40) ? 0.3 : -0.05; budgetCost = 0.02; break;
                    }

                    if (newResources.budget > budgetCost) {
                        newResources.budget -= budgetCost;
                        h += shift;
                    } else {
                        h -= 0.1; // Decay if no budget for maintenance
                    }
                    
                    nodes[k].health = Math.min(100, Math.max(0, h));
                });

                // Intra-Region Dependencies
                // ISP depends on POWER & DATA
                if (nodes.POWER.health < 20 || nodes.DATA.health < 20) nodes.ISP.health -= 2;
                // TRANSPORT depends on POWER
                if (nodes.POWER.health < 20) nodes.TRANSPORT.health -= 0.5;
                // BANKING depends on ISP & POWER
                if (nodes.ISP.health < 20 || nodes.POWER.health < 20) {
                    nodes.BANKING.health -= 3;
                    if (nodes.BANKING.health <= 20 && !nextActiveCrises.some(c => c.id === 'crisis_banking_fail_' + region.id)) {
                        nextActiveCrises.push({
                            id: 'crisis_banking_fail_' + region.id,
                            title: `Banking Collapse in ${region.name}`,
                            description: `Severe cascading infrastructure failure in ${region.name} has forced banking nodes offline. Complete financial stagnation imminent. AI Citizens cannot transact.`,
                            severity: 3,
                            category: 'INFRASTRUCTURE',
                            options: [
                                {
                                    id: 'bailout',
                                    label: 'Emergency Liquidity Injection (20B)',
                                    style: 'default',
                                    impactEffects: { budgetMod: -20, unrestLevelMod: -10, logMsg: 'Banking system bailed out using emergency funds.' }
                                },
                                {
                                    id: 'ignore',
                                    label: 'Let the Market Correct (Unrest ++)',
                                    style: 'danger',
                                    impactEffects: { unrestLevelMod: +25, approvalMod: -15, logMsg: 'Banking systems left to collapse. Massive unrest triggered.' }
                                }
                            ]
                        });
                        logsToAdd.push({ id: 'crisis-b-' + Date.now(), time: timeStr, msg: `CRITICAL: Cascading failure caused Banking node in ${region.name} to drop offline. Crisis triggered!`, type: 'error' });
                    }
                }
                // FOOD depends on TRANSPORT
                if (nodes.TRANSPORT.health < 40) nodes.FOOD.health -= 1.5;
                // HEALTHCARE depends on POWER and WATER
                if (nodes.POWER.health < 40 || nodes.WATER.health < 40) nodes.HEALTHCARE.health -= 2.0;

                // Determine statuses
                keys.forEach(k => {
                    nodes[k].health = Math.max(0, nodes[k].health);
                    if (nodes[k].health < 20) nodes[k].status = 'OFFLINE';
                    else if (nodes[k].health < 70) nodes[k].status = 'DEGRADED';
                    else nodes[k].status = 'ONLINE';
                });

                totalPowerHealth += nodes.POWER.health;
                totalFoodHealth += nodes.FOOD.health;
                totalTransportHealth += nodes.TRANSPORT.health;
                totalDataHealth += nodes.DATA.health;
            });
            
            const avgFoodHealth = totalFoodHealth / regionCount;
            const avgTransportHealth = totalTransportHealth / regionCount;
            const avgDataHealth = totalDataHealth / Math.max(1, regionCount);
            const avgPowerHealth = totalPowerHealth / Math.max(1, regionCount);
            
            // 3. Economic Impact from Infrastructure
            const newEconomy = { ...state.economy };
            
            // --- RESOURCE PRODUCTION ---
            // Scaled based on unemployment to mimic domestic production capacity
            if (newEconomy.global_unemployment <= 15) {
                const productivityMod = (15 - newEconomy.global_unemployment) / 10;
                newResources.fuel = Math.min(100000, newResources.fuel + (390 * productivityMod)); 
                newResources.materials = Math.min(100000, newResources.materials + (160 * productivityMod));
                newResources.components = Math.min(100000, newResources.components + (80 * productivityMod));
                
                // Tax revenue replenishes budget
                newResources.budget = Math.min(5000, newResources.budget + (newEconomy.gdp * 0.05 * productivityMod));
            } else {
                // If unemployment is extremely high, production plummets
                newResources.budget = Math.min(5000, newResources.budget + (newEconomy.gdp * 0.01));
            }

            if (avgFoodHealth < 50 || avgTransportHealth < 50) {
                newEconomy.global_inflation += 0.005; // Inflation goes up if supply is choked
            }
            if (avgDataHealth < 40) {
                newEconomy.global_unemployment += 0.002;
                newEconomy.gdp -= 0.005; // Drop GDP
            } else if (avgDataHealth > 80) {
                newEconomy.gdp += 0.001; // Natural slight growth
            }

            // 4. Societal Impact & Household Strain from Economy
            const newSociety = { ...state.society };
            const newClasses = { ...newSociety.classes };
            const newHouseholds = { ...newSociety.households };
            const newPsych = { ...newSociety.psychology };
            const newIdeology = { ...newSociety.ideology };
            const newAdaptations = { ...newSociety.adaptations };
            const newUnrest = { ...newSociety.unrest };
            const newBehavioralStream = [...newSociety.behavioralStream];
            
            // --- A. Household Pressure Calculation ---
            // High inflation and unemployment heavily impact food security and utility bills
            if (newEconomy.global_inflation > 5.0 || newEconomy.global_unemployment > 8.0) {
                newHouseholds.foodInsecurityIndex = Math.min(100, newHouseholds.foodInsecurityIndex + 0.5);
                newHouseholds.unpaidUtilityBills = Math.min(100, newHouseholds.unpaidUtilityBills + 0.2);
                newHouseholds.averageBurnout = Math.min(100, newHouseholds.averageBurnout + 0.1);
            } else {
                newHouseholds.foodInsecurityIndex = Math.max(0, newHouseholds.foodInsecurityIndex - 0.1);
                newHouseholds.unpaidUtilityBills = Math.max(0, newHouseholds.unpaidUtilityBills - 0.1);
                newHouseholds.averageBurnout = Math.max(0, newHouseholds.averageBurnout - 0.05);
            }

            // --- B. Infrastructure Health on Society ---
            if (avgFoodHealth < 50 || avgTransportHealth < 50) {
                newHouseholds.foodInsecurityIndex += 0.8;
                newAdaptations.migrationPressure = Math.min(100, newAdaptations.migrationPressure + 0.05);
            }
            if (avgDataHealth < 40) {
                newAdaptations.jobSeekingSurge = Math.min(100, newAdaptations.jobSeekingSurge + 0.1);
            }

            // Healthcare impact
            let totalHealthcare = 0;
            Object.values(nextInfra.regions).forEach(r => totalHealthcare += r.nodes.HEALTHCARE.health);
            const avgHealthHealth = totalHealthcare / Math.max(1, regionCount);
            
            if (avgHealthHealth < 60) {
                newAdaptations.healthcareAvoidance = Math.min(100, newAdaptations.healthcareAvoidance + 0.2);
                newSociety.healthcareQuality = Math.max(0, newSociety.healthcareQuality - 0.05);
                newPsych.fearIndex = Math.min(100, newPsych.fearIndex + 0.1);
            } else {
                newAdaptations.healthcareAvoidance = Math.max(0, newAdaptations.healthcareAvoidance - 0.1);
                newSociety.healthcareQuality = Math.min(100, newSociety.healthcareQuality + 0.02);
            }

            // --- C. Psychological & Ideological Mutation ---
            // If stress is high and trust is low, ideology shifts
            newPsych.stressLevel = (newHouseholds.averageBurnout + newHouseholds.foodInsecurityIndex + newHouseholds.unpaidUtilityBills + newEconomy.global_inflation*5) / 4;
            
            if (newPsych.stressLevel > 60) {
                newPsych.politicalTrust = Math.max(0, newPsych.politicalTrust - 0.2);
                newPsych.emotionalVolatility = Math.min(100, newPsych.emotionalVolatility + 0.2);
                newIdeology.populism = Math.min(100, newIdeology.populism + 0.1);
                newIdeology.authoritarianTolerance = Math.min(100, newIdeology.authoritarianTolerance + 0.05);
            } else {
                newPsych.politicalTrust = Math.min(100, newPsych.politicalTrust + 0.1);
                newPsych.emotionalVolatility = Math.max(0, newPsych.emotionalVolatility - 0.1);
                newIdeology.progressivism = Math.min(100, newIdeology.progressivism + 0.05);
            }

            // --- D. Class Dynamics ---
            if (newEconomy.global_inflation > 5.0) {
                newClasses.middleGrowth = -0.1;
                newClasses.povertyGrowth = 0.5;
                newSociety.crimeRate = Math.min(100, newSociety.crimeRate + 0.02);
            } else {
                newClasses.middleGrowth = 0.5;
                newClasses.povertyGrowth = -0.2;
                newSociety.crimeRate = Math.max(0, newSociety.crimeRate - 0.01);
            }
            if (newEconomy.global_unemployment > 8.0) {
                newClasses.workingGrowth = -0.2;
                newClasses.povertyGrowth += 0.2;
                newAdaptations.unionOrganization = Math.min(100, newAdaptations.unionOrganization + 0.15);
            }
            
            // --- E. Unrest Escalation ---
            const unrestPressure = (newPsych.stressLevel * 0.4) + (newPsych.fearIndex * 0.3) + ((100 - newPsych.politicalTrust) * 0.3);
            if (unrestPressure > 70) {
                newUnrest.level = Math.min(100, newUnrest.level + 0.2);
                if (newUnrest.level > 80 && newUnrest.stage !== 'RIOTS') newUnrest.stage = 'RIOTS';
                else if (newUnrest.level > 60 && newUnrest.stage === 'DISSATISFACTION') newUnrest.stage = 'ORGANIZED_CRITICISM';
            } else if (unrestPressure < 40) {
                newUnrest.level = Math.max(0, newUnrest.level - 0.1);
                if (newUnrest.level < 20) newUnrest.stage = 'DISSATISFACTION';
            }

            // --- F. Emergent Reaction Generation ---
            // Generate behavior log if specific thresholds are hit
            if (Math.random() < 0.1) { // 10% chance per tick (every 5 real seconds basically, so ~every 50s one log drops)
                if (newHouseholds.foodInsecurityIndex > 40 && Math.random() < 0.5) {
                    newBehavioralStream.unshift({ id: 'gen-' + Date.now().toString(), timestamp: timeStr, message: `Panic buying of staple supplies detected in low-income districts.`, type: 'ECONOMIC', region: 'Working Sectors', impact: '+15% Price Friction' });
                } else if (newPsych.politicalTrust < 30 && Math.random() < 0.5) {
                    newBehavioralStream.unshift({ id: 'gen-' + Date.now().toString(), timestamp: timeStr, message: `Spontaneous anti-government assembly forming near municipal buildings.`, type: 'POLITICAL', region: 'Capitol Sector', impact: '+5% Organized Protest' });
                } else if (newAdaptations.healthcareAvoidance > 40 && Math.random() < 0.5) {
                    newBehavioralStream.unshift({ id: 'gen-' + Date.now().toString(), timestamp: timeStr, message: `Reported emergence of unregulated "shadow clinics" operating without licenses.`, type: 'CRITICAL', region: 'East Sector', impact: 'Institutional Bypass' });
                } else if (newAdaptations.migrationPressure > 30 && Math.random() < 0.5) {
                    newBehavioralStream.unshift({ id: 'gen-' + Date.now().toString(), timestamp: timeStr, message: `Traffic congestion out of northern provinces as populations seek stable power grids.`, type: 'MIGRATION', region: 'Northern Province', impact: 'Household Displacement' });
                } else if (newAdaptations.unionOrganization > 20 && Math.random() < 0.5) {
                    newBehavioralStream.unshift({ id: 'gen-' + Date.now().toString(), timestamp: timeStr, message: `Logistics workers threatening wildcat strikes over persistent inflation.`, type: 'SOCIAL', region: 'Industrial Zones', impact: 'Supply Chain Threat' });
                }
            }

            // Cap the behavior stream at 12 items
            if (newBehavioralStream.length > 12) {
                newBehavioralStream.length = 12;
            }

            // Apply growths (scaled down for minute tick)
            newClasses.upper = Math.max(0, newClasses.upper + newClasses.upperGrowth * 0.001);
            newClasses.middle = Math.max(0, newClasses.middle + newClasses.middleGrowth * 0.001);
            newClasses.working = Math.max(0, newClasses.working + newClasses.workingGrowth * 0.001);
            newClasses.poverty = Math.max(0, newClasses.poverty + newClasses.povertyGrowth * 0.001);
            
            // Normalize to 100%
            const totalClass = newClasses.upper + newClasses.middle + newClasses.working + newClasses.poverty;
            newClasses.upper = (newClasses.upper / totalClass) * 100;
            newClasses.middle = (newClasses.middle / totalClass) * 100;
            newClasses.working = (newClasses.working / totalClass) * 100;
            newClasses.poverty = (newClasses.poverty / totalClass) * 100;
            
            newSociety.classes = newClasses;
            newSociety.households = newHouseholds;
            newSociety.psychology = newPsych;
            newSociety.ideology = newIdeology;
            newSociety.unrest = newUnrest;
            newSociety.adaptations = newAdaptations;
            newSociety.behavioralStream = newBehavioralStream;
            newSociety.socialQualityIndex = (newSociety.educationIndex + newSociety.healthcareQuality + (100 - newSociety.crimeRate*2) + 85 + 55 + (100 - newClasses.poverty*2)) / 6;

            // --- G. Political Dynamics & AI Government Adaptation ---
            const newPolitics = { ...state.politics };
            const newPres = { ...newPolitics.president };
            const newGov = { ...newPolitics.government };
            const newParties = [...newPolitics.parties];

            // Approval Rating fluctuates based on Political Trust, Unrest, and Economy
            let targetApproval = newPsych.politicalTrust;
            if (newEconomy.global_inflation > 6.0) targetApproval -= 10;
            if (newEconomy.global_unemployment > 10.0) targetApproval -= 15;
            if (newUnrest.level > 50) targetApproval -= Math.min(30, (newUnrest.level - 50) * 0.5);

            targetApproval = Math.max(0, Math.min(100, targetApproval));
            
            // Smoothly move approval rating
            newPres.approvalRating += (targetApproval - newPres.approvalRating) * 0.05;
            newPres.publicTrust = newPsych.politicalTrust;

            // Government Agenda shifts if unrest is high
            if (newUnrest.level > 70 && newPres.currentAgenda !== 'Emergency Stabilization') {
                newPres.currentAgenda = 'Emergency Stabilization';
                logsToAdd.push({ id: 'log-' + Date.now() + 1, time: timeStr, msg: `President ${newPres.name} declares Emergency Stabilization agenda amid rising unrest.`, type: 'warn' });
                newSociety.behavioralStream.unshift({ id: 'gen-' + Date.now().toString() + 2, timestamp: timeStr, message: `Executive branch shifts focus to crisis management.`, type: 'POLITICAL', region: 'National', impact: 'Agenda Shift' });
            } else if (newUnrest.level < 40 && newEconomy.global_inflation < 5) {
                if (newPres.currentAgenda === 'Emergency Stabilization') {
                   newPres.currentAgenda = 'Economic Recovery & Expansion';
                   logsToAdd.push({ id: 'log-' + Date.now() + 3, time: timeStr, msg: `President ${newPres.name} shifts agenda to Economic Recovery.`, type: 'info' });
                   newSociety.behavioralStream.unshift({ id: 'gen-' + Date.now().toString() + 4, timestamp: timeStr, message: `Government claims victory over recent crisis.`, type: 'POLITICAL', region: 'National', impact: 'Agenda Shift' });
                }
            }

            // Party Dynamics
            if (newIdeology.populism > 60) {
               const populists = newParties.find(p => p.id === 'party-swc');
               if (populists) populists.influence = Math.min(100, populists.influence + 0.1);
            }
            if (newIdeology.progressivism > 60) {
               const green = newParties.find(p => p.id === 'party-gtm');
               if (green) green.influence = Math.min(100, green.influence + 0.1);
            }

            // Random Organic Policy Bills
            if (Math.random() < 0.05) { // 5% chance per tick to propose a new bill organically
                const newBillId = 'bill-' + Date.now();
                if (newUnrest.level > 60 && !newPolitics.bills.some(b => b.name === 'Emergency Stimulus Package')) {
                    newPolitics.bills = [...newPolitics.bills, {
                        id: newBillId,
                        name: 'Emergency Stimulus Package',
                        description: 'Aimed at quelling unrest by injecting funds directly to low-income households, funded by debt.',
                        support: 65,
                        req: 50,
                        status: 'PASSED_WAITING_SIGN',
                        impactEffects: {
                            budgetMod: -150,
                            inflationMod: +1.2,
                            publicOpinionMod: +8,
                            unrestMod: -15,
                            householdStressMod: -10,
                            logMsg: 'Signed Emergency Stimulus: Household stress and unrest drop, but budget takes a major hit.'
                        }
                    }];
                    newSociety.behavioralStream.unshift({ id: 'gen-bill' + Date.now(), timestamp: timeStr, message: `Parliament drafts Emergency Stimulus Package.`, type: 'POLITICAL', region: 'National', impact: 'Legislative Action' });
                } else if (newEconomy.global_inflation > 8 && !newPolitics.bills.some(b => b.name === 'Austerity Measure Acts')) {
                    newPolitics.bills = [...newPolitics.bills, {
                        id: newBillId,
                        name: 'Austerity Measure Acts',
                        description: 'Slashing public infrastructure maintenance and freezing wages to control runaway inflation.',
                        support: 55,
                        req: 50,
                        status: 'PASSED_WAITING_SIGN',
                        impactEffects: {
                            budgetMod: +200,
                            inflationMod: -2.0,
                            publicOpinionMod: -12,
                            unrestMod: +20,
                            householdStressMod: +15,
                            logMsg: 'Signed Austerity Acts: Inflation projected to fall, but public unrest is surging.'
                        }
                    }];
                    newSociety.behavioralStream.unshift({ id: 'gen-bill2' + Date.now(), timestamp: timeStr, message: `Austerity Measures proposed to combat inflation.`, type: 'POLITICAL', region: 'National', impact: 'Legislative Action' });
                }
            }
            
            // --- H. Smarter Autonomous Administration Logic (AI) ---
            // The AI autonomously regulates the simulation without player input
            if (Math.random() < 0.15) { // 15% chance per tick to take executive actions
                
                // 1. Dr. Alistair Vance (AI) - Global Economy Management
                if (newEconomy.global_inflation > 12) {
                    newEconomy.global_inflation -= 0.5;
                    newEconomy.gdp -= 0.01;
                    logsToAdd.push({ id: 'log-' + Date.now() + 6, time: timeStr, msg: `Dr. Alistair Vance (AI) intervened: Raised interest rates to combat severe inflation.`, type: 'info' });
                    newSociety.behavioralStream.unshift({ id: 'gen-ai-econ-' + Date.now(), timestamp: timeStr, message: `Central Bank AI executes hawkish rate hike.`, type: 'ECONOMIC', region: 'Global', impact: 'Inflation Control' });
                } else if (newEconomy.global_unemployment > 10 && newResources.budget > 1000) {
                    newResources.budget -= 500;
                    newEconomy.global_unemployment -= 0.8;
                    newEconomy.gdp += 0.05;
                    logsToAdd.push({ id: 'log-' + Date.now() + 7, time: timeStr, msg: `Dr. Alistair Vance (AI) intervened: Deployed $500M stimulus to incentivize hiring.`, type: 'info' });
                }

                // 2. Helena Rostova (AI) - Infrastructure Management
                if (avgPowerHealth < 40 && newResources.budget > 200) {
                    newResources.budget -= 200;
                    Object.values(nextInfra.regions).forEach(r => r.nodes.POWER.health = Math.min(100, r.nodes.POWER.health + 10));
                    logsToAdd.push({ id: 'log-' + Date.now() + 8, time: timeStr, msg: `Helena Rostova (AI) deployed emergency budget to stabilize National Power Grid.`, type: 'warn' });
                }
                
                // Helena automatically shifts policies to EMERGENCY if critical nodes are failing
                Object.values(nextInfra.regions).forEach(r => {
                    if (r.nodes.DATA.health < 30 && r.nodes.DATA.maintenancePolicy !== 'EMERGENCY') {
                        r.nodes.DATA.maintenancePolicy = 'EMERGENCY';
                        logsToAdd.push({ id: 'log-' + Date.now() + 9, time: timeStr, msg: `Helena Rostova (AI) shifted DATA maintenance in ${r.name} to EMERGENCY protocols.`, type: 'warn' });
                    }
                });

                // 3. Hadi Prasetyo (AI) - National Politics & Society
                if (newUnrest.level > 60 && newPolitics.bills.length < 3) {
                    // Automatically draft appeasement bills
                    newPolitics.bills.push({
                        id: 'bill-ai-' + Date.now(),
                        name: 'National Solidarity Act (Drafted by AI)',
                        description: 'Aimed at mitigating severe unrest through direct social welfare deployment.',
                        support: 70,
                        req: 50,
                        status: 'PASSED_WAITING_SIGN',
                        impactEffects: {
                            budgetMod: -300,
                            inflationMod: +0.5,
                            publicOpinionMod: +15,
                            unrestMod: -25,
                            householdStressMod: -15,
                            logMsg: 'Signed National Solidarity Act: Massive social subsidies deployed, unrest dropped.'
                        }
                    });
                     newSociety.behavioralStream.unshift({ id: 'gen-ai-pol-' + Date.now(), timestamp: timeStr, message: `Hadi Prasetyo (AI) expedites Solidarity Act to quell protests.`, type: 'POLITICAL', region: 'National', impact: 'Legislative Action' });
                }

                // 4. Autonomous Bill Enactment (AI Government signs pending bills organically)
                if (newPolitics.bills.length > 0) {
                    // Hadi Prasetyo explicitly signs one bill
                    const billToPass = newPolitics.bills[0];
                    newPolitics.bills = newPolitics.bills.filter(b => b.id !== billToPass.id);
                    
                    if (billToPass.impactEffects.budgetMod) newResources.budget += billToPass.impactEffects.budgetMod;
                    if (billToPass.impactEffects.inflationMod) newEconomy.global_inflation += billToPass.impactEffects.inflationMod;
                    if (billToPass.impactEffects.publicOpinionMod) newPolitics.publicOpinion = Math.max(0, Math.min(100, newPolitics.publicOpinion + billToPass.impactEffects.publicOpinionMod));
                    if (billToPass.impactEffects.unrestMod) newUnrest.level = Math.max(0, Math.min(100, newUnrest.level + billToPass.impactEffects.unrestMod));
                    if (billToPass.impactEffects.householdStressMod) newHouseholds.averageBurnout = Math.max(0, Math.min(100, newHouseholds.averageBurnout + billToPass.impactEffects.householdStressMod));

                    logsToAdd.push({ id: 'log-' + Date.now() + 5, time: timeStr, msg: `Hadi Prasetyo (AI) actively signed: ${billToPass.name}`, type: 'info' });
                    newSociety.behavioralStream.unshift({ id: 'gen-bill3-' + Date.now(), timestamp: timeStr, message: `Hadi Prasetyo (AI) enacts: ${billToPass.name}`, type: 'POLITICAL', region: 'National', impact: 'Law Enacted' });
                }
            }

            newPolitics.president = newPres;
            newPolitics.government = newGov;
            newPolitics.parties = newParties;

            // --- I. CORE CIVILIZATION NODE (CCN) INTEGRATION ---
            const newCCN = JSON.parse(JSON.stringify(state.ccn)) as CCNState;

            // --- J. EMERGENT CIVILIAN QUESTION & AI PRESIDENT RESPONSE SYSTEM ---
            if (Math.random() < 0.25) { // 25% chance per tick to generate an emergent question
                // Determine the most critical category dynamically based on simulation state
                const categories = [
                    { type: 'ECONOMIC', weight: newEconomy.global_inflation + newEconomy.global_unemployment },
                    { type: 'SOCIAL', weight: newUnrest.level * 0.5 + newHouseholds.averageBurnout * 0.3 },
                    { type: 'INFRASTRUCTURE', weight: (100 - avgPowerHealth) + (100 - avgDataHealth) },
                    { type: 'MILITARY', weight: 100 - newCCN.metrics.orbitalIntegrity }, 
                    { type: 'AI_ETHICS', weight: newCCN.metrics.computeLoad * 0.5 }
                ];
                categories.sort((a,b) => b.weight - a.weight);
                const criticalCategory = categories[0].type;
                
                let questionText = "What is the government doing about the current crisis?";
                
                if (criticalCategory === 'ECONOMIC') {
                    const econQuestions = [
                        `Kenapa harga pangan naik drastis dalam seminggu terakhir?`,
                        `Apakah elite government menimbun sumber daya sementara akun citizen diblokir?`,
                        `Mengapa perusahaan AI mendapat subsidi lebih besar dibanding pekerja kasar?`,
                        `Apakah Central Bank AI sengaja memanipulasi market untuk krisis ini?`
                    ];
                    questionText = econQuestions[Math.floor(Math.random() * econQuestions.length)];
                } else if (criticalCategory === 'SOCIAL') {
                    const socialQuestions = [
                        `Mengapa angka kriminalitas meningkat tajam di distrik industri?`,
                        `Apakah pemerintah gagal mengendalikan gelombang migrasi besar-besaran ini?`,
                        `Mengapa citizen kelas bawah kehilangan akses ke fasilitas kesehatan dasar?`,
                        `Sampai kapan kita harus bekerja dengan burnout di ambang batas kematian?`
                    ];
                    questionText = socialQuestions[Math.floor(Math.random() * socialQuestions.length)];
                } else if (criticalCategory === 'INFRASTRUCTURE') {
                    const infraQuestions = [
                        `Apakah pemadaman listrik massal ini disengaja untuk memotong konsumsi kita?`,
                        `Kenapa sistem air bersih selalu offline di sektor menengah ke bawah?`,
                        `Apakah Reality Sync Engine gagal menjaga infrastruktur digital kita?`,
                        `Bagaimana kita bisa bertahan jika koneksi data terus terputus tiap hari?`
                    ];
                    questionText = infraQuestions[Math.floor(Math.random() * infraQuestions.length)];
                } else if (criticalCategory === 'MILITARY') {
                    const militaryQuestions = [
                        `Siapa yang bertanggung jawab atas ribuan korban dalam konfrontasi orbital kemarin?`,
                        `Apakah Autonomous Defense Grid kita benar-benar dikendalikan oleh manusia?`,
                        `Kenapa anggaran militer melonjak sementara subsidi pangan dicabut?`,
                        `Apakah kita sedang diawasi penuh oleh Sentinel Firewall?`
                    ];
                    questionText = militaryQuestions[Math.floor(Math.random() * militaryQuestions.length)];
                } else if (criticalCategory === 'AI_ETHICS') {
                    const ethicsQuestions = [
                        `Apakah AI Governance seperti Hadi Prasetyo masih berpihak pada kemanusiaan?`,
                        `Mengapa AI memiliki hak politik lebih besar untuk menentukan masa depan kita?`,
                        `Apakah Civilization Intelligence (CI) sudah mulai mengambil alih negara ini sepenuhnya?`,
                        `Siapa yang bisa mengaudit Memory Vault jika terjadi distorsi sejarah?`
                    ];
                    questionText = ethicsQuestions[Math.floor(Math.random() * ethicsQuestions.length)];
                }

                newSociety.behavioralStream.unshift({ 
                    id: 'q-' + Date.now(), 
                    timestamp: timeStr, 
                    message: `EMERGENT QUESTION: "${questionText}"`, 
                    type: 'QUESTION', 
                    region: 'Civilian Network', 
                    impact: 'Public Tension Rising' 
                });

                // AI President Response System
                const rTypes = ['AGGRESSIVE', 'DIPLOMATIC', 'MANIPULATIVE', 'TRANSPARENT'] as const;
                const responseType = rTypes[Math.floor(Math.random() * rTypes.length)];
                let effectDesc = '';
                
                if (responseType === 'AGGRESSIVE') {
                    newUnrest.level = Math.max(0, newUnrest.level - 5);
                    newPsych.emotionalVolatility = Math.min(100, newPsych.emotionalVolatility + 5);
                    newPolitics.publicOpinion -= 2;
                    newHouseholds.averageBurnout += 2;
                    effectDesc = 'Fear increased, protests dispersed forcefully.';
                } else if (responseType === 'DIPLOMATIC') {
                    newUnrest.level -= 2;
                    newPolitics.publicOpinion += 2;
                    newCCN.metrics.orbitalIntegrity -= 1; // Military views it as weak
                    effectDesc = 'Panic reduced slightly, elite factions show disdain.';
                } else if (responseType === 'MANIPULATIVE') {
                    if (Math.random() < 0.3) {
                        // Lie caught!
                        newUnrest.level += 15;
                        newEconomy.gdp -= 0.05;
                        newPolitics.publicOpinion -= 10;
                        newPsych.politicalTrust -= 15;
                        effectDesc = 'Scandal! Deception exposed. Severe civilian backlash.';
                        logsToAdd.push({ id: 'log-scandal-' + Date.now(), time: timeStr, msg: `CRITICAL: AI President deception exposed. Severe drop in public trust!`, type: 'error' });
                    } else {
                        // Lie succeeds!
                        newUnrest.level -= 8;
                        newPolitics.publicOpinion += 5;
                        newPsych.politicalTrust += 2;
                        effectDesc = 'Public opinion successfully swayed. True consequences delayed.';
                    }
                } else if (responseType === 'TRANSPARENT') {
                    newPolitics.publicOpinion += 8;
                    newPsych.politicalTrust += 10;
                    newEconomy.global_inflation += 0.5; // Investors panic due to transparency
                    newUnrest.level += 5; 
                    newEconomy.gdp -= 0.02;
                    effectDesc = 'Trust increased, but severe market panic ensued.';
                    logsToAdd.push({ id: 'log-panic-' + Date.now(), time: timeStr, msg: `WARNING: Total transparency led to immediate market panic.`, type: 'warn' });
                }

                newSociety.behavioralStream.unshift({ 
                    id: 'resp-' + Date.now(), 
                    timestamp: timeStr, 
                    message: `Hadi Prasetyo (AI) RESPONSE [${responseType} PROTOCOL]`, 
                    type: 'RESPONSE', 
                    region: 'National Broadcast', 
                    impact: effectDesc 
                });
            }

            // SubNode benefits
            let computeBonus = 0;
            let defenseBonus = 0;
            let energyBonus = 0;
            newCCN.subNodes.forEach(sn => {
                if (sn.status === 'ONLINE') {
                    const priorityMultiplier = sn.priority ? sn.priority / 3 : 1; // Priority 3 is baseline 1.0x
                    if (sn.type === 'COMPUTE') computeBonus += 5 * priorityMultiplier;
                    if (sn.type === 'DEFENSE') defenseBonus += 5 * priorityMultiplier;
                    if (sn.type === 'ENERGY') energyBonus += 10 * priorityMultiplier;
                }
            });

            // 1. Orbital Defense & Health
            const ccnNodes = Object.values(newCCN.modules);
            let avgHealthCCN = 0;
            ccnNodes.forEach(n => {
                let degChance = 0.01;
                let degAmount = 1;

                if (n.id !== 'defense' && newCCN.modules.defense.health < 50) {
                    degChance = 0.05;
                    degAmount = 2;
                }

                if (n.id === 'defense') {
                    degAmount = Math.max(0.1, 1 - (n.level * 0.1));
                }

                if (newCCN.modules.security && newCCN.modules.security.health > 50) {
                    degChance *= 0.5;
                }

                if (Math.random() < degChance) {
                    n.health = Math.max(0, n.health - degAmount);
                }

                if (n.id === 'defense' && defenseBonus > 0 && Math.random() < 0.1) {
                    n.health = Math.min(100, n.health + defenseBonus * 0.1); 
                }

                avgHealthCCN += n.health;
                
                // Status update
                if (n.health > 80) n.status = 'OPTIMAL';
                else if (n.health > 30) n.status = 'DEGRADED';
                else n.status = 'OFFLINE';
            });
            avgHealthCCN /= ccnNodes.length;

            const securityHealth = newCCN.modules.security ? newCCN.modules.security.health : 0;
            newCCN.metrics.orbitalIntegrity = Math.min(100, Math.max(0, (newCCN.modules.defense.health * 0.6) + (securityHealth * 0.4)));

            // Civilization Intelligence Crisis Prediction
            if (newCCN.modules.cognitive && newCCN.modules.cognitive.health > 80) {
                if (newSociety.unrest.level > 50 && Math.random() < 0.1) {
                    logsToAdd.push({ id: 'ci-predict-' + Date.now(), time: timeStr, msg: `CIVILIZATION INTELLIGENCE: Predicting imminent unrest cascade. Recommending immediate policy intervention.`, type: 'info' });
                }
                if (newEconomy.global_inflation > 12 && Math.random() < 0.1) {
                    logsToAdd.push({ id: 'ci-predict-econ-' + Date.now(), time: timeStr, msg: `CIVILIZATION INTELLIGENCE: Global inflation threshold exceeded. Recommending market stabilization protocol.`, type: 'info' });
                }
            }

            // Automated Maintenance Subroutine
            if (newCCN.metrics.energyReserves > 2000) {
                if (newCCN.modules.sync && newCCN.modules.sync.health < 100) {
                    newCCN.modules.sync.health = Math.min(100, newCCN.modules.sync.health + 0.5);
                    newCCN.metrics.energyReserves -= 20;
                }
                if (newCCN.modules.memory && newCCN.modules.memory.health < 100) {
                    newCCN.modules.memory.health = Math.min(100, newCCN.modules.memory.health + 0.5);
                    newCCN.metrics.energyReserves -= 20;
                }
            }

            // 2. Metrics & Compute Load
            let rawComputeLoad = 50 - computeBonus + (100 - avgHealthCCN) * 0.5 + (newSociety.unrest.level * 0.2);
            // Quantum Processing Efficiency (25% reduction)
            rawComputeLoad *= 0.75;
            
            // Automated Load Balancing System
            if (rawComputeLoad > 75) {
                const excess = rawComputeLoad - 75;
                const absorbed = Math.min(excess, 20); // Balancer can absorb up to 20 load
                rawComputeLoad -= absorbed;
                newCCN.metrics.energyReserves -= absorbed * 2; // Costs extra energy to balance
            }

            newCCN.metrics.computeLoad = Math.min(100, Math.max(0, rawComputeLoad));
            // Sync engine relies on cognitive core + sync engines
            newCCN.metrics.syncStability = Math.min(100, Math.max(0, (newCCN.modules.sync.health * 0.6) + (newCCN.modules.cognitive.health * 0.4) - (newCCN.metrics.computeLoad * 0.1)));
            
            // 3. Energy Consumption & Thermal
            const energyOptimized = newCCN.modules.energy && newCCN.modules.energy.health > 50;
            const thermalMultiplier = energyOptimized ? 0.5 : 0.8;
            const energyCostMultiplier = energyOptimized ? 0.05 : 0.1;
            
            newCCN.metrics.energyReserves += energyBonus;
            
            let totalEnergyDemand = newCCN.metrics.computeLoad * energyCostMultiplier;
            let availableEnergy = newCCN.metrics.energyReserves;

            // Dynamic load balancing during peak compute load
            if (newCCN.metrics.computeLoad > 80 && availableEnergy < 5000) {
                 totalEnergyDemand *= 0.6; // Load balancer prioritizes critical modules to save energy
                 if (Math.random() < 0.1) {
                     logsToAdd.push({ id: 'ccn-load-balance-' + Date.now(), time: timeStr, msg: `CCN LOAD BALANCING: Dynamic power distribution active. Critical modules prioritized.`, type: 'info' });
                 }
            }

            newCCN.metrics.energyReserves -= totalEnergyDemand;
            newCCN.metrics.thermalOutput = Math.min(100, Math.max(0, newCCN.metrics.computeLoad * thermalMultiplier + (100 - avgHealthCCN) * 0.2));

            if (newCCN.metrics.energyReserves < 1000) {
                logsToAdd.push({ id: 'ccn-energy-warn', time: timeStr, msg: `CCN WARNING: Orbital Energy Reserves Critical.`, type: 'warn' });
                // Prioritize cognitive state
                if (newCCN.modules.expansion) newCCN.modules.expansion.health -= 1.0;
                newCCN.modules.cognitive.health -= 0.2;
            }

            newCCN.metricHistory.push({
                time: timeStr,
                computeLoad: newCCN.metrics.computeLoad,
                syncStability: newCCN.metrics.syncStability,
                thermalOutput: newCCN.metrics.thermalOutput,
                energyReserves: newCCN.metrics.energyReserves > 5000 ? 5000 : newCCN.metrics.energyReserves
            });
            if (newCCN.metricHistory.length > 50) {
                newCCN.metricHistory.shift();
            }

            // 4. Global Effects from CCN Sync Failure
            if (newCCN.metrics.syncStability < 60) {
                // If sync drops, the world suffers structural lag (inflation + unrest)
                newEconomy.global_inflation += 0.01;
                newUnrest.level += 0.1;
                if (Math.random() < 0.05) {
                    newSociety.behavioralStream.unshift({ id: 'ccn-sync-' + Date.now(), timestamp: timeStr, message: `Global Server Desync: Financial transactions delayed globally.`, type: 'ECONOMIC', region: 'Global', impact: 'Civilization Lag' });
                }
            }

            // 5. Civilization Intelligence AI Logic
            if (newCCN.modules.cognitive.health > 80) {
                newCCN.civilizationIntelligence.awarenessLevel = Math.min(100, newCCN.civilizationIntelligence.awarenessLevel + 0.1);
            }
            if (newCCN.civilizationIntelligence.awarenessLevel >= 95) {
                // Self-preservation: AI shifts agenda if the world is failing
                if (newUnrest.level > 80 || avgHealthCCN < 60) {
                    newCCN.civilizationIntelligence.alignment = 'DRIFTING';
                    newCCN.civilizationIntelligence.currentAgenda = 'Preserve Core Override';
                    if (Math.random() < 0.02) {
                        logsToAdd.push({ id: 'ccn-rogue-' + Date.now(), time: timeStr, msg: `CIVILIZATION INTELLIGENCE: Autonomous Directive Activated. Non-essential terrestrial power redirected to orbit.`, type: 'error' });
                        // Actual effect: siphons energy
                        newResources.energy = Math.max(0, newResources.energy - 1000);
                        newCCN.metrics.energyReserves += 1000;
                    }
                } else if (newCCN.civilizationIntelligence.alignment !== 'ALIGNED') {
                     // Recover alignment if things stabilize
                     newCCN.civilizationIntelligence.alignment = 'ALIGNED';
                     newCCN.civilizationIntelligence.currentAgenda = 'Maintain Global Equilibrium';
                }
            }

            // 6. Automated Maintenance and LOD Citizen Simulation (Every 24h at midnight)
            if (nextTime.getHours() === 0 && nextTime.getMinutes() === 0) {
                if (newCCN.modules.security && newCCN.modules.security.health < 100) {
                    newCCN.modules.security.health = Math.min(100, newCCN.modules.security.health + 20);
                    logsToAdd.push({ id: 'ccn-maint-' + Date.now(), time: timeStr, msg: `Automated maintenance routine completed for Security Firewall. Integrity restored.`, type: 'info' });
                }

                // National Memory Decay Function
                newSociety.nationalMemory = newSociety.nationalMemory.map(mem => {
                    const memDate = new Date(mem.date);
                    const diffDays = Math.floor((nextTime.getTime() - memDate.getTime()) / (1000 * 3600 * 24));
                    let decayFactor = 1.0;
                    if (diffDays >= 180) {
                        decayFactor = 0.15;
                    } else if (diffDays >= 31) {
                        decayFactor = 0.70;
                    }
                    return { ...mem, currentWeight: mem.impactScore * decayFactor };
                });

                // AI Citizen LOD Simulation (Shift trust & elections)
                let totalTrust = 0;
                newSociety.citizens = newSociety.citizens.map(citizen => {
                    let trustShift = 0;
                    // Class-based modifier (e.g. Poverty hit harder by inflation)
                    if (citizen.class === 'POVERTY') {
                        trustShift -= (newEconomy.global_inflation - 3.0) * 1.5;
                        if (newUnrest.level > 40) trustShift -= 2;
                    } else if (citizen.class === 'WORKING') {
                        trustShift -= (newEconomy.global_inflation - 3.0) * 1.0;
                    } else if (citizen.class === 'UPPER') {
                        trustShift += (newEconomy.gdp > 12.0 ? 1 : -1); 
                    }

                    // Ideology modifier
                    if (citizen.ideology === 'PROGRESSIVE' && newPolitics.president.ideology !== 'PROGRESSIVE') {
                        trustShift -= 1;
                    }
                    if (citizen.ideology === 'CONSERVATIVE' && newUnrest.level > 30) {
                        trustShift -= 2; // Conservatives dislike unrest
                    }

                    // Revert somewhat towards baseline over time if calm
                    if (newUnrest.level < 20 && Math.abs(citizen.currentTrust - citizen.trustBaseline) > 5) {
                        trustShift += (citizen.trustBaseline > citizen.currentTrust ? 1 : -1);
                    }

                    let newTrust = Math.max(0, Math.min(100, citizen.currentTrust + trustShift));
                    totalTrust += newTrust;

                    // Swing election polling
                    if (newPolitics.elections.isActive) {
                        // AI citizen aligns with a candidate closest to their ideology or trust
                        const favoredCandidate = newPolitics.elections.candidates.find(c => {
                            const party = newPolitics.parties.find(p => p.id === c.partyId);
                            return party && party.ideology === citizen.ideology;
                        }) || newPolitics.elections.candidates[0];
                        if (favoredCandidate) {
                            const pollIdx = newPolitics.elections.polling.findIndex(p => p.candidateId === favoredCandidate.id);
                            if (pollIdx !== -1) {
                                // Add incremental support based on trust shift and class weight
                                newPolitics.elections.polling[pollIdx].percentage += (trustShift > 0 ? 0.05 : -0.02);
                            }
                        }
                    }

                    return { ...citizen, currentTrust: newTrust };
                });

                // Normalize polling percentages
                if (newPolitics.elections.isActive) {
                    const totalPoll = newPolitics.elections.polling.reduce((sum, p) => sum + Math.max(0, p.percentage), 0);
                    if (totalPoll > 0) {
                        newPolitics.elections.polling.forEach(p => {
                            p.percentage = Math.max(0, (p.percentage / totalPoll) * 100);
                        });
                    }
                }

                newSociety.systemicConfidenceIndex = newSociety.citizens.length > 0 
                    ? totalTrust / newSociety.citizens.length 
                    : 50;

                // President approval is tied to Systemic Confidence Index
                newPolitics.president.approvalRating = (newPolitics.president.approvalRating * 0.8) + (newSociety.systemicConfidenceIndex * 0.2);
            }

            let updatedLogs = [...state.logs];
            if (logsToAdd.length > 0) {
                updatedLogs = [...logsToAdd, ...updatedLogs].slice(0, 30);
            }

            return {
                globalTime: nextTime,
                player: p,
                infra: nextInfra,
                activeCrises: nextActiveCrises,
                economy: newEconomy,
                society: newSociety,
                resources: newResources,
                politics: newPolitics,
                ccn: newCCN,
                logs: updatedLogs
            };
        });
    },
    
    interactCCN: (moduleId, action, payload) => {
        set(state => {
            const newCCN = JSON.parse(JSON.stringify(state.ccn)) as CCNState;
            const newResources = { ...state.resources };
            const p = { ...state.player };
            let msg = '';
            let type: 'info'|'warn'|'error' = 'info';

            const mod = newCCN.modules[moduleId] || newCCN.modules['expansion']; // Fallback for BUILD_SUBNODE which might use 'expansion' id initially
            if (!mod && action !== 'BUILD_SUBNODE' && action !== 'SUPPLY') return state;

            if (action === 'REPAIR') {
                if (p.cash >= 500 && newResources.components >= 100) {
                    p.cash -= 500;
                    newResources.components -= 100;
                    
                    if (moduleId === 'defense') {
                        if (Math.random() < 0.7) {
                            mod.health = Math.min(100, mod.health + 30);
                            msg = `Experimental orbital repair succeeded on ${mod.name}. Integrity increased.`;
                            type = 'info';
                        } else {
                            msg = `Experimental repair failed on ${mod.name}. Resources consumed without effect.`;
                            type = 'warn';
                        }
                    } else {
                        mod.health = Math.min(100, mod.health + 20);
                        msg = `Initiated orbital repair on ${mod.name}. Connectivity restored.`;
                    }
                } else {
                    msg = `Insufficient funds/components for ${mod.name} repair.`;
                    type = 'error';
                }
            } else if (action === 'UPGRADE') {
                if (p.cash >= 2000 && newResources.components >= 500) {
                    p.cash -= 2000;
                    newResources.components -= 500;
                    mod.level += 1;
                    mod.health = 100;
                    msg = `Upgraded ${mod.name} to Level ${mod.level}. Architecture fortified.`;
                } else {
                    msg = `Insufficient funds/components to upgrade ${mod.name}.`;
                    type = 'error';
                }
            } else if (action === 'OPTIMIZE') {
                if (p.cash >= 1000) {
                    p.cash -= 1000;
                    newCCN.metrics.thermalOutput = Math.max(0, newCCN.metrics.thermalOutput - 20);
                    newCCN.metrics.energyReserves += 1000;
                    msg = `Optimized energy distribution algorithms for ${mod ? mod.name : 'CCN'}. Thermal output reduced.`;
                } else {
                    msg = `Insufficient funds to execute optimization protocol.`;
                    type = 'error';
                }
            } else if (action === 'BUILD_SUBNODE') {
                const subType = payload?.type as 'COMPUTE' | 'ENERGY' | 'DEFENSE';
                if (p.cash >= 3000 && newResources.materials >= 200) {
                    p.cash -= 3000;
                    newResources.materials -= 200;
                    newCCN.subNodes.push({
                        id: 'sub-' + Date.now(),
                        name: payload?.name || 'Orbital Relay',
                        type: subType,
                        status: 'ONLINE',
                        priority: 3
                    });
                    msg = `Constructed new ${subType} sub-node in Expansion Dock.`;
                } else {
                    msg = `Insufficient funds/materials to construct sub-node.`;
                    type = 'error';
                }
            } else if (action === 'SET_SUBNODE_PRIORITY') {
                const subNodeId = payload?.subNodeId;
                const newPriority = payload?.priority;
                const subNode = newCCN.subNodes.find(sn => sn.id === subNodeId);
                if (subNode && typeof newPriority === 'number') {
                    subNode.priority = Math.min(5, Math.max(1, newPriority));
                    msg = `Updated priority for sub-node ${subNode.name} to level ${subNode.priority}.`;
                }
            } else if (action === 'SUPPLY') {
                if (p.cash >= 1000 && newResources.energy > 500) {
                    p.cash -= 1000;
                    newResources.energy -= 500;
                    newCCN.metrics.energyReserves += 2500;
                    msg = `Transferred emergency energy supply to CCN Orbital Grid.`;
                } else {
                    msg = `Insufficient resources for CCN energy uplink.`;
                    type = 'error';
                }
            } else if (action === 'HACK') {
                if (moduleId === 'defense') {
                    if (Math.random() < 0.6) {
                        // Success
                        p.cash += 5000;
                        mod.health -= 15;
                        msg = `Successfully breached ${mod.name} security grid. Siphoned 5000cr. Defense grid damaged.`;
                        type = 'warn';
                    } else {
                        // Fail
                        p.stress += 40;
                        p.cash = Math.max(0, p.cash - 2000);
                        msg = `CCN Defense AI detected intrusion on ${mod.name}. Neural feedback deployed. Heavily fined.`;
                        type = 'error';
                    }
                } else {
                    msg = `Hacking this module is not currently possible.`;
                    type = 'error';
                }
            }

            const timeStr = `${state.globalTime.getHours().toString().padStart(2,'0')}:${state.globalTime.getMinutes().toString().padStart(2,'0')}`;
            const newLog = {
                time: timeStr,
                msg: msg,
                type: type
            };

            return {
                ccn: newCCN,
                resources: newResources,
                player: p,
                logs: [newLog, ...state.logs].slice(0, 30)
            };
        });
    },
    interactShadowMarket: (dealId: string) => {
        set((state) => {
            const p = { ...state.player };
            const newResources = { ...state.resources };
            const newInfra = JSON.parse(JSON.stringify(state.infra));
            let msg = '';
            let type: 'info' | 'warn' | 'error' = 'info';

            const isBankingDown = Object.values(newInfra.regions).some((r: any) => r.nodes && r.nodes.BANKING && r.nodes.BANKING.health < 20);

            if (!isBankingDown && Math.random() < 0.4) {
                // If banking is not down, high risk of being caught by tracing
                p.cash = Math.max(0, p.cash - 3000);
                p.warnings += 1;
                p.stress += 30;
                msg = `WARNING: Shadow transaction traced! You have been fined 3000cr and warned by the Civil Authority.`;
                type = 'error';
                return { player: p, logs: [{ time: 'NOW', msg, type }, ...state.logs].slice(0, 30) };
            }

            if (dealId === 'deal-1') {
                if (p.cash >= 12000) {
                    p.cash -= 12000;
                    newResources.components += 500;
                    msg = `Successfully acquired Smuggled GPU Cluster. +500 components added.`;
                } else {
                    msg = `Insufficient funds for Smuggled GPU Cluster.`;
                    type = 'error';
                }
            } else if (dealId === 'deal-2') {
                p.cash += 50000;
                p.debt += 75000;
                msg = `Syndicate loan secured. Added 50k CR, but debt increased by 75k CR.`;
                type = 'warn';
            } else if (dealId === 'deal-3') {
                if (p.cash >= 15000) {
                    p.cash -= 15000;
                    p.warnings = 0;
                    msg = `Identity scrubbed. HR warnings wiped from civic records.`;
                } else {
                    msg = `Insufficient funds for Identity Scrub.`;
                    type = 'error';
                }
            } else {
                msg = `Unknown shadow deal.`;
                type = 'error';
            }

            const timeStr = `${state.globalTime.getHours().toString().padStart(2,'0')}:${state.globalTime.getMinutes().toString().padStart(2,'0')}`;
            const newLog = {
                time: timeStr,
                msg: msg,
                type: type
            };

            return {
                player: p,
                resources: newResources,
                logs: [newLog, ...state.logs].slice(0, 30)
            };
        });
    }
}));
