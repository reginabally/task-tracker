'use client';

import { useState, useEffect } from 'react';
import { getTaskTypes, createTaskType, updateTaskType, deleteTaskType, updateTaskTypeOrder } from '@/app/settings/actions';

// Define the TaskType interface
interface TaskType {
  id: string;
  name: string;
  label: string;
  sortOrder?: number;
}

export default function CategoriesSettings() {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [isLoadingTaskTypes, setIsLoadingTaskTypes] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<TaskType | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<TaskType | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  // Load task types when the component mounts
  useEffect(() => {
    loadTaskTypes();
  }, []);

  // Load task types function
  const loadTaskTypes = async () => {
    setIsLoadingTaskTypes(true);
    try {
      const types = await getTaskTypes();
      setTaskTypes(types);
    } catch (error) {
      console.error('Error loading task types:', error);
      setStatusMessage({
        type: 'error',
        text: 'Failed to load task categories'
      });
    } finally {
      setIsLoadingTaskTypes(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      return;
    }
    
    setIsAddingCategory(true);
    setStatusMessage(null);
    
    try {
      const result = await createTaskType(newCategoryName);
      
      if (result.success) {
        // Close the modal and reset the input
        setIsAddCategoryModalOpen(false);
        setNewCategoryName('');
        
        // Refresh the task types list
        await loadTaskTypes();
        
        // Show success message
        setStatusMessage({
          type: 'success',
          text: result.message
        });
      } else {
        // Show error message
        setStatusMessage({
          type: 'error',
          text: result.message
        });
      }
    } catch (error) {
      console.error('Error adding category:', error);
      setStatusMessage({
        type: 'error',
        text: 'An unexpected error occurred'
      });
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleEditCategoryClick = (category: TaskType) => {
    setEditingCategory(category);
    setEditCategoryName(category.label);
    setIsEditCategoryModalOpen(true);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editCategoryName.trim() || !editingCategory) {
      return;
    }
    
    setIsEditingCategory(true);
    setStatusMessage(null);
    
    try {
      const result = await updateTaskType(editingCategory.id, editCategoryName);
      
      if (result.success) {
        // Close the modal and reset the state
        setIsEditCategoryModalOpen(false);
        setEditingCategory(null);
        setEditCategoryName('');
        
        // Refresh the task types list
        await loadTaskTypes();
        
        // Show success message
        setStatusMessage({
          type: 'success',
          text: result.message
        });
      } else {
        // Show error message
        setStatusMessage({
          type: 'error',
          text: result.message
        });
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setStatusMessage({
        type: 'error',
        text: 'An unexpected error occurred'
      });
    } finally {
      setIsEditingCategory(false);
    }
  };

  const handleDeleteCategoryClick = (category: TaskType) => {
    setDeletingCategory(category);
    setIsDeleteCategoryModalOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) {
      return;
    }
    
    setIsDeletingCategory(true);
    setStatusMessage(null);
    
    try {
      const result = await deleteTaskType(deletingCategory.id);
      
      if (result.success) {
        // Close the modal and reset the state
        closeDeleteModal();
        
        // Refresh the task types list
        await loadTaskTypes();
        
        // Show success message
        setStatusMessage({
          type: 'success',
          text: result.message
        });
      } else {
        // Show error message
        setStatusMessage({
          type: 'error',
          text: result.message
        });
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setStatusMessage({
        type: 'error',
        text: 'An unexpected error occurred'
      });
    } finally {
      setIsDeletingCategory(false);
    }
  };

  const closeEditModal = () => {
    setIsEditCategoryModalOpen(false);
    setEditingCategory(null);
    setEditCategoryName('');
  };

  const closeDeleteModal = () => {
    setIsDeleteCategoryModalOpen(false);
    setDeletingCategory(null);
  };

  // Handle moving a category up in order
  const handleMoveCategoryUp = async (category: TaskType, index: number) => {
    if (index === 0) return; // Already at the top
    
    const prevCategory = taskTypes[index - 1];
    
    // Swap orders
    try {
      setStatusMessage(null);
      
      // Update the current category to have the previous one's order
      await updateTaskTypeOrder(category.id, prevCategory.sortOrder || 0);
      
      // Update the previous category to have the current one's order
      await updateTaskTypeOrder(prevCategory.id, category.sortOrder || 0);
      
      // Refresh the task types list
      await loadTaskTypes();
      
      setStatusMessage({
        type: 'success',
        text: 'Category order updated successfully'
      });
    } catch (error) {
      console.error('Error moving category up:', error);
      setStatusMessage({
        type: 'error',
        text: 'Failed to update category order'
      });
    }
  };
  
  // Handle moving a category down in order
  const handleMoveCategoryDown = async (category: TaskType, index: number) => {
    if (index === taskTypes.length - 1) return; // Already at the bottom
    
    const nextCategory = taskTypes[index + 1];
    
    // Swap orders
    try {
      setStatusMessage(null);
      
      // Update the current category to have the next one's order
      await updateTaskTypeOrder(category.id, nextCategory.sortOrder || 0);
      
      // Update the next category to have the current one's order
      await updateTaskTypeOrder(nextCategory.id, category.sortOrder || 0);
      
      // Refresh the task types list
      await loadTaskTypes();
      
      setStatusMessage({
        type: 'success',
        text: 'Category order updated successfully'
      });
    } catch (error) {
      console.error('Error moving category down:', error);
      setStatusMessage({
        type: 'error',
        text: 'Failed to update category order'
      });
    }
  };

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
        <h2 className="text-xl font-semibold text-gray-800">Categories</h2>
        <button
          type="button"
          onClick={() => setIsAddCategoryModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Category
        </button>
      </div>
      
      {isLoadingTaskTypes ? (
        <div className="text-center py-6">
          <p className="text-gray-500">Loading categories...</p>
        </div>
      ) : taskTypes.length === 0 ? (
        <div className="bg-gray-50 p-6 text-center rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-2">No categories found</p>
          <p className="text-sm text-gray-500">
            Categories help you organize your tasks. Click &quot;Add Category&quot; to create your first category.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Order
                </th>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                  Category Name
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  System Name
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {taskTypes.map((category, index) => (
                <tr key={category.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                    {category.sortOrder !== undefined ? category.sortOrder : '-'}
                  </td>
                  <td className="whitespace-nowrap py-4 pr-3 text-sm font-medium text-gray-900">
                    {category.label}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {category.name}
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex items-center justify-end space-x-3">
                      {/* Move up icon */}
                      <button
                        type="button"
                        onClick={() => handleMoveCategoryUp(category, index)}
                        className={`text-gray-500 hover:text-blue-600 ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Move up"
                        disabled={index === 0}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      
                      {/* Move down icon */}
                      <button
                        type="button"
                        onClick={() => handleMoveCategoryDown(category, index)}
                        className={`text-gray-500 hover:text-blue-600 ${index === taskTypes.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Move down"
                        disabled={index === taskTypes.length - 1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Edit icon */}
                      <button
                        type="button"
                        onClick={() => handleEditCategoryClick(category)}
                        className="text-gray-500 hover:text-blue-600"
                        title="Edit category"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      
                      {/* Delete icon */}
                      <button
                        type="button"
                        onClick={() => handleDeleteCategoryClick(category)}
                        className="text-gray-500 hover:text-red-600"
                        title="Delete category"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Add New Category</h2>
            
            <form onSubmit={handleAddCategory}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="e.g. Code Review"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  System name will be automatically generated as: {newCategoryName ? newCategoryName.trim().toUpperCase().replace(/\s+/g, '_') : 'CODE_REVIEW'}
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingCategory || !newCategoryName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                >
                  {isAddingCategory ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Edit Category</h2>
            
            <form onSubmit={handleUpdateCategory}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  System name will be automatically updated to: {editCategoryName ? editCategoryName.trim().toUpperCase().replace(/\s+/g, '_') : ''}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Current system name: <span className="font-medium">{editingCategory.name}</span>
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditingCategory || !editCategoryName.trim() || editCategoryName.trim() === editingCategory.label}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                >
                  {isEditingCategory ? 'Updating...' : 'Update Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {isDeleteCategoryModalOpen && deletingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Delete Category</h2>
            
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete the category <span className="font-medium">{deletingCategory.label}</span>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. If tasks are using this category, the deletion will fail.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                disabled={isDeletingCategory}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
              >
                {isDeletingCategory ? 'Deleting...' : 'Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 