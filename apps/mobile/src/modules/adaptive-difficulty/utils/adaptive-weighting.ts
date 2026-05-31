export const ADAPTIVE_WEIGHTING_CONSTANTS = {
  baseWeight: 1,
  explorationRate: 0.1,
  maxAdaptiveBoost: 3,
  priorAttemptCount: 6,
  targetErrorRate: 0.16,
} as const;

export interface AdaptivePracticeItemAggregate {
  failureCount: number;
  successCount: number;
}

interface GetSmoothedFailureEstimateParams {
  aggregate: AdaptivePracticeItemAggregate;
}

export function getSmoothedFailureEstimate({
  aggregate,
}: GetSmoothedFailureEstimateParams): number {
  const { priorAttemptCount, targetErrorRate } = ADAPTIVE_WEIGHTING_CONSTANTS;

  return (
    (aggregate.failureCount + targetErrorRate * priorAttemptCount) /
    (aggregate.successCount + aggregate.failureCount + priorAttemptCount)
  );
}

interface GetAdaptiveItemWeightParams {
  aggregate: AdaptivePracticeItemAggregate;
}

export function getAdaptiveItemWeight({
  aggregate,
}: GetAdaptiveItemWeightParams): number {
  const { baseWeight, maxAdaptiveBoost, targetErrorRate } =
    ADAPTIVE_WEIGHTING_CONSTANTS;
  const estimatedFailureRate = getSmoothedFailureEstimate({ aggregate });
  const need = Math.max(0, estimatedFailureRate - targetErrorRate);
  const normalizedNeed = need / (1 - targetErrorRate);

  return baseWeight + maxAdaptiveBoost * normalizedNeed;
}

interface PickAdaptiveWeightedRandomItemParams<Item> {
  getWeight: (item: Item) => number;
  items: readonly Item[];
}

export function pickAdaptiveWeightedRandomItem<Item>({
  getWeight,
  items,
}: PickAdaptiveWeightedRandomItemParams<Item>): Item | undefined {
  const itemCount = items.length;

  if (itemCount === 0) {
    return undefined;
  }

  const weightedItems = items.map((item) => ({
    item,
    weight: Math.max(getWeight(item), 0),
  }));
  const totalWeight = weightedItems.reduce(
    (sum, weightedItem) => sum + weightedItem.weight,
    0,
  );
  const targetProbability = Math.random();
  let currentProbability = 0;

  return (
    weightedItems.find((weightedItem) => {
      const exploitationProbability =
        totalWeight > 0 ? weightedItem.weight / totalWeight : 1 / itemCount;
      const probability =
        (1 - ADAPTIVE_WEIGHTING_CONSTANTS.explorationRate) *
          exploitationProbability +
        ADAPTIVE_WEIGHTING_CONSTANTS.explorationRate * (1 / itemCount);

      currentProbability += probability;

      return currentProbability >= targetProbability;
    })?.item ?? weightedItems.at(-1)?.item
  );
}
