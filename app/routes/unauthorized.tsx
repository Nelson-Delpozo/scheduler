// app/routes/unauthorized.tsx

import { Link } from "@remix-run/react";

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">Unauthorized Access</h1>
      <p className="mt-4 text-gray-700 dark:text-gray-300">
        You do not have permission to access this page.
      </p>
      <Link
        to="/"
        className="mt-6 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        Go to Homepage
      </Link>
    </div>
  );
}
