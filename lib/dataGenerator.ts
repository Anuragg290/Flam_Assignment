import { DataPoint, AggregationPeriod } from './types';

/**
 * Generates realistic time-series data with configurable patterns
 */
export class DataGenerator {
  private baseValue: number;
  private trend: number;
  private noise: number;
  private seasonality: number;
  private spikeProbability: number;

  constructor(config: {
    baseValue?: number;
    trend?: number;
    noise?: number;
    seasonality?: number;
    spikeProbability?: number;
  } = {}) {
    this.baseValue = config.baseValue ?? 100;
    this.trend = config.trend ?? 0.1;
    this.noise = config.noise ?? 5;
    this.seasonality = config.seasonality ?? 10;
    this.spikeProbability = config.spikeProbability ?? 0.02;
  }

  /**
   * Generate a single data point
   */
  generatePoint(timestamp: number, index: number): DataPoint {
    const time = timestamp / 1000; // Convert to seconds
    const trendComponent = this.trend * index;
    const seasonalComponent = this.seasonality * Math.sin(time / 60);
    const noiseComponent = (Math.random() - 0.5) * this.noise;
    const spike = Math.random() < this.spikeProbability ? this.noise * 10 : 0;

    const value = this.baseValue + trendComponent + seasonalComponent + noiseComponent + spike;

    return {
      timestamp,
      value: Math.max(0, value),
      category: this.getCategory(index),
      metadata: {
        index,
        hasSpike: spike > 0,
      },
    };
  }

  /**
   * Generate multiple data points
   */
  generatePoints(count: number, startTime: number = Date.now(), intervalMs: number = 1000): DataPoint[] {
    const points: DataPoint[] = [];
    for (let i = 0; i < count; i++) {
      const timestamp = startTime + i * intervalMs;
      points.push(this.generatePoint(timestamp, i));
    }
    return points;
  }

  /**
   * Generate continuous stream of data points
   */
  *generateStream(startTime: number = Date.now(), intervalMs: number = 100): Generator<DataPoint> {
    let index = 0;
    while (true) {
      const timestamp = startTime + index * intervalMs;
      yield this.generatePoint(timestamp, index);
      index++;
    }
  }

  /**
   * Aggregate data points by time period
   */
  aggregate(points: DataPoint[], period: AggregationPeriod): DataPoint[] {
    if (points.length === 0) return [];

    const aggregated: Map<number, { sum: number; count: number; timestamps: number[] }> = new Map();

    points.forEach((point) => {
      const bucket = Math.floor(point.timestamp / period.milliseconds) * period.milliseconds;
      const existing = aggregated.get(bucket) || { sum: 0, count: 0, timestamps: [] };
      existing.sum += point.value;
      existing.count += 1;
      existing.timestamps.push(point.timestamp);
      aggregated.set(bucket, existing);
    });

    return Array.from(aggregated.entries())
      .map(([timestamp, data]) => ({
        timestamp,
        value: data.sum / data.count, // Average aggregation
        category: points[0]?.category,
        metadata: {
          originalCount: data.count,
          aggregated: true,
        },
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  private getCategory(index: number): string {
    const categories = ['A', 'B', 'C', 'D'];
    return categories[index % categories.length];
  }
}

/**
 * Predefined aggregation periods
 */
export const AGGREGATION_PERIODS: AggregationPeriod[] = [
  { label: '1 minute', milliseconds: 60 * 1000 },
  { label: '5 minutes', milliseconds: 5 * 60 * 1000 },
  { label: '1 hour', milliseconds: 60 * 60 * 1000 },
];

