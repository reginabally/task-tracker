'use client';

import { useState } from 'react';

interface CollapsibleTextProps {
  text: string;
  maxLines?: number;
  collapsible?: boolean;
}

export default function CollapsibleText({ text, maxLines = 5, collapsible = true }: CollapsibleTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const lines = text.split('\n');
  const hasMoreLines = collapsible && lines.length > maxLines;
  const displayLines = isExpanded || !collapsible ? lines : lines.slice(0, maxLines);

  return (
    <div className="relative">
      <div className="whitespace-pre-wrap text-gray-900">
        {displayLines.join('\n')}
      </div>
      {hasMoreLines && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 flex items-center text-sm text-purple-600 hover:text-purple-700"
        >
          {isExpanded ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Show Less
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Show More
            </>
          )}
        </button>
      )}
    </div>
  );
} 