'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchTasks, getLockedReportingPeriodAction } from '@/app/tasks/actions';
import { generateReportHTML } from '@/app/tasks/report';
import ReportView from '@/app/components/ReportView';

export default function ReportContent() {
  const [reportHTML, setReportHTML] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const generateReport = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let startDate: Date | undefined;
        let endDate: Date | undefined;
        let type: string | undefined;
        let tag: string | undefined;
        
        // Get filter parameters from URL
        const filter = searchParams.get('filter');
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');
        const typeParam = searchParams.get('type');
        const tagParam = searchParams.get('tag');
        
        // Set date range based on filter type
        if (filter === 'current-period') {
          // Get the current reporting period
          const { periodStart, periodEnd } = await getLockedReportingPeriodAction();
          startDate = periodStart;
          endDate = periodEnd;
        } else if (startDateParam && endDateParam) {
          // Use custom date range from URL parameters
          startDate = new Date(startDateParam);
          endDate = new Date(endDateParam);
        }
        
        // Set type and tag filters if provided
        if (typeParam) {
          type = typeParam;
        }
        
        if (tagParam) {
          tag = tagParam;
        }
        
        // Fetch tasks with the specified filters
        const tasks = await fetchTasks({
          startDate,
          endDate,
          type,
          tag
        });
        
        // Generate HTML report
        const html = generateReportHTML(tasks);
        
        // Store the generated HTML in state
        setReportHTML(html);
      } catch (err) {
        console.error('Error generating report:', err);
        setError('Failed to generate report. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    generateReport();
  }, [searchParams]);

  const handleDownloadReport = () => {
    // Create a blob from the HTML content
    const blob = new Blob([reportHTML], { type: 'text/html' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-report-${new Date().toISOString().split('T')[0]}.html`;
    
    // Append to body, click, and remove
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up the URL
    URL.revokeObjectURL(url);
  };

  const handleBackToTasks = () => {
    router.push('/tasks');
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bi-Weekly Report</h1>
        <button
          onClick={handleBackToTasks}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Back to Tasks
        </button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Generating report...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      ) : reportHTML ? (
        <ReportView 
          reportHTML={reportHTML} 
          onDownload={handleDownloadReport} 
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No report content available.</p>
        </div>
      )}
    </>
  );
} 