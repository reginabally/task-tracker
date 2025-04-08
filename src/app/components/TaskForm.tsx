'use client';

import { useEffect, useState, KeyboardEvent, useRef } from 'react';
import { getAllTags, getAllTaskTypes, addTask } from '@/app/tasks/actions';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTaskContext } from '@/app/lib/TaskContext';

interface TaskType {
  name: string;
  label: string;
}

interface Tag {
  name: string;
  label: string;
}

export default function TaskForm() {
  const { triggerRefresh } = useTaskContext();
  const [formData, setFormData] = useState({
    description: '',
    type: '',
    tags: [] as string[],
    date: new Date(),
    link: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [matchingTags, setMatchingTags] = useState<Tag[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTagIndex, setSelectedTagIndex] = useState(-1);
  const tagListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [tags, types] = await Promise.all([
          getAllTags(),
          getAllTaskTypes()
        ]);
        setAllTags(tags);
        setTaskTypes(types);
      } catch (err) {
        console.error('Error loading form data:', err);
        setError('Failed to load task types and tags. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (tagInput.trim()) {
      const matches = allTags.filter(
        tag =>
          tag.label.toLowerCase().includes(tagInput.toLowerCase()) &&
          !formData.tags.includes(tag.name)
      );
      setMatchingTags(matches);
      setSelectedTagIndex(-1); // Reset selection when input changes
    } else {
      setMatchingTags([]);
      setSelectedTagIndex(-1);
    }
  }, [tagInput, allTags, formData.tags]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, date }));
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // If there's a selected tag, add it
      if (selectedTagIndex >= 0 && selectedTagIndex < matchingTags.length) {
        addTag(matchingTags[selectedTagIndex].name);
        return;
      }
      
      // Otherwise, create a new tag from the input
      if (tagInput.trim()) {
        const newTag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
        if (!formData.tags.includes(newTag)) {
          setFormData(prev => ({
            ...prev,
            tags: [...prev.tags, newTag]
          }));
        }
        setTagInput('');
        setMatchingTags([]);
        setSelectedTagIndex(-1);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedTagIndex(prev => 
        prev < matchingTags.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedTagIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setMatchingTags([]);
      setSelectedTagIndex(-1);
    }
  };

  // Scroll the selected item into view
  useEffect(() => {
    if (selectedTagIndex >= 0 && tagListRef.current) {
      const selectedElement = tagListRef.current.children[selectedTagIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedTagIndex]);

  const addTag = (tagName: string) => {
    if (!formData.tags.includes(tagName)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagName]
      }));
    }
    setTagInput('');
    setMatchingTags([]);
    setSelectedTagIndex(-1);
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if the task has only a Slack link and a date
      const isSlackLink = formData.link.startsWith('https://a8c.slack.com');
      const hasOnlySlackLinkAndDate = isSlackLink && 
                                     formData.description.trim() === '' && 
                                     formData.type === '' && 
                                     formData.tags.length === 0;
      
      // Create a copy of formData to avoid modifying the state directly
      const taskData = { ...formData };
      
      // If it's a Slack link with only date, set type and tag automatically
      if (hasOnlySlackLinkAndDate) {
        taskData.type = 'MANUAL_REVIEW_WORK';
        taskData.tags = ['slack-ping'];
      }
      
      await addTask({
        ...taskData,
        date: taskData.date.toISOString().split('T')[0]
      });
      
      // Reset form after successful submission
      setFormData({
        description: '',
        type: '',
        tags: [],
        date: new Date(),
        link: ''
      });
      // Trigger refresh of the task list
      triggerRefresh();
      alert('Task added successfully!');
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTagLabel = (name: string) =>
    allTags.find(t => t.name === name)?.label || name.replace(/-/g, ' ');

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Add New Task</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-800 mb-1">
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-800 mb-1">
            Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            disabled={isLoading || taskTypes.length === 0}
          >
            <option value="">Select a type</option>
            {taskTypes.map(type => (
              <option key={type.name} value={type.name}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-800 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map(tag => (
              <span 
                key={tag} 
                className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
              >
                {getTagLabel(tag)}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  disabled={isLoading}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              id="tagInput"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagKeyDown}
              placeholder="Type a tag and press Enter"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={isLoading}
            />
            {matchingTags.length > 0 && (
              <ul 
                ref={tagListRef}
                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
              >
                {matchingTags.map((tag, index) => (
                  <li 
                    key={tag.name}
                    onClick={() => addTag(tag.name)}
                    className={`px-3 py-2 cursor-pointer text-gray-900 ${
                      index === selectedTagIndex 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {tag.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-800 mb-1">
            Date
          </label>
          <DatePicker
            id="date"
            selected={formData.date}
            onChange={handleDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            dateFormat="MMM d, yyyy"
            disabled={isLoading}
            required
          />
        </div>
        
        <div>
          <label htmlFor="link" className="block text-sm font-medium text-gray-800 mb-1">
            Link (Optional)
          </label>
          <input
            type="url"
            id="link"
            name="link"
            value={formData.link}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Add Task'}
        </button>
      </form>
    </div>
  );
}
