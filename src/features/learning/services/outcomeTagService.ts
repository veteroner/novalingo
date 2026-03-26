/**
 * Outcome Tag Service
 *
 * Maps `outcomeTag` values from completed lessons to parent dashboard
 * metric categories. Tag format: `category:value` (e.g. `vocabulary:animals`).
 *
 * Categories:
 *   vocabulary  — topics where new words were introduced
 *   mastery     — topics where recall/production was demonstrated
 *   retention   — review or spaced-repetition lesson completions
 *   pattern     — sentence patterns / grammar chunks acquired
 */

export interface OutcomeMetrics {
  /** All 'vocabulary:*' tag values */
  vocabularyTopics: string[];
  /** All 'mastery:*' tag values */
  masteryTopics: string[];
  /** All 'retention:*' tag values */
  retentionTopics: string[];
  /** All 'pattern:*' tag values */
  patternAcquisitions: string[];
  /** Total number of lessons completed (length of the tags array passed in) */
  totalLessonsCompleted: number;
}

/** Splits a raw tag into its category and value parts. */
export function parseOutcomeTag(tag: string): { category: string; value: string } {
  const colonIdx = tag.indexOf(':');
  if (colonIdx === -1) return { category: tag, value: '' };
  return {
    category: tag.slice(0, colonIdx),
    value: tag.slice(colonIdx + 1),
  };
}

/** Aggregates an array of outcome tags from completed lessons into metrics. */
export function aggregateOutcomeTags(tags: string[]): OutcomeMetrics {
  const metrics: OutcomeMetrics = {
    vocabularyTopics: [],
    masteryTopics: [],
    retentionTopics: [],
    patternAcquisitions: [],
    totalLessonsCompleted: tags.length,
  };

  for (const tag of tags) {
    const { category, value } = parseOutcomeTag(tag);
    switch (category) {
      case 'vocabulary':
        if (value && !metrics.vocabularyTopics.includes(value)) {
          metrics.vocabularyTopics.push(value);
        }
        break;
      case 'mastery':
        if (value && !metrics.masteryTopics.includes(value)) {
          metrics.masteryTopics.push(value);
        }
        break;
      case 'retention':
        if (value && !metrics.retentionTopics.includes(value)) {
          metrics.retentionTopics.push(value);
        }
        break;
      case 'pattern':
        if (value && !metrics.patternAcquisitions.includes(value)) {
          metrics.patternAcquisitions.push(value);
        }
        break;
      default:
        break;
    }
  }

  return metrics;
}

/** Returns a human-readable label for an outcome tag. */
export function getOutcomeLabel(tag: string): string {
  const { category, value } = parseOutcomeTag(tag);
  const displayValue = value.replace(/\+/g, ' ');

  switch (category) {
    case 'vocabulary':
      return `Vocabulary: ${displayValue}`;
    case 'mastery':
      return `Mastered: ${displayValue}`;
    case 'retention':
      return `Review: ${displayValue}`;
    case 'pattern':
      return `Pattern: "${displayValue}"`;
    default:
      return tag;
  }
}
