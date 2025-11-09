'use client';

import React, { useState, useCallback, memo } from 'react';
import { FilterOptions } from '@/lib/types';

interface FilterPanelProps {
  onFilterChange: (filters: FilterOptions) => void;
  availableCategories?: string[];
}

const FilterPanel: React.FC<FilterPanelProps> = memo(({ onFilterChange, availableCategories = [] }) => {
  const [filters, setFilters] = useState<FilterOptions>({});

  const handleCategoryChange = useCallback((category: string, checked: boolean) => {
    setFilters((prev) => {
      const categories = prev.categories || [];
      const newCategories = checked
        ? [...categories, category]
        : categories.filter((c) => c !== category);
      const newFilters = { ...prev, categories: newCategories.length > 0 ? newCategories : undefined };
      onFilterChange(newFilters);
      return newFilters;
    });
  }, [onFilterChange]);

  const handleMinValueChange = useCallback((value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setFilters((prev) => {
      const newFilters = { ...prev, minValue: numValue };
      onFilterChange(newFilters);
      return newFilters;
    });
  }, [onFilterChange]);

  const handleMaxValueChange = useCallback((value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setFilters((prev) => {
      const newFilters = { ...prev, maxValue: numValue };
      onFilterChange(newFilters);
      return newFilters;
    });
  }, [onFilterChange]);

  return (
    <div className="bg-gray-100 p-4 rounded-lg space-y-4">
      <h3 className="font-semibold text-lg">Filters</h3>

      {/* Category Filter */}
      {availableCategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Categories</label>
          <div className="space-y-2">
            {availableCategories.map((category) => (
              <label key={category} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.categories?.includes(category) || false}
                  onChange={(e) => handleCategoryChange(category, e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">{category}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Value Range Filter */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Min Value</label>
          <input
            type="number"
            value={filters.minValue ?? ''}
            onChange={(e) => handleMinValueChange(e.target.value)}
            className="w-full px-2 py-1 border rounded"
            placeholder="Min"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max Value</label>
          <input
            type="number"
            value={filters.maxValue ?? ''}
            onChange={(e) => handleMaxValueChange(e.target.value)}
            className="w-full px-2 py-1 border rounded"
            placeholder="Max"
          />
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => {
          setFilters({});
          onFilterChange({});
        }}
        className="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
      >
        Clear Filters
      </button>
    </div>
  );
});

FilterPanel.displayName = 'FilterPanel';

export default FilterPanel;

