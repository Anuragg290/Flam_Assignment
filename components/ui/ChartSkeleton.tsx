'use client';

import React from 'react';

/**
 * Loading skeleton for charts
 */
export default function ChartSkeleton() {
  return (
    <div className="animate-pulse bg-gray-200 rounded" style={{ width: 800, height: 400 }}>
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading chart...</div>
      </div>
    </div>
  );
}

