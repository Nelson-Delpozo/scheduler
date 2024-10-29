// app/routes/super-admin-dashboard/restaurant-management.tsx

import { Form, useFetcher } from "@remix-run/react";
import { useState } from "react";

import Modal from "~/components/Modal";

interface Restaurant {
  id: number;
  name: string;
  location: string | null;
  phoneNumber: string | null;
  status: string;
}

interface RestaurantManagementProps {
  restaurants: Restaurant[];
  pendingRestaurants: Restaurant[];
}

export default function RestaurantManagement({
  restaurants,
  pendingRestaurants,
}: RestaurantManagementProps) {
  const fetcher = useFetcher();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRestaurant, setModalRestaurant] = useState<Restaurant | null>(
    null,
  );

  const openModal = (restaurant: Restaurant) => {
    setModalRestaurant(restaurant);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalRestaurant(null);
  };

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-semibold dark:text-gray-200">
        Pending Restaurants for Approval
      </h2>
      {pendingRestaurants.length > 0 ? (
        <ul className="space-y-4">
          {pendingRestaurants.map((restaurant) => (
            <li
              key={restaurant.id}
              className="flex flex-col items-center justify-between space-y-2 rounded-md border p-4 dark:border-gray-700 sm:flex-row sm:space-y-0"
            >
              <div className="w-full sm:w-auto">
                <p className="font-semibold dark:text-gray-300">
                  {restaurant.name}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {restaurant.location || "No location provided"}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {restaurant.phoneNumber || "No phone number provided"}
                </p>
              </div>
              <Form method="post" action="/admin-approve-restaurant">
                <input
                  type="hidden"
                  name="restaurantId"
                  value={restaurant.id}
                />
                <button
                  type="submit"
                  className="w-full rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 sm:w-auto"
                >
                  Approve
                </button>
              </Form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-700 dark:text-gray-400">
          No restaurants are currently pending approval.
        </p>
      )}

      <h2 className="mb-4 mt-8 text-2xl font-semibold dark:text-gray-200">
        All Restaurants
      </h2>
      <ul className="space-y-4">
        {restaurants.map((restaurant) => (
          <li
            key={restaurant.id}
            className="flex flex-col items-center justify-between space-y-2 rounded-md border p-4 dark:border-gray-700 sm:flex-row sm:space-y-0"
          >
            <div className="w-full sm:w-auto">
              <p className="font-semibold dark:text-gray-300">
                {restaurant.name}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {restaurant.location || "No location provided"}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {restaurant.phoneNumber || "No phone number provided"}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Status: {restaurant.status}
              </p>
            </div>
            <div className="mt-4 flex w-full flex-col space-y-2 sm:mt-0 sm:w-auto sm:flex-row sm:space-x-2 sm:space-y-0">
              <button
                type="button"
                onClick={() => openModal(restaurant)}
                className="w-full rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 sm:w-auto"
              >
                Edit
              </button>
              <Form method="post" className="w-full sm:w-auto">
                <input
                  type="hidden"
                  name="restaurantId"
                  value={restaurant.id}
                />
                <input type="hidden" name="actionType" value="delete" />
                <button
                  type="submit"
                  className="w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 sm:w-auto"
                >
                  Delete
                </button>
              </Form>
            </div>
          </li>
        ))}
      </ul>

      {modalRestaurant ? (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="mx-auto w-full max-w-md rounded-md bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold dark:text-gray-200">
              Edit Restaurant
            </h2>
            <fetcher.Form method="post" action="/super-admin-dashboard">
              <input
                type="hidden"
                name="restaurantId"
                value={modalRestaurant.id}
              />
              <input type="hidden" name="actionType" value="update" />
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={modalRestaurant.name}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  defaultValue={modalRestaurant.location || ""}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  defaultValue={modalRestaurant.phoneNumber || ""}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-white"
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
