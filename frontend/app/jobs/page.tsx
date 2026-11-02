"use client";

import { FormEvent, useEffect, useState } from "react";

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
};

type Job = {
  id: number;
  customer_id: number;
  customer_name: string;
  title: string;
  description: string;
  status: string;
  price: string;
  due_date: string | null;
  created_at: string;
};

export default function JobsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("quoted");
  const [price, setPrice] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCustomers() {
    try {
      const response = await fetch("http://localhost:3001/api/customers");

      if (!response.ok) {
        throw new Error("Failed to load customers");
      }

      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load customers");
    }
  }

  async function loadJobs() {
    try {
      const response = await fetch("http://localhost:3001/api/jobs");

      if (!response.ok) {
        throw new Error("Failed to load jobs");
      }

      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load jobs");
    }
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await Promise.all([
        loadCustomers(),
        loadJobs()
      ]);
      setLoading(false);
    }

    loadData();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a job title.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customer_id: Number(customerId),
          title,
          description,
          status,
          price: Number(price) || 0,
          due_date: dueDate || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create job");
      }

      setCustomerId("");
      setTitle("");
      setDescription("");
      setStatus("quoted");
      setPrice("");
      setDueDate("");

      await loadJobs();
    } catch (error) {
      console.error(error);
      setError("Unable to create job.");
    }
  }

  function formatStatus(value: string) {
    return value
      .replace("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function formatDate(value: string | null) {
    if (!value) {
      return "No due date";
    }

    return new Date(value).toLocaleDateString("en-GB");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Jobs
          </h1>

          <p className="mt-2 text-gray-600">
            Create and manage customer jobs.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-10 rounded-xl bg-white p-6 shadow-sm">

          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Add Job
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Customer
              </label>

              <select
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select a customer</option>

                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Job Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Website Design"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the work required..."
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-3">

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="quoted">Quoted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Price (£)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Due Date
                </label>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

            </div>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700"
            >
              Add Job
            </button>

          </form>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Existing Jobs
            </h2>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
              {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
            </span>
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-8 text-center">
              <p className="text-gray-500">
                No jobs have been created yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-lg border border-gray-200 p-5"
                >

                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                    <div>
                      <p className="text-sm font-medium text-blue-600">
                        {job.customer_name}
                      </p>

                      <h3 className="mt-1 text-lg font-semibold text-gray-900">
                        {job.title}
                      </h3>

                      {job.description && (
                        <p className="mt-2 text-sm text-gray-600">
                          {job.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                        {formatStatus(job.status)}
                      </span>

                    </div>

                  </div>

                  <div className="mt-5 grid gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2 md:grid-cols-3">

                    <div>
                      <p className="text-xs font-medium uppercase text-gray-500">
                        Price
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        £{Number(job.price).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase text-gray-500">
                        Due Date
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {formatDate(job.due_date)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase text-gray-500">
                        Job ID
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        #{job.id}
                      </p>
                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </main>
  );
}
