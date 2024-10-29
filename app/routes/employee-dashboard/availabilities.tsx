import { Form, useFetcher } from "@remix-run/react";
import { useState } from "react";

import Modal from "~/components/Modal";

// Define the type for an availability item
interface AvailabilityItem {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
}

interface AvailabilityProps {
  availability: AvailabilityItem[];
}

export default function Availability({ availability }: AvailabilityProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAvailability, setModalAvailability] =
    useState<AvailabilityItem | null>(null);

  const openModal = (availability: AvailabilityItem) => {
    setModalAvailability(availability);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalAvailability(null);
  };

  const fetcher = useFetcher();

  return (
    <div>
      <h2 className="mb-4 text-xl">My Availability</h2>
      <ul className="space-y-4">
        {availability.length > 0 ? (
          availability.map((avail) => (
            <li
              key={avail.id}
              className="flex flex-col items-center justify-between space-y-2 rounded-md border p-4 sm:flex-row sm:space-y-0"
            >
              <div className="w-full sm:w-auto">
                <p className="font-semibold">Date: {avail.date}</p>
                <p className="text-gray-600">Start Time: {avail.startTime}</p>
                <p className="text-gray-600">End Time: {avail.endTime}</p>
              </div>
              <div className="mt-2 flex w-full flex-col space-y-2 sm:mt-0 sm:w-auto sm:flex-row sm:space-x-2 sm:space-y-0">
                <button
                  type="button"
                  onClick={() => openModal(avail)}
                  className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                >
                  Edit
                </button>
                <Form method="post">
                  <input type="hidden" name="availabilityId" value={avail.id} />
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

      {/* Modal for editing availability */}
      {modalAvailability ? (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="mx-auto w-full max-w-md rounded-md bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Edit Availability</h2>
            <fetcher.Form method="post">
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
                  defaultValue={modalAvailability.date}
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
                  defaultValue={modalAvailability.startTime}
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
                  defaultValue={modalAvailability.endTime}
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
    </div>
  );
}
