import { useEffect } from 'react';
import { useTaskContext } from './TaskContext';

export default function Notification() {
  const { notification, clearNotification } = useTaskContext();
  
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);
  
  if (!notification) return null;
  
  const colors = {
    success: {
      bg: '#dcfce7',
      border: '#86efac',
      text: '#166534'
    },
    error: {
      bg: '#fee2e2',
      border: '#fca5a5',
      text: '#b91c1c'
    },
    info: {
      bg: '#dbeafe',
      border: '#93c5fd',
      text: '#1e40af'
    }
  }[notification.type];
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      right: '1rem',
      zIndex: 50
    }}>
      <div 
        style={{
          padding: '0.75rem 1rem',
          borderRadius: '0.375rem',
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.bg,
          color: colors.text,
          maxWidth: '20rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        role="alert"
      >
        <span>{notification.message}</span>
        <button
          onClick={clearNotification}
          style={{
            marginLeft: '1rem',
            fontWeight: 'bold',
            background: 'none',
            border: 'none',
            padding: 0,
            color: colors.text,
            cursor: 'pointer'
          }}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
} 