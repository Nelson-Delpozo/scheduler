// app/routes/super-admin-dashboard/user-management.tsx

import { useFetcher } from "@remix-run/react";
import { useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  restaurantId: number;
}

interface UserManagementProps {
  users: User[];
}

export default function UserManagement({ users }: UserManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const fetcher = useFetcher();

  const openModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-200">Users</h2>
      <ul className="space-y-4">
        {users.map((user) => (
          <li
            key={user.id}
            className="flex flex-col items-center justify-between space-y-2 rounded-md border p-4 dark:border-gray-700 sm:flex-row sm:space-y-0"
          >
            <div className="w-full sm:w-auto">
              <p className="font-semibold text-gray-900 dark:text-gray-200">{user.name}</p>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              <p className="text-gray-600 dark:text-gray-400">
                {user.phoneNumber || "No phone number provided"}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Role: {user.role}</p>
              <p className="text-gray-600 dark:text-gray-400">Restaurant ID: {user.restaurantId}</p>
            </div>
            <div className="mt-2 flex w-full flex-col space-y-2 sm:mt-0 sm:w-auto sm:flex-row sm:space-x-2 sm:space-y-0">
              <button
                type="button"
                onClick={() => openModal(user)}
                className="w-full rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 sm:w-auto"
              >
                Edit User
              </button>
              <fetcher.Form method="post" action="/admin-delete-user" className="w-full sm:w-auto">
                <input type="hidden" name="userId" value={user.id} />
                <button
                  type="submit"
                  className="w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 sm:w-auto"
                >
                  Delete User
                </button>
              </fetcher.Form>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal for Editing User */}
      {isModalOpen && selectedUser ? <fetcher.Form
          method="post"
          action="/admin-update-user"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onSubmit={closeModal}
        >
          <div className="w-full max-w-md rounded-md bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-200">Edit User</h2>
            <input type="hidden" name="userId" value={selectedUser.id} />
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                name="name"
                defaultValue={selectedUser.name}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <input
                type="text"
                name="role"
                defaultValue={selectedUser.role}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                defaultValue={selectedUser.phoneNumber || ""}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-500"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                type="submit"
                className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="rounded bg-gray-500 px-6 py-2 text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </fetcher.Form> : null}
    </div>
  );
}
