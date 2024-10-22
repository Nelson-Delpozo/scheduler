// app/routes/super-admin-dashboard.tsx

import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import { useState } from "react";


import Modal from "~/components/Modal";
import {
  getAllRestaurants,
  getPendingRestaurants,
  approveRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "~/models/restaurant.server";
import { requireSuperAdmin } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireSuperAdmin(request);
  if (!user) {
    return redirect("/login");
  }
  

  const restaurants = await getAllRestaurants();
  const pendingRestaurants = await getPendingRestaurants();
  return json({ restaurants, pendingRestaurants });
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireSuperAdmin(request);
  if (!user) {
    return redirect("/login");
  }

  

  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const restaurantId = formData.get("restaurantId");

  if (typeof restaurantId === "string") {
    const parsedRestaurantId = parseInt(restaurantId);
    switch (actionType) {
      case "approve":
        await approveRestaurant(parsedRestaurantId);
        break;
      case "update": {
        const name = formData.get("name") as string;
        const location = formData.get("location") as string;
        const phoneNumber = formData.get("phoneNumber") as string;

        if (name && location) {
          await updateRestaurant(parsedRestaurantId, {
            name,
            location,
            phoneNumber: phoneNumber ?? undefined,
          });
        } else {
          return json(
            { success: false, error: "Invalid restaurant data." },
            { status: 400 },
          );
        }
        break;
      }
      case "delete":
        await deleteRestaurant(parsedRestaurantId);
        break;
      default:
        return json(
          { success: false, error: "Invalid action type." },
          { status: 400 },
        );
    }
    return json({ success: true });
  }

  return json(
    { success: false, error: "Invalid restaurant ID." },
    { status: 400 },
  );
};

export default function SuperAdminDashboard() {
  const { restaurants, pendingRestaurants } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState("restaurants");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalRestaurant, setModalRestaurant] = useState<{
    id: number;
    name: string;
    location: string;
    phoneNumber: string | null;
  } | null>(null);

  const openModal = (restaurant: {
    id: number;
    name: string;
    location: string;
    phoneNumber: string | null;
  }) => {
    setModalRestaurant(restaurant);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalRestaurant(null);
  };

  const fetcher = useFetcher();

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex items-center justify-between px-4 py-4">
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
        <h1 className="mb-4 text-2xl font-bold">Super Admin Dashboard</h1>
        <div className="mb-8 flex">
        <button
            onClick={() => setActiveTab("restaurants")}
            className={`rounded px-4 py-2 text-sm font-medium ${
              activeTab === "restaurants"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-blue-500"
            }`}
          >
            Restaurants
          </button>
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
            onClick={() => setActiveTab("metrics")}
            className={`rounded px-4 py-2 text-sm font-medium ${
              activeTab === "metrics"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-blue-500"
            }`}
          >
            Metrics
          </button>
        </div>

        {activeTab === "restaurants" ? (
          <div className="mt-8">
            <h2 className="mb-4 text-2xl">Pending Restaurants for Approval</h2>
            {pendingRestaurants.length > 0 ? (
              <ul className="space-y-4">
                {pendingRestaurants.map((restaurant) => (
                  <li
                    key={restaurant.id}
                    className="flex flex-col items-center justify-between space-y-2 rounded-md border p-4 sm:flex-row sm:space-y-0"
                  >
                    <div className="w-full sm:w-auto">
                      <p className="font-semibold">{restaurant.name}</p>
                      <p className="text-gray-600">
                        {restaurant.location || "No location provided"}
                      </p>
                      <p className="text-gray-600">
                        {restaurant.phoneNumber || "No phone number provided"}
                      </p>
                    </div>
                    <Form
                      method="post"
                      className="mt-4 flex w-full sm:mt-0 sm:w-auto"
                    >
                      <input
                        type="hidden"
                        name="restaurantId"
                        value={restaurant.id}
                      />
                      <input type="hidden" name="actionType" value="approve" />
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
              <p className="text-gray-700">
                No restaurants are currently pending approval.
              </p>
            )}

            <h2 className="mb-4 mt-8 text-2xl">All Restaurants</h2>
            <ul className="space-y-4">
              {restaurants.map((restaurant) => (
                <li
                  key={restaurant.id}
                  className="flex flex-col items-center justify-between space-y-2 rounded-md border p-4 sm:flex-row sm:space-y-0"
                >
                  <div className="w-full sm:w-auto">
                    <p className="font-semibold">{restaurant.name}</p>
                    <p className="text-gray-600">
                      {restaurant.location || "No location provided"}
                    </p>
                    <p className="text-gray-600">
                      {restaurant.phoneNumber || "No phone number provided"}
                    </p>
                    <p className="text-gray-600">Status: {restaurant.status}</p>
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
          </div>
        ) : activeTab === "users" ? (
          <div className="mt-8">
            <h2 className="mb-4 text-xl">Users</h2>
            <p className="text-gray-700">User management coming soon.</p>
          </div>
        ) : activeTab === "metrics" ? (
          <div className="mt-8">
            <h2 className="mb-4 text-xl">Metrics</h2>
            <p className="text-gray-700">Metrics functionality coming soon.</p>
          </div>
        ) : null}
      </div>

{modalRestaurant ? (
  <Modal isOpen={isModalOpen} onClose={closeModal}>
    <div className="mx-auto w-full max-w-md rounded-md bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-bold">Edit Restaurant</h2>
      <fetcher.Form
        method="post"
        action="/super-admin-dashboard"
        onSubmit={() => {
          // Use a small delay to allow Remix to handle the form submission before closing
          setTimeout(() => {
            closeModal();
          }, 0);
        }}
      >
        <input type="hidden" name="restaurantId" value={modalRestaurant.id} />
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
            defaultValue={modalRestaurant.name}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            Location
          </label>
          <input
            type="text"
            name="location"
            defaultValue={modalRestaurant.location}
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
            defaultValue={modalRestaurant.phoneNumber ?? ""}
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
