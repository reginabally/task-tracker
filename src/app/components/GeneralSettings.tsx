'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { getReportingPeriodSettings, updateReportingPeriod } from '@/app/settings/actions';

export default function GeneralSettings() {
  const [reportStartDate, setReportStartDate] = useState<Date>(new Date());
  const [nextReportDate, setNextReportDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Load the current reporting period settings when the page loads
  useEffect(() => {
    const loadReportingPeriodSettings = async () => {
      try {
        const { periodStart, nextStartDate } = await getReportingPeriodSettings();
        setReportStartDate(new Date(periodStart));
        setNextReportDate(new Date(nextStartDate));
      } catch (error) {
        console.error('Error loading reporting period settings:', error);
        setStatusMessage({
          type: 'error',
          text: 'Failed to load reporting period settings'
        });
      }
    };

    loadReportingPeriodSettings();
  }, []);

  // Calculate the next report date when the start date changes
  useEffect(() => {
    if (reportStartDate) {
      const nextDate = new Date(reportStartDate);
      nextDate.setDate(reportStartDate.getDate() + 14);
      setNextReportDate(nextDate);
    }
  }, [reportStartDate]);

  const handleSaveReportingPeriod = async () => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const result = await updateReportingPeriod(reportStartDate);
      
      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: result.message
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: result.message
        });
      }
    } catch (error) {
      console.error('Error saving reporting period settings:', error);
      setStatusMessage({
        type: 'error',
        text: 'An unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-md shadow p-6">
      {statusMessage && (
        <div className={`mb-6 p-4 rounded-md ${
          statusMessage.type === 'success' 
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {statusMessage.text}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">General Settings</h2>
      </div>
      
      <div className="max-w-lg">
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-2">Reporting Period</h4>
          <p className="text-sm text-gray-600 mb-4">
            Configure the start date for your reporting period. Each period lasts 14 days,
            starting on the selected date and ending 13 days later.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Start Date
              </label>
              <div className="max-w-xs">
                <DatePicker
                  selected={reportStartDate}
                  onChange={(date: Date | null) => date && setReportStartDate(date)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  dateFormat="MMMM d, yyyy"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            {nextReportDate && (
              <div className="text-sm text-gray-600">
                <p>Next period will start on: <span className="font-medium">{format(nextReportDate, 'MMMM d, yyyy')}</span></p>
                <p className="mt-1">
                  Current period: <span className="font-medium">{format(reportStartDate, 'MMMM d, yyyy')}</span> to <span className="font-medium">
                    {format(new Date(reportStartDate.getTime() + 13 * 24 * 60 * 60 * 1000), 'MMMM d, yyyy')}
                  </span>
                </p>
              </div>
            )}
            
            <div>
              <button
                type="button"
                onClick={handleSaveReportingPeriod}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Report Period'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 