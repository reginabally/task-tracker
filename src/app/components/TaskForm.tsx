'use client';

import { useState, KeyboardEvent } from 'react';

const TASK_TYPES = [
  "Slack Ping",
  "P2 Activity",
  "Project Work",
  "Tool/Workflow Improvement",
  "Learning",
  "Personal",
  "Others"
] as const;

type TaskType = typeof TASK_TYPES[number];

interface TaskFormData {
  description: string;
  type: TaskType;
  tags: string[];
  date: string;
  link: string;
}

export default function TaskForm() {
  const [formData, setFormData] = useState<TaskFormData>({
    description: '',
    type: TASK_TYPES[0],
    tags: [],
    date: new Date().toISOString().split('T')[0],
    link: ''
  });
  
  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      
      // Only add the tag if it's not already in the list
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(JSON.stringify(formData, null, 2));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 text-base text-gray-900 placeholder-gray-500"
          placeholder="Enter task description"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Type
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 text-base text-gray-900"
        >
          {TASK_TYPES.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Tags
        </label>
        <div className="mt-1">
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map(tag => (
              <div 
                key={tag} 
                className="group flex items-center bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1.5 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleTagKeyDown}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 text-base text-gray-900 placeholder-gray-500"
            placeholder="Type a tag and press Enter"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 text-base text-gray-900"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="link" className="block text-sm font-medium text-gray-700">
          Link
        </label>
        <input
          type="url"
          id="link"
          name="link"
          value={formData.link}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 text-base text-gray-900 placeholder-gray-500"
          placeholder="Enter URL (optional)"
        />
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Submit Task
      </button>
    </form>
  );
} 