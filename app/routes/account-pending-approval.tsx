// app/routes/account-pending-approval.tsx

import { Link } from "@remix-run/react";

export default function AccountPendingApproval() {
  return (
    <div className="flex min-h-full flex-col justify-center items-center">
      <div className="mx-auto w-full max-w-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Account Pending Approval</h1>
        <p className="mb-6 text-gray-700">
          Your account has been created successfully and is currently pending approval by an administrator.
          You will receive an email notification once your account has been approved.
        </p>
        <Link
          to="/"
          className="text-blue-500 underline hover:text-blue-700"
        >
          Go back to the home page
        </Link>
      </div>
    </div>
  );
}
