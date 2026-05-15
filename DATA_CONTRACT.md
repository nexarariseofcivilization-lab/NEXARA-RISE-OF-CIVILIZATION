# SIMULATION DATA CONTRACT

## 1. Tick Authority
Specifies which tick loop is responsible for mutating specific data domains.

| Domain | Tick Cadence | Responsible Engine | Mutated Entities |
| :--- | :--- | :--- | :--- |
| **World Core** | 1 Minute | `GlobalTick_Worker` | `global_ticks`, `regions` (basic time/weather) |
| **Life/Bio** | 1 Minute | `Biological_Worker` | `citizen_needs` (stamina, hunger decay) |
| **Psych/AI** | 10 Seconds | `Behavioral_Worker` | `public_sentiment` (micro-shifts), transient UI streams |
| **Economy** | 5 Minutes | `Economy_Worker` | `resource_prices`, `regional_economy`, `businesses` |
| **Politics** | 15 Minutes| `Political_Worker` | `unrest_events`, `policies`, `budget` balances |
| **Memory** | 1 Hour | `Archival_Worker` | `historical_events`, `era_snapshots` |

## 2. Entity Ownership
To prevent race conditions, only specific processes are allowed to perform `UPDATE` or `INSERT` on specific tables.

- **`regions` table**: Owned by `World_Engine`. Read-only to Economy and Politics.
- **`citizen_needs` / `citizens`**: Mutated strictly by `Population_Engine` and the `Biological_Worker`. Actions from players or politics emit events, which the Population Engine processes.
- **`market_transactions`**: Append-only. Inserted by `Economy_Engine` or players.
- **`resource_prices`**: Owned by `Economy_Engine`. Calculated entirely from transactions and supply/demand arrays.

## 3. Event Bus Topology & Payload Structure

All systemic interactions occur via the Event Bus.

### Event Definition Pattern
```json
{
  "event_id": "uuid",
  "topic": "ECONOMY.RESOURCE.SCARCITY",
  "timestamp": "ISO8601",
  "region_id": "uuid",
  "tick_id": "tick_version",
  "payload": {},
  "source": "Economy_Engine"
}
```

### Standard Event Topics

#### 1. INFRASTRUCTURE EVENTS
- `INFRA.NODE.OFFLINE`: Emitted when an infrastructure node fails.
  - Payload: `{ "node_type": "POWER", "health": 0, "cause": "overload" }`
- `INFRA.NODE.RESTORED`: Emitted when a node comes back online.
- `INFRA.<TYPE>.BLACKOUT`: Emitted when a critical node goes completely offline due to neglect.
- `INFRA.LOGISTICS.COLLAPSE`: Emitted when regional average infrastructure health falls below 50.

#### 5. FACTION & PERCEPTION EVENTS
- `PERCEPTION.RUMOR.SPAWNED`: Emitted when a rumor propagates due to systemic stress.
- `FACTION.MOBILIZATION.STRIKE`: Emitted when a worker union organizes a strike.
- `FACTION.MOBILIZATION.SABOTAGE`: Emitted when radicals sabotage infrastructure.
- `FACTION.MOBILIZATION.SUPPRESSED`: Emitted when security forces suppress mobilization.
- `FACTION.STRATEGY.NEW_GOAL`: Emitted when a faction autonomously sets a new objective.
- `FACTION.STRATEGY.ACHIEVED`: Emitted when a faction successfully completes its goal (e.g., captures infrastructure or forces policy).
- `DIPLOMACY.PACT.FORMED`: Emitted when two factions form a coalition.
- `DIPLOMACY.PACT.BROKEN`: Emitted when two factions declare a vendetta.

#### 6. CULTURE & IDENTITY EVENTS
- `CULTURE.MYTH.BORN`: Emitted when a symbolic event like martyrdom becomes a cultural myth.

#### 2. ECONOMIC EVENTS
- `ECONOMY.PRICE.SPIKE`: Emitted when a resource price jumps > 10% in a tick.
  - Payload: `{ "resource": "food", "old_price": 10, "new_price": 15 }`
- `ECONOMY.INFLATION.SPIKE`: Emitted when critical inflation occurs on essential goods.
- `ECONOMY.SUPPLY.SHORTAGE`: Emitted when regional supply fails to meet demand.
- `ECONOMY.BUSINESS.BANKRUPT`: Emitted when a business liquidates.
- `ECONOMY.JOB.LOSS`: Emitted to move citizens from employed to structured unemployment.

#### 3. POPULATION EVENTS
- `POPULATION.HUNGER.CRITICAL`: Emitted when hunger state forces a massive stress penalty.
- `POPULATION.MIGRATION.STARTED`: Emitted when a household abandons a region.
- `POPULATION.PROTEST.ORGANIZING`: Transitory event prior to riot.
- `POPULATION.CRIME.INCREASE`: Background unrest event generating instability.
- `POPULATION.UNREST.INCREASE`: Emitted when localized sentiment drops below threshold.
  - Payload: `{ "district_id": "D-1", "unrest_level": 75, "primary_cause": "food_scarcity" }`
- `POPULATION.RIOT.PROBABILITY_HIGH`: Emitted when regional unrest pressure exceeds an explosive threshold (e.g., >80).
- `POPULATION.RIOT.STARTED`: Emitted if unrest > 90 and probability roll triggers.

#### 4. POLITICAL EVENTS
- `POLITICS.POLICY.ENACTED`: Emitted when a new policy passes.
  - Payload: `{ "policy_id": "uuid", "type": "TAX_RELIEF", "target": "working_class" }`
- `POLITICS.ELECTION.ENDED`: Emitted at the end of a voting period.
- `POLITICS.TREASURY.CRITICAL`: Emitted when fiscal reserves drop below safe threshold or enter deep debt.
- `POLITICS.TRUST.COLLAPSE`: Emitted when institutional trust breaks a 10% threshold.

## 4. Mutation Rules & State Transitions

- **Strict Isolation:** The Political Engine CANNOT directly change a citizen's hunger. It enacts a `Tax Relief Policy`, which modifies the `Economic_Worker` tax calculation, which leaves the citizen with more disposable income, which allows them to buy food, which restores hunger during the `Biological_Worker` tick.
- **Cascading Logic:**
  1. `INFRA.NODE.OFFLINE (POWER)` -> Picked up by `Economy_Engine`.
  2. `Economy_Engine` halts production for affected factories. Emits `ECONOMY.PRICE.SPIKE (FOOD)`.
  3. `Population_Engine` processes the spike. Working class citizens can't afford food. Emits `POPULATION.UNREST.INCREASE`.
  4. `Political_Worker` reads high unrest. Prompts Tier 4 AI President for a crisis response.
  5. AI President generates `Subsidy Policy`.

## 6. Event Orchestration (Dead Letters & Retries)
- All events are processed idempotently.
- If an event handler fails (e.g., locking issue on table), the event is moved to the `event_dead_letter` queue.
- Events older than a tick window that are purely transient (like UI sentiment updates) are dropped instead of retried. Core systemic events (bankruptcies, node failures) are retried until processed.
