// app/routes/employee-dashboard/index.tsx

import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";

import { getAvailabilityForUser } from "~/models/availability.server";
import { getShiftsForEmployee } from "~/models/shift.server";
import { requireUser } from "~/session.server";

import Availability from "./availabilities";
import Schedules from "./schedules";
import Shifts from "./shifts";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  if (!user) return json({ error: "Unauthorized" }, { status: 401 });

  const shifts = await getShiftsForEmployee(user.id);
  const availability = await getAvailabilityForUser(user.id);

  return json({ shifts, availability, user });
};

export default function EmployeeDashboard() {
  const { shifts, availability } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState("shifts");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "shifts":
        return <Shifts shifts={shifts} />;
      case "availability":
        return <Availability availability={availability} />;
      case "schedules":
        return <Schedules schedules={[]} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-5xl px-4 py-4 sm:px-8">
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Employee Dashboard
          </h1>
          <Form action="/logout" method="post">
            <button
              type="submit"
              className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 dark:bg-red-600"
            >
              Logout
            </button>
          </Form>
        </div>

        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setActiveTab("shifts")}
            className={`rounded px-4 py-2 text-sm font-medium ${
              activeTab === "shifts"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            Shifts
          </button>
          <button
            onClick={() => setActiveTab("availability")}
            className={`rounded px-4 py-2 text-sm font-medium ${
              activeTab === "availability"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            Availabilities
          </button>
          <button
            onClick={() => setActiveTab("schedules")}
            className={`rounded px-4 py-2 text-sm font-medium ${
              activeTab === "schedules"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            Schedules
          </button>
        </div>

        <div className="mt-4">{renderActiveTab()}</div>
      </div>
    </div>
  );
}
