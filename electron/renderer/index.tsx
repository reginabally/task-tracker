import React from 'react';
import { createRoot } from 'react-dom/client';
import { TaskProvider } from './components/TaskContext';
import TaskForm from './components/TaskForm';
import Notification from './components/Notification';
import './styles/globals.css';
// DatePicker CSS will be imported in the TaskForm component

function App() {
  return (
    <TaskProvider>
      <div className="container">
        <header style={{
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#3b82f6'
          }}>Task Tracker</h1>
          <p style={{
            marginTop: '0.5rem',
            color: '#6b7280'
          }}>
            A desktop application for tracking tasks, generating reports, and AI-assisted HR self-feedback.
          </p>
        </header>

        <main>
          <TaskForm />
        </main>

        <Notification />
      </div>
    </TaskProvider>
  );
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
}); 