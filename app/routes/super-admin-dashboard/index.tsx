// app/routes/super-admin-dashboard/index.tsx

import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { useState } from "react";


import { getAllRestaurants, getPendingRestaurants } from "~/models/restaurant.server";
import { getAllUsers } from "~/models/user.server";
import { requireSuperAdmin } from "~/session.server";

import RestaurantManagement from "./restaurant-management";
import UserManagement from "./user-management";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireSuperAdmin(request);
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const restaurants = await getAllRestaurants();
  const pendingRestaurants = await getPendingRestaurants();
  const users = await getAllUsers();

  return json({ restaurants, pendingRestaurants, users });
};

export default function SuperAdminDashboard() {
  const { restaurants, pendingRestaurants, users } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState("restaurants");

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 dark:bg-gray-900">
      <div className="flex w-full items-center justify-between px-4 py-4 sm:px-8 bg-white dark:bg-gray-800 shadow">
        <h1 className="text-2xl font-bold dark:text-gray-200">Super Admin Dashboard</h1>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
          >
            Logout
          </button>
        </Form>
      </div>

      <div className="w-full max-w-5xl px-4 py-6 sm:px-8">
        <div className="mb-8 flex space-x-4">
          <button
            onClick={() => setActiveTab("restaurants")}
            className={`rounded px-4 py-2 text-sm font-medium ${
              activeTab === "restaurants"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-blue-500"
            }`}
          >
            Restaurants
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`rounded px-4 py-2 text-sm font-medium ${
              activeTab === "users"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-blue-500"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("metrics")}
            className={`rounded px-4 py-2 text-sm font-medium ${
              activeTab === "metrics"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-blue-500"
            }`}
          >
            Metrics
          </button>
        </div>

        {activeTab === "restaurants" ? <RestaurantManagement restaurants={restaurants} pendingRestaurants={pendingRestaurants} /> : null}
        {activeTab === "users" ? <UserManagement users={users} /> : null}
        {activeTab === "metrics" ? <div className="mt-8">
            <h2 className="text-xl font-semibold dark:text-gray-200">Metrics</h2>
            <p className="text-gray-700 dark:text-gray-400">Metrics functionality coming soon.</p>
          </div> : null}
      </div>
    </div>
  );
}
