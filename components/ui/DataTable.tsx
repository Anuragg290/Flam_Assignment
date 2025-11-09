'use client';

import React, { memo } from 'react';
import { DataPoint } from '@/lib/types';
import { useVirtualization } from '@/hooks/useVirtualization';

interface DataTableProps {
  data: DataPoint[];
  height?: number;
}

const DataTable: React.FC<DataTableProps> = memo(({ data, height = 400 }) => {
  const itemHeight = 40;
  const { containerRef, visibleItems, totalHeight, handleScroll } = useVirtualization<DataPoint>(
    data,
    {
      itemHeight,
      containerHeight: height,
      overscan: 5,
    }
  );

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b font-semibold grid grid-cols-4 gap-4">
        <div>Index</div>
        <div>Timestamp</div>
        <div>Value</div>
        <div>Category</div>
      </div>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{ height, overflowY: 'auto' }}
        className="relative"
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              className="px-4 py-2 border-b grid grid-cols-4 gap-4 hover:bg-gray-50"
              style={{
                position: 'absolute',
                top: index * itemHeight,
                height: itemHeight,
                width: '100%',
              }}
            >
              <div>{index}</div>
              <div className="text-sm">{formatTimestamp(item.timestamp)}</div>
              <div>{item.value.toFixed(2)}</div>
              <div>{item.category || '-'}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600">
        Showing {visibleItems.length} of {data.length} items
      </div>
    </div>
  );
});

DataTable.displayName = 'DataTable';

export default DataTable;

