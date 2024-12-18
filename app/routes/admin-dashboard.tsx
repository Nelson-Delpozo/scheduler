import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useFetcher } from "@remix-run/react";
import { useState } from "react";

import Modal from "~/components/Modal";
import {
  createShift,
  updateShift,
  deleteShift,
  getShiftsByRestaurant,
} from "~/models/shift.server";
import {
  approveUser,
  getUsersByRestaurantId,
  updateUser,
  deleteUser,
  getUsersPendingApprovalByRestaurantId,
} from "~/models/user.server";
import { requireAdmin } from "~/session.server";

interface Shift {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  role: string | null;
  assignedTo: {
    name: string;
  } | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireAdmin(request);
  if (!user) {
    return redirect("/login");
  }

  if (user.restaurantId) {
    const pendingUsers = await getUsersPendingApprovalByRestaurantId(
      user.restaurantId,
    );
    const restaurantUsers = await getUsersByRestaurantId(user.restaurantId);
    const shifts = await getShiftsByRestaurant(user.restaurantId);

    return json({
      pendingUsers,
      restaurantUsers,
      shifts,
      restaurantId: user.restaurantId,
    });
  } else {
    // Handle the case when restaurantId is null
    return json({
      pendingUsers: [],
      restaurantUsers: [],
      shifts: [],
      restaurantId: null,
    });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  switch (actionType) {
    case "create-shift": {
      const date = formData.get("date") as string;
      const startTime = formData.get("startTime") as string;
      const endTime = formData.get("endTime") as string;
      const assignedToIdValue = formData.get("assignedToId");
      const assignedToId = assignedToIdValue
        ? parseInt(assignedToIdValue as string)
        : undefined;
      const restaurantId = parseInt(formData.get("restaurantId") as string);
      const createdById = parseInt(formData.get("createdById") as string);
      const role = String(formData.get("role"));

      if (
        !date ||
        !startTime ||
        !endTime ||
        isNaN(restaurantId) ||
        isNaN(createdById)
      ) {
        return json(
          {
            success: false,
            error: "Missing or invalid data.",
          },
          { status: 400 },
        );
      }

      try {
        // Parse the date and time correctly
        await createShift(
          new Date(date),
          new Date(`${date}T${startTime}:00`),
          new Date(`${date}T${endTime}:00`),
          role,
          restaurantId,
          createdById,
          undefined,
          assignedToId, // Will be null if not provided
        );
        return redirect("/admin-dashboard");
      } catch (error) {
        return json({ error: (error as Error).message }, { status: 400 });
      }
    }

    case "update-shift": {
      const shiftId = parseInt(formData.get("shiftId") as string);
      const date = formData.get("date") as string;
      const startTime = formData.get("startTime") as string;
      const endTime = formData.get("endTime") as string;
      const assignedToIdValue = formData.get("assignedToId");
      const assignedToId = assignedToIdValue
        ? parseInt(assignedToIdValue as string)
        : undefined;
      const role = String(formData.get("role"));

      if (!shiftId || !date || !startTime || !endTime) {
        return json(
          { success: false, error: "Missing or invalid data." },
          { status: 400 },
        );
      }

      try {
        // Treat the parsed time as local and convert to UTC
        const shiftDate = new Date(`${date}T00:00:00`);
        const shiftStartTime = new Date(`${date}T${startTime}:00`);
        const shiftEndTime = new Date(`${date}T${endTime}:00`);

        // Adjust times to UTC if needed
        const shiftStartTimeUTC = new Date(
          shiftStartTime.getTime() - shiftStartTime.getTimezoneOffset() * 60000,
        ).toISOString();

        const shiftEndTimeUTC = new Date(
          shiftEndTime.getTime() - shiftEndTime.getTimezoneOffset() * 60000,
        ).toISOString();

        // Construct update data with UTC times
        const updateData = {
          date: shiftDate.toISOString(),
          startTime: shiftStartTimeUTC,
          endTime: shiftEndTimeUTC,
          role,
          assignedToId,
        };

        await updateShift(
          shiftId,
          new Date(date),
          new Date(`${date}T${startTime}:00`),
          new Date(`${date}T${endTime}:00`),
          role,
          assignedToId,
          updateData,
        );

        return redirect("/admin-dashboard");
      } catch (error) {
        return json({ error: (error as Error).message }, { status: 400 });
      }
    }

    case "delete-shift": {
      const shiftId = parseInt(formData.get("shiftId") as string);

      if (!shiftId) {
        return json(
          { success: false, error: "Invalid shift ID." },
          { status: 400 },
        );
      }

      try {
        await deleteShift(shiftId);
        return redirect("/admin-dashboard");
      } catch (error) {
        return json({ error: (error as Error).message }, { status: 400 });
      }
    }

    case "approve": {
      const userId = formData.get("userId") as string;
      if (userId) {
        await approveUser(parseInt(userId));
      } else {
        return json(
          { success: false, error: "Invalid user ID." },
          { status: 400 },
        );
      }
      break;
    }
    case "update": {
      const userId = formData.get("userId") as string;
      const name = formData.get("name") as string | null;
      const role = formData.get("role") as string | null;
      const phoneNumber = formData.get("phoneNumber") as string | null;

      if (userId && name && role) {
        await updateUser(parseInt(userId), {
          name,
          role,
          phoneNumber: phoneNumber ?? undefined,
        });
      } else {
        return json(
          { success: false, error: "Invalid user data." },
          { status: 400 },
        );
      }
      break;
    }
    case "delete": {
      const userId = formData.get("userId") as string;
      if (userId) {
        await deleteUser(parseInt(userId));
      } else {
        return json(
          { success: false, error: "Invalid user ID." },
          { status: 400 },
        );
      }
      break;
    }
    default:
      return json(
        { success: false, error: "Invalid action type." },
        { status: 400 },
      );
  }

  return redirect("/admin-dashboard");
};

export default function AdminDashboard() {
  const { pendingUsers, restaurantUsers, shifts, restaurantId } =
    useLoaderData<typeof loader>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalShift, setModalShift] = useState<{
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    role: string;
    assignedTo?: number;
  } | null>(null);
  const [modalUser, setModalUser] = useState<{
    id: number;
    name: string;
    role: string;
    phoneNumber: string | null;
  } | null>(null);
  const [activeTab, setActiveTab] = useState("users");

  const openShiftModal = (shift: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    role: string;
    assignedTo: number;
  }) => {
    setModalShift(shift);
    setIsModalOpen(true);
  };

  const closeShiftModal = () => {
    setIsModalOpen(false);
    setModalShift(null);
  };

  const openModal = (user: {
    id: number;
    name: string;
    role: string;
    phoneNumber: string | null;
  }) => {
    setModalUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalUser(null);
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
        <h1 className="mb-4 text-2xl font-bold">Admin Dashboard</h1>
        <div className="mb-8 flex">
          <button
            onClick={() => setActiveTab("users")}
            className={`rounded px-4 py-2 text-sm font-medium ${
              activeTab === "users"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-blue-500"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("shifts")}
            className={`rounded px-4 py-2 text-sm font-medium ${
              activeTab === "shifts"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-blue-500"
            }`}
          >
            Shifts
          </button>
          <button
            onClick={() => setActiveTab("schedules")}
            className={`rounded px-4 py-2 text-sm font-medium ${
              activeTab === "schedules"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-blue-500"
            }`}
          >
            Schedules
          </button>
        </div>

        {activeTab === "users" ? (
          <div className="mt-8">
            <h2 className="mb-4 text-xl">Users Awaiting Approval</h2>
            {pendingUsers.length > 0 ? (
              <ul className="space-y-4">
                {pendingUsers.map((user) => (
                  <li
                    key={user.id}
                    className="flex flex-col items-center justify-between space-y-2 rounded-md border p-4 sm:flex-row sm:space-y-0"
                  >
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="font-semibold">{user.email}</p>
                      <p className="text-gray-600">
                        {user.phoneNumber || "No phone number provided"}
                      </p>
                    </div>
                    <Form
                      method="post"
                      className="mt-4 flex w-full sm:mt-0 sm:w-auto"
                    >
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="actionType" value="approve" />
                      <button
                        type="submit"
                        className="w-full rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 sm:w-auto"
                      >
                        Approve User
                      </button>
                    </Form>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700">
                No users are currently pending approval.
              </p>
            )}

            <h2 className="mb-4 mt-8 text-xl">Manage Users</h2>
            <ul className="space-y-4">
              {restaurantUsers
                .filter((user) => user.status?.toLowerCase() === "approved")
                .map((user) => (
                  <li
                    key={user.id}
                    className="flex flex-col items-center justify-between space-y-2 rounded-md border p-4 sm:flex-row sm:space-y-0"
                  >
                    <div className="w-full sm:w-auto">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-gray-600">{user.email}</p>
                      <p className="text-gray-600">
                        {user.phoneNumber || "No phone number provided"}
                      </p>
                      <p className="text-gray-600">Role: {user.role}</p>
                    </div>
                    <div className="mt-2 flex w-full flex-col space-y-2 sm:mt-0 sm:w-auto sm:flex-row sm:space-x-2 sm:space-y-0">
                      <button
                        type="button"
                        onClick={() => openModal(user)}
                        className="w-full rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 sm:w-auto"
                      >
                        Edit User
                      </button>
                      <Form method="post" className="w-full sm:w-auto">
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="actionType" value="delete" />
                        <button
                          type="submit"
                          className="w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 sm:w-auto"
                        >
                          Delete User
                        </button>
                      </Form>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        ) : null}

        {/* Shifts Tab */}
        {activeTab === "shifts" ? (
          <div className="mt-8">
            <h2 className="mb-4 text-xl">Create and Manage Shifts</h2>
            <Form method="post" className="mb-4">
              <input type="hidden" name="actionType" value="create-shift" />
              <input type="hidden" name="restaurantId" value={restaurantId} />
              <input
                type="hidden"
                name="createdById"
                value={restaurantUsers[0]?.id || ""}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <input
                  type="date"
                  name="date"
                  required
                  className="rounded border p-2"
                />
                <input
                  type="time"
                  name="startTime"
                  required
                  className="rounded border p-2"
                />
                <input
                  type="time"
                  name="endTime"
                  required
                  className="rounded border p-2"
                />
                <select name="assignedToId" className="rounded border p-2">
                  <option value="">Unassigned</option>
                  {restaurantUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.id} - {user.name}
                    </option>
                  ))}
                </select>

                <select name="role" className="rounded border p-2" required>
                  <option value="">Select Role</option>
                  <option value="dr-manager">DR Manager</option>
                  <option value="bar-manager">Bar Manager</option>
                  <option value="kitchen-manager">Kitchen Manager</option>
                  <option value="server">Server</option>
                  <option value="bartender">Bartender</option>
                  <option value="chips">Chips</option>
                  <option value="cook">Cook</option>
                  <option value="busser">Busser</option>
                  <option value="barback">Barback</option>
                </select>
              </div>
              <button
                type="submit"
                className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Create Shift
              </button>
            </Form>
            <ul className="space-y-4">
              <ul className="space-y-4">
                {shifts.map((shift: Shift) => {
                  // Parse the shift date string as a UTC date
                  // const shiftDate = new Date(shift.date);

                  // // Extract the year, month, and day in UTC to prevent local timezone adjustments
                  // const formattedDate = shiftDate.toLocaleDateString("en-US", {
                  //   year: "numeric",
                  //   month: "2-digit",
                  //   day: "2-digit",
                  //   timeZone: "UTC",
                  // });

                  // // Format the start and end times in the user's local time zone
                  // const formattedStartTime = new Date(
                  //   shift.startTime,
                  // ).toLocaleTimeString(undefined, {
                  //   hour: "2-digit",
                  //   minute: "2-digit",
                  //   hour12: true,
                  // });

                  // const formattedEndTime = new Date(
                  //   shift.endTime,
                  // ).toLocaleTimeString(undefined, {
                  //   hour: "2-digit",
                  //   minute: "2-digit",
                  //   hour12: true,
                  // });

                  return (
                    <li
                      key={shift.id}
                      className="flex flex-col items-center justify-between space-y-2 rounded-md border p-4 sm:flex-row sm:space-y-0"
                    >
                      <div className="w-full sm:w-auto">
                        <p className="font-semibold">
                          Date:{" "}
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
                        <p>Role: {shift.role || "Unassigned"}</p>
                        <p>
                          Assigned To:{" "}
                          {shift.assignedTo
                            ? shift.assignedTo.name
                            : "Unassigned"}
                        </p>
                      </div>
                      <div className="mt-2 flex w-full flex-col space-y-2 sm:mt-0 sm:w-auto sm:flex-row sm:space-x-2 sm:space-y-0">
                        <button
                          type="button"
                          onClick={() => openShiftModal(shift)}
                          className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <Form method="post">
                          <input
                            type="hidden"
                            name="shiftId"
                            value={shift.id}
                          />
                          <input
                            type="hidden"
                            name="actionType"
                            value="delete-shift"
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
                  );
                })}
              </ul>
            </ul>
          </div>
        ) : null}

        {activeTab === "schedules" ? (
          <div className="mt-8">
            <h2 className="mb-4 text-xl">Schedules</h2>
            <p className="text-gray-700">
              Schedules functionality coming soon.
            </p>
          </div>
        ) : null}
      </div>

      {modalUser ? (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="mx-auto w-full max-w-md rounded-md bg-white p-6 shadow-lg sm:max-w-lg md:max-w-2xl">
            <h2 className="mb-4 text-xl font-bold">Edit User</h2>
            <fetcher.Form
              method="post"
              action="/admin-dashboard"
              onSubmit={() => {
                // Use a small delay to allow Remix to handle the form submission before closing
                setTimeout(() => {
                  closeModal();
                }, 0);
              }}
            >
              <input type="hidden" name="userId" value={modalUser.id} />
              <input type="hidden" name="actionType" value="update" />
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={modalUser.name}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Role
                </label>
                <input
                  type="text"
                  name="role"
                  defaultValue={modalUser.role}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  defaultValue={modalUser.phoneNumber ?? ""}
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
                  onClick={closeModal}
                  className="rounded bg-gray-500 px-6 py-2 text-white hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </fetcher.Form>
          </div>
        </Modal>
      ) : null}

      {/* Modal for editing shifts */}
      {modalShift ? (
        <Modal isOpen={isModalOpen} onClose={closeShiftModal}>
          <div className="mx-auto w-full max-w-md rounded-md bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Edit Shift</h2>
            <fetcher.Form
              method="post"
              action="/admin-dashboard"
              onSubmit={() => {
                // Use a small delay to allow Remix to handle the form submission before closing
                setTimeout(() => {
                  closeModal();
                }, 0);
              }}
            >
              <input type="hidden" name="shiftId" value={modalShift.id} />
              <input type="hidden" name="actionType" value="update-shift" />
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
                    new Date(modalShift.date).toISOString().split("T")[0]
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
                    modalShift.startTime,
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
                    modalShift.endTime,
                  ).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="assignedToId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Assigned To
                </label>
                <select
                  name="assignedToId"
                  defaultValue={
                    modalShift.assignedTo ? modalShift.assignedTo.name : ""
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                >
                  <option value="">Unassigned</option>
                  {restaurantUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Role
                </label>
                <select
                  name="role"
                  defaultValue={modalShift.role || ""}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                >
                  <option value="dr-manager">DR Manager</option>
                  <option value="bar-manager">Bar Manager</option>
                  <option value="kitchen-manager">Kitchen Manager</option>
                  <option value="server">Server</option>
                  <option value="bartender">Bartender</option>
                  <option value="chips">Chips</option>
                  <option value="cook">Cook</option>
                  <option value="busser">Busser</option>
                  <option value="barback">Barback</option>
                </select>
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
                  onClick={closeShiftModal}
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
