import { useFetcher } from "@remix-run/react";
import { useState } from "react";

import Modal from "~/components/Modal";

// Define the type for a schedule item
interface ScheduleItem {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  role: string;
}

interface SchedulesProps {
  schedules: ScheduleItem[];
}

export default function Schedules({ schedules }: SchedulesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSchedule, setModalSchedule] = useState<ScheduleItem | null>(null);

  const openModal = (schedule: ScheduleItem) => {
    setModalSchedule(schedule);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalSchedule(null);
  };

  const fetcher = useFetcher();

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold dark:text-gray-200">My Schedules</h2>
      <ul className="space-y-4">
        {schedules.length > 0 ? (
          schedules.map((schedule) => (
            <li
              key={schedule.id}
              className="flex items-center justify-between rounded-md border p-4 dark:bg-gray-800 dark:border-gray-700"
            >
              <div>
                <p className="font-semibold dark:text-gray-300">
                  Date: {schedule.date}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Start Time: {schedule.startTime}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  End Time: {schedule.endTime}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Role: {schedule.role}
                </p>
              </div>
              <button
                onClick={() => openModal(schedule)}
                className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
              >
                Edit
              </button>
            </li>
          ))
        ) : (
          <p className="text-gray-700 dark:text-gray-300">No schedules available.</p>
        )}
      </ul>

      {/* Modal for editing schedule */}
      {modalSchedule ? <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="mx-auto w-full max-w-md rounded-md bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold dark:text-gray-200">Edit Schedule</h2>
            <fetcher.Form method="post">
              <input type="hidden" name="scheduleId" value={modalSchedule.id} />
              <input type="hidden" name="actionType" value="update-schedule" />
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
                  defaultValue={modalSchedule.date}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:focus:border-blue-500"
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
                  defaultValue={modalSchedule.startTime}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:focus:border-blue-500"
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
                  defaultValue={modalSchedule.endTime}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:focus:border-blue-500"
                />
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  type="submit"
                  className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded bg-gray-500 px-6 py-2 text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </fetcher.Form>
          </div>
        </Modal> : null}
    </div>
  );
}
