
"use client";

import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Customer = {
  id: number;
  name: string;
};

type Job = {
  id: number;
  customer_id: number;
  customer_name: string;
  title: string;
  status: string;
  price: string | number;
  due_date: string | null;
  created_at: string;
};

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [jobsResponse, customersResponse] = await Promise.all([
          fetch(`${API_URL}/api/jobs`),
          fetch(`${API_URL}/api/customers`)
        ]);

        if (!jobsResponse.ok || !customersResponse.ok) {
          throw new Error("Unable to load dashboard data");
        }

        const jobsData = await jobsResponse.json();
        const customersData = await customersResponse.json();

        setJobs(jobsData);
        setCustomers(customersData);
      } catch (err) {
        console.error(err);
        setError("Unable to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const activeJobs = jobs.filter(
    (job) => job.status === "in_progress"
  );

  const completedJobs = jobs.filter(
    (job) => job.status === "completed"
  );

  const quotedJobs = jobs.filter(
    (job) => job.status === "quoted"
  );

  const quotedValue = quotedJobs.reduce(
    (total, job) => total + Number(job.price || 0),
    0
  );

  const recentJobs = [...jobs]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  function formatStatus(status: string) {
    return status
      .replace("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function formatDate(date: string | null) {
    if (!date) return "No due date";
    return new Date(date).toLocaleDateString("en-GB");
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Job Manager
          </h1>
          <p className="text-sm text-gray-500">
            Manage your customers, jobs and invoices
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            An overview of your business activity.
          </p>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading dashboard...</p>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-lg bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                  Total Customers
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {customers.length}
                </p>
              </div>

              <div className="rounded-lg bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                  Active Jobs
                </p>
                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {activeJobs.length}
                </p>
              </div>

              <div className="rounded-lg bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                  Completed Jobs
                </p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {completedJobs.length}
                </p>
              </div>

              <div className="rounded-lg bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                  Quoted Job Value
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  £{quotedValue.toFixed(2)}
                </p>
              </div>

            </div>

            <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Jobs
                </h3>
                <span className="text-sm text-gray-500">
                  {jobs.length} total jobs
                </span>
              </div>

              {recentJobs.length === 0 ? (
                <p className="py-6 text-center text-gray-500">
                  No jobs have been created yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-blue-600">
                          {job.customer_name}
                        </p>
                        <h4 className="mt-1 font-semibold text-gray-900">
                          {job.title}
                        </h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Due: {formatDate(job.due_date)}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-gray-900">
                          £{Number(job.price).toFixed(2)}
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                          {formatStatus(job.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

