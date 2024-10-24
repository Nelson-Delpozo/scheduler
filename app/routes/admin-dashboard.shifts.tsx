import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getShiftsByRestaurant } from "~/models/shift.server";
import { requireAdmin } from "~/session.server";

interface Shift {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  role: string | null;
  assignedTo: {
    name: string;
  } | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireAdmin(request);
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Check if the restaurantId is not null
  if (user.restaurantId !== null) {
    const shifts = await getShiftsByRestaurant(user.restaurantId);
    return json({ shifts });
  } else {
    // Handle the case where restaurantId is null
    return json({ shifts: [] });
  }
};

export default function AdminDashboardShifts() {
  const { shifts } = useLoaderData<typeof loader>();

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-semibold">Current Shifts</h2>
      <ul className="space-y-4">
        {shifts.map((shift: Shift) => (
          <li key={shift.id} className="rounded-md border p-4">
            <p className="font-semibold">
              Date: {new Date(shift.date).toLocaleDateString(undefined)}
            </p>
            <p className="text-gray-600">
              Start Time:{" "}
              {new Date(shift.startTime).toLocaleTimeString(undefined)}
            </p>
            <p className="text-gray-600">
              End Time: {new Date(shift.endTime).toLocaleTimeString(undefined)}
            </p>
            <p>Role: {shift.role || "Unassigned"}</p>
            <p>
              Assigned To:{" "}
              {shift.assignedTo ? shift.assignedTo.name : "Unassigned"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
