# CIVILIZATION RUNTIME ARCHITECTURE

## 1. Authority Model: Server Authoritative
NEXARA operates on a strictly **Server Authoritative** model. The Supabase backend serves as the single source of truth for the entire civilization state. 
- **Client Role:** The Next.js frontend acts only as a `Command Node` (a terminal). It issues intents/directives and subscribes to state changes via WebSockets.
- **Server Role:** All core state mutations (economy, population behavior, infrastructure degradation) happen through Supabase Edge Functions and PostgreSQL RPCs to prevent client-side manipulation or cheating.

## 2. Tick Architecture: Hybrid Resolution Multi-Rate
To balance intense computational load with emergent responsiveness, NEXARA uses a multi-rate tick system orchestrated by `pg_cron` and Edge Functions.

- **Global/Base Tick (1 Minute):** Handles basic time progression, biological decay (stamina/hunger), and micro-infrastructure power consumption.
- **AI Behavior Tick (10 Seconds):** Evaluates rapid AI sentiment shifts, local routing, and UI-level citizen behavioral streams. Sub-sampled for efficiency.
- **Economic Tick (5 Minutes):** Resolves supply/demand curves, market pricing updates, employment shifts, and inflation calculations.
- **Political/Event Tick (15 Minutes):** Triggers long-term societal shifts, policy implementations, crisis generation, and structural mobility checks.

## 3. Persistence Model
State data in NEXARA is heavily differentiated based on retrieval needs and consequence weight.

- **Immutable (Append-Only):** 
  - National History Archive (`National Memory`), Wars, Crises Outcomes, Legacy Records.
  - Event Sourcing logs for critical government decisions to ensure verifiable history.
- **Persistent (Relational):** 
  - Player/Citizen Identities, Property & Assets, Infrastructure Topology, Political Structures.
- **Semi-Persistent (Degrading):** 
  - Citizen Sentiment, Opinion Indexes, News Cycles, Minor Grudges, and Short-term Memories. These decay naturally over time.
- **Volatile / In-Memory (Redis/Cache):**
  - Real-time market order books, sub-tick movements, active civilian pathing streams, instantaneous UI telemetry data.

## 4. AI Agent Layered Model
Evaluating 100,000+ AI citizens using LLMs is computationally impossible. NEXARA utilizes a layered **LOD (Level of Detail)** intelligence architecture for NPCs.

- **Tier 1: Rule-Based (The Masses - 90%)**
  - Background population. Simple state machines. They consume, work, sleep, and vote based on hardcoded deterministic math (e.g., `if bread_price > threshold -> riot_chance++`).
- **Tier 2: Utility AI (Key Demographics - 9%)**
  - Uses utility curves to rank desires. They assess their socioeconomic class, neighborhood status, and infrastructure health to decide whether to migrate, protest, or change jobs.
- **Tier 3: Goal-Oriented Action Planning / GOAP (Local Leaders - 0.9%)**
  - Neighborhood watch leaders, union organizers, mid-level CEOs. They form series of actions to achieve broader goals (e.g., organizing a strike if Tier 1 and 2 morale drops).
- **Tier 4: LLM-Driven (Political Entities & Bosses - 0.1%)**
  - The AI President, Ministers, Opposition Leaders. Powered by generative AI to draft speeches, negotiate with players, analyze crisis context, and produce highly dynamic, unscripted policies.

## 5. Event Orchestration Layer (Civilization Event Bus)
To prevent tight coupling between deeply interconnected systems (economy, politics, infrastructure), NEXARA employs a robust asynchronous Event Bus.
- **Topic-Based Pub/Sub:** Events (e.g., `INFRA_COLLAPSE`, `MARKET_CRASH`, `RIOT_STARTED`) are published to the bus.
- **Decoupled Handlers:** Systems subscribe only to relevant topics. A power outage emits `POWER_NODE_FAILED`, which is independently caught by the `SocietyEngine` (lowering morale) and the `EconomicEngine` (halting production). 
- **Event Storm Mitigation:** Events are batched and debounced to prevent cascading failure loops from locking the database.

## 6. Sharding & Region Partitioning
Attempting to run a global civilization in a single logical loop will result in compute bottlenecks.
- **Geographic Partitions:** The world is divided into autonomous simulation shards (e.g., `Region_DKI`, `Region_Java_West`).
- **Local Ticks:** Each region has its own localized economic and behavioral tick loop.
- **Macro-Sync:** Inter-region interactions (trade, migration, federal taxes) are processed at a macro-tick level, aggregating local outputs to prevent cross-shard locking.

## 7. Time Consistency Model
With multi-rate ticks, race conditions occur if a slow tick reads stale data.
- **Tick Versioning:** Every state mutation is stamped with the `global_tick_id`. 
- **Snapshot Isolation:** Analytics, political decisions, and major economic calculations operate on isolated snapshots from the end of the previous tick, ensuring data consistency even if sub-ticks are delayed.

## 8. Memory Scaling (National Memory Archive)
The `National Memory` system will grow exponentially. To manage database bloat without losing historical weight:
- **Decay Function:** Historical relevance decreases over time. Minor events decay and are aggressively summarized or culled.
- **Compression & Archiving:** Monthly digests summarize localized events into broader "Era" trends. High-granularity data is moved to cold storage.
- **Vector Indexing:** Important historical lore is stored as embeddings, allowing Tier 4 LLMs to semantically query past events (e.g., "What happened last time we raised taxes?") without loading the entire DB.

## 9. AI Cost Governance
Tier 4 LLMs (AI Politicians/News) can bankrupt an infrastructure budget if left unchecked.
- **Invocation Budgets:** Strict quotas on LLM API calls per hour.
- **Crisis-Triggered Invocation:** The AI President does not "think" constantly. LLM generation is only triggered by specific thresholds (e.g., Unrest > 70%, Major Event published).
- **Context Distillation:** Instead of sending the raw database state to the LLM, a strict `State Summarizer` function distills the world into a tiny text payload before prompting. 
- **Response Caching:** Generalized rhetoric or ambient news is cached and reused among players or slightly obfuscated via templates to save compute.
