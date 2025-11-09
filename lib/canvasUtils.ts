import { ChartConfig, DataPoint, ZoomState } from './types';

/**
 * Canvas rendering utilities
 */
export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private config: ChartConfig;

  constructor(ctx: CanvasRenderingContext2D, config: ChartConfig) {
    this.ctx = ctx;
    this.config = config;
  }

  /**
   * Clear the canvas
   */
  clear(): void {
    const { width, height } = this.config;
    this.ctx.fillStyle = this.config.colors.background;
    this.ctx.fillRect(0, 0, width, height);
  }

  /**
   * Draw grid lines
   */
  drawGrid(): void {
    const { width, height, padding } = this.config;
    const { left, right, top, bottom } = padding;
    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;

    this.ctx.strokeStyle = this.config.colors.grid;
    this.ctx.lineWidth = 1;

    // Vertical grid lines
    const verticalLines = 10;
    for (let i = 0; i <= verticalLines; i++) {
      const x = left + (chartWidth * i) / verticalLines;
      this.ctx.beginPath();
      this.ctx.moveTo(x, top);
      this.ctx.lineTo(x, height - bottom);
      this.ctx.stroke();
    }

    // Horizontal grid lines
    const horizontalLines = 8;
    for (let i = 0; i <= horizontalLines; i++) {
      const y = top + (chartHeight * i) / horizontalLines;
      this.ctx.beginPath();
      this.ctx.moveTo(left, y);
      this.ctx.lineTo(width - right, y);
      this.ctx.stroke();
    }
  }

  /**
   * Draw axes labels
   */
  drawAxesLabels(
    minValue: number,
    maxValue: number,
    minTime: number,
    maxTime: number
  ): void {
    const { width, height, padding } = this.config;
    const { left, right, top, bottom } = padding;
    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;

    this.ctx.fillStyle = this.config.colors.text;
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Y-axis labels
    const yLabels = 8;
    for (let i = 0; i <= yLabels; i++) {
      const value = minValue + ((maxValue - minValue) * (yLabels - i)) / yLabels;
      const y = top + (chartHeight * i) / yLabels;
      this.ctx.fillText(value.toFixed(1), left / 2, y);
    }

    // X-axis labels
    const xLabels = 10;
    for (let i = 0; i <= xLabels; i++) {
      const time = minTime + ((maxTime - minTime) * i) / xLabels;
      const x = left + (chartWidth * i) / xLabels;
      const date = new Date(time);
      const label = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      this.ctx.fillText(label, x, height - bottom / 2);
    }
  }

  /**
   * Transform point to canvas coordinates
   */
  transformPoint(
    point: DataPoint,
    minValue: number,
    maxValue: number,
    minTime: number,
    maxTime: number,
    zoom?: ZoomState
  ): { x: number; y: number } {
    const { width, height, padding } = this.config;
    const { left, right, top, bottom } = padding;
    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;

    const normalizedX = (point.timestamp - minTime) / (maxTime - minTime);
    const normalizedY = (point.value - minValue) / (maxValue - minValue);

    let x = left + normalizedX * chartWidth;
    let y = top + (1 - normalizedY) * chartHeight;

    if (zoom) {
      x = (x - zoom.offsetX) * zoom.scale;
      y = (y - zoom.offsetY) * zoom.scale;
    }

    return { x, y };
  }

  /**
   * Draw line chart
   */
  drawLine(
    points: DataPoint[],
    minValue: number,
    maxValue: number,
    minTime: number,
    maxTime: number,
    zoom?: ZoomState
  ): void {
    if (points.length === 0) return;

    this.ctx.strokeStyle = this.config.colors.primary;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    const firstPoint = this.transformPoint(points[0], minValue, maxValue, minTime, maxTime, zoom);
    this.ctx.moveTo(firstPoint.x, firstPoint.y);

    for (let i = 1; i < points.length; i++) {
      const point = this.transformPoint(points[i], minValue, maxValue, minTime, maxTime, zoom);
      this.ctx.lineTo(point.x, point.y);
    }

    this.ctx.stroke();
  }

  /**
   * Draw bar chart
   */
  drawBars(
    points: DataPoint[],
    minValue: number,
    maxValue: number,
    minTime: number,
    maxTime: number,
    zoom?: ZoomState
  ): void {
    if (points.length === 0) return;

    const { padding } = this.config;
    const { left, right, top, bottom } = padding;
    const chartWidth = this.config.width - left - right;
    const chartHeight = this.config.height - top - bottom;
    const barWidth = chartWidth / points.length;

    this.ctx.fillStyle = this.config.colors.primary;

    points.forEach((point) => {
      const transformed = this.transformPoint(point, minValue, maxValue, minTime, maxTime, zoom);
      const zeroY = top + chartHeight;
      const barHeight = zeroY - transformed.y;

      this.ctx.fillRect(transformed.x - barWidth / 2, transformed.y, barWidth * 0.8, barHeight);
    });
  }

  /**
   * Draw scatter plot
   */
  drawScatter(
    points: DataPoint[],
    minValue: number,
    maxValue: number,
    minTime: number,
    maxTime: number,
    zoom?: ZoomState,
    radius: number = 3
  ): void {
    if (points.length === 0) return;

    this.ctx.fillStyle = this.config.colors.primary;

    points.forEach((point) => {
      const transformed = this.transformPoint(point, minValue, maxValue, minTime, maxTime, zoom);
      this.ctx.beginPath();
      this.ctx.arc(transformed.x, transformed.y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  /**
   * Draw heatmap
   */
  drawHeatmap(
    points: DataPoint[],
    minValue: number,
    maxValue: number,
    minTime: number,
    maxTime: number,
    zoom?: ZoomState
  ): void {
    if (points.length === 0) return;

    const { padding } = this.config;
    const { left, right, top, bottom } = padding;
    const chartWidth = this.config.width - left - right;
    const chartHeight = this.config.height - top - bottom;
    const cellWidth = chartWidth / Math.ceil(Math.sqrt(points.length));
    const cellHeight = chartHeight / Math.ceil(Math.sqrt(points.length));

    points.forEach((point, index) => {
      const normalizedValue = (point.value - minValue) / (maxValue - minValue);
      const intensity = Math.floor(normalizedValue * 255);
      const color = `rgb(${intensity}, ${255 - intensity}, 128)`;

      const row = Math.floor(index / Math.ceil(Math.sqrt(points.length)));
      const col = index % Math.ceil(Math.sqrt(points.length));

      this.ctx.fillStyle = color;
      this.ctx.fillRect(
        left + col * cellWidth,
        top + row * cellHeight,
        cellWidth,
        cellHeight
      );
    });
  }
}

/**
 * Get optimal point density for performance
 */
export function getOptimalPointDensity(points: DataPoint[], maxPoints: number): DataPoint[] {
  if (points.length <= maxPoints) return points;

  const step = Math.ceil(points.length / maxPoints);
  return points.filter((_, index) => index % step === 0);
}

