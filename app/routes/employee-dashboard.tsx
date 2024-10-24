import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { useState } from "react";

import { getShiftsForEmployee } from "~/models/shift.server";
import { requireUser } from "~/session.server";

import {
  createAvailability,
  getAvailabilityForUser,
} from "../models/availability.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  if (!user) {
    return redirect("/login");
  }

  const shifts = await getShiftsForEmployee(user.id);
  const availability = await getAvailabilityForUser(user.id);

  return json({ shifts, user, availability });
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const formData = await request.formData();
  const date = formData.get("date") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;

  if (user) {
    await createAvailability(user.id, date, startTime, endTime);
  }

  return redirect("/employee-dashboard");
};

export default function EmployeeDashboard() {
  const { shifts, user, availability } = useLoaderData<typeof loader>();
  const [availabilityForm, setAvailabilityForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });
  const [activeTab, setActiveTab] = useState("shifts");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setAvailabilityForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex min-h-full flex-col items-center">
      <div className="flex w-full items-center justify-between px-4 py-4 sm:px-8">
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="btn-primary rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </Form>
      </div>
      <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-4 sm:px-8">
        <h1 className="mb-4 text-2xl font-bold">Employee Dashboard</h1>
        <h2 className="mb-4 text-xl">Welcome, {user.name}</h2>

        {/* Tab Navigation */}
        <div className="mb-8 flex">
          {["shifts", "availability", "schedules"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`rounded px-4 py-2 text-sm font-medium ${
                activeTab === tab
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content Based on Active Tab */}
        <div className="mt-4">
          {activeTab === "shifts" ? (
            <div>
              <h2 className="mb-4 text-xl">My Shifts</h2>
              <ul className="space-y-4">
                {shifts.length > 0 ? (
                  shifts.map(
                    (shift: {
                      id: number;
                      date: string;
                      startTime: string;
                      endTime: string;
                      role: string;
                    }) => (
                      <li
                        key={shift.id}
                        className="flex items-center justify-between rounded-md border p-4"
                      >
                        <div>
                          <p className="font-semibold">
                            Shift Date:{" "}
                            {new Date(shift.date).toLocaleDateString("en-US")}
                          </p>
                          <p className="text-gray-600">
                            Start Time:{" "}
                            {new Date(shift.startTime).toLocaleTimeString(
                              "en-US",
                            )}
                          </p>
                          <p className="text-gray-600">
                            End Time:{" "}
                            {new Date(shift.endTime).toLocaleTimeString(
                              "en-US",
                            )}
                          </p>
                          <p className="text-gray-600">
                            Role: {shift.role || "Not Specified"}
                          </p>
                          <p className="font-semibold">
                            Shift Date:{" "}
                            {new Date(shift.date).toLocaleDateString("en-US")}
                          </p>
                        </div>
                      </li>
                    ),
                  )
                ) : (
                  <p className="text-gray-700">No shifts assigned yet.</p>
                )}
              </ul>
            </div>
          ) : null}

          {activeTab === "availability" ? (
            <div>
              <h2 className="mb-4 text-xl">Set Availability</h2>
              <Form method="post">
                <div className="mb-4">
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={availabilityForm.date}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="startTime"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={availabilityForm.startTime}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="endTime"
                    className="block text-sm font-medium text-gray-700"
                  >
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={availabilityForm.endTime}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
                >
                  Set Availability
                </button>
              </Form>

              <h2 className="mb-4 mt-8 text-xl">My Availability</h2>
              <ul className="space-y-4">
                {availability.length > 0 ? (
                  availability.map(
                    (avail: {
                      id: number;
                      date: string;
                      startTime: string;
                      endTime: string;
                    }) => (
                      <li
                        key={avail.id}
                        className="flex items-center justify-between rounded-md border p-4"
                      >
                        <div>
                          <p className="font-semibold">
                            Date:{" "}
                            {new Date(avail.date).toLocaleDateString("en-US")}
                          </p>
                          <p className="text-gray-600">
                            Start Time:{" "}
                            {new Date(avail.startTime).toLocaleTimeString(
                              "en-US",
                            )}
                          </p>
                          <p className="text-gray-600">
                            End Time:{" "}
                            {new Date(avail.endTime).toLocaleTimeString(
                              "en-US",
                            )}
                          </p>
                        </div>
                      </li>
                    ),
                  )
                ) : (
                  <p className="text-gray-700">No availability set yet.</p>
                )}
              </ul>
            </div>
          ) : null}

          {activeTab === "schedules" ? (
            <div>
              <h2 className="mb-4 text-xl">My Schedules</h2>
              <p className="text-gray-700">
                Schedules functionality coming soon.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
