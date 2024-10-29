import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { createShift, getShiftsByRestaurant } from "~/models/shift.server";
import { requireAdmin } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireAdmin(request);
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const shifts = await getShiftsByRestaurant(user.restaurantId!);
  return json({
    shifts,
    restaurantId: user.restaurantId,
    createdById: user.id,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const date = new Date(formData.get("date") as string);
  const startTime = new Date(
    `${formData.get("date")}T${formData.get("startTime")}:00`,
  );
  const endTime = new Date(
    `${formData.get("date")}T${formData.get("endTime")}:00`,
  );
  const role = formData.get("role") as string;
  const assignedToId = formData.get("assignedToId")
    ? parseInt(formData.get("assignedToId") as string)
    : undefined;
  const restaurantId = parseInt(formData.get("restaurantId") as string);
  const createdById = parseInt(formData.get("createdById") as string);

  try {
    await createShift(
      "Shift", // Name of the shift or can be dynamically set
      date,
      startTime,
      endTime,
      role,
      restaurantId,
      createdById,
      assignedToId,
    );
  } catch (error) {
    return json({ error: (error as Error).message }, { status: 400 });
  }

  return json({ success: true });
};

export default function ShiftCreation() {
  const { restaurantId, createdById } = useLoaderData<typeof loader>();

  return (
    <div className="mt-8 dark:bg-gray-900 dark:text-white">
      <Form method="post" className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label
            htmlFor="startTime"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Start Time
          </label>
          <input
            type="time"
            id="startTime"
            name="startTime"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label
            htmlFor="endTime"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            End Time
          </label>
          <input
            type="time"
            id="endTime"
            name="endTime"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Role
          </label>
          <input
            type="text"
            id="role"
            name="role"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <input type="hidden" name="restaurantId" value={restaurantId} />
        <input type="hidden" name="createdById" value={createdById} />
        <div>
          <label
            htmlFor="assignedToId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Assign To (User ID)
          </label>
          <input
            type="number"
            id="assignedToId"
            name="assignedToId"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Shift
        </button>
      </Form>
    </div>
  );
}
