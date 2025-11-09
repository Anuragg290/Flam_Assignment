import { PerformanceMetrics } from './types';

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private frameCount: number = 0;
  private lastTime: number = performance.now();
  private fps: number = 60;
  private renderTimes: number[] = [];
  private readonly maxSamples: number = 60;

  /**
   * Start measuring render time
   */
  startMeasure(): number {
    return performance.now();
  }

  /**
   * End measuring render time and update metrics
   */
  endMeasure(startTime: number): number {
    const renderTime = performance.now() - startTime;
    this.renderTimes.push(renderTime);
    if (this.renderTimes.length > this.maxSamples) {
      this.renderTimes.shift();
    }
    return renderTime;
  }

  /**
   * Update FPS calculation
   */
  updateFPS(): void {
    this.frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;

    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(dataPoints: number): PerformanceMetrics {
    const avgRenderTime =
      this.renderTimes.length > 0
        ? this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length
        : 0;

    return {
      fps: this.fps,
      renderTime: Math.round(avgRenderTime * 100) / 100,
      dataPoints,
      memoryUsage: this.getMemoryUsage(),
    };
  }

  /**
   * Get memory usage if available
   */
  private getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1048576); // Convert to MB
    }
    return undefined;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 60;
    this.renderTimes = [];
  }
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * RequestAnimationFrame wrapper with cleanup
 */
export function useAnimationFrame(callback: () => void): () => void {
  let rafId: number | null = null;
  let lastTime = 0;

  const loop = (currentTime: number) => {
    if (currentTime - lastTime >= 16) {
      // Target 60fps (16.67ms per frame)
      callback();
      lastTime = currentTime;
    }
    rafId = requestAnimationFrame(loop);
  };

  rafId = requestAnimationFrame(loop);

  return () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
  };
}

