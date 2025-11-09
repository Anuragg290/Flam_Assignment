'use client';

import React, { memo } from 'react';
import { PerformanceMetrics } from '@/lib/types';

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = memo(({ metrics }) => {
  const fpsColor = metrics.fps >= 55 ? 'text-green-600' : metrics.fps >= 30 ? 'text-yellow-600' : 'text-red-600';
  const renderTimeColor = metrics.renderTime < 16 ? 'text-green-600' : metrics.renderTime < 33 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg font-mono">
      <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>FPS:</span>
          <span className={fpsColor}>{metrics.fps}</span>
        </div>
        <div className="flex justify-between">
          <span>Render Time:</span>
          <span className={renderTimeColor}>{metrics.renderTime.toFixed(2)}ms</span>
        </div>
        <div className="flex justify-between">
          <span>Data Points:</span>
          <span>{metrics.dataPoints.toLocaleString()}</span>
        </div>
        {metrics.memoryUsage !== undefined && (
          <div className="flex justify-between">
            <span>Memory:</span>
            <span>{metrics.memoryUsage} MB</span>
          </div>
        )}
      </div>
    </div>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

export default PerformanceMonitor;

