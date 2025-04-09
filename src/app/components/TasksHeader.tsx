'use client';

export default function TasksHeader() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Task Tracker</h1>
        <p className="mt-2 text-sm text-gray-600">
          Add and manage your daily tasks and activities
        </p>
      </div>
    </div>
  );
} 