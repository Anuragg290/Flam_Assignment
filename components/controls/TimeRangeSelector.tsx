'use client';

import React, { useState, useCallback, memo, useMemo } from 'react';
import { TimeRange, AggregationPeriod } from '@/lib/types';
import { AGGREGATION_PERIODS } from '@/lib/dataGenerator';

interface TimeRangeSelectorProps {
  dataStartTime: number;
  dataEndTime: number;
  onTimeRangeChange: (range: TimeRange) => void;
  onAggregationChange: (period: AggregationPeriod | null) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = memo(
  ({ dataStartTime, dataEndTime, onTimeRangeChange, onAggregationChange }) => {
    const [selectedRange, setSelectedRange] = useState<TimeRange>({
      start: dataStartTime,
      end: dataEndTime,
    });
    const [selectedAggregation, setSelectedAggregation] = useState<AggregationPeriod | null>(null);

    const handleStartTimeChange = useCallback(
      (value: string) => {
        const timestamp = new Date(value).getTime();
        setSelectedRange((prev) => {
          const newRange = { ...prev, start: timestamp };
          onTimeRangeChange(newRange);
          return newRange;
        });
      },
      [onTimeRangeChange]
    );

    const handleEndTimeChange = useCallback(
      (value: string) => {
        const timestamp = new Date(value).getTime();
        setSelectedRange((prev) => {
          const newRange = { ...prev, end: timestamp };
          onTimeRangeChange(newRange);
          return newRange;
        });
      },
      [onTimeRangeChange]
    );

    const handleAggregationChange = useCallback(
      (period: AggregationPeriod | null) => {
        setSelectedAggregation(period);
        onAggregationChange(period);
      },
      [onAggregationChange]
    );

    const startDateString = useMemo(
      () => new Date(selectedRange.start).toISOString().slice(0, 16),
      [selectedRange.start]
    );
    const endDateString = useMemo(
      () => new Date(selectedRange.end).toISOString().slice(0, 16),
      [selectedRange.end]
    );
    const dataStartDateString = useMemo(
      () => new Date(dataStartTime).toISOString().slice(0, 16),
      [dataStartTime]
    );
    const dataEndDateString = useMemo(
      () => new Date(dataEndTime).toISOString().slice(0, 16),
      [dataEndTime]
    );

    return (
      <div className="bg-gray-100 p-4 rounded-lg space-y-4">
        <h3 className="font-semibold text-lg">Time Range</h3>

        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="datetime-local"
              value={startDateString}
              min={dataStartDateString}
              max={dataEndDateString}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              className="w-full px-2 py-1 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input
              type="datetime-local"
              value={endDateString}
              min={dataStartDateString}
              max={dataEndDateString}
              onChange={(e) => handleEndTimeChange(e.target.value)}
              className="w-full px-2 py-1 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Aggregation</label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="aggregation"
                checked={selectedAggregation === null}
                onChange={() => handleAggregationChange(null)}
                className="rounded"
              />
              <span className="text-sm">None</span>
            </label>
            {AGGREGATION_PERIODS.map((period) => (
              <label key={period.label} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="aggregation"
                  checked={selectedAggregation?.label === period.label}
                  onChange={() => handleAggregationChange(period)}
                  className="rounded"
                />
                <span className="text-sm">{period.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            const resetRange = { start: dataStartTime, end: dataEndTime };
            setSelectedRange(resetRange);
            onTimeRangeChange(resetRange);
            setSelectedAggregation(null);
            onAggregationChange(null);
          }}
          className="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Reset to Full Range
        </button>
      </div>
    );
  }
);

TimeRangeSelector.displayName = 'TimeRangeSelector';

export default TimeRangeSelector;

