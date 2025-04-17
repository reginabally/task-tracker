document.addEventListener('DOMContentLoaded', function() {
  // Get form elements
  const form = document.getElementById('task-form');
  const descriptionInput = document.getElementById('description');
  const typeSelect = document.getElementById('type');
  const dateInput = document.getElementById('date');
  const linkInput = document.getElementById('link');
  const tagInput = document.getElementById('tag-input');
  const selectedTagsContainer = document.getElementById('selected-tags');
  const tagSuggestions = document.getElementById('tag-suggestions');
  const submitButton = document.getElementById('submit-btn');
  const errorMessage = document.getElementById('error-message');
  const notification = document.getElementById('notification');
  const notificationMessage = document.getElementById('notification-message');
  const notificationClose = document.getElementById('notification-close');

  // State
  let allTags = [];
  let selectedTags = [];
  let matchingTags = [];
  let selectedTagIndex = -1;
  let taskTypes = [];
  let automationRules = [];
  let isInitialized = false;

  // Initialize the form
  initForm();

  // Set today's date by default
  const today = new Date();
  dateInput.value = today.toISOString().split('T')[0];

  // Event listeners
  form.addEventListener('submit', handleSubmit);
  tagInput.addEventListener('input', handleTagInputChange);
  tagInput.addEventListener('keydown', handleTagKeyDown);
  notificationClose.addEventListener('click', clearNotification);
  descriptionInput.addEventListener('input', (e) => applyAutomationRules('description', e.target.value));
  linkInput.addEventListener('input', (e) => applyAutomationRules('link', e.target.value));

  // Initialize the form
  async function initForm() {
    setLoading(true);
    showError(null);
    
    try {
      // Fetch data from the Electron API
      const [tags, types, rules] = await Promise.all([
        window.api.tag.getAll(),
        window.api.taskType.getAll(),
        window.api.automationRule.getAll()
      ]);
      
      allTags = tags;
      
      // Sort task types by sortOrder
      taskTypes = [...types].sort((a, b) => {
        // Safely access sortOrder property or default to 0
        const orderA = a.sortOrder || 0;
        const orderB = b.sortOrder || 0;
        
        // If orders are the same, sort by label alphabetically
        if (orderA === orderB) {
          return a.label.localeCompare(b.label);
        }
        
        return orderA - orderB;
      });
      
      automationRules = rules;
      
      // Populate task types
      typeSelect.innerHTML = '<option value="">Select a category</option>';
      taskTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.name;
        option.textContent = type.label;
        typeSelect.appendChild(option);
      });
      
      isInitialized = true;
    } catch (err) {
      console.error('Error loading form data:', err);
      const errorHtml = `
        <p>Failed to load task types and tags. The database may not be properly initialized.</p>
        <p>Try these steps:</p>
        <ol class="ml-5 list-decimal">
          <li>Check if the database exists</li>
          <li>Run Prisma migrations (npx prisma db push)</li>
          <li>Run the seed script (npm run seed)</li>
        </ol>
        <button id="retry-init" class="mt-3 px-3 py-1 bg-blue-600 text-white rounded-md">Retry</button>
      `;
      showError(errorHtml, true);
      
      // Add event listener to retry button
      document.getElementById('retry-init')?.addEventListener('click', initForm);
    } finally {
      setLoading(false);
    }
  }

  // Show or hide the loading state
  function setLoading(loading) {
    if (loading) {
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting...';
    } else {
      submitButton.disabled = !isInitialized;
      submitButton.textContent = 'Add Task';
    }
  }

  // Show or hide error message
  function showError(message, isHtml = false) {
    if (message) {
      if (isHtml) {
        errorMessage.innerHTML = message;
      } else {
        errorMessage.textContent = message;
      }
      errorMessage.style.display = 'block';
    } else {
      errorMessage.textContent = '';
      errorMessage.style.display = 'none';
    }
  }

  // Handle tag input change
  function handleTagInputChange() {
    const value = tagInput.value.trim();
    
    if (value) {
      // Find matching tags
      matchingTags = allTags.filter(
        tag => tag.label.toLowerCase().includes(value.toLowerCase()) && 
               !selectedTags.some(selectedTag => selectedTag.name === tag.name)
      );
      
      // Show matching tags
      tagSuggestions.innerHTML = '';
      
      if (matchingTags.length > 0) {
        matchingTags.forEach((tag, index) => {
          const suggestionEl = document.createElement('div');
          suggestionEl.className = 'tag-suggestion';
          suggestionEl.textContent = tag.label;
          suggestionEl.dataset.index = index;
          suggestionEl.addEventListener('click', () => addTag(tag));
          tagSuggestions.appendChild(suggestionEl);
        });
        
        tagSuggestions.style.display = 'block';
      } else {
        tagSuggestions.style.display = 'none';
      }
      
      selectedTagIndex = -1;
    } else {
      matchingTags = [];
      tagSuggestions.innerHTML = '';
      tagSuggestions.style.display = 'none';
      selectedTagIndex = -1;
    }
  }

  // Handle tag input keydown
  function handleTagKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // If there's a selected tag in the dropdown, add it
      if (selectedTagIndex >= 0 && selectedTagIndex < matchingTags.length) {
        addTag(matchingTags[selectedTagIndex]);
        return;
      }
      
      // Otherwise, create a new tag from the input
      if (tagInput.value.trim()) {
        const newTagName = tagInput.value.trim().toLowerCase().replace(/\s+/g, '-');
        if (!selectedTags.some(tag => tag.name === newTagName)) {
          const newTag = {
            name: newTagName,
            label: tagInput.value.trim().replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
          };
          addTag(newTag);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      
      // Navigate down in suggestions
      if (matchingTags.length > 0) {
        selectedTagIndex = Math.min(selectedTagIndex + 1, matchingTags.length - 1);
        highlightSelectedTag();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      
      // Navigate up in suggestions
      if (matchingTags.length > 0) {
        selectedTagIndex = Math.max(selectedTagIndex - 1, -1);
        highlightSelectedTag();
      }
    } else if (e.key === 'Escape') {
      // Close suggestions
      tagSuggestions.style.display = 'none';
      selectedTagIndex = -1;
    }
  }
  
  // Highlight the selected tag in suggestions
  function highlightSelectedTag() {
    const suggestions = tagSuggestions.querySelectorAll('.tag-suggestion');
    
    suggestions.forEach((suggestion, index) => {
      if (index === selectedTagIndex) {
        suggestion.classList.add('selected');
        suggestion.scrollIntoView({ block: 'nearest' });
      } else {
        suggestion.classList.remove('selected');
      }
    });
  }

  // Add a tag to the selected tags
  function addTag(tag) {
    if (!selectedTags.some(t => t.name === tag.name)) {
      selectedTags.push(tag);
      renderSelectedTags();
    }
    
    tagInput.value = '';
    tagSuggestions.style.display = 'none';
    matchingTags = [];
    selectedTagIndex = -1;
  }

  // Remove a tag from the selected tags
  function removeTag(tagName) {
    selectedTags = selectedTags.filter(tag => tag.name !== tagName);
    renderSelectedTags();
  }

  // Render selected tags
  function renderSelectedTags() {
    selectedTagsContainer.innerHTML = '';
    
    selectedTags.forEach(tag => {
      const tagElement = document.createElement('div');
      tagElement.className = 'tag';
      tagElement.textContent = tag.label;
      
      const removeButton = document.createElement('button');
      removeButton.className = 'tag-remove';
      removeButton.textContent = '×';
      removeButton.addEventListener('click', () => removeTag(tag.name));
      
      tagElement.appendChild(removeButton);
      selectedTagsContainer.appendChild(tagElement);
    });
  }

  // Apply automation rules for description and link
  function applyAutomationRules(field, value) {
    // Only process when there's a value
    if (!value) return;
    
    // Process automation rules
    for (const rule of automationRules) {
      // Only process rules for the current field type
      if (rule.trigger !== field) continue;
      
      // Skip if pattern is empty or value doesn't include the pattern
      if (!rule.pattern || !value.includes(rule.pattern)) continue;
      
      // Rule matches - apply task type
      typeSelect.value = rule.type;
      
      // Apply tags from the rule (avoid duplicates)
      rule.tags.forEach(tagName => {
        const tag = allTags.find(t => t.name === tagName);
        if (tag && !selectedTags.some(t => t.name === tag.name)) {
          selectedTags.push(tag);
        }
      });
      
      renderSelectedTags();
      
      // Only apply the first matching rule (for now)
      break;
    }
  }

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!isInitialized) {
      showError('The app is not fully initialized yet. Please wait or retry initialization.');
      return;
    }
    
    setLoading(true);
    showError(null);
    
    try {
      // Get form data
      const formData = {
        description: descriptionInput.value,
        typeId: taskTypes.find(t => t.name === typeSelect.value)?.id || null,
        date: dateInput.value,
        link: linkInput.value,
        tagIds: selectedTags.map(tag => 
          allTags.find(t => t.name === tag.name)?.id
        ).filter(Boolean)
      };
      
      // Submit to the Electron API
      await window.api.task.create(formData);
      
      // Reset form
      form.reset();
      selectedTags = [];
      renderSelectedTags();
      
      // Set today's date again (since we reset the form)
      const today = new Date();
      dateInput.value = today.toISOString().split('T')[0];
      
      // Show success notification
      showNotification('success', 'Task added successfully!');
    } catch (err) {
      console.error('Error adding task:', err);
      showError('Failed to add task. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Show notification
  function showNotification(type, message) {
    notificationMessage.textContent = message;
    notification.querySelector('.notification-content')?.classList.remove('success', 'error', 'info');
    notification.querySelector('.notification-content')?.classList.add(type);
    notification.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      clearNotification();
    }, 5000);
  }

  // Clear notification
  function clearNotification() {
    notification.style.display = 'none';
  }
}); 