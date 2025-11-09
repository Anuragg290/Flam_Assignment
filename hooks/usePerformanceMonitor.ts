'use client';

import { useState, useEffect, useRef } from 'react';
import { PerformanceMetrics } from '@/lib/types';
import { PerformanceMonitor } from '@/lib/performanceUtils';

/**
 * Hook for performance monitoring
 */
export function usePerformanceMonitor(dataPoints: number) {
  const monitorRef = useRef<PerformanceMonitor>(new PerformanceMonitor());
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    renderTime: 0,
    dataPoints: 0,
  });
  const frameRef = useRef<number | null>(null);

  // Track if component is mounted
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const monitor = monitorRef.current;

    const updateMetrics = () => {
      if (!isMountedRef.current) return;

      monitor.updateFPS();
      const newMetrics = monitor.getMetrics(dataPoints);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setMetrics(newMetrics);
        frameRef.current = requestAnimationFrame(updateMetrics);
      }
    };

    frameRef.current = requestAnimationFrame(updateMetrics);

    return () => {
      isMountedRef.current = false;
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [dataPoints]);

  const startMeasure = () => {
    return monitorRef.current.startMeasure();
  };

  const endMeasure = (startTime: number) => {
    return monitorRef.current.endMeasure(startTime);
  };

  return {
    metrics,
    startMeasure,
    endMeasure,
  };
}

