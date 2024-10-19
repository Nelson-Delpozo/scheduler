// app/routes/admin-dashboard/shifts.tsx

import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData, useActionData, Form } from "@remix-run/react";
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from "react";

import { createShift, getShiftsByRestaurant } from "~/models/shift.server";
import { requireAdmin } from "~/session.server";

// Loader to get the list of shifts for the current restaurant
export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireAdmin(request);
  if (!user || !user.restaurantId) {
    return redirect("/login");
  }

  const shifts = await getShiftsByRestaurant(user.restaurantId);
  return json({ shifts, restaurantId: user.restaurantId, createdById: user.id });
};

// Action to handle creating a new shift
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const date = new Date(formData.get("date") as string);
  const startTime = new Date(`${formData.get("date")}T${formData.get("startTime")}:00`);
  const endTime = new Date(`${formData.get("date")}T${formData.get("endTime")}:00`);
  const assignedToId = formData.get("assignedToId") ? parseInt(formData.get("assignedToId") as string) : undefined;
  const restaurantId = parseInt(formData.get("restaurantId") as string);
  const createdById = parseInt(formData.get("createdById") as string);

  try {
    await createShift(date, startTime, endTime, restaurantId, createdById, undefined, assignedToId);
    return redirect("/admin-dashboard/shifts");
  } catch (error) {
    return json({ error: (error as Error).message }, { status: 400 });
  }
};

export default function Shifts() {
  const { shifts, restaurantId, createdById } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [formError, setFormError] = useState(actionData?.error || null);

  return (
    <div className="flex min-h-full flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-4xl p-8">
        <h1 className="text-2xl font-bold mb-6">Manage Shifts</h1>
        {formError ? <div className="text-red-500 mb-4">{formError}</div> : null}
        <Form method="post" className="space-y-4">
          <input type="hidden" name="restaurantId" value={restaurantId} />
          <input type="hidden" name="createdById" value={createdById} />
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700">
              Assign To (User ID)
            </label>
            <input
              type="number"
              id="assignedToId"
              name="assignedToId"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Shift
          </button>
        </Form>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Current Shifts</h2>
          <ul className="space-y-4">
            {shifts.map((shift: { id: Key | null | undefined; date: string | number | Date; startTime: string | number | Date; endTime: string | number | Date; assignedTo: { name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; }; }) => (
              <li key={shift.id} className="p-4 border rounded-md">
                <p className="font-semibold">Date: {new Date(shift.date).toLocaleDateString()}</p>
                <p>Start Time: {new Date(shift.startTime).toLocaleTimeString()}</p>
                <p>End Time: {new Date(shift.endTime).toLocaleTimeString()}</p>
                <p>Assigned To: {shift.assignedTo ? shift.assignedTo.name : "Unassigned"}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
