'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GeneralSettings from '../components/GeneralSettings';
import CategoriesSettings from '../components/CategoriesSettings';
import TagsSettings from '../components/TagsSettings';
import AutomationSettings from '../components/AutomationSettings';

type TabType = 'general' | 'categories' | 'tags' | 'automation';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('general');

  // Function to navigate back to tasks page
  const goToTasksPage = () => {
    router.push('/tasks');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
        <button 
          onClick={goToTasksPage}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Back to Tasks
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-3 font-medium text-sm mr-8 border-b-2 whitespace-nowrap ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-3 font-medium text-sm mr-8 border-b-2 whitespace-nowrap ${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('tags')}
              className={`px-4 py-3 font-medium text-sm mr-8 border-b-2 whitespace-nowrap ${
                activeTab === 'tags'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tags
            </button>
            <button
              onClick={() => setActiveTab('automation')}
              className={`px-4 py-3 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'automation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Automation
            </button>
          </nav>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'categories' && <CategoriesSettings />}
          {activeTab === 'tags' && <TagsSettings />}
          {activeTab === 'automation' && <AutomationSettings />}
        </div>
      </div>
    </div>
  );
} 