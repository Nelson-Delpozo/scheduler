// app/routes/admin-dashboard/shift-management.tsx

import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useFetcher } from "@remix-run/react";
import { useState } from "react";

import Modal from "~/components/Modal";
import {
  getShiftsByRestaurant,
  updateShift,
  deleteShift,
} from "~/models/shift.server";
import { requireAdmin } from "~/session.server";

interface Shift {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  role: string | null;
  assignedTo: { name: string } | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireAdmin(request);
  if (!user) throw new Response("Unauthorized", { status: 401 });

  const shifts = await getShiftsByRestaurant(user.restaurantId!);
  return json({ shifts });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const shiftId = parseInt(formData.get("shiftId") as string);

  if (actionType === "delete-shift") {
    await deleteShift(shiftId);
  } else if (actionType === "update-shift") {
    const date = formData.get("date") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const role = formData.get("role") as string;

    await updateShift(shiftId, { date, startTime, endTime, role });
  }

  return json({ success: true });
};

export default function ShiftManagement({
    shifts,
  }: {
    shifts: Shift[];
    restaurantUsers: { id: number; name: string }[];
  }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
    const fetcher = useFetcher();
  
    const openModal = (shift: Shift) => {
      setSelectedShift(shift);
      setIsModalOpen(true);
    };
  
    const closeModal = () => {
      setSelectedShift(null);
      setIsModalOpen(false);
    };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">
        Manage Shifts
      </h2>
      <ul className="mt-4 space-y-4">
        {shifts.map((shift: Shift) => (
          <li
            key={shift.id}
            className="flex justify-between rounded-md bg-gray-100 p-4 dark:bg-gray-800"
          >
            <div>
              <p className="text-gray-700 dark:text-gray-200">
                Date: {new Date(shift.date).toLocaleDateString()}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Time: {new Date(shift.startTime).toLocaleTimeString()} -{" "}
                {new Date(shift.endTime).toLocaleTimeString()}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Role: {shift.role || "Unassigned"}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Assigned To:{" "}
                {shift.assignedTo ? shift.assignedTo.name : "Unassigned"}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => openModal(shift)}
                className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
              >
                Edit
              </button>
              <Form method="post">
                <input type="hidden" name="shiftId" value={shift.id} />
                <input type="hidden" name="actionType" value="delete-shift" />
                <button
                  type="submit"
                  className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </Form>
            </div>
          </li>
        ))}
      </ul>

      {isModalOpen && selectedShift ? (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <fetcher.Form
            method="post"
            className="rounded-md bg-white p-6 dark:bg-gray-900"
          >
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              Edit Shift
            </h3>
            <input type="hidden" name="shiftId" value={selectedShift.id} />
            <input type="hidden" name="actionType" value="update-shift" />
            <div className="mt-4">
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Date
              </label>
              <input
                type="date"
                name="date"
                defaultValue={
                  new Date(selectedShift.date).toISOString().split("T")[0]
                }
                className="mt-1 w-full rounded border p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="startTime"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                defaultValue={new Date(selectedShift.startTime)
                  .toLocaleTimeString("en-GB")
                  .slice(0, 5)}
                className="mt-1 w-full rounded border p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="endTime"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                defaultValue={new Date(selectedShift.endTime)
                  .toLocaleTimeString("en-GB")
                  .slice(0, 5)}
                className="mt-1 w-full rounded border p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Role
              </label>
              <input
                type="text"
                name="role"
                defaultValue={selectedShift.role || ""}
                className="mt-1 w-full rounded border p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                type="submit"
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Save
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </fetcher.Form>
        </Modal>
      ) : null}
    </div>
  );
}
