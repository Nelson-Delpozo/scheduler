// app/routes/admin-dashboard/user-management.tsx
import { Form, useFetcher } from "@remix-run/react";

interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  role: string;
  status?: string;
}

interface UserManagementProps {
  pendingUsers: User[];
  restaurantUsers: User[];
}

export default function UserManagement({ pendingUsers, restaurantUsers }: UserManagementProps) {
  const fetcher = useFetcher();

  return (
    <div className="mt-8">
      {/* Pending Users */}
      <h2 className="mb-4 text-xl font-semibold dark:text-gray-200">Users Awaiting Approval</h2>
      {pendingUsers.length > 0 ? (
        <ul className="space-y-4">
          {pendingUsers.map((user) => (
            <li
              key={user.id}
              className="flex flex-col items-center justify-between space-y-2 rounded-md border p-4 sm:flex-row sm:space-y-0 dark:bg-gray-800 dark:border-gray-700"
            >
              <div>
                <p className="font-semibold dark:text-gray-200">{user.name}</p>
                <p className="dark:text-gray-400">{user.email}</p>
                <p className="text-gray-600 dark:text-gray-500">
                  {user.phoneNumber || "No phone number provided"}
                </p>
              </div>
              <Form method="post" action="/admin-dashboard" className="mt-4 flex sm:mt-0 sm:w-auto">
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="actionType" value="approve" />
                <button
                  type="submit"
                  className="w-full rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 sm:w-auto dark:bg-green-600 dark:hover:bg-green-700"
                >
                  Approve User
                </button>
              </Form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-700 dark:text-gray-400">No users are currently pending approval.</p>
      )}

      {/* Approved Users */}
      <h2 className="mb-4 mt-8 text-xl font-semibold dark:text-gray-200">Manage Users</h2>
      <ul className="space-y-4">
        {restaurantUsers
          .filter((user) => user.status?.toLowerCase() === "approved")
          .map((user) => (
            <li
              key={user.id}
              className="flex flex-col items-center justify-between space-y-2 rounded-md border p-4 sm:flex-row sm:space-y-0 dark:bg-gray-800 dark:border-gray-700"
            >
              <div>
                <p className="font-semibold dark:text-gray-200">{user.name}</p>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                <p className="text-gray-600 dark:text-gray-500">
                  {user.phoneNumber || "No phone number provided"}
                </p>
                <p className="text-gray-600 dark:text-gray-500">Role: {user.role}</p>
              </div>
              <div className="mt-2 flex w-full flex-col space-y-2 sm:mt-0 sm:w-auto sm:flex-row sm:space-x-2 sm:space-y-0">
                {/* Edit button */}
                <button
                  type="button"
                  onClick={() => fetcher.submit({ userId: user.id.toString(), actionType: "update" })}
                  className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
                >
                  Edit User
                </button>

                {/* Delete button */}
                <Form method="post" action="/admin-dashboard" className="w-full sm:w-auto">
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="actionType" value="delete" />
                  <button
                    type="submit"
                    className="w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 sm:w-auto dark:bg-red-600 dark:hover:bg-red-700"
                  >
                    Delete User
                  </button>
                </Form>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
