import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useFetcher } from "@remix-run/react";
import { useState } from "react";

import Modal from "~/components/Modal";
import { getShiftsForEmployee } from "~/models/shift.server";
import { requireUser } from "~/session.server";

import {
  createAvailability,
  getAvailabilityForUser,
  updateAvailability,
  deleteAvailability,
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
  const actionType = formData.get("actionType");

  switch (actionType) {
    case "create-availability": {
      const date = formData.get("date") as string;
      const startTime = formData.get("startTime") as string;
      const endTime = formData.get("endTime") as string;

      if (!date || !startTime || !endTime) {
        return json(
          { success: false, error: "Missing or invalid data." },
          { status: 400 },
        );
      }

      await createAvailability(user.id, date, startTime, endTime);
      return redirect("/employee-dashboard");
    }

    case "update-availability": {
      const availabilityId = parseInt(formData.get("availabilityId") as string);
      const date = formData.get("date") as string;
      const startTime = formData.get("startTime") as string;
      const endTime = formData.get("endTime") as string;

      if (!availabilityId || !date || !startTime || !endTime) {
        return json(
          { success: false, error: "Missing or invalid data." },
          { status: 400 },
        );
      }

      try {
        // Treat the parsed time as local and convert to UTC
        const availabilityDate = new Date(`${date}T00:00:00`);
        const availabilityStartTime = new Date(`${date}T${startTime}:00`);
        const availabilityEndTime = new Date(`${date}T${endTime}:00`);

        // Adjust times to UTC if needed
        const availabilityStartTimeUTC = new Date(
          availabilityStartTime.getTime() -
            availabilityStartTime.getTimezoneOffset() * 60000,
        ).toISOString();

        const availabilityEndTimeUTC = new Date(
          availabilityEndTime.getTime() -
            availabilityEndTime.getTimezoneOffset() * 60000,
        ).toISOString();

        // Construct update data with UTC times
        const updateData = {
          date: availabilityDate.toISOString(),
          startTime: availabilityStartTimeUTC,
          endTime: availabilityEndTimeUTC,
        };

        await updateAvailability(
          availabilityId,
          new Date(date),
          new Date(`${date}T${startTime}:00`),
          new Date(`${date}T${endTime}:00`),
          updateData,
        );

        return redirect("/employee-dashboard");
      } catch (error) {
        return json({ error: (error as Error).message }, { status: 400 });
      }
    }

    case "delete-availability": {
      const availabilityId = parseInt(formData.get("availabilityId") as string);

      if (!availabilityId) {
        return json(
          { success: false, error: "Invalid availability ID." },
          { status: 400 },
        );
      }

      await deleteAvailability(availabilityId);
      return redirect("/employee-dashboard");
    }

    default:
      return json(
        { success: false, error: "Invalid action type." },
        { status: 400 },
      );
  }
};

export default function EmployeeDashboard() {
  const { shifts, user, availability } = useLoaderData<typeof loader>();
  const [availabilityForm, setAvailabilityForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });
  const [modalAvailability, setModalAvailability] = useState<{
    id: number;
    date: string;
    startTime: string;
    endTime: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const openAvailabilityModal = (availability: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
  }) => {
    setModalAvailability(availability);
    setIsModalOpen(true);
  };

  const closeAvailabilityModal = () => {
    setIsModalOpen(false);
    setModalAvailability(null);
  };

  const fetcher = useFetcher();

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
                  shifts.map((shift) => (
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
                          {new Date(shift.endTime).toLocaleTimeString("en-US")}
                        </p>
                        <p className="text-gray-600">
                          Role: {shift.role || "Not Specified"}
                        </p>
                      </div>
                    </li>
                  ))
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
                <input
                  type="hidden"
                  name="actionType"
                  value="create-availability"
                />
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
                  availability.map((avail) => (
                    <li
                      key={avail.id}
                      className="flex flex-col items-center justify-between space-y-2 rounded-md border p-4 sm:flex-row sm:space-y-0"
                    >
                      <div className="w-full sm:w-auto">
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
                          {new Date(avail.endTime).toLocaleTimeString("en-US")}
                        </p>
                      </div>
                      <div className="mt-2 flex w-full flex-col space-y-2 sm:mt-0 sm:w-auto sm:flex-row sm:space-x-2 sm:space-y-0">
                        <button
                          type="button"
                          onClick={() => openAvailabilityModal(avail)}
                          className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <Form method="post">
                          <input
                            type="hidden"
                            name="availabilityId"
                            value={avail.id}
                          />
                          <input
                            type="hidden"
                            name="actionType"
                            value="delete-availability"
                          />
                          <button
                            type="submit"
                            className="w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 sm:w-auto"
                          >
                            Delete
                          </button>
                        </Form>
                      </div>
                    </li>
                  ))
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

      {/* Modal for editing availability */}
      {modalAvailability ? (
        <Modal isOpen={isModalOpen} onClose={closeAvailabilityModal}>
          <div className="mx-auto w-full max-w-md rounded-md bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Edit Availability</h2>
            <fetcher.Form
              method="post"
              onSubmit={() => {
                // Use a small delay to allow Remix to handle the form submission before closing
                setTimeout(() => {
                  closeAvailabilityModal();
                }, 0);
              }}
            >
              <input
                type="hidden"
                name="availabilityId"
                value={modalAvailability.id}
              />
              <input
                type="hidden"
                name="actionType"
                value="update-availability"
              />
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
                  defaultValue={
                    new Date(modalAvailability.date).toISOString().split("T")[0]
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
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
                  defaultValue={new Date(
                    modalAvailability.startTime,
                  ).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
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
                  defaultValue={new Date(
                    modalAvailability.endTime,
                  ).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  type="submit"
                  className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={closeAvailabilityModal}
                  className="rounded bg-gray-500 px-6 py-2 text-white hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </fetcher.Form>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
