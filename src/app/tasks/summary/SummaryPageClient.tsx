'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import AIChatBox from '@/app/components/AIChatBox';
import CollapsibleText from '@/app/components/CollapsibleText';
import ApiKeyCheck from '@/app/components/ApiKeyCheck';
import { format } from 'date-fns';
import { getOpenAIApiKey } from '@/app/settings/actions';

// Model options type
type AIModel = 'lm-studio' | 'openai-gpt4o';

// Environment variables (these will be loaded by Next.js at build time)
const LM_STUDIO_API_ENDPOINT = process.env.NEXT_PUBLIC_LM_STUDIO_API_ENDPOINT || 'http://localhost:1234/v1/chat/completions';
const OPENAI_API_ENDPOINT = process.env.NEXT_PUBLIC_OPENAI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';

export default function SummaryPageClient({
  initialTextReport,
}: {
  initialTextReport: string;
}) {
  const [plainTextReport, setPlainTextReport] = useState(initialTextReport);
  const [aiResponse, setAIResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [previousFeedback, setPreviousFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>('openai-gpt4o');
  const [openAIApiKey, setOpenAIApiKey] = useState<string>('');
  
  const [aiPrompt, setAiPrompt] = useState(`You are a helpful assistant summarizing a work report for an HR self-feedback draft.

Here are the activities:
%TASK_SUMMARY%

Generate a short summary paragraph in first-person voice, organized into the following sections:
- Summary
- Growth
- Achievements
- Future Goals`);
  
  // Fetch the OpenAI API key from the Settings table
  useEffect(() => {
    const fetchOpenAIApiKey = async () => {
      try {
        const { value } = await getOpenAIApiKey();
        setOpenAIApiKey(value || '');
      } catch (error) {
        console.error('Error fetching OpenAI API key:', error);
      }
    };
    
    fetchOpenAIApiKey();
  }, []);
  
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

  // Handle loading state
  const handleLoadingState = (loading: boolean) => {
    setIsLoading(loading);
  };

  // Handle model selection change
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value as AIModel);
  };

  // Handle file selection
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Process uploaded file
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.md')) {
      setFeedbackError('Please upload a Markdown (.md) file');
      return;
    }

    setFeedbackLoading(true);
    setFeedbackError(null);

    try {
      // Read the file content
      const fileContent = await readFileContent(file);
      
      // Parse and clean the markdown content
      const parsedContent = fileContent.trim();
      
      // Call API to summarize previous feedback
      const summarizedFeedback = await summarizePreviousFeedback(parsedContent);
      
      // Update the AI prompt to include the previous feedback summary
      const updatedPrompt = `You are a helpful assistant summarizing a work report for an HR self-feedback draft.

Here are the activities:
%TASK_SUMMARY%

Here is a brief summary of my previous HR feedback, to use as context:
%SUMMARIZED_PREVIOUS_FEEDBACK%

Generate a short summary paragraph in first-person voice, organized into the following sections:
- Summary
- Growth
- Achievements
- Future Goals`;

      setAiPrompt(updatedPrompt);

      // Keep track of the feedback separately
      setPreviousFeedback(summarizedFeedback);

    } catch (error) {
      console.error('Error processing feedback file:', error);
      setFeedbackError('Failed to process the feedback file. Please try again.');
    } finally {
      setFeedbackLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Read file content as text
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      reader.onerror = () => reject(new Error('File reading error'));
      reader.readAsText(file);
    });
  };

  // Summarize previous feedback using AI
  const summarizePreviousFeedback = async (text: string): Promise<string> => {
    const prompt = `You are a system that extracts key points from HR performance review self-assessment feedback.
Here is the previous feedback document:
${text}

Your task is to extract the most important points and areas of focus from this feedback, in a very concise bullet point format.
Focus on:
- Areas mentioned for improvement
- Key achievements and strengths
- Any specific goals mentioned

Keep your response under 150 words total, focusing only on the most important information.`;

    try {
      const endpoint = selectedModel === 'lm-studio' ? LM_STUDIO_API_ENDPOINT : OPENAI_API_ENDPOINT;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add authentication for OpenAI
      if (selectedModel === 'openai-gpt4o') {
        if (!openAIApiKey) {
          throw new Error('OpenAI API key is missing');
        }
        headers['Authorization'] = `Bearer ${openAIApiKey}`;
      }
      
      // Prepare the body based on the selected model
      let body;
      if (selectedModel === 'lm-studio') {
        body = JSON.stringify({
          model: 'meta-llama-3.1-8b-instruct',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
        });
      } else {
        body = JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
        });
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body,
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0]?.message?.content.trim() || 'No response from AI';
    } catch (error) {
      console.error(`Error calling ${selectedModel} API for feedback summarization:`, error);
      throw new Error(`Failed to summarize previous feedback using ${selectedModel}`);
    }
  };

  // Handle downloading the AI response as markdown
  const handleDownload = () => {
    if (!aiResponse) return;
    
    // Create filename with current date
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    const filename = `ai-summary-${currentDate}.md`;
    
    // Create the markdown content
    const markdownContent = `# AI Summary - ${currentDate}\n\n${aiResponse}`;
    
    // Create a blob for download
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and trigger click
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
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
          {/* API Key Check */}
          <ApiKeyCheck />
          
          {/* AI Model Selection Dropdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">AI Model Selection</h2>
            <div className="max-w-xs">
              <label htmlFor="model-selector" className="block text-sm font-medium text-gray-700 mb-1">
                Select AI Model
              </label>
              <select
                id="model-selector"
                value={selectedModel}
                onChange={handleModelChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md text-gray-900"
              >
                <option value="lm-studio" className="text-gray-900">LM Studio</option>
                <option value="openai-gpt4o" className="text-gray-900">OpenAI (GPT-4o)</option>
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Choose the AI model you want to use for generating summaries.
              </p>
            </div>
          </div>

          {/* AI Chat Box */}
          <AIChatBox
            prompt={aiPrompt}
            content={plainTextReport || 'No tasks found for the current reporting period.'}
            previousFeedback={previousFeedback}
            onEdit={handleContentEdit}
            onPromptEdit={handlePromptEdit}
            onSendToAI={handleAIResponse}
            onLoadingStateChange={handleLoadingState}
            selectedModel={selectedModel}
          />

          {/* Previous Feedback File Upload Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Upload Previous HR Self-Feedback</h2>
            <p className="text-sm text-gray-600 mb-4">
              Upload a previous HR self-feedback .md file to include as context in your new summary (optional)
            </p>
            
            <div className="flex items-center space-x-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".md"
                className="hidden"
              />
              <button
                onClick={handleFileSelect}
                disabled={feedbackLoading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                {feedbackLoading ? 'Processing...' : 'Upload Previous Feedback'}
              </button>
            </div>
            
            {feedbackLoading && (
              <div className="mt-3 flex items-center text-sm text-gray-600">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Summarizing previous feedback...
              </div>
            )}
            
            {feedbackError && (
              <div className="mt-3 text-sm text-red-600">
                {feedbackError}
              </div>
            )}
            
            {previousFeedback && !feedbackLoading && !feedbackError && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <div className="text-sm font-medium text-gray-700 mb-1">Previous Feedback Summary:</div>
                <div className="text-sm text-gray-600 whitespace-pre-wrap">
                  {previousFeedback}
                </div>
              </div>
            )}
          </div>

          {/* Show AI Response if available, otherwise show Plain Text Summary */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {isLoading ? 'AI Summary Response' : (aiResponse ? 'AI Summary Response' : 'Plain Text Summary')}
                </h2>
                {aiResponse && !isLoading && (
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download as Markdown
                  </button>
                )}
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center space-y-4">
                    <svg className="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">AI is processing your request...</p>
                  </div>
                </div>
              ) : (
                <CollapsibleText 
                  text={aiResponse || plainTextReport || 'No tasks found for the current reporting period.'} 
                  collapsible={!aiResponse}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 