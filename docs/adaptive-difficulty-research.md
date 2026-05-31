# Adaptive Difficulty Research Notes

This note summarizes the research behind GeoPoto Adaptive Difficulty and translates it into a practical v1 implementation direction.

## What the research suggests

### Spaced repetition is useful, but heavier than GeoPoto needs today

Classic spaced repetition systems schedule a specific item for review at a later time. SuperMemo SM-2 tracks per-item easiness and repetition intervals, with harder items returning sooner and easier items moving farther away. FSRS is a newer spaced repetition family that models memory with difficulty, stability, and retrievability.

GeoPoto does not currently have due dates, review queues, or explicit recall grades. It has short quiz sessions that should feel playful. For v1, a full scheduler would add conceptual and implementation weight without matching the current product shape.

Recommended takeaway: borrow the per-item memory idea, but do not implement SM-2 or FSRS yet.

### Adaptive practice needs exploration and a target challenge level

Adaptive systems can overfit if they always pick the item with the worst score. Exploration and exploitation is the useful framing here: exploitation means asking weak items more often, while exploration means still asking other eligible items so the app can discover new weaknesses and keep practice varied.

Recommended takeaway: never give a Practice Item probability zero just because the player usually succeeds. Use a probability floor or mix in random selection.

The strongest concrete difficulty target I found is the 85 Percent Rule: in several binary learning models, learning is fastest around 85% accuracy, or about 15.87% error. This should not be treated as a universal law for every human learning task, but it is a better anchor than an arbitrary weight multiplier. It also aligns with the optimal challenge point idea: practice should be neither too easy nor too hard.

Recommended takeaway: use about 16% expected error as the anchor, then add product guardrails so training still feels varied and fair.

### Bayesian smoothing is a good fit for sparse local data

Raw failure rate can be misleading with very few answers. One failure out of one attempt should not make an item permanently dominate the session. A beta-binomial style estimate lets the app combine a neutral prior with observed successes and failures.

A simple v1 estimate should use a target-anchored prior:

```txt
targetErrorRate = 0.16
priorAttemptCount = 6

estimatedFailureRate =
  (failures + targetErrorRate * priorAttemptCount) /
  (successes + failures + priorAttemptCount)
```

This behaves like every Practice Item starts near the productive challenge target, and the player's real history gradually takes over. A prior attempt count of 6 is a conservative v1 guardrail: one early failure nudges selection, repeated failures matter, and the app does not overreact after a single answer.

Recommended takeaway: use smoothed failure rate, not raw failure rate.

## GeoPoto v1 recommendation

### Core decision

Adaptive Difficulty should not use a fixed claim like "failed items are 4 times more likely." The research supports a target challenge principle more strongly than a specific multiplier. GeoPoto should anchor v1 around 16% expected error, keep an exploration floor for every eligible Practice Item, and bound any adaptive boost so practice still feels varied.

### Domain model

Track a Practice Item as:

```txt
countryCode + questionFormat + answerFormat
```

Do not include flag answer difficulty in Practice Item identity. It changes the interaction, not the geography knowledge being practiced. Do not include geographic language either. Adaptive History should follow the same Practice Items across geographic languages.

### Persistence

Use MMKV for the Adaptive Difficulty setting:

```txt
adaptive-difficulty-enabled = true by default
```

The setting controls selection behavior only. Practice Results should continue to be recorded when Adaptive Difficulty is disabled, so the local history remains useful if the player enables it again.

Use SQLite for Practice Result aggregates because the data is relational and needs filtering by country and format. Do not store an append-only answer log in v1. The database should be bounded by the number of possible Practice Items, so a player who answers 100000 questions should not have a meaningfully larger database than a player who answers 1000 questions.

Recommended SQLite table shape:

```sql
CREATE TABLE practice_item_results (
  country_code TEXT NOT NULL,
  question_format TEXT NOT NULL,
  answer_format TEXT NOT NULL,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  last_answered_at TEXT,
  last_success_at TEXT,
  last_failure_at TEXT,
  PRIMARY KEY (country_code, question_format, answer_format)
);
```

Implementation decision: v1 should use an aggregate-only schema like this, with upserts that increment success or failure counters for the matching Practice Item. The exact table name and migration structure can follow the mobile app's SQLite conventions once those are introduced.

An append-only attempt log is intentionally out of scope for v1. Aggregates are enough unless we later want charts, recency decay, undo, or sync. If one of those features is added later, it should include a retention or compaction strategy so storage remains bounded.

### Recording results

Record one Practice Result when the app resolves a submitted answer:

- Training records every submitted answer in finite and infinite sessions.
- Daily Challenge records the first playable submitted answer.
- Daily Challenge results feed the same Adaptive History as training results.
- The review step after a wrong answer does not create another result.
- Recording updates the aggregate row for the Practice Item instead of inserting an unbounded attempt row.

### Training selection

When Adaptive Difficulty is enabled, training should weight eligible Practice Items by need while keeping selection bounded and varied. Use estimated failure rates, a 10% exploration floor, and the existing same-session repeat dampening in infinite mode.

```txt
targetErrorRate = 0.16
priorAttemptCount = 6
explorationRate = 0.10
baseWeight = 1
maxAdaptiveBoost = 3
```

The target error rate is the research-backed anchor. The other constants are v1 product guardrails chosen to keep the behavior noticeable but not intrusive:

- `priorAttemptCount = 6` makes early data matter without letting one answer dominate.
- `explorationRate = 0.10` keeps a simple epsilon-greedy style exploration budget.
- `maxAdaptiveBoost = 3` means the adaptive part can make a high-need Practice Item up to 4 times the baseline weight, before normalization and exploration.

The v1 item weight should be:

```txt
estimatedFailureRate =
  (failures + targetErrorRate * priorAttemptCount) /
  (successes + failures + priorAttemptCount)

need = max(0, estimatedFailureRate - targetErrorRate)
normalizedNeed = need / (1 - targetErrorRate)
adaptiveItemWeight = baseWeight + maxAdaptiveBoost * normalizedNeed
```

This makes items at or below the target error rate behave like baseline exploration items, and gradually increases priority for items above the target. `maxAdaptiveBoost` is a cap, not a research-derived constant.

When selecting from `N` eligible candidates, convert weights into probabilities with an exploration mix:

```txt
adaptiveProbability =
  adaptiveItemWeight / sum(all adaptiveItemWeights)

selectionProbability =
  explorationRate * (1 / N) +
  (1 - explorationRate) * adaptiveProbability
```

This gives every eligible Practice Item a guaranteed probability floor while still making weak items more likely.

For finite training sessions, keep the existing one-question-per-country promise. If the selected region has more countries than the limit, use Adaptive Difficulty to make countries with weaker eligible Practice Items more likely to be included. The country-level weight should come from the hardest eligible Practice Item for that country. Then choose one Practice Item within each included country using item weights. If the session includes every country in the region, country inclusion is fixed and only the Practice Item chosen inside each country is adaptive.

For infinite training, sample each next Practice Item with weights, while preserving the existing same-session repeat dampening behavior. A country may repeat before every eligible country has appeared, but each same-session appearance should make that country less likely to appear again.

```txt
repeatDampeningWeight =
  1 / (sameSessionCountryQuestionCount + 1)

infiniteCountryWeight =
  countryAdaptiveWeight * repeatDampeningWeight
```

`countryAdaptiveWeight` should come from the hardest eligible Practice Item for that country, using the same item weight formula above. If Adaptive Difficulty is disabled, `countryAdaptiveWeight` should be `1`, preserving repeat dampening as the only infinite-mode weighting signal.

### Daily Challenge

Daily Challenge should record Practice Results, but should not use Adaptive Difficulty for question generation. The Daily Challenge is shared by every player on a UTC challenge day, and this is a hard product invariant. Adaptive Difficulty must never change which Daily Challenge question a player receives.

Daily Challenge UI should not mention Adaptive Difficulty. The result can feed Adaptive History invisibly for future training, while the Daily Challenge experience stays focused on the shared puzzle.

### Settings

Adaptive Difficulty should have its own section in the app Settings screen. It should include:

- A toggle, enabled by default, that controls whether training selection is adaptive.
- A reset action that clears Adaptive History.

Resetting Adaptive History should ask for confirmation. It should not turn Adaptive Difficulty off. It should only clear the aggregate results used for future selection.

Suggested English copy:

```txt
Title: Adaptive Difficulty
Description: Prioritize training questions you often miss.
Toggle: Enable Adaptive Difficulty
Reset action: Reset Adaptive Difficulty History
Reset confirmation title: Reset Adaptive Difficulty History?
Reset confirmation description: This clears the local results used to prioritize training questions. Adaptive Difficulty will stay enabled.
```

## Parameters to revisit after real use

- Target expected error rate: start at `0.16`, with an acceptable observed band from `0.15` to `0.20`.
- Prior attempt count: start at `6`, then tune if early attempts affect selection too quickly or too slowly.
- Exploration rate: start at `0.10`, then tune if mastered or new items feel too rare.
- Maximum adaptive boost: start at `3`, then tune if the effect feels too subtle or too aggressive.
- Recency: add decay only if old mistakes keep dominating too long.
- Minimum attempts before strong adaptation: optional because smoothing already protects early data.
- Same-session repeat penalty: important for infinite mode, less important for finite mode if sampling without replacement.
- Reset history: included in v1 from the Adaptive Difficulty Settings section.

## Sources

- SuperMemo SM-2 official algorithm notes: https://www.super-memory.com/english/ol/sm2.htm
- FSRS scheduler overview: https://github.com/open-spaced-repetition/free-spaced-repetition-scheduler
- The Eighty Five Percent Rule for optimal learning: https://pmc.ncbi.nlm.nih.gov/articles/PMC6831579/
- Challenge Point framework abstract: https://europepmc.org/article/MED/15130871
- Exploration and exploitation overview: https://inst.eecs.berkeley.edu/~cs188/textbook/rl/eae.html
- Epsilon-greedy exploration lecture note: https://stanford-cs221.github.io/spring2026-extra/modules/mdps/epsilon-greedy-6pp.pdf
- Beta-binomial model overview: https://bookdown.org/kevin_davisross/stat415-handouts/beta-binomial.html
- Bayesian Knowledge Tracing properties: https://jedm.educationaldatamining.org/index.php/JEDM/article/download/35/pdf_27
- Duolingo half-life regression paper: https://research.duolingo.com/papers/settles.acl16.pdf
- Expo SQLite documentation: https://docs.expo.dev/versions/latest/sdk/sqlite/
