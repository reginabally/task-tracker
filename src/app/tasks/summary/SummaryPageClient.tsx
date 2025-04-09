'use client';

import { useState } from 'react';
import Link from 'next/link';
import AIChatBox from '@/app/components/AIChatBox';
import CollapsibleText from '@/app/components/CollapsibleText';

export default function SummaryPageClient({
  initialTextReport,
}: {
  initialTextReport: string;
}) {
  const [plainTextReport, setPlainTextReport] = useState(initialTextReport);
  const [aiResponse, setAIResponse] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("You are a helpful assistant summarizing a work report for an HR feedback draft. Here are the activities: %TASK_SUMMARY% Generate a short summary paragraph in first-person voice.");
  
  // Handle edits to the task summary content
  const handleContentEdit = (newContent: string) => {
    setPlainTextReport(newContent);
  };

  // Handle prompt edits
  const handlePromptEdit = (newPrompt: string) => {
    setAiPrompt(newPrompt);
  };

  // Handle AI response
  const handleAIResponse = (response: string) => {
    setAIResponse(response);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/tasks"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Tasks
          </Link>
        </div>

        <div className="space-y-6">
          {/* AI Chat Box */}
          <AIChatBox
            prompt={aiPrompt}
            content={plainTextReport || 'No tasks found for the current reporting period.'}
            onEdit={handleContentEdit}
            onPromptEdit={handlePromptEdit}
            onSendToAI={handleAIResponse}
          />

          {/* Show AI Response if available, otherwise show Plain Text Summary */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {aiResponse ? 'AI Summary Response' : 'Plain Text Summary'}
              </h2>
              <CollapsibleText text={aiResponse || plainTextReport || 'No tasks found for the current reporting period.'} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 