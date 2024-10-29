// app/routes/admin-dashboard/index.tsx

import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";

import { getSchedulesByRestaurant } from "~/models/schedule.server";
import { getShiftsByRestaurant } from "~/models/shift.server";
import { getUsersByRestaurantId, getUsersPendingApprovalByRestaurantId } from "~/models/user.server";
import { requireAdmin } from "~/session.server";

import ScheduleManagement from "./schedule-management";
import ShiftManagement from "./shift-management";
import UserManagement from "./user-management";


export const loader: LoaderFunction = async ({ request }) => {
    const user = await requireAdmin(request);
  
    if (!user || !user.restaurantId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const pendingUsers = await getUsersPendingApprovalByRestaurantId(user.restaurantId);
    const restaurantUsers = await getUsersByRestaurantId(user.restaurantId);
    const shifts = await getShiftsByRestaurant(user.restaurantId);
    const schedules = await getSchedulesByRestaurant(user.restaurantId); // Fetch schedules
  
    return json({
      pendingUsers,
      restaurantUsers,
      shifts,
      schedules, // Add schedules to the response
      restaurantId: user.restaurantId,
    });
  };
  

export default function AdminDashboard() {
  const { pendingUsers, restaurantUsers, shifts, schedules } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 dark:bg-gray-900">
      <div className="flex w-full items-center justify-between px-4 py-4 sm:px-8 bg-white dark:bg-gray-800 shadow">
        <h1 className="text-2xl font-bold dark:text-gray-200">Admin Dashboard</h1>
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
        <div className="mb-8 flex">
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
            onClick={() => setActiveTab("shifts")}
            className={`rounded px-4 py-2 text-sm font-medium ${
              activeTab === "shifts"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-blue-500"
            }`}
          >
            Shifts
          </button>
          <button
            onClick={() => setActiveTab("schedules")}
            className={`rounded px-4 py-2 text-sm font-medium ${
              activeTab === "schedules"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-blue-500"
            }`}
          >
            Schedules
          </button>
        </div>

        {/* Conditional Rendering for Active Tab */}
        {activeTab === "users" ? <UserManagement pendingUsers={pendingUsers} restaurantUsers={restaurantUsers} /> : null}
        {activeTab === "shifts" ? <ShiftManagement shifts={shifts} restaurantUsers={restaurantUsers} /> : null}
        {activeTab === "schedules" ? <ScheduleManagement schedules={schedules} /> : null}

      </div>
    </div>
  );
}
