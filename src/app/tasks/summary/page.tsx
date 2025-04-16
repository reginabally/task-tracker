import { Metadata } from 'next';
import { fetchTasks, getLockedReportingPeriodAction } from '../actions';
import { generateReportHTML } from '../report';
import { extractPlainTextFromReport } from '@/app/lib/utils';
import SummaryPageClient from '@/app/tasks/summary/SummaryPageClient';

export const metadata: Metadata = {
  title: 'AI Task Summary',
  description: 'Generate AI-powered summaries of your tasks',
};

// Define interface for Next.js 15 page props
interface SummaryPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SummaryPage({ searchParams }: SummaryPageProps) {
  // Wait for searchParams to resolve
  const resolvedParams = await searchParams;
  
  // Extract filter parameters from URL
  const type = typeof resolvedParams.type === 'string' ? resolvedParams.type : undefined;
  const tag = typeof resolvedParams.tag === 'string' ? resolvedParams.tag : undefined;
  
  // Extract custom date range if present
  const startDateStr = typeof resolvedParams.startDate === 'string' ? resolvedParams.startDate : undefined;
  const endDateStr = typeof resolvedParams.endDate === 'string' ? resolvedParams.endDate : undefined;
  
  // Parse dates if provided
  const customStartDate = startDateStr ? new Date(startDateStr) : undefined;
  const customEndDate = endDateStr ? new Date(endDateStr) : undefined;
  
  // Get the current reporting period (use as fallback if no custom dates)
  const { periodStart, periodEnd } = await getLockedReportingPeriodAction();
  
  // Use custom dates if provided, otherwise use reporting period
  const startDate = customStartDate || periodStart;
  const endDate = customEndDate || periodEnd;
  
  // Fetch tasks with all applicable filters
  const tasks = await fetchTasks({ 
    type,
    tag,
    startDate,
    endDate
  });
  
  // Generate HTML report
  const htmlReport = await generateReportHTML(tasks);
  
  // Extract plain text from the report
  const plainTextReport = extractPlainTextFromReport(htmlReport);

  return (
    <SummaryPageClient 
      initialTextReport={plainTextReport} 
    />
  );
} 