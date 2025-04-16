'use client';

import Link from 'next/link';
import { CiSettings } from 'react-icons/ci';

export default function TasksHeader() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Task Tracker</h1>
        <p className="mt-2 text-sm text-gray-600">
          Add and manage your daily tasks and activities
        </p>
      </div>
      
      <div className="relative group">
        <Link href="/settings" className="text-gray-500 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors">
          <CiSettings className="w-6 h-6" />
          <span className="sr-only">Settings</span>
        </Link>
        <div className="absolute right-0 top-0 -translate-y-full hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap mb-1">
          Settings
        </div>
      </div>
    </div>
  );
} 