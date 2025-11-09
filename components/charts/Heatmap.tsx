'use client';

import React, { useEffect, useMemo, memo } from 'react';
import { DataPoint, ChartConfig } from '@/lib/types';
import { useChartRenderer } from '@/hooks/useChartRenderer';

interface HeatmapProps {
  data: DataPoint[];
  config: ChartConfig;
  width?: number;
  height?: number;
}

const Heatmap: React.FC<HeatmapProps> = memo(({ data, config, width, height }) => {
  const chartConfig = useMemo(
    () => ({
      ...config,
      width: width || config.width,
      height: height || config.height,
    }),
    [config, width, height]
  );

  const { canvasRef, render } = useChartRenderer('heatmap', chartConfig);

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

  useEffect(() => {
    render(data, minValue, maxValue, minTime, maxTime);
  }, [data, minValue, maxValue, minTime, maxTime, render]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="cursor-pointer"
        style={{ width: chartConfig.width, height: chartConfig.height }}
      />
    </div>
  );
});

Heatmap.displayName = 'Heatmap';

export default Heatmap;

