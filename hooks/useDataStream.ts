'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DataPoint, FilterOptions, TimeRange } from '@/lib/types';
import { DataGenerator } from '@/lib/dataGenerator';

const INITIAL_DATA_COUNT = 1000;
const MAX_DATA_POINTS = 10000;

/**
 * Hook for managing real-time data stream
 */
export function useDataStream(intervalMs: number = 100) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const generatorRef = useRef<DataGenerator | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  // Initialize generator
  useEffect(() => {
    generatorRef.current = new DataGenerator({
      baseValue: 100,
      trend: 0.1,
      noise: 5,
      seasonality: 10,
    });

    // Generate initial data
    const initialData = generatorRef.current.generatePoints(
      INITIAL_DATA_COUNT,
      Date.now() - INITIAL_DATA_COUNT * intervalMs,
      intervalMs
    );
    setData(initialData);
    startTimeRef.current = Date.now() - INITIAL_DATA_COUNT * intervalMs;
  }, [intervalMs]);

  // Start streaming
  const startStream = useCallback(() => {
    if (isStreaming || !generatorRef.current) return;
    setIsStreaming(true);

    intervalRef.current = setInterval(() => {
      if (!generatorRef.current || !isMountedRef.current) return;

      setData((prevData) => {
        // Double-check mounted state before updating
        if (!isMountedRef.current) return prevData;

        const newPoint = generatorRef.current!.generatePoint(
          Date.now(),
          prevData.length
        );

        // Keep only the most recent MAX_DATA_POINTS
        const updated = [...prevData, newPoint];
        if (updated.length > MAX_DATA_POINTS) {
          return updated.slice(-MAX_DATA_POINTS);
        }
        return updated;
      });
    }, intervalMs);
  }, [isStreaming, intervalMs]);

  // Stop streaming
  const stopStream = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Filter data based on options
  const filteredData = useMemo(() => {
    return data;
  }, [data]);

  return {
    data: filteredData,
    isStreaming,
    startStream,
    stopStream,
  };
}

/**
 * Hook for filtering data
 */
export function useDataFilter(
  data: DataPoint[],
  filterOptions: FilterOptions
) {
  return useMemo(() => {
    let filtered = [...data];

    // Filter by time range
    if (filterOptions.timeRange) {
      const { start, end } = filterOptions.timeRange;
      filtered = filtered.filter(
        (point) => point.timestamp >= start && point.timestamp <= end
      );
    }

    // Filter by value range
    if (filterOptions.minValue !== undefined) {
      filtered = filtered.filter((point) => point.value >= filterOptions.minValue!);
    }
    if (filterOptions.maxValue !== undefined) {
      filtered = filtered.filter((point) => point.value <= filterOptions.maxValue!);
    }

    // Filter by categories
    if (filterOptions.categories && filterOptions.categories.length > 0) {
      filtered = filtered.filter(
        (point) => point.category && filterOptions.categories!.includes(point.category)
      );
    }

    return filtered;
  }, [data, filterOptions]);
}

