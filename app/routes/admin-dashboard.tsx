// app/routes/admin-dashboard.tsx

import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData, NavLink, Outlet } from "@remix-run/react";

import { getUsersPendingApproval, approveUser } from "~/models/user.server";

export const loader: LoaderFunction = async () => {
  const pendingUsers = await getUsersPendingApproval();
  return json({ pendingUsers });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const userId = formData.get("userId");

  if (typeof userId === "string") {
    await approveUser(parseInt(userId));
  }

  return json({ success: true });
};

export default function AdminDashboard() {
  const { pendingUsers } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-full flex-col justify-center items-center">
      <div className="mx-auto w-full max-w-5xl p-8">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <div className="flex space-x-4 mb-8">
          <NavLink
            to="/admin-dashboard"
            end
            className={({ isActive }) =>
              isActive
                ? "border-b-2 border-blue-500 pb-2 text-blue-600"
                : "pb-2 text-gray-600 hover:text-blue-500"
            }
          >
            User Approvals
          </NavLink>
          <NavLink
            to="/admin-dashboard/scheduling"
            className={({ isActive }) =>
              isActive
                ? "border-b-2 border-blue-500 pb-2 text-blue-600"
                : "pb-2 text-gray-600 hover:text-blue-500"
            }
          >
            Scheduling
          </NavLink>
          <NavLink
            to="/admin-dashboard/shift-creation"
            className={({ isActive }) =>
              isActive
                ? "border-b-2 border-blue-500 pb-2 text-blue-600"
                : "pb-2 text-gray-600 hover:text-blue-500"
            }
          >
            Shift Creation
          </NavLink>
        </div>
        <Outlet />
        <div className="mt-8">
          {pendingUsers.length > 0 ? <div>
              <h2 className="text-xl mb-4">Pending User Approvals</h2>
              <ul className="space-y-4">
                {pendingUsers.map((user) => (
                  <li key={user.id} className="flex justify-between items-center p-4 border rounded-md">
                    <div>
                      <p className="font-semibold">{user.email}</p>
                      <p className="text-gray-600">{user.phoneNumber || "No phone number provided"}</p>
                    </div>
                    <form method="post">
                      <input type="hidden" name="userId" value={user.id} />
                      <button
                        type="submit"
                        className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:bg-green-400"
                      >
                        Approve User
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </div> : null}
          {pendingUsers.length === 0 ? <p className="text-gray-700">No users are currently pending approval.</p> : null}
        </div>
        <Link to="/" className="text-blue-500 underline hover:text-blue-700 mt-8 block">
          Go back to the home page
        </Link>
      </div>
    </div>
  );
}
