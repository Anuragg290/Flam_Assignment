'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { ChartConfig, DataPoint, ZoomState } from '@/lib/types';
import { CanvasRenderer, getOptimalPointDensity } from '@/lib/canvasUtils';

const MAX_RENDER_POINTS = 2000; // Limit points for smooth rendering

/**
 * Hook for chart rendering with canvas
 */
export function useChartRenderer(
  chartType: 'line' | 'bar' | 'scatter' | 'heatmap',
  config: ChartConfig
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const zoomRef = useRef<ZoomState>({ scale: 1, offsetX: 0, offsetY: 0 });
  const [zoom, setZoom] = useState<ZoomState>({ scale: 1, offsetX: 0, offsetY: 0 });

  // Initialize renderer
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Set canvas size
    canvas.width = config.width;
    canvas.height = config.height;

    // Initialize renderer
    rendererRef.current = new CanvasRenderer(ctx, config);
  }, [config]);

  // Render chart
  const render = useCallback(
    (
      points: DataPoint[],
      minValue: number,
      maxValue: number,
      minTime: number,
      maxTime: number
    ) => {
      if (!rendererRef.current || points.length === 0) return;

      const renderer = rendererRef.current;
      const currentZoom = zoomRef.current;

      // Optimize point density for performance
      const optimizedPoints = getOptimalPointDensity(points, MAX_RENDER_POINTS);

      // Clear and draw
      renderer.clear();
      renderer.drawGrid();
      renderer.drawAxesLabels(minValue, maxValue, minTime, maxTime);

      // Draw chart based on type
      switch (chartType) {
        case 'line':
          renderer.drawLine(optimizedPoints, minValue, maxValue, minTime, maxTime, currentZoom);
          break;
        case 'bar':
          renderer.drawBars(optimizedPoints, minValue, maxValue, minTime, maxTime, currentZoom);
          break;
        case 'scatter':
          renderer.drawScatter(optimizedPoints, minValue, maxValue, minTime, maxTime, currentZoom);
          break;
        case 'heatmap':
          renderer.drawHeatmap(optimizedPoints, minValue, maxValue, minTime, maxTime, currentZoom);
          break;
      }
    },
    [chartType]
  );

  // Zoom handlers
  const handleZoom = useCallback((delta: number, x: number, y: number) => {
    setZoom((prev) => {
      const newScale = Math.max(0.5, Math.min(3, prev.scale + delta));
      const newZoom = {
        scale: newScale,
        offsetX: x - (x - prev.offsetX) * (newScale / prev.scale),
        offsetY: y - (y - prev.offsetY) * (newScale / prev.scale),
      };
      zoomRef.current = newZoom;
      return newZoom;
    });
  }, []);

  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    setZoom((prev) => {
      const newZoom = {
        ...prev,
        offsetX: prev.offsetX + deltaX,
        offsetY: prev.offsetY + deltaY,
      };
      zoomRef.current = newZoom;
      return newZoom;
    });
  }, []);

  const resetZoom = useCallback(() => {
    const reset = { scale: 1, offsetX: 0, offsetY: 0 };
    zoomRef.current = reset;
    setZoom(reset);
  }, []);

  return {
    canvasRef,
    render,
    zoom,
    handleZoom,
    handlePan,
    resetZoom,
  };
}

