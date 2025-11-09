'use server';

import { DataGenerator } from '@/lib/dataGenerator';
import { DataPoint } from '@/lib/types';

/**
 * Server Action: Generate initial dataset
 */
export async function generateInitialData(count: number = 1000): Promise<DataPoint[]> {
  const generator = new DataGenerator({
    baseValue: 100,
    trend: 0.1,
    noise: 5,
    seasonality: 10,
  });

  const startTime = Date.now() - count * 100;
  return generator.generatePoints(count, startTime, 100);
}

/**
 * Server Action: Generate data batch
 */
export async function generateDataBatch(
  count: number,
  startTime: number,
  intervalMs: number = 100
): Promise<DataPoint[]> {
  const generator = new DataGenerator({
    baseValue: 100,
    trend: 0.1,
    noise: 5,
    seasonality: 10,
  });

  return generator.generatePoints(count, startTime, intervalMs);
}

/**
 * Server Action: Aggregate data on server
 */
export async function aggregateDataOnServer(
  data: DataPoint[],
  periodMs: number
): Promise<DataPoint[]> {
  if (data.length === 0) return [];

  const generator = new DataGenerator();
  const period = {
    label: 'Custom',
    milliseconds: periodMs,
  };

  return generator.aggregate(data, period);
}

/**
 * Server Action: Validate and sanitize filter options
 */
export async function validateFilters(filters: {
  minValue?: number;
  maxValue?: number;
  categories?: string[];
}): Promise<{ valid: boolean; errors?: string[] }> {
  const errors: string[] = [];

  if (filters.minValue !== undefined && filters.maxValue !== undefined) {
    if (filters.minValue > filters.maxValue) {
      errors.push('Min value cannot be greater than max value');
    }
  }

  if (filters.minValue !== undefined && filters.minValue < 0) {
    errors.push('Min value cannot be negative');
  }

  if (filters.categories && filters.categories.length > 10) {
    errors.push('Too many categories selected');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

