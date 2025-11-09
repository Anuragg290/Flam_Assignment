'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

interface VirtualizationConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

/**
 * Hook for virtual scrolling
 */
export function useVirtualization<T>(
  items: T[],
  config: VirtualizationConfig
) {
  const { itemHeight, containerHeight, overscan = 5 } = config;
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    startIndex + visibleCount + overscan * 2
  );

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, startIndex, endIndex]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return {
    containerRef,
    visibleItems,
    totalHeight,
    startIndex,
    endIndex,
    handleScroll,
  };
}

