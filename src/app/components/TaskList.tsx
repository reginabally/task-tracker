'use client';

import { useState, useEffect, KeyboardEvent, useRef } from 'react';
import { format } from 'date-fns';
import TaskFilters from './TaskFilters';
import { fetchTasks, getAllTaskTypes, getAllTags, updateTask, deleteTask, getLockedReportingPeriodAction } from '@/app/tasks/actions';
import { useTaskContext } from '@/app/lib/TaskContext';

interface Task {
  id: string;
  description: string;
  date: Date;
  link: string | null;
  type: {
    name: string;
    label: string;
  };
  tags: {
    tag: {
      name: string;
      label: string;
    };
  }[];
}

interface EditModalProps {
  task: Task;
  taskTypes: { name: string; label: string; }[];
  tags: { name: string; label: string; }[];
  onClose: () => void;
  onSave: (updatedTask: {
    id: string;
    description: string;
    type: string;
    tags: string[];
    date: string;
    link?: string;
  }) => Promise<void>;
}

function EditModal({ task, taskTypes, tags, onClose, onSave }: EditModalProps) {
  const [description, setDescription] = useState(task.description);
  const [type, setType] = useState(task.type.name);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    task.tags.map(({ tag }) => tag.name)
  );
  const [date, setDate] = useState(format(new Date(task.date), 'yyyy-MM-dd'));
  const [link, setLink] = useState(task.link || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [matchingTags, setMatchingTags] = useState<{ name: string; label: string; }[]>([]);
  const [selectedTagIndex, setSelectedTagIndex] = useState(-1);
  const tagListRef = useRef<HTMLUListElement>(null);

  // Update matching tags when tag input changes
  useEffect(() => {
    if (tagInput.trim()) {
      const matches = tags.filter(
        tag =>
          tag.label.toLowerCase().includes(tagInput.toLowerCase()) &&
          !selectedTags.includes(tag.name)
      );
      setMatchingTags(matches);
      setSelectedTagIndex(-1); // Reset selection when input changes
    } else {
      setMatchingTags([]);
      setSelectedTagIndex(-1);
    }
  }, [tagInput, tags, selectedTags]);

  // Scroll the selected item into view
  useEffect(() => {
    if (selectedTagIndex >= 0 && tagListRef.current) {
      const selectedElement = tagListRef.current.children[selectedTagIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedTagIndex]);

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
        if (!selectedTags.includes(newTag)) {
          setSelectedTags([...selectedTags, newTag]);
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

  const addTag = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      setSelectedTags([...selectedTags, tagName]);
    }
    setTagInput('');
    setMatchingTags([]);
    setSelectedTagIndex(-1);
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const getTagLabel = (name: string) =>
    tags.find(t => t.name === name)?.label || name.replace(/-/g, ' ');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        id: task.id,
        description,
        type,
        tags: selectedTags,
        date,
        link: link || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Edit Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
              required
            >
              {taskTypes.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map(tag => (
                <span 
                  key={tag} 
                  className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {getTagLabel(tag)}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                    disabled={isSubmitting}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagKeyDown}
                placeholder="Type a tag and press Enter"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                disabled={isSubmitting}
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
            <label className="block text-sm font-medium text-gray-900">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900">Link (optional)</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            />
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type DateFilter = 'today' | 'current-period';

export default function TaskList() {
  const { refreshTrigger } = useTaskContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTypes, setTaskTypes] = useState<{ name: string; label: string; }[]>([]);
  const [tags, setTags] = useState<{ name: string; label: string; }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    tag: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');

  // Load task types and tags on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [types, tagList] = await Promise.all([
          getAllTaskTypes(),
          getAllTags()
        ]);
        setTaskTypes(types);
        setTags(tagList);
      } catch (err) {
        console.error('Error loading filter data:', err);
        setError('Failed to load task types and tags');
      }
    };
    
    loadData();
  }, []);

  // Fetch tasks whenever filters change or refreshTrigger changes
  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (dateFilter === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          startDate = today;
          endDate = new Date(today);
          endDate.setHours(23, 59, 59, 999);
        } else if (dateFilter === 'current-period') {
          const { periodStart, periodEnd } = await getLockedReportingPeriodAction();
          startDate = periodStart;
          endDate = periodEnd;
        }

        const filteredTasks = await fetchTasks({
          type: filters.type || undefined,
          tag: filters.tag || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        
        setTasks(filteredTasks);
      } catch (err) {
        console.error('Error fetching filtered tasks:', err);
        setError('Failed to fetch tasks with the selected filters');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTasks();
  }, [dateFilter, filters, refreshTrigger]);

  const handleFilterChange = (newFilters: {
    type: string;
    tag: string;
    startDate: Date | null;
    endDate: Date | null;
  }) => {
    // Only update filters if they've actually changed
    if (
      newFilters.type !== filters.type ||
      newFilters.tag !== filters.tag ||
      (newFilters.startDate?.getTime() !== filters.startDate?.getTime()) ||
      (newFilters.endDate?.getTime() !== filters.endDate?.getTime())
    ) {
      setFilters(newFilters);
    }
  };

  const handleEditTask = async (updatedTask: {
    id: string;
    description: string;
    type: string;
    tags: string[];
    date: string;
    link?: string;
  }) => {
    try {
      await updateTask(updatedTask);
      // Refresh the task list
      const filteredTasks = await fetchTasks({
        type: filters.type || undefined,
        tag: filters.tag || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      setTasks(filteredTasks);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      // Refresh the task list
      const filteredTasks = await fetchTasks({
        type: filters.type || undefined,
        tag: filters.tag || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      setTasks(filteredTasks);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleFilterClick = async (filter: DateFilter) => {
    setDateFilter(filter);
    
    // Update the filters state with the appropriate date range
    if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      
      setFilters({
        ...filters,
        startDate: today,
        endDate: endOfDay
      });
    } else if (filter === 'current-period') {
      const { periodStart, periodEnd } = await getLockedReportingPeriodAction();
      
      setFilters({
        ...filters,
        startDate: periodStart,
        endDate: periodEnd
      });
    }
  };

  // Format date for the date input field (YYYY-MM-DD format)
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  // Create a memoized version of initialFilters to prevent unnecessary re-renders
  const initialFiltersValue = {
    type: filters.type,
    tag: filters.tag,
    startDate: formatDateForInput(filters.startDate),
    endDate: formatDateForInput(filters.endDate)
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    // Switch back to "Today" tab
    setDateFilter('today');
  };

  return (
    <div>
      <TaskFilters 
        taskTypes={taskTypes} 
        tags={tags} 
        onFilterChange={handleFilterChange} 
        initialFilters={initialFiltersValue}
        onClearFilters={handleClearFilters}
      />
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleFilterClick('today')}
          className={`px-4 py-2 rounded-md ${
            dateFilter === 'today'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => handleFilterClick('current-period')}
          className={`px-4 py-2 rounded-md ${
            dateFilter === 'current-period'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Current Reporting Period
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No tasks found matching your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary row for Manual Review Work + Slack Ping tasks */}
          {(() => {
            const slackPingTasks = tasks.filter(
              task => 
                task.type.name === 'MANUAL_REVIEW_WORK' && 
                task.tags.some(({ tag }) => tag.name === 'slack-ping')
            );
            if (slackPingTasks.length > 0) {
              return (
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200">
                  <p className="text-blue-900 font-medium">
                    {slackPingTasks.length} Slack {slackPingTasks.length === 1 ? 'ping' : 'pings'} answered
                  </p>
                </div>
              );
            }
            return null;
          })()}

          {/* Filtered task list excluding Manual Review Work + Slack Ping tasks */}
          {tasks
            .filter(
              task => 
                !(task.type.name === 'MANUAL_REVIEW_WORK' && 
                  task.tags.some(({ tag }) => tag.name === 'slack-ping'))
            )
            .map((task) => (
              <div
                key={task.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{task.description}</p>
                    {task.link && (
                      <a
                        href={task.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm block mt-1"
                      >
                        {task.link}
                      </a>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {task.type.label}
                      </span>
                      {task.tags.map(({ tag }) => (
                        <span
                          key={tag.name}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                    <time className="text-sm text-gray-500">
                      {format(new Date(task.date), 'MMM d, yyyy')}
                    </time>
                    <button
                      onClick={() => setEditingTask(task)}
                      className="p-1 text-gray-500 hover:text-blue-600"
                      title="Edit task"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeletingTaskId(task.id)}
                      className="p-1 text-gray-500 hover:text-red-600"
                      title="Delete task"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {editingTask && (
        <EditModal
          task={editingTask}
          taskTypes={taskTypes}
          tags={tags}
          onClose={() => setEditingTask(null)}
          onSave={handleEditTask}
        />
      )}

      {deletingTaskId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Delete Task</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingTaskId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTask(deletingTaskId)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 