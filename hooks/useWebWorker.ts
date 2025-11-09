'use client';

import { useRef, useCallback, useEffect } from 'react';
import { DataPoint, FilterOptions, AggregationPeriod } from '@/lib/types';

interface WorkerMessage {
  type: 'filter' | 'aggregate' | 'both';
  data: DataPoint[];
  filterOptions?: FilterOptions;
  aggregationPeriod?: AggregationPeriod;
}

interface WorkerResponse {
  type: string;
  data: DataPoint[];
  processingTime: number;
  error?: string;
}

/**
 * Hook for using Web Workers for data processing
 */
export function useWebWorker() {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Create worker
    if (typeof window !== 'undefined') {
      try {
        workerRef.current = new Worker(
          new URL('/workers/dataProcessor.worker.js', window.location.origin)
        );
      } catch (error) {
        console.warn('Failed to create Web Worker:', error);
        workerRef.current = null;
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Track if component is mounted
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const processData = useCallback(
    (
      data: DataPoint[],
      options: {
        filterOptions?: FilterOptions;
        aggregationPeriod?: AggregationPeriod;
      },
      onComplete: (result: DataPoint[], processingTime: number) => void
    ) => {
      if (!workerRef.current) {
        // Fallback to main thread if worker not available
        console.warn('Web Worker not available, processing on main thread');
        if (isMountedRef.current) {
          onComplete(data, 0);
        }
        return;
      }

      const message: WorkerMessage = {
        type: options.filterOptions && options.aggregationPeriod ? 'both' : options.filterOptions ? 'filter' : 'aggregate',
        data,
        filterOptions: options.filterOptions,
        aggregationPeriod: options.aggregationPeriod,
      };

      const handleMessage = (e: MessageEvent<WorkerResponse>) => {
        // Always remove listener first
        workerRef.current?.removeEventListener('message', handleMessage);

        // Only call callback if component is still mounted
        if (!isMountedRef.current) return;

        if (e.data.error) {
          console.error('Worker error:', e.data.error);
          onComplete(data, 0);
        } else {
          onComplete(e.data.data, e.data.processingTime);
        }
      };

      workerRef.current.addEventListener('message', handleMessage);
      workerRef.current.postMessage(message);
    },
    []
  );

  return { processData };
}

