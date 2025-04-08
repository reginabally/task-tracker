'use client';

import { useRouter } from 'next/navigation';

export default function TasksHeader() {
  const router = useRouter();

  const handleGenerateReport = () => {
    router.push('/report');
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Task Tracker</h1>
        <p className="mt-2 text-sm text-gray-600">
          Add and manage your daily tasks and activities
        </p>
      </div>
      <button
        onClick={handleGenerateReport}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Generate Report
      </button>
    </div>
  );
} 