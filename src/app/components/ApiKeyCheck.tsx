'use client';

import { useEffect, useState } from 'react';

export default function ApiKeyCheck() {
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'available' | 'missing'>('checking');
  
  useEffect(() => {
    // Check if API key is available
    const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    
    if (openaiKey && openaiKey.trim() !== '') {
      setApiKeyStatus('available');
    } else {
      setApiKeyStatus('missing');
    }
  }, []);

  if (apiKeyStatus === 'checking') {
    return null;
  }

  if (apiKeyStatus === 'available') {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <strong className="font-medium">OpenAI API Key Not Found</strong>
            <br />
            The OpenAI API key environment variable (NEXT_PUBLIC_OPENAI_API_KEY) was not detected. 
            <br />
            1. Make sure it&apos;s set in your .env.local file
            <br />
            2. Restart your Next.js server to apply the changes
          </p>
        </div>
      </div>
    </div>
  );
} 