// Web Worker for data processing
// This is the compiled version - the TypeScript version is in dataProcessor.worker.ts

// Worker message types
// interface WorkerMessage {
//   type: 'filter' | 'aggregate' | 'both';
//   data: DataPoint[];
//   filterOptions?: FilterOptions;
//   aggregationPeriod?: AggregationPeriod;
// }

// Filter data
function filterData(data, filterOptions) {
  let filtered = [...data];

  // Filter by time range
  if (filterOptions.timeRange) {
    const { start, end } = filterOptions.timeRange;
    filtered = filtered.filter(
      (point) => point.timestamp >= start && point.timestamp <= end
    );
  }

  // Filter by value range
  if (filterOptions.minValue !== undefined) {
    filtered = filtered.filter((point) => point.value >= filterOptions.minValue);
  }
  if (filterOptions.maxValue !== undefined) {
    filtered = filtered.filter((point) => point.value <= filterOptions.maxValue);
  }

  // Filter by categories
  if (filterOptions.categories && filterOptions.categories.length > 0) {
    filtered = filtered.filter(
      (point) => point.category && filterOptions.categories.includes(point.category)
    );
  }

  return filtered;
}

// Aggregate data
function aggregateData(points, period) {
  if (points.length === 0) return [];

  const aggregated = new Map();

  points.forEach((point) => {
    const bucket = Math.floor(point.timestamp / period.milliseconds) * period.milliseconds;
    const existing = aggregated.get(bucket) || { sum: 0, count: 0, timestamps: [] };
    existing.sum += point.value;
    existing.count += 1;
    existing.timestamps.push(point.timestamp);
    aggregated.set(bucket, existing);
  });

  return Array.from(aggregated.entries())
    .map(([timestamp, data]) => ({
      timestamp,
      value: data.sum / data.count, // Average aggregation
      category: points[0]?.category,
      metadata: {
        originalCount: data.count,
        aggregated: true,
      },
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

// Handle messages from main thread
self.onmessage = (e) => {
  const startTime = performance.now();
  const { type, data, filterOptions, aggregationPeriod } = e.data;

  let processedData = data;
  let processingTime = 0;

  try {
    if (type === 'filter' && filterOptions) {
      processedData = filterData(data, filterOptions);
    } else if (type === 'aggregate' && aggregationPeriod) {
      processedData = aggregateData(data, aggregationPeriod);
    } else if (type === 'both' && filterOptions && aggregationPeriod) {
      // First filter, then aggregate
      processedData = filterData(data, filterOptions);
      processedData = aggregateData(processedData, aggregationPeriod);
    }

    processingTime = performance.now() - startTime;

    const response = {
      type,
      data: processedData,
      processingTime,
    };

    self.postMessage(response);
  } catch (error) {
    self.postMessage({
      type,
      data: [],
      processingTime: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

