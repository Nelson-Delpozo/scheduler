// app/routes/admin-dashboard.tsx

import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { getUsersPendingApproval, approveUser } from "~/models/user.server";
import { requireAdmin } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireAdmin(request);
  if (!user) {
    return redirect("/login");
  }

  const pendingUsers = await getUsersPendingApproval();
  return json({ pendingUsers });
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireAdmin(request);
  if (!user) {
    return redirect("/login");
  }

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
    <div className="flex min-h-full flex-col">
      <div className="mx-auto w-full max-w-5xl px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="flex space-x-6 mb-10">
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
          <NavLink
            to="/admin-dashboard/restaurant-approval"
            className={({ isActive }) =>
              isActive
                ? "border-b-2 border-blue-500 pb-2 text-blue-600"
                : "pb-2 text-gray-600 hover:text-blue-500"
            }
          >
            Restaurant Approvals
          </NavLink>
        </div>
        <Outlet />
        <div className="mt-8">
          <h2 className="text-2xl mb-4">Pending Users for Approval</h2>
          {pendingUsers.length > 0 ? (
            <ul className="space-y-4">
              {pendingUsers.map((user) => (
                <li key={user.id} className="flex justify-between items-center p-4 border rounded-md">
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-gray-600">{user.email}</p>
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
          ) : (
            <p className="text-gray-700">No users are currently pending approval.</p>
          )}
        </div>
        <Link to="/" className="text-blue-500 underline hover:text-blue-700 mt-8 block">
          Go back to the home page
        </Link>
      </div>
    </div>
  );
}
