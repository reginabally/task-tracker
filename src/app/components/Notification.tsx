'use client';

import { useEffect } from 'react';
import { useTaskContext, NotificationType } from '@/app/lib/TaskContext';

export default function Notification() {
  const { notification, clearNotification } = useTaskContext();
  
  // Clear notification when clicked or on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && notification) {
        clearNotification();
      }
    };

    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [notification, clearNotification]);

  if (!notification) return null;

  const getNotificationStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-400 text-green-700';
      case 'error':
        return 'bg-red-50 border-red-400 text-red-700';
      case 'info':
        return 'bg-blue-50 border-blue-400 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-400 text-gray-700';
    }
  };

  return (
    <div 
      className={`${getNotificationStyles(notification.type)} border-l-4 p-4 mb-4 rounded-md flex justify-between items-center transition-opacity duration-300`}
      role="alert"
    >
      <div className="flex-1">{notification.message}</div>
      <button 
        onClick={clearNotification}
        className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
        aria-label="Close notification"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
} 