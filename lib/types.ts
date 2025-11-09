export interface DataPoint {
  timestamp: number;
  value: number;
  category?: string;
  metadata?: Record<string, any>;
}

export interface ChartData {
  points: DataPoint[];
  min: number;
  max: number;
  minTime: number;
  maxTime: number;
}

export interface ChartConfig {
  width: number;
  height: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  colors: {
    primary: string;
    secondary: string;
    background: string;
    grid: string;
    text: string;
  };
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface AggregationPeriod {
  label: string;
  milliseconds: number;
}

export interface FilterOptions {
  categories?: string[];
  minValue?: number;
  maxValue?: number;
  timeRange?: TimeRange;
}

export interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  dataPoints: number;
  memoryUsage?: number;
}

export type ChartType = 'line' | 'bar' | 'scatter' | 'heatmap';

export interface ZoomState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

