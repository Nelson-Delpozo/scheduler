// app/routes/admin-dashboard/schedule-management.tsx

import { useFetcher } from "@remix-run/react";
import { useState } from "react";

interface Schedule {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  createdBy: {
    name: string;
  };
}

interface ScheduleManagementProps {
  schedules: Schedule[];
}

export default function ScheduleManagement({ schedules }: ScheduleManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const fetcher = useFetcher();

  const openModal = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedSchedule(null);
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Manage Schedules</h2>
      <ul className="space-y-4">
        {schedules.map((schedule) => (
          <li key={schedule.id} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div>
              <p className="text-gray-700 dark:text-gray-200">Name: {schedule.name}</p>
              <p className="text-gray-500 dark:text-gray-400">
                Start Date: {new Date(schedule.startDate).toLocaleDateString()} - End Date: {new Date(schedule.endDate).toLocaleDateString()}
              </p>
              <p className="text-gray-500 dark:text-gray-400">Created By: {schedule.createdBy.name}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => openModal(schedule)}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
              >
                Edit
              </button>
              <fetcher.Form method="post">
                <input type="hidden" name="actionType" value="delete-schedule" />
                <input type="hidden" name="scheduleId" value={schedule.id} />
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                >
                  Delete
                </button>
              </fetcher.Form>
            </div>
          </li>
        ))}
      </ul>

      <fetcher.Form method="post" className="mt-8">
        <input type="hidden" name="actionType" value="create-schedule" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            type="text"
            name="name"
            placeholder="Schedule Name"
            required
            className="p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <input
            type="date"
            name="startDate"
            required
            className="p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <input
            type="date"
            name="endDate"
            required
            className="p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Create Schedule
        </button>
      </fetcher.Form>

      {/* Edit Schedule Modal */}
      {isModalOpen && selectedSchedule ? <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Edit Schedule</h3>
            <fetcher.Form method="post" onSubmit={() => closeModal()}>
              <input type="hidden" name="actionType" value="update-schedule" />
              <input type="hidden" name="scheduleId" value={selectedSchedule.id} />
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={selectedSchedule.name}
                  required
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="startDate" className="block text-sm text-gray-700 dark:text-gray-300">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  defaultValue={new Date(selectedSchedule.startDate).toISOString().split("T")[0]}
                  required
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="endDate" className="block text-sm text-gray-700 dark:text-gray-300">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  defaultValue={new Date(selectedSchedule.endDate).toISOString().split("T")[0]}
                  required
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </fetcher.Form>
          </div>
        </div> : null}
    </div>
  );
}
