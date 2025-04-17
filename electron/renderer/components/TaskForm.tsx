import { useEffect, useState, KeyboardEvent, useRef } from 'react';
import DatePicker from 'react-datepicker';
// Import just the CSS we need directly in our component
// import 'react-datepicker/dist/react-datepicker.css';
import { useTaskContext } from './TaskContext';

interface TaskType {
  id: string;
  name: string;
  label: string;
  sortOrder?: number;
}

interface Tag {
  id: string;
  name: string;
  label: string;
}

interface AutomationRule {
  id: number;
  trigger: 'link' | 'description';
  pattern: string;
  type: string;
  tags: string[];
}

export default function TaskForm() {
  const { triggerRefresh, showNotification } = useTaskContext();
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
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use the Electron API to fetch data
        const [tags, types, rules] = await Promise.all([
          window.api.tag.getAll(),
          window.api.taskType.getAll(),
          window.api.automationRule.getAll()
        ]);
        setAllTags(tags);
        
        // Sort task types by sortOrder
        setTaskTypes([...types].sort((a, b) => {
          // Safely access sortOrder property or default to 0
          const orderA = a.sortOrder || 0;
          const orderB = b.sortOrder || 0;
          
          // If orders are the same, sort by label alphabetically
          if (orderA === orderB) {
            return a.label.localeCompare(b.label);
          }
          
          return orderA - orderB;
        }));
        setAutomationRules(rules);
      } catch (err) {
        console.error('Error loading form data:', err);
        setError('Failed to load task types and tags. Please try again.');
        showNotification('error', 'Failed to load task types and tags');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [showNotification]);

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
    
    if (name === 'link') {
      // Apply automation rules for link
      applyAutomationRules(name, value);
    } else if (name === 'description') {
      // Apply automation rules for description
      applyAutomationRules(name, value);
    } else {
      // Normal input handling for non-link and non-description fields
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const applyAutomationRules = (field: string, value: string) => {
    // Basic update to start
    const updatedFormData = { ...formData, [field]: value };
    
    // Process automation rules
    for (const rule of automationRules) {
      // Only process rules for the current field type
      if (rule.trigger !== field) continue;
      
      // Skip if pattern is empty or value doesn't include the pattern
      if (!rule.pattern || !value.includes(rule.pattern)) continue;
      
      // Rule matches - apply task type
      updatedFormData.type = rule.type;
      
      // Apply tags from the rule (avoid duplicates)
      const uniqueTags = new Set([...updatedFormData.tags]);
      rule.tags.forEach(tag => uniqueTags.add(tag));
      updatedFormData.tags = Array.from(uniqueTags);
      
      // Only apply the first matching rule (for now)
      break;
    }
    
    setFormData(updatedFormData);
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

  // For debugging
  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedTags, fetchedTypes] = await Promise.all([
          window.api.tag.getAll(),
          window.api.taskType.getAll()
        ]);
        console.log('✅ Tags:', fetchedTags);
        console.log('✅ TaskTypes:', fetchedTypes);
        setTags(fetchedTags);
        setTypes(fetchedTypes);
      } catch (error) {
        console.error('❌ Failed to fetch tags or types:', error);
        setError('Failed to load task types and tags.');
      }
    };
  
    loadData();
  }, []);

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
      // Using Electron API instead of server action
      await window.api.task.create({
        description: formData.description,
        typeId: taskTypes.find(t => t.name === formData.type)?.id || null,
        date: formData.date.toISOString().split('T')[0],
        link: formData.link,
        tagIds: formData.tags.map(tagName => 
          allTags.find(tag => tag.name === tagName)?.id
        ).filter(Boolean)
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
      
      // Show success notification
      showNotification('success', 'Task added successfully!');
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task. Please try again.');
      showNotification('error', 'Failed to add task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTagLabel = (name: string) =>
    allTags.find(t => t.name === name)?.label || name.replace(/-/g, ' ');

  return (
    <div style={{
      maxWidth: '42rem',
      margin: '0 auto',
      padding: '1.5rem',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: '#1f2937'
      }}>Add New Task</h2>
      
      {error && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          borderRadius: '0.375rem'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="description" style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.25rem'
          }}>
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="type" style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.25rem'
          }}>
            Category
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            disabled={isLoading || taskTypes.length === 0}
          >
            <option value="">Select a category</option>
            {taskTypes.map(type => (
              <option key={type.id} value={type.name}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="tags" style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.25rem'
          }}>
            Tags
          </label>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '0.5rem', 
            marginBottom: '0.5rem' 
          }}>
            {formData.tags.map(tag => (
              <span 
                key={tag} 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af'
                }}
              >
                {getTagLabel(tag)}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  style={{
                    marginLeft: '0.25rem',
                    color: '#3b82f6',
                    cursor: 'pointer'
                  }}
                  disabled={isLoading}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              id="tagInput"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagKeyDown}
              placeholder="Type a tag and press Enter"
              disabled={isLoading}
            />
            {matchingTags.length > 0 && (
              <ul 
                ref={tagListRef}
                style={{
                  position: 'absolute',
                  zIndex: 10,
                  width: '100%',
                  marginTop: '0.25rem',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  maxHeight: '15rem',
                  overflow: 'auto'
                }}
              >
                {matchingTags.map((tag, index) => (
                  <li 
                    key={tag.id}
                    onClick={() => addTag(tag.name)}
                    style={{
                      padding: '0.75rem',
                      cursor: 'pointer',
                      color: '#1f2937',
                      backgroundColor: index === selectedTagIndex ? '#dbeafe' : 'transparent',
                    }}
                  >
                    {tag.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="date" style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.25rem'
          }}>
            Date
          </label>
          <DatePicker
            id="date"
            selected={formData.date}
            onChange={handleDateChange}
            dateFormat="MMM d, yyyy"
            disabled={isLoading}
            required
          />
        </div>
        
        <div>
          <label htmlFor="link" style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.25rem'
          }}>
            Link (Optional)
          </label>
          <input
            type="url"
            id="link"
            name="link"
            value={formData.link}
            onChange={handleInputChange}
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          style={{
            marginTop: '0.5rem',
            width: '100%'
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Add Task'}
        </button>
      </form>
    </div>
  );
} 