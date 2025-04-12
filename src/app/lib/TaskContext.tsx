'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// Define notification type
export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  type: NotificationType;
  message: string;
}

interface TaskContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
  notification: Notification | null;
  showNotification: (type: NotificationType, message: string) => void;
  clearNotification: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [notification, setNotification] = useState<Notification | null>(null);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ type, message });
    
    // Auto-clear notifications after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const clearNotification = () => {
    setNotification(null);
  };

  return (
    <TaskContext.Provider value={{ 
      refreshTrigger, 
      triggerRefresh, 
      notification, 
      showNotification, 
      clearNotification 
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
} 