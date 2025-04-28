'use client';

import { useState, useEffect } from 'react';
import { getOpenAIApiKey, getLMStudioEndpoint, getOpenAIEndpoint } from '@/app/settings/actions';

// Default fallback endpoint for OpenAI (used only if not found in settings)
const DEFAULT_OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

interface AIChatBoxProps {
  prompt: string;
  content: string;
  previousFeedback?: string | null;
  onEdit?: (newContent: string) => void;
  onPromptEdit?: (newPrompt: string) => void;
  onSendToAI?: (response: string) => void;
  onLoadingStateChange?: (loading: boolean) => void;
  selectedModel?: 'lm-studio' | 'openai-gpt4o';
}

export default function AIChatBox({ 
  prompt, 
  content, 
  previousFeedback = null,
  onEdit, 
  onPromptEdit, 
  onSendToAI, 
  onLoadingStateChange,
  selectedModel = 'openai-gpt4o'
}: AIChatBoxProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(prompt);
  const [editedContent, setEditedContent] = useState(content);
  const [isLoading, setIsLoading] = useState(false);
  const [openAIApiKey, setOpenAIApiKey] = useState<string>('');
  const [lmStudioEndpoint, setLMStudioEndpoint] = useState<string>('http://localhost:1234/v1/chat/completions');
  const [openAIEndpoint, setOpenAIEndpoint] = useState<string>(DEFAULT_OPENAI_ENDPOINT);
  
  // Fetch API settings from the Settings table
  useEffect(() => {
    const fetchAPISettings = async () => {
      try {
        // Always fetch both endpoints regardless of selected model
        const { value: lmEndpoint } = await getLMStudioEndpoint();
        if (lmEndpoint) {
          setLMStudioEndpoint(lmEndpoint);
        }
        
        const { value: oaiEndpoint } = await getOpenAIEndpoint();
        if (oaiEndpoint) {
          setOpenAIEndpoint(oaiEndpoint);
        }
        
        // Fetch OpenAI API key if that model is selected
        if (selectedModel === 'openai-gpt4o') {
          const { value } = await getOpenAIApiKey();
          setOpenAIApiKey(value || '');
        }
      } catch (error) {
        console.error('Error fetching API settings:', error);
      }
    };
    
    fetchAPISettings();
  }, [selectedModel]);

  // Update edited content when content prop changes
  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  // Update edited prompt when prompt prop changes
  useEffect(() => {
    setEditedPrompt(prompt);
  }, [prompt]);

  // Update loading state in parent component
  useEffect(() => {
    if (onLoadingStateChange) {
      onLoadingStateChange(isLoading);
    }
  }, [isLoading, onLoadingStateChange]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onEdit) {
      // Pass the edited content back to the parent
      onEdit(editedContent);
    }
    
    if (onPromptEdit) {
      // Pass the edited prompt back to the parent
      onPromptEdit(editedPrompt);
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPrompt(prompt);
    setEditedContent(content);
    setIsEditing(false);
  };

  const handleSendToAI = async () => {
    if (!onSendToAI) return;
    
    setIsLoading(true);
    
    try {
      // Replace the placeholders with the actual content
      let finalPrompt = editedPrompt.replace('%TASK_SUMMARY%', editedContent);
      
      // Replace the previous feedback placeholder if available
      if (previousFeedback) {
        finalPrompt = finalPrompt.replace('%SUMMARIZED_PREVIOUS_FEEDBACK%', previousFeedback);
      } else {
        // If no previous feedback, remove the section
        finalPrompt = finalPrompt.replace(/Here is a brief summary of my previous HR feedback, to use as context:\n%SUMMARIZED_PREVIOUS_FEEDBACK%\n\n/g, '');
      }
      
      // Determine which API endpoint to use based on selected model
      const endpoint = selectedModel === 'lm-studio' ? lmStudioEndpoint : openAIEndpoint;
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
              content: finalPrompt
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
              content: finalPrompt
            }
          ],
          temperature: 0.7,
        });
      }
      
      // Call the API
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          endpoint,
          hasApiKey: selectedModel === 'openai-gpt4o' ? !!openAIApiKey : 'N/A',
        });
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'No response from AI';
      
      // Pass the AI response back to the parent
      onSendToAI(aiResponse);
    } catch (error: unknown) {
      console.error(`Error calling ${selectedModel} API:`, error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Provide more specific error messages based on error type
      if (selectedModel === 'openai-gpt4o') {
        if (!openAIApiKey) {
          alert('OpenAI API key is missing. Please go to Settings → AI Config to add your API key.');
        } else if (errorMessage.includes('401')) {
          alert('OpenAI API authentication failed. Please check that your API key is valid and properly formatted.');
        } else {
          alert(`Failed to get AI summary from OpenAI: ${errorMessage}`);
        }
      } else {
        alert(`Failed to get AI summary from LM Studio. Make sure LM Studio is running and the API endpoint is accessible at ${lmStudioEndpoint}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-500 mb-1">AI Assistant</div>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
                <textarea
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  rows={3}
                  placeholder="Enter your prompt with placeholders like %TASK_SUMMARY% and %SUMMARIZED_PREVIOUS_FEEDBACK%"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Summary</label>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  rows={4}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1 text-sm text-white bg-purple-600 rounded-md hover:bg-purple-700"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="text-gray-900 whitespace-pre-wrap pr-16">{editedPrompt}</div>
              <div className="absolute top-0 right-0 flex space-x-2">
                <button
                  onClick={handleSendToAI}
                  disabled={isLoading}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Send to AI for summarization"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={handleEdit}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Edit prompt and content"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 