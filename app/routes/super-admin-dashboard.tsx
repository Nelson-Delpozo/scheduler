// app/routes/super-admin-dashboard.tsx

import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { getAllRestaurants, getPendingRestaurants, approveRestaurant } from "~/models/restaurant.server";
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
  const restaurantId = formData.get("restaurantId");

  if (typeof restaurantId === "string") {
    await approveRestaurant(parseInt(restaurantId));
  }

  return json({ success: true });
};

export default function SuperAdminDashboard() {
  const { restaurants, pendingRestaurants } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto w-full max-w-7xl px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>
        <div className="flex space-x-6 mb-10">
          <NavLink
            to="/super-admin-dashboard"
            end
            className={({ isActive }) =>
              isActive
                ? "border-b-2 border-blue-500 pb-2 text-blue-600"
                : "pb-2 text-gray-600 hover:text-blue-500"
            }
          >
            Restaurant Approvals
          </NavLink>
          <NavLink
            to="/super-admin-dashboard/metrics"
            className={({ isActive }) =>
              isActive
                ? "border-b-2 border-blue-500 pb-2 text-blue-600"
                : "pb-2 text-gray-600 hover:text-blue-500"
            }
          >
            Metrics
          </NavLink>
          <NavLink
            to="/super-admin-dashboard/manage-restaurants"
            className={({ isActive }) =>
              isActive
                ? "border-b-2 border-blue-500 pb-2 text-blue-600"
                : "pb-2 text-gray-600 hover:text-blue-500"
            }
          >
            Manage Restaurants
          </NavLink>
        </div>
        <Outlet />
        <div className="mt-8">
          <h2 className="text-2xl mb-4">Pending Restaurants for Approval</h2>
          {pendingRestaurants.length > 0 ? (
            <ul className="space-y-4">
              {pendingRestaurants.map((restaurant) => (
                <li key={restaurant.id} className="flex justify-between items-center p-4 border rounded-md">
                  <div>
                    <p className="font-semibold">{restaurant.name}</p>
                    <p className="text-gray-600">{restaurant.location || "No location provided"}</p>
                    <p className="text-gray-600">{restaurant.phoneNumber || "No phone number provided"}</p>
                  </div>
                  <form method="post">
                    <input type="hidden" name="restaurantId" value={restaurant.id} />
                    <button
                      type="submit"
                      className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:bg-green-400"
                    >
                      Approve Restaurant
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700">No restaurants are currently pending approval.</p>
          )}
        </div>
        <div className="mt-8">
          <h2 className="text-2xl mb-4">All Restaurants</h2>
          <ul className="space-y-4">
            {restaurants.map((restaurant) => (
              <li key={restaurant.id} className="p-4 border rounded-md">
                <div>
                  <p className="font-semibold">{restaurant.name}</p>
                  <p className="text-gray-600">{restaurant.location || "No location provided"}</p>
                  <p className="text-gray-600">{restaurant.phoneNumber || "No phone number provided"}</p>
                  <p className="text-gray-600">Status: {restaurant.status}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <Link to="/" className="text-blue-500 underline hover:text-blue-700 mt-8 block">
          Go back to the home page
        </Link>
      </div>
    </div>
  );
}
