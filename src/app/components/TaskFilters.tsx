'use client';

import { useState, useEffect } from 'react';

interface TaskFiltersProps {
  taskTypes: { name: string; label: string; }[];
  tags: { name: string; label: string; }[];
  onFilterChange: (filters: {
    type: string;
    tag: string;
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
  initialFilters?: {
    type: string;
    tag: string;
    startDate: string;
    endDate: string;
  };
  onClearFilters?: () => void;
}

export default function TaskFilters({ 
  taskTypes, 
  tags, 
  onFilterChange,
  initialFilters = { type: '', tag: '', startDate: '', endDate: '' },
  onClearFilters
}: TaskFiltersProps) {
  const [type, setType] = useState(initialFilters.type);
  const [tag, setTag] = useState(initialFilters.tag);
  const [startDate, setStartDate] = useState<string>(initialFilters.startDate);
  const [endDate, setEndDate] = useState<string>(initialFilters.endDate);

  // Update local state when initialFilters change
  useEffect(() => {
    setType(initialFilters.type);
    setTag(initialFilters.tag);
    setStartDate(initialFilters.startDate);
    setEndDate(initialFilters.endDate);
  }, [initialFilters]);

  // Helper function to notify parent of filter changes
  const notifyFilterChange = () => {
    onFilterChange({
      type,
      tag,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    });
  };

  // Handle type change
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value);
    // We'll notify the parent after the state update
    setTimeout(notifyFilterChange, 0);
  };

  // Handle tag change
  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTag(e.target.value);
    // We'll notify the parent after the state update
    setTimeout(notifyFilterChange, 0);
  };

  // Handle date changes
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    // We'll notify the parent after the state update
    setTimeout(notifyFilterChange, 0);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    // We'll notify the parent after the state update
    setTimeout(notifyFilterChange, 0);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setType('');
    setTag('');
    setStartDate('');
    setEndDate('');
    // We'll notify the parent after the state update
    setTimeout(() => {
      onFilterChange({
        type: '',
        tag: '',
        startDate: null,
        endDate: null,
      });
      
      // Call the onClearFilters callback if provided
      if (onClearFilters) {
        onClearFilters();
      }
    }, 0);
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Filter Tasks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Type</label>
          <select
            value={type}
            onChange={handleTypeChange}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
          >
            <option value="">All Types</option>
            {taskTypes.map((t) => (
              <option key={t.name} value={t.name}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Tag</label>
          <select
            value={tag}
            onChange={handleTagChange}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
          >
            <option value="">All Tags</option>
            {tags.map((t) => (
              <option key={t.name} value={t.name}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
          />
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleClearFilters}
          className="px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
} 