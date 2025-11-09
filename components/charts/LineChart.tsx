'use client';

import React, { useEffect, useMemo, memo } from 'react';
import { DataPoint, ChartConfig } from '@/lib/types';
import { useChartRenderer } from '@/hooks/useChartRenderer';

interface LineChartProps {
  data: DataPoint[];
  config: ChartConfig;
  width?: number;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = memo(({ data, config, width, height }) => {
  const chartConfig = useMemo(
    () => ({
      ...config,
      width: width || config.width,
      height: height || config.height,
    }),
    [config, width, height]
  );

  const { canvasRef, render, handleZoom, handlePan, resetZoom } = useChartRenderer('line', chartConfig);

  // Calculate data bounds
  const { minValue, maxValue, minTime, maxTime } = useMemo(() => {
    if (data.length === 0) {
      return { minValue: 0, maxValue: 100, minTime: Date.now(), maxTime: Date.now() };
    }

    const values = data.map((p) => p.value);
    const times = data.map((p) => p.timestamp);

    return {
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
    };
  }, [data]);

  // Render on data change
  useEffect(() => {
    render(data, minValue, maxValue, minTime, maxTime);
  }, [data, minValue, maxValue, minTime, maxTime, render]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    handleZoom(delta, x, y);
  };

  // Mouse drag pan
  const [isDragging, setIsDragging] = React.useState(false);
  const [lastPos, setLastPos] = React.useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const deltaX = e.clientX - lastPos.x;
      const deltaY = e.clientY - lastPos.y;
      handlePan(deltaX, deltaY);
      setLastPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="cursor-crosshair"
        style={{ width: chartConfig.width, height: chartConfig.height }}
      />
      <button
        onClick={resetZoom}
        className="absolute top-2 right-2 px-2 py-1 bg-gray-800 text-white text-xs rounded hover:bg-gray-700"
      >
        Reset Zoom
      </button>
    </div>
  );
});

LineChart.displayName = 'LineChart';

export default LineChart;

