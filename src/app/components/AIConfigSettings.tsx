'use client';

import { useState, useEffect } from 'react';
import { 
  getOpenAIApiKey, 
  updateOpenAIApiKey,
  getLMStudioEndpoint,
  updateLMStudioEndpoint,
  getOpenAIEndpoint,
  updateOpenAIEndpoint
} from '@/app/settings/actions';

export default function AIConfigSettings() {
  const [apiKey, setApiKey] = useState<string>('');
  const [lmStudioEndpoint, setLMStudioEndpoint] = useState<string>('');
  const [openAIEndpoint, setOpenAIEndpoint] = useState<string>('https://api.openai.com/v1/chat/completions');
  const [isEditingOpenAIEndpoint, setIsEditingOpenAIEndpoint] = useState(false);
  const [isEditingLMStudioEndpoint, setIsEditingLMStudioEndpoint] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lmEndpointLoading, setLMEndpointLoading] = useState(false);
  const [openAIEndpointLoading, setOpenAIEndpointLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [lmStatusMessage, setLMStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [openAIEndpointMessage, setOpenAIEndpointMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Load settings when the page loads
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load OpenAI API key
        const { value: apiKeyValue } = await getOpenAIApiKey();
        if (apiKeyValue) {
          setApiKey(apiKeyValue);
        }

        // Load OpenAI endpoint
        const { value: openAIEndpointValue } = await getOpenAIEndpoint();
        if (openAIEndpointValue) {
          setOpenAIEndpoint(openAIEndpointValue);
        } else {
          // Set default value if not found
          setOpenAIEndpoint('https://api.openai.com/v1/chat/completions');
        }

        // Load LM Studio endpoint
        const { value: endpointValue } = await getLMStudioEndpoint();
        if (endpointValue) {
          setLMStudioEndpoint(endpointValue);
        } else {
          // Set default value if not found
          setLMStudioEndpoint('http://localhost:1234/v1/chat/completions');
        }
      } catch {
        setStatusMessage({
          type: 'error',
          text: 'Failed to load AI configuration settings'
        });
      }
    };

    loadSettings();
  }, []);

  const handleSaveApiKey = async () => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const result = await updateOpenAIApiKey(apiKey);
      
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
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'An unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOpenAIEndpoint = async () => {
    setOpenAIEndpointLoading(true);
    setOpenAIEndpointMessage(null);

    try {
      const result = await updateOpenAIEndpoint(openAIEndpoint);
      
      if (result.success) {
        setOpenAIEndpointMessage({
          type: 'success',
          text: result.message
        });
        setIsEditingOpenAIEndpoint(false);
      } else {
        setOpenAIEndpointMessage({
          type: 'error',
          text: result.message
        });
      }
    } catch {
      setOpenAIEndpointMessage({
        type: 'error',
        text: 'An unexpected error occurred'
      });
    } finally {
      setOpenAIEndpointLoading(false);
    }
  };

  const handleSaveLMStudioEndpoint = async () => {
    setLMEndpointLoading(true);
    setLMStatusMessage(null);

    try {
      const result = await updateLMStudioEndpoint(lmStudioEndpoint);
      
      if (result.success) {
        setLMStatusMessage({
          type: 'success',
          text: result.message
        });
        setIsEditingLMStudioEndpoint(false);
      } else {
        setLMStatusMessage({
          type: 'error',
          text: result.message
        });
      }
    } catch {
      setLMStatusMessage({
        type: 'error',
        text: 'An unexpected error occurred'
      });
    } finally {
      setLMEndpointLoading(false);
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
        <h2 className="text-xl font-semibold text-gray-800">AI Configuration</h2>
      </div>
      
      <div className="max-w-lg space-y-8">
        {/* OpenAI API Key Section */}
        <div className="pt-2">
          <h4 className="text-md font-medium text-gray-900 mb-2">OpenAI API Key</h4>
          <p className="text-sm text-gray-600 mb-4">
            Configure your OpenAI API key to enable AI features in the Task Tracker.
            Your API key is securely stored and only used for generating task summaries and insights.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <div>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="sk-..."
                  disabled={isLoading}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                You can find your API key in your OpenAI account dashboard.
              </p>
            </div>
            
            <div>
              <button
                type="button"
                onClick={handleSaveApiKey}
                disabled={isLoading || !apiKey.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save API Key'}
              </button>
            </div>
          </div>
        </div>

        {/* OpenAI API Endpoint Section */}
        <div className="border-t border-gray-200 pt-6">
          {openAIEndpointMessage && (
            <div className={`mb-4 p-3 rounded-md text-sm ${
              openAIEndpointMessage.type === 'success' 
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {openAIEndpointMessage.text}
            </div>
          )}

          <h4 className="text-md font-medium text-gray-900 mb-2">OpenAI API Endpoint</h4>
          <p className="text-sm text-gray-600 mb-4">
            The API endpoint used for OpenAI requests. Typically you won&apos;t need to change this 
            unless you&apos;re using a proxy or custom deployment.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endpoint URL
              </label>
              <div className="relative">
                {isEditingOpenAIEndpoint ? (
                  <input
                    type="text"
                    value={openAIEndpoint}
                    onChange={(e) => setOpenAIEndpoint(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="https://api.openai.com/v1/chat/completions"
                    disabled={openAIEndpointLoading}
                  />
                ) : (
                  <div className="flex items-center">
                    <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700 text-sm overflow-x-auto">
                      {openAIEndpoint}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingOpenAIEndpoint(true)}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      title="Edit endpoint"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {isEditingOpenAIEndpoint && (
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleSaveOpenAIEndpoint}
                  disabled={openAIEndpointLoading || !openAIEndpoint.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {openAIEndpointLoading ? 'Saving...' : 'Save Endpoint'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingOpenAIEndpoint(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* LM Studio Endpoint Section */}
        <div className="border-t border-gray-200 pt-6">
          {lmStatusMessage && (
            <div className={`mb-4 p-3 rounded-md text-sm ${
              lmStatusMessage.type === 'success' 
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {lmStatusMessage.text}
            </div>
          )}

          <h4 className="text-md font-medium text-gray-900 mb-2">LM Studio Configuration</h4>
          <p className="text-sm text-gray-600 mb-4">
            Configure the endpoint for your local LM Studio instance. 
            This is used when generating AI summaries with locally hosted models.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LM Studio API Endpoint
              </label>
              <div className="relative">
                {isEditingLMStudioEndpoint ? (
                  <input
                    type="text"
                    value={lmStudioEndpoint}
                    onChange={(e) => setLMStudioEndpoint(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="http://localhost:1234/v1/chat/completions"
                    disabled={lmEndpointLoading}
                  />
                ) : (
                  <div className="flex items-center">
                    <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700 text-sm overflow-x-auto">
                      {lmStudioEndpoint}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingLMStudioEndpoint(true)}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      title="Edit endpoint"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                This should be the full URL to your LM Studio chat completions endpoint.
              </p>
            </div>
            
            {isEditingLMStudioEndpoint && (
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleSaveLMStudioEndpoint}
                  disabled={lmEndpointLoading || !lmStudioEndpoint.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {lmEndpointLoading ? 'Saving...' : 'Save Endpoint'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingLMStudioEndpoint(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 