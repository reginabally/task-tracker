'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchTasks, getLockedReportingPeriodAction } from '@/app/tasks/actions';
import { generateReportHTML } from '@/app/tasks/report';
import ReportView from '@/app/components/ReportView';

export default function ReportPage() {
  const [reportHTML, setReportHTML] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const generateReport = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get the current reporting period
        const { periodStart, periodEnd } = await getLockedReportingPeriodAction();
        
        // Fetch tasks for the current reporting period
        const tasks = await fetchTasks({
          startDate: periodStart,
          endDate: periodEnd
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
  }, []);

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
    <div className="container mx-auto px-4 py-8">
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
    </div>
  );
} 