import type { AnalyticsDashboard, AnalyticsEvent, AnalyticsSnapshot } from './types';

/** A framework-independent event collector for feature-toggle analytics. */
export class AccessibilityAnalytics {
  private readonly events: AnalyticsEvent[] = [];

  record(featureId: string, enabled: boolean): void {
    this.events.push({ featureId, enabled, timestamp: Date.now() });
  }

  snapshot(): AnalyticsSnapshot {
    const enabledFeatures: Record<string, number> = {};
    for (const event of this.events) {
      if (event.enabled) {
        enabledFeatures[event.featureId] = (enabledFeatures[event.featureId] ?? 0) + 1;
      }
    }

    return {
      totalEvents: this.events.length,
      enabledFeatures,
      events: [...this.events],
    };
  }

  clear(): void {
    this.events.length = 0;
  }
}

export function createAnalyticsDashboard(snapshot: AnalyticsSnapshot): AnalyticsDashboard {
  const enabledFeatures = Object.entries(snapshot.enabledFeatures)
    .map(([featureId, activations]) => ({ featureId, activations }))
    .sort((left, right) => right.activations - left.activations);

  return {
    totalEvents: snapshot.totalEvents,
    enabledFeatureCount: enabledFeatures.length,
    mostUsedFeature: enabledFeatures[0]?.featureId ?? null,
    enabledFeatures,
  };
}
