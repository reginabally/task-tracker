import TaskForm from '../components/TaskForm';

export default function TasksPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Task Tracker</h1>
          <p className="mt-2 text-sm text-gray-600">
            Add and manage your daily tasks and activities
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Task</h2>
            <TaskForm />
          </div>
        </div>
      </div>
    </main>
  );
} 