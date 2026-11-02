export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Job Manager
          </h1>
          <p className="text-sm text-gray-500">
            Manage your customers, jobs and invoices
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Dashboard
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Active Jobs
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              0
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Outstanding Invoices
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              £0.00
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Completed Jobs
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              0
            </p>
          </div>

        </div>

        <div className="bg-white rounded-lg shadow-sm mt-8 p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Jobs
          </h3>

          <p className="text-gray-500 mt-4">
            No jobs have been created yet.
          </p>
        </div>
      </div>
    </main>
  );
}