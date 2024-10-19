// app/routes/admin-dashboard.tsx

import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData, NavLink, Outlet, Form, useTransition } from "@remix-run/react";
import { useState } from "react";

import Modal from '~/components/Modal';
import { createShift, getShiftsByRestaurant } from "~/models/shift.server";
import { getUsersPendingApproval, approveUser, getUsersByRestaurantId, updateUser, deleteUser } from "~/models/user.server";
import { requireAdmin } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireAdmin(request);
  if (!user) {
    return redirect("/login");
  }

  const pendingUsers = await getUsersPendingApproval();
  const restaurantUsers = await getUsersByRestaurantId(user.restaurantId!);
  const shifts = await getShiftsByRestaurant(user.restaurantId!);
  return json({ pendingUsers, restaurantUsers, shifts, restaurantId: user.restaurantId, createdById: user.id });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const userId = formData.get("userId");

  if (typeof userId !== "string") {
    return json({ success: false, error: "Invalid user ID" });
  }

  switch (actionType) {
    case "approve":
      await approveUser(parseInt(userId));
      break;
    case "update": {
      const name = formData.get("name") as string | null;
      const role = formData.get("role") as string | null;
      const phoneNumber = formData.get("phoneNumber") as string | null;

      if (name && role) {
        await updateUser(parseInt(userId), { name, role, phoneNumber: phoneNumber ?? undefined });
      } else {
        return json({ success: false, error: "Invalid user data" });
      }
      break;
    }
    case "delete":
      await deleteUser(parseInt(userId));
      break;
    case "createShift": {
      const date = new Date(formData.get("date") as string);
      const startTime = new Date(`${formData.get("date")}T${formData.get("startTime")}:00`);
      const endTime = new Date(`${formData.get("date")}T${formData.get("endTime")}:00`);
      const assignedToId = formData.get("assignedToId") ? parseInt(formData.get("assignedToId") as string) : undefined;
      const restaurantId = parseInt(formData.get("restaurantId") as string);
      const createdById = parseInt(formData.get("createdById") as string);

      try {
        await createShift(date, startTime, endTime, restaurantId, createdById, undefined, assignedToId);
      } catch (error) {
        return json({ error: (error as Error).message }, { status: 400 });
      }
      break;
    }
    default:
      return json({ success: false, error: "Invalid action type" });
  }

  return json({ success: true });
};

export default function AdminDashboard() {
  const { pendingUsers, restaurantUsers, shifts, restaurantId, createdById } = useLoaderData<typeof loader>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalUser, setModalUser] = useState<{ id: number; name: string; role: string; phoneNumber: string | null } | null>(null);

  const openModal = (user: { id: number; name: string; role: string; phoneNumber: string | null }) => {
    setModalUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalUser(null);
  };

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
          {pendingUsers.length > 0 ? (
            <div>
              <h2 className="text-xl mb-4">Pending User Approvals</h2>
              <ul className="space-y-4">
                {pendingUsers.map((user) => (
                  <li key={user.id} className="flex justify-between items-center p-4 border rounded-md">
                    <div>
                      <p className="font-semibold">{user.email}</p>
                      <p className="text-gray-600">{user.phoneNumber || "No phone number provided"}</p>
                      <p className="text-gray-600">{user.name || "No name provided"}</p>
                    </div>
                    <Form method="post">
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="actionType" value="approve" />
                      <button
                        type="submit"
                        className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:bg-green-400"
                      >
                        Approve User
                      </button>
                    </Form>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {pendingUsers.length === 0 ? <p className="text-gray-700">No users are currently pending approval.</p> : null}
        </div>
        <div className="mt-8">
          <h2 className="text-xl mb-4">Manage Users</h2>
          <ul className="space-y-4">
            {restaurantUsers.map((user: { id: any; name: any; email?: any; phoneNumber: any; role: any; status?: any; }) => (
              <li key={user.id} className="flex justify-between items-center p-4 border rounded-md">
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-gray-600">{user.phoneNumber || "No phone number provided"}</p>
                  <p className="text-gray-600">Role: {user.role}</p>
                  <p className="text-gray-600">Status: {user.status}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => openModal(user)}
                    className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 focus:bg-yellow-400"
                  >
                    Edit User
                  </button>
                  <Form method="post">
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="actionType" value="delete" />
                    <button
                      type="submit"
                      className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:bg-red-400"
                    >
                      Delete User
                    </button>
                  </Form>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8">
          <h2 className="text-xl mb-4">Manage Shifts</h2>
          <ul className="space-y-4">
            {shifts.map((shift) => (
              <li key={shift.id} className="p-4 border rounded-md">
                <p className="font-semibold">Date: {new Date(shift.date).toLocaleDateString()}</p>
                <p>Start Time: {new Date(shift.startTime).toLocaleTimeString()}</p>
                <p>End Time: {new Date(shift.endTime).toLocaleTimeString()}</p>
                <p>Assigned To: {shift.assignedTo ? shift.assignedTo.name : "Unassigned"}</p>
              </li>
            ))}
          </ul>
          <Form method="post" className="space-y-4 mt-4">
            <input type="hidden" name="actionType" value="createShift" />
            <input type="hidden" name="restaurantId" value={restaurantId} />
            <input type="hidden" name="createdById" value={createdById} />
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700">
                Assign To (User ID)
              </label>
              <input
                type="number"
                id="assignedToId"
                name="assignedToId"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create Shift
            </button>
          </Form>
        </div>
      </div>
      {modalUser ? <Modal isOpen={isModalOpen} onClose={closeModal}>
          <h2 className="text-xl font-bold mb-4">Edit User</h2>
          <Form method="post">
            <input type="hidden" name="userId" value={modalUser.id} />
            <input type="hidden" name="actionType" value="update" />
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                defaultValue={modalUser.name}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <input
                type="text"
                name="role"
                defaultValue={modalUser.role}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                defaultValue={modalUser.phoneNumber ?? ""}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
              >
                Save
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 focus:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </Form>
        </Modal> : null}
    </div>
  );
}
