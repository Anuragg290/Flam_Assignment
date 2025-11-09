'use client';

import React, { useState, useMemo, Suspense, useTransition } from 'react';
import { DataProvider, useDataContext } from '@/components/providers/DataProvider';
import ChartSkeleton from '@/components/ui/ChartSkeleton';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import ScatterPlot from '@/components/charts/ScatterPlot';
import Heatmap from '@/components/charts/Heatmap';
import FilterPanel from '@/components/controls/FilterPanel';
import TimeRangeSelector from '@/components/controls/TimeRangeSelector';
import DataTable from '@/components/ui/DataTable';
import PerformanceMonitor from '@/components/ui/PerformanceMonitor';
import { ChartConfig, ChartType } from '@/lib/types';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useResponsive } from '@/hooks/useResponsive';

const DEFAULT_CHART_CONFIG: ChartConfig = {
  width: 800,
  height: 400,
  padding: {
    top: 20,
    right: 20,
    bottom: 40,
    left: 60,
  },
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    background: '#ffffff',
    grid: '#e5e7eb',
    text: '#374151',
  },
};

function DashboardContent() {
  const {
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
  } = useDataContext();

  const [selectedChart, setSelectedChart] = useState<ChartType>('line');
  const [isPending, startTransition] = useTransition();
  const { metrics, startMeasure, endMeasure } = usePerformanceMonitor(filteredData.length);
  const { isMobile, isTablet, width } = useResponsive();

  // Calculate data bounds
  const { minTime, maxTime } = useMemo(() => {
    if (filteredData.length === 0) {
      const now = Date.now();
      return { minTime: now - 3600000, maxTime: now };
    }
    const times = filteredData.map((p) => p.timestamp);
    return {
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
    };
  }, [filteredData]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    filteredData.forEach((point) => {
      if (point.category) cats.add(point.category);
    });
    return Array.from(cats);
  }, [filteredData]);

  // Responsive chart config
  const chartConfig = useMemo(() => {
    if (isMobile) {
      return {
        ...DEFAULT_CHART_CONFIG,
        width: Math.max(300, width - 32),
        height: 300,
        padding: {
          ...DEFAULT_CHART_CONFIG.padding,
          left: 40,
          bottom: 30,
        },
      };
    } else if (isTablet) {
      return {
        ...DEFAULT_CHART_CONFIG,
        width: 600,
        height: 350,
      };
    }
    return DEFAULT_CHART_CONFIG;
  }, [isMobile, isTablet, width]);

  // Render chart with performance monitoring
  const renderChart = () => {
    const start = startMeasure();
    let chart;

    switch (selectedChart) {
      case 'line':
        chart = <LineChart data={filteredData} config={chartConfig} />;
        break;
      case 'bar':
        chart = <BarChart data={filteredData} config={chartConfig} />;
        break;
      case 'scatter':
        chart = <ScatterPlot data={filteredData} config={chartConfig} />;
        break;
      case 'heatmap':
        chart = <Heatmap data={filteredData} config={chartConfig} />;
        break;
    }

    endMeasure(start);
    return chart;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Performance-Critical Data Visualization Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Real-time dashboard handling 10,000+ data points at 60fps
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {/* Chart Type Selector */}
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
              <label className="block text-xs sm:text-sm font-medium mb-2">Chart Type</label>
              <div className="flex flex-wrap gap-2">
                {(['line', 'bar', 'scatter', 'heatmap'] as ChartType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      startTransition(() => {
                        setSelectedChart(type);
                      });
                    }}
                    disabled={isPending}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded capitalize transition-colors ${
                      selectedChart === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white p-2 sm:p-4 rounded-lg shadow overflow-x-auto">
              <Suspense fallback={<ChartSkeleton />}>
                {renderChart()}
              </Suspense>
            </div>

            {/* Data Table */}
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Data Table</h2>
              <div className="overflow-x-auto">
                <DataTable data={filteredData} height={isMobile ? 300 : 400} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-3 sm:space-y-4">
            {/* Performance Monitor */}
            <PerformanceMonitor metrics={metrics} />

            {/* Stream Controls */}
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
              <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Stream Controls</h3>
              <div className="space-y-2">
                <button
                  onClick={isStreaming ? stopStream : startStream}
                  className={`w-full px-4 py-2 rounded ${
                    isStreaming
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isStreaming ? 'Stop Stream' : 'Start Stream'}
                </button>
                <div className="text-sm text-gray-600">
                  Status: <span className={isStreaming ? 'text-green-600' : 'text-gray-400'}>
                    {isStreaming ? 'Streaming' : 'Stopped'}
                  </span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <FilterPanel onFilterChange={setFilters} availableCategories={categories} />

            {/* Time Range */}
            <TimeRangeSelector
              dataStartTime={minTime}
              dataEndTime={maxTime}
              onTimeRangeChange={setTimeRange}
              onAggregationChange={setAggregation}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DataProvider>
      <DashboardContent />
    </DataProvider>
  );
}

