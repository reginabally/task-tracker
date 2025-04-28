'use client';

import { useState, useEffect } from 'react';
import { getTaskTypes, getTags } from '@/app/settings/actions';
import { getAutomationRules, createAutomationRule, updateAutomationRule, deleteAutomationRule, AutomationRule as BaseAutomationRule } from '@/app/settings/automationActions';

// Extend the base AutomationRule interface to include a tempId for local state management
interface AutomationRule extends BaseAutomationRule {
  tempId?: number;
}

interface TaskType {
  id: string;
  name: string;
  label: string;
}

interface Tag {
  id: string;
  name: string;
  label: string;
}

export default function AutomationSettings() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Clear success messages after 3 seconds
  useEffect(() => {
    if (statusMessage && statusMessage.type === 'success') {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [loadedTaskTypes, loadedTags, loadedRules] = await Promise.all([
          getTaskTypes(),
          getTags(),
          getAutomationRules()
        ]);
        setTaskTypes(loadedTaskTypes);
        setTags(loadedTags);
        setRules(loadedRules);
      } catch (error) {
        console.error('Error loading automation settings data:', error);
        setStatusMessage({
          type: 'error',
          text: 'Failed to load automation settings'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const addRule = async () => {
    const newRule: AutomationRule = {
      trigger: 'description',
      pattern: '',
      type: taskTypes.length > 0 ? taskTypes[0].name : '',
      tags: [],
      tempId: Date.now()
    };

    // Add the new rule to the local state instead of creating it in the database immediately
    const newRules = [...rules, newRule];
    setRules(newRules);
    
    // Set the new rule to edit mode
    setEditingIndex(newRules.length - 1);
  };

  const updateRule = async (index: number, updatedRule: AutomationRule) => {
    const updatedRules = [...rules];
    updatedRules[index] = updatedRule;
    setRules(updatedRules);
  };

  const saveRule = async (index: number) => {
    const rule = rules[index];
    
    try {
      let result;
      
      // Create a clean rule object without the tempId property for server actions
      const { tempId, ...cleanRule } = rule;
      
      if (rule.id) {
        // If the rule has an ID, update it
        result = await updateAutomationRule(cleanRule);
      } else {
        // If the rule doesn't have an ID, create it
        result = await createAutomationRule(cleanRule);
      }
      
      if (result.success) {
        // If we created a new rule, update our local state with the server-assigned ID
        if (result.rule) {
          const updatedRules = [...rules];
          updatedRules[index] = {
            ...result.rule,
            tempId: rule.tempId // Preserve the tempId in case we need it
          };
          setRules(updatedRules);
        }
        
        setStatusMessage({
          type: 'success',
          text: result.message
        });
        setEditingIndex(null);
      } else {
        setStatusMessage({
          type: 'error',
          text: result.message
        });
      }
    } catch (error) {
      console.error('Error saving rule:', error);
      setStatusMessage({
        type: 'error',
        text: 'An unexpected error occurred while saving the rule'
      });
    }
  };

  const deleteRule = async (index: number) => {
    const rule = rules[index];
    
    if (!rule.id) {
      // If the rule doesn't have an ID yet, it hasn't been saved to the database
      const updatedRules = rules.filter((_, i) => i !== index);
      setRules(updatedRules);
      setEditingIndex(null);
      return;
    }
    
    try {
      const result = await deleteAutomationRule(rule.id);
      
      if (result.success) {
        const updatedRules = rules.filter((_, i) => i !== index);
        setRules(updatedRules);
        setEditingIndex(null);
        setStatusMessage({
          type: 'success',
          text: result.message
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: result.message
        });
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
      setStatusMessage({
        type: 'error',
        text: 'An unexpected error occurred while deleting the rule'
      });
    }
  };

  const handleEditRule = (index: number) => {
    setEditingIndex(index);
  };

  const handleSaveRule = (index: number) => {
    saveRule(index);
  };

  const handleCancelRule = (index: number) => {
    const rule = rules[index];

    // If the rule doesn't have an ID, it hasn't been saved to the database yet, so remove it
    if (!rule.id) {
      const updatedRules = rules.filter((_, i) => i !== index);
      setRules(updatedRules);
    }
    
    // Exit edit mode
    setEditingIndex(null);
  };

  const toggleTag = (ruleIndex: number, tagName: string) => {
    const rule = { ...rules[ruleIndex] };
    
    if (rule.tags.includes(tagName)) {
      rule.tags = rule.tags.filter(t => t !== tagName);
    } else {
      rule.tags = [...rule.tags, tagName];
    }
    
    updateRule(ruleIndex, rule);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow p-6">
      {statusMessage && (
        <div className={`mb-6 p-4 rounded-md ${
          statusMessage.type === 'success' 
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {statusMessage.text}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Automation Rules</h2>
        <button
          onClick={addRule}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Rule
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-md text-center">
          <p className="text-gray-500">No automation rules defined. Click &quot;Add Rule&quot; to create one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule, index) => (
            <div key={rule.id ?? rule.tempId ?? index} className="bg-gray-50 rounded-md p-4 border border-gray-200">
              {editingIndex === index ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trigger Field
                      </label>
                      <select
                        value={rule.trigger}
                        onChange={(e) => updateRule(index, { ...rule, trigger: e.target.value as 'link' | 'description' })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="description">Description</option>
                        <option value="link">Link</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pattern (substring to match)
                      </label>
                      <input
                        type="text"
                        value={rule.pattern}
                        onChange={(e) => updateRule(index, { ...rule, pattern: e.target.value })}
                        placeholder="Enter text pattern to match"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category to Assign
                    </label>
                    <select
                      value={rule.type}
                      onChange={(e) => updateRule(index, { ...rule, type: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {taskTypes.map((type) => (
                        <option key={type.id} value={type.name}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags to Assign
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => toggleTag(index, tag.name)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            rule.tags.includes(tag.name)
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                              : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => handleCancelRule(index)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveRule(index)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-lg">
                        {rule.trigger === 'description' ? 'Description' : 'Link'} contains: 
                        <span className="ml-2 font-bold text-indigo-700">&ldquo;{rule.pattern}&rdquo;</span>
                      </h3>
                      <div className="mt-2">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Auto-assign:</span> 
                          <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {taskTypes.find(t => t.name === rule.type)?.label || rule.type}
                          </span>
                        </div>
                      </div>
                      {rule.tags.length > 0 && (
                        <div className="mt-2">
                          <div className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Tags:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {rule.tags.map((tagName) => {
                              const tag = tags.find(t => t.name === tagName);
                              return (
                                <span 
                                  key={tagName}
                                  className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs"
                                >
                                  {tag?.label || tagName}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-start space-x-1">
                      <button
                        onClick={() => handleEditRule(index)}
                        className="p-2 text-gray-600 hover:text-indigo-600 transition"
                        title="Edit rule"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteRule(index)}
                        className="p-2 text-gray-600 hover:text-red-600 transition"
                        title="Delete rule"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 