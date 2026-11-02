import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Job Manager",
  description: "Manage customers, jobs and invoices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        <div className="min-h-screen">

          <header className="border-b border-gray-200 bg-white shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

              <Link
                href="/"
                className="text-xl font-bold text-gray-900"
              >
                Job Manager
              </Link>

              <nav className="flex items-center gap-2">

                <Link
                  href="/"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  Dashboard
                </Link>

                <Link
                  href="/customers"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  Customers
                </Link>

                <Link
                  href="/jobs"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  Jobs
                </Link>

              </nav>

            </div>
          </header>

          {children}

        </div>
      </body>
    </html>
  );
}

