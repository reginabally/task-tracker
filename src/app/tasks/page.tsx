import { Metadata } from 'next';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import TasksHeader from '../components/TasksHeader';
import { TaskProvider } from '../lib/TaskContext';

export const metadata: Metadata = {
  title: 'Task Tracker',
  description: 'Add and manage your daily tasks and activities',
};

export default function TasksPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <TasksHeader />
        </div>

        <TaskProvider>
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <TaskForm />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Tasks</h2>
                <TaskList />
              </div>
            </div>
          </div>
        </TaskProvider>
      </div>
    </main>
  );
} 