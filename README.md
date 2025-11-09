# Performance-Critical Data Visualization Dashboard

A high-performance real-time dashboard built with Next.js 14+ App Router and TypeScript that can smoothly render and update 10,000+ data points at 60fps.

## 🚀 Features

- **Multiple Chart Types**: Line chart, bar chart, scatter plot, and heatmap
- **Real-time Updates**: New data arrives every 100ms (simulated)
- **Interactive Controls**: Zoom, pan, data filtering, and time range selection
- **Data Aggregation**: Group by time periods (1min, 5min, 1hour)
- **Virtual Scrolling**: Handle large datasets in data tables efficiently
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Performance Monitoring**: Real-time FPS and render time tracking

## 📋 Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (or yarn/pnpm)
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## 🛠️ Installation & Setup

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd performance-dashboard

# Install dependencies
npm install

# Run development server
npm run dev
```

The dashboard will be available at [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Setup

No environment variables are required for basic functionality. The dashboard generates synthetic data locally.

## 🏗️ Project Structure

```
performance-dashboard/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx              # Main dashboard page (Client Component)
│   │   └── layout.tsx              # Dashboard layout (Server Component)
│   ├── api/
│   │   └── data/
│   │       └── route.ts           # Data API endpoints (Server Route Handler)
│   ├── globals.css                # Global styles with Tailwind
│   └── layout.tsx                 # Root layout (Server Component)
├── components/
│   ├── charts/                    # Canvas-based chart components
│   │   ├── LineChart.tsx
│   │   ├── BarChart.tsx
│   │   ├── ScatterPlot.tsx
│   │   └── Heatmap.tsx
│   ├── controls/                  # Interactive control components
│   │   ├── FilterPanel.tsx
│   │   └── TimeRangeSelector.tsx
│   ├── ui/                        # UI components
│   │   ├── DataTable.tsx          # Virtual scrolling table
│   │   └── PerformanceMonitor.tsx # FPS/memory monitor
│   └── providers/
│       └── DataProvider.tsx       # Context provider for data
├── hooks/                         # Custom React hooks
│   ├── useDataStream.ts           # Real-time data streaming
│   ├── useChartRenderer.ts        # Canvas rendering logic
│   ├── usePerformanceMonitor.ts  # Performance metrics
│   └── useVirtualization.ts       # Virtual scrolling
├── lib/                           # Utility libraries
│   ├── dataGenerator.ts           # Time-series data generation
│   ├── performanceUtils.ts       # Performance utilities
│   ├── canvasUtils.ts             # Canvas rendering utilities
│   └── types.ts                   # TypeScript type definitions
├── public/                        # Static assets
├── package.json
├── next.config.js                 # Next.js configuration
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
├── README.md
└── PERFORMANCE.md                 # Detailed performance analysis
```

## 🎯 Next.js Specific Optimizations

### App Router Architecture

#### Server Components (Default)
- **Layouts**: `app/layout.tsx`, `app/dashboard/layout.tsx` - Rendered on server
- **Metadata**: SEO-friendly metadata in layout files
- **Initial HTML**: Faster initial page load with server-rendered HTML

#### Client Components (`'use client'`)
- **Interactive Charts**: All chart components marked with `'use client'`
- **Real-time Updates**: Data streaming hooks are client-side only
- **User Interactions**: Zoom, pan, filtering handled client-side

#### Route Handlers
- **API Endpoints**: `app/api/data/route.ts` - Server-side data generation
- **Efficient Processing**: Heavy data generation happens on server
- **Type Safety**: Full TypeScript support for API routes

### Code Splitting & Bundling

- **Automatic Code Splitting**: Next.js automatically splits code by route
- **Dynamic Imports**: Chart components loaded on demand
- **Tree Shaking**: Unused code eliminated in production builds
- **Bundle Optimization**: Optimized package imports in `next.config.js`

### Performance Features

- **Image Optimization**: Ready for Next.js Image component (if needed)
- **Font Optimization**: Can integrate Next.js font optimization
- **Static Generation**: Layout components can be statically generated
- **Streaming**: Ready for React Suspense boundaries

## 🧪 Performance Testing Instructions

### Manual Testing

1. **Start the Dashboard**
   ```bash
   npm run dev
   ```

2. **Open Performance Monitor**
   - Navigate to `/dashboard`
   - Locate the Performance Monitor panel in the sidebar
   - Note initial FPS and memory usage

3. **Test Real-time Updates**
   - Click "Start Stream" button
   - Observe FPS counter (should maintain 60 FPS)
   - Monitor render time (should stay < 16ms)
   - Let it run for 5-10 minutes to check memory stability

4. **Stress Testing**
   - Let stream run until 10,000+ data points accumulate
   - Switch between chart types rapidly
   - Apply filters and aggregations
   - Test zoom/pan interactions
   - Verify no frame drops or UI freezing

5. **Memory Leak Test**
   - Start stream and let it run for 30+ minutes
   - Monitor memory usage in Performance Monitor
   - Check browser DevTools Memory tab
   - Memory should stabilize, not continuously grow

### Browser DevTools Testing

1. **Performance Tab**
   - Open Chrome DevTools → Performance
   - Click Record
   - Interact with dashboard for 10 seconds
   - Stop recording
   - Check for:
     - Consistent 60 FPS
     - No long tasks (>50ms)
     - Smooth frame rendering

2. **Memory Tab**
   - Open Chrome DevTools → Memory
   - Take heap snapshot before starting stream
   - Start stream, let it run 5 minutes
   - Take another heap snapshot
   - Compare snapshots - should show minimal growth

3. **React DevTools Profiler**
   - Install React DevTools extension
   - Open Profiler tab
   - Record while interacting with dashboard
   - Check component render times
   - Verify memoization is working (components shouldn't re-render unnecessarily)

### Automated Performance Testing

```bash
# Run Lighthouse CI (if configured)
npm run lighthouse

# Check bundle size
npm run build
# Check .next/analyze for bundle analysis
```

### Performance Benchmarks

| Test Scenario | Target | How to Verify |
|--------------|--------|---------------|
| 10,000 points rendering | 60 FPS | Performance Monitor panel |
| Real-time updates | No frame drops | Visual inspection + FPS counter |
| Memory stability | < 1MB/hour growth | Performance Monitor + DevTools |
| Interaction latency | < 100ms | DevTools Performance tab |
| Chart switching | < 50ms | Visual inspection |

## 🌐 Browser Compatibility

### Supported Browsers

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 90+ | ✅ Full support, best performance |
| Firefox | 88+ | ✅ Full support |
| Safari | 14+ | ✅ Full support (iOS 14+) |
| Edge | 90+ | ✅ Full support (Chromium-based) |

### Browser-Specific Features

#### Chrome/Edge (Chromium)
- **Best Performance**: Optimized V8 engine
- **Memory API**: Full `performance.memory` support
- **Canvas**: Hardware-accelerated rendering
- **Recommended**: Best experience for development and testing

#### Firefox
- **Good Performance**: Gecko engine optimization
- **Memory API**: Limited `performance.memory` support
- **Canvas**: Software rendering fallback possible
- **Note**: Memory usage may not display in Performance Monitor

#### Safari
- **Good Performance**: WebKit optimizations
- **Memory API**: Not available
- **Canvas**: Hardware acceleration available
- **Note**: Some advanced features may have limitations

### Mobile Compatibility

- **iOS Safari**: 14+ (iPad recommended for best experience)
- **Chrome Mobile**: 90+ (Android)
- **Performance**: May see reduced FPS on lower-end devices
- **Recommendation**: Use aggregation for mobile devices

### Advanced Features

1. **Web Workers**: Data processing (filtering, aggregation) offloaded to worker threads
2. **Server Actions**: Server-side data processing for large datasets
3. **Edge Runtime**: API routes configured for Edge Runtime (lower latency)
4. **Suspense Boundaries**: Progressive loading with Suspense for better UX
5. **useTransition**: Non-blocking updates for smooth interactions
6. **Responsive Design**: Fully responsive with mobile/tablet optimizations

### Known Limitations

1. **Memory API**: Not available in Firefox/Safari - memory usage won't display
2. **OffscreenCanvas**: Not used (potential future optimization)
3. **Service Workers**: Not implemented (potential future optimization)

## 📊 Feature Overview

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│  Performance-Critical Data Visualization Dashboard      │
├─────────────────────────────────────────────────────────┤
│  [Line] [Bar] [Scatter] [Heatmap]  Chart Type Selector │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────┐     │
│  │                                              │     │
│  │         Canvas Chart Area                    │     │
│  │         (Interactive Zoom/Pan)              │     │
│  │                                              │     │
│  └──────────────────────────────────────────────┘     │
│                                                          │
│  ┌──────────────────────────────────────────────┐     │
│  │  Data Table (Virtual Scrolling)               │     │
│  │  Index | Timestamp | Value | Category        │     │
│  └──────────────────────────────────────────────┘     │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Sidebar:                                              │
│  ┌────────────────────┐                               │
│  │ Performance Monitor│                               │
│  │ FPS: 60            │                               │
│  │ Render: 10.2ms     │                               │
│  │ Points: 10,000     │                               │
│  └────────────────────┘                               │
│  ┌────────────────────┐                               │
│  │ Stream Controls    │                               │
│  │ [Start/Stop]       │                               │
│  └────────────────────┘                               │
│  ┌────────────────────┐                               │
│  │ Filters            │                               │
│  │ Categories, Values │                               │
│  └────────────────────┘                               │
│  ┌────────────────────┐                               │
│  │ Time Range         │                               │
│  │ Start/End + Agg    │                               │
│  └────────────────────┘                               │
└─────────────────────────────────────────────────────────┘
```

### Key Features

1. **Real-time Data Streaming**
   - Simulated data generation every 100ms
   - Automatic memory management (max 10,000 points)
   - Smooth updates without UI blocking

2. **Interactive Charts**
   - **Line Chart**: Zoom with mouse wheel, pan with drag
   - **Bar Chart**: Time-series bar visualization
   - **Scatter Plot**: Point-based visualization with zoom
   - **Heatmap**: Color-coded intensity map

3. **Data Filtering**
   - Filter by category (A, B, C, D)
   - Filter by value range (min/max)
   - Filter by time range
   - Real-time filter application

4. **Data Aggregation**
   - Group data by time periods
   - Options: 1 minute, 5 minutes, 1 hour
   - Reduces rendering load for large datasets

5. **Virtual Scrolling Table**
   - Only renders visible rows
   - Handles 10,000+ rows efficiently
   - Smooth scrolling at 60 FPS

6. **Performance Monitoring**
   - Real-time FPS counter
   - Average render time tracking
   - Data point count
   - Memory usage (Chrome/Edge only)

## 🔧 Configuration

### Chart Configuration

Modify `DEFAULT_CHART_CONFIG` in `app/dashboard/page.tsx`:

```typescript
const DEFAULT_CHART_CONFIG: ChartConfig = {
  width: 800,        // Chart width in pixels
  height: 400,       // Chart height in pixels
  padding: {
    top: 20,
    right: 20,
    bottom: 40,
    left: 60,
  },
  colors: {
    primary: '#3b82f6',    // Chart line/bar color
    secondary: '#8b5cf6',
    background: '#ffffff',  // Canvas background
    grid: '#e5e7eb',       // Grid line color
    text: '#374151',       // Text color
  },
};
```

### Data Generation Settings

Adjust in `hooks/useDataStream.ts`:

```typescript
generatorRef.current = new DataGenerator({
  baseValue: 100,        // Base value for data points
  trend: 0.1,           // Trend component
  noise: 5,              // Random noise level
  seasonality: 10,      // Seasonal variation
});
```

### Performance Limits

Tune in respective files:

- **`MAX_DATA_POINTS`** (`hooks/useDataStream.ts`): Maximum points in memory (default: 10,000)
- **`MAX_RENDER_POINTS`** (`hooks/useChartRenderer.ts`): Max points rendered (default: 2,000)
- **`INITIAL_DATA_COUNT`** (`hooks/useDataStream.ts`): Initial load (default: 1,000)
- **Stream Interval** (`hooks/useDataStream.ts`): Update frequency (default: 100ms)

## 📈 Performance Targets

- ✅ **60 FPS** during real-time updates
- ✅ **< 100ms** response time for interactions
- ✅ **Handle 10,000+ points** without UI freezing
- ✅ **Memory efficient** - automatic cleanup prevents leaks
- ✅ **Bundle size** - Optimized Next.js production build

## 🐛 Troubleshooting

### Low FPS

**Symptoms**: FPS drops below 55, choppy animations

**Solutions**:
1. Reduce `MAX_RENDER_POINTS` in `hooks/useChartRenderer.ts`
2. Enable aggregation to reduce data points
3. Check browser DevTools Performance tab for bottlenecks
4. Close other browser tabs/applications
5. Check if hardware acceleration is enabled in browser

### High Memory Usage

**Symptoms**: Memory continuously grows, browser becomes slow

**Solutions**:
1. Reduce `MAX_DATA_POINTS` in `hooks/useDataStream.ts`
2. Clear filters periodically
3. Restart the stream if memory grows continuously
4. Check for memory leaks in DevTools Memory tab
5. Use aggregation for very large datasets

### Canvas Not Rendering

**Symptoms**: Charts appear blank or don't update

**Solutions**:
1. Check browser console for errors
2. Verify canvas context is available (check browser compatibility)
3. Ensure chart dimensions are valid (> 0)
4. Check if canvas element is properly mounted
5. Verify data array is not empty

### Build Errors

**Symptoms**: `npm run build` fails

**Solutions**:
1. Clear `.next` directory: `rm -rf .next`
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Check TypeScript errors: `npm run build` (errors will be shown)
4. Verify Node.js version: `node --version` (should be 18+)

## 📝 Development Notes

### Adding New Chart Types

1. Create component in `components/charts/`
2. Add rendering method in `lib/canvasUtils.ts`
3. Update `useChartRenderer.ts` switch statement
4. Add to chart type selector in dashboard

### Extending Data Generator

Modify `lib/dataGenerator.ts` to add:
- New data patterns
- Custom aggregation methods
- Additional metadata fields

### Performance Monitoring

The `usePerformanceMonitor` hook tracks:
- FPS (frames per second)
- Render time (milliseconds)
- Data point count
- Memory usage (when available)

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Web Performance](https://web.dev/performance/)

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

For performance-related contributions, please include:
- Performance benchmarks
- Before/after metrics
- Explanation of optimization technique
