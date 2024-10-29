// app/routes/account-pending-approval.tsx

import { Link } from "@remix-run/react";

export default function AccountPendingApproval() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="mx-auto w-full max-w-lg rounded-md bg-white p-8 text-center shadow-lg dark:bg-gray-800">
        <h1 className="mb-4 text-3xl font-bold text-gray-800 dark:text-gray-200">
          Account Pending Approval
        </h1>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Your account has been created successfully and is currently pending
          approval by an administrator. You will receive an email notification
          once your account has been approved.
        </p>
        <Link
          to="/"
          className="text-blue-500 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-600"
        >
          Go back to the home page
        </Link>
      </div>
    </div>
  );
}
