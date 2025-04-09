'use client';

import { Suspense } from 'react';
import ReportContent from './ReportContent';

export default function ReportPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={
        <div className="text-center py-12">
          <p className="text-gray-500">Loading report...</p>
        </div>
      }>
        <ReportContent />
      </Suspense>
    </div>
  );
} 