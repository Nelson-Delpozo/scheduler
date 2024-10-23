// app/routes/admin-dashboard/shift-creation.tsx

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
  return json({ shifts, restaurantId: user.restaurantId, createdById: user.id });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const date = new Date(formData.get("date") as string);
  const startTime = new Date(`${formData.get("date")}T${formData.get("startTime")}:00`);
  const endTime = new Date(`${formData.get("date")}T${formData.get("endTime")}:00`);
  const role = formData.get("role") as string;
  const assignedToId = formData.get("assignedToId") ? parseInt(formData.get("assignedToId") as string) : undefined;
  const restaurantId = parseInt(formData.get("restaurantId") as string);
  const createdById = parseInt(formData.get("createdById") as string);

  try {
    await createShift(date, startTime, endTime, role, restaurantId, createdById, undefined, assignedToId);
  } catch (error) {
    return json({ error: (error as Error).message }, { status: 400 });
  }

  return json({ success: true });
};

export default function ShiftCreation() {
  const { restaurantId, createdById } = useLoaderData<typeof loader>();

  return (
    <div className="mt-8">
      <Form method="post" className="space-y-4 mt-4">
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
            Role
          </label>
          <input
            type="string"
            id="role"
            name="role"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <input type="hidden" name="restaurantId" value={restaurantId} />
        <input type="hidden" name="createdById" value={createdById} />
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
  );
}