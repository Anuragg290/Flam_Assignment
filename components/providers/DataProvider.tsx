'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useTransition } from 'react';
import { DataPoint, FilterOptions, TimeRange, AggregationPeriod } from '@/lib/types';
import { useDataStream, useDataFilter } from '@/hooks/useDataStream';
import { DataGenerator, AGGREGATION_PERIODS } from '@/lib/dataGenerator';
import { useWebWorker } from '@/hooks/useWebWorker';
import { aggregateDataOnServer } from '@/app/actions/dataActions';

interface DataContextValue {
  data: DataPoint[];
  filteredData: DataPoint[];
  isStreaming: boolean;
  startStream: () => void;
  stopStream: () => void;
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  timeRange: TimeRange | null;
  setTimeRange: (range: TimeRange | null) => void;
  aggregation: AggregationPeriod | null;
  setAggregation: (period: AggregationPeriod | null) => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function useDataContext() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within DataProvider');
  }
  return context;
}

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const { data, isStreaming, startStream, stopStream } = useDataStream(100);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [timeRange, setTimeRange] = useState<TimeRange | null>(null);
  const [aggregation, setAggregation] = useState<AggregationPeriod | null>(null);
  const [isPending, startTransition] = useTransition();
  const [processedData, setProcessedData] = useState<DataPoint[]>([]);
  const { processData } = useWebWorker();
  const isMountedRef = React.useRef(true);

  // Apply filters
  const filterOptions: FilterOptions = {
    ...filters,
    timeRange: timeRange || undefined,
  };
  const filteredDataRaw = useDataFilter(data, filterOptions);

  // Track mounted state
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Use Web Worker for processing if available, otherwise fallback to main thread or server
  React.useEffect(() => {
    if (filteredDataRaw.length === 0) {
      if (isMountedRef.current) {
        setProcessedData([]);
      }
      return;
    }

    if (aggregation) {
      // Try Web Worker first, then fallback to server action
      if (filteredDataRaw.length > 5000) {
        // For large datasets, use server action
        startTransition(() => {
          aggregateDataOnServer(filteredDataRaw, aggregation.milliseconds)
            .then((result) => {
              if (isMountedRef.current) {
                setProcessedData(result);
              }
            })
            .catch((error) => {
              if (!isMountedRef.current) return;
              console.error('Server aggregation failed, using worker:', error);
              // Fallback to Web Worker
              processData(
                filteredDataRaw,
                { filterOptions, aggregationPeriod: aggregation },
                (result, processingTime) => {
                  if (isMountedRef.current) {
                    setProcessedData(result);
                    if (processingTime > 0) {
                      console.log(`Worker processing time: ${processingTime.toFixed(2)}ms`);
                    }
                  }
                }
              );
            });
        });
      } else {
        // For smaller datasets, use Web Worker
        startTransition(() => {
          processData(
            filteredDataRaw,
            { filterOptions, aggregationPeriod: aggregation },
            (result, processingTime) => {
              if (isMountedRef.current) {
                setProcessedData(result);
                if (processingTime > 0) {
                  console.log(`Worker processing time: ${processingTime.toFixed(2)}ms`);
                }
              }
            }
          );
        });
      }
    } else {
      startTransition(() => {
        if (isMountedRef.current) {
          setProcessedData(filteredDataRaw);
        }
      });
    }
  }, [filteredDataRaw, aggregation, filterOptions, processData]);

  // Fallback to main thread if worker not available
  const filteredData = React.useMemo(() => {
    if (processedData.length > 0) {
      return processedData;
    }
    if (!aggregation || filteredDataRaw.length === 0) {
      return filteredDataRaw;
    }

    const generator = new DataGenerator();
    return generator.aggregate(filteredDataRaw, aggregation);
  }, [processedData, filteredDataRaw, aggregation]);

  return (
    <DataContext.Provider
      value={{
        data,
        filteredData,
        isStreaming,
        startStream,
        stopStream,
        filters,
        setFilters,
        timeRange,
        setTimeRange,
        aggregation,
        setAggregation,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

