// app/routes/employee-dashboard/shifts.tsx

import { useFetcher } from "@remix-run/react";
import { useState } from "react";

import Modal from "~/components/Modal";

interface Shift {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  role: string;
}

interface ShiftsProps {
  shifts: Shift[];
}

export default function Shifts({ shifts }: ShiftsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalShift, setModalShift] = useState<Shift | null>(null);

  const openModal = (shift: Shift) => {
    setModalShift(shift);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalShift(null);
  };

  const fetcher = useFetcher();

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
        My Shifts
      </h2>
      <ul className="space-y-4">
        {shifts.length > 0 ? (
          shifts.map((shift) => (
            <li
              key={shift.id}
              className="flex items-center justify-between rounded-md border bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-300">
                  Date: {new Date(shift.date).toLocaleDateString("en-US")}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Start: {new Date(shift.startTime).toLocaleTimeString("en-US")}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  End: {new Date(shift.endTime).toLocaleTimeString("en-US")}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Role: {shift.role || "Not Specified"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openModal(shift)}
                className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
              >
                Edit
              </button>
            </li>
          ))
        ) : (
          <p className="text-gray-700 dark:text-gray-300">
            No shifts assigned yet.
          </p>
        )}
      </ul>

      {modalShift ? (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="mx-auto w-full max-w-md rounded-md bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-gray-200">
              Edit Shift
            </h2>
            <fetcher.Form method="post" action="/employee-dashboard/shifts">
              <input type="hidden" name="shiftId" value={modalShift.id} />
              <input type="hidden" name="actionType" value="update-shift" />
              <div className="mb-4">
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
                    new Date(modalShift.date).toISOString().split("T")[0]
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="endTime"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  defaultValue={new Date(modalShift.endTime).toLocaleTimeString(
                    "en-GB",
                    { hour: "2-digit", minute: "2-digit" },
                  )}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="submit"
                  className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
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
