// import type { LoaderFunction } from "@remix-run/node";
// import { json } from "@remix-run/node";
// import { useLoaderData } from "@remix-run/react";

// import { getShiftsByRestaurant } from "~/models/shift.server";
// import { requireAdmin } from "~/session.server";

// interface Shift {
//   id: number;
//   date: string;
//   startTime: string;
//   endTime: string;
//   role: string | null;
//   assignedTo: {
//     name: string;
//   } | null;
// }

// export const loader: LoaderFunction = async ({ request }) => {
//   const user = await requireAdmin(request);
//   if (!user) {
//     throw new Error("User not authenticated");
//   }

//   // Check if the restaurantId is not null
//   if (user.restaurantId !== null) {
//     const shifts = await getShiftsByRestaurant(user.restaurantId);
//     return json({ shifts });
//   } else {
//     // Handle the case where restaurantId is null
//     return json({ shifts: [] });
//   }
// };

// export default function AdminDashboardShifts() {
//   const { shifts } = useLoaderData<typeof loader>();

//   return (
//     <div className="mt-8">
//       <h2 className="mb-4 text-xl font-semibold">Current Shifts</h2>
//       <ul className="space-y-4">
//         {shifts.map((shift: Shift) => {
//           // Parse the shift date string as a UTC date
//           const shiftDate = new Date(shift.date);

//           // Extract the year, month, and day in UTC to prevent local timezone adjustments
//           const formattedDate = shiftDate.toLocaleDateString("en-US", {
//             year: "numeric",
//             month: "2-digit",
//             day: "2-digit",
//           });

//           // Format the start and end times in the user's local time zone
//           const formattedStartTime = new Date(
//             shift.startTime,
//           ).toLocaleTimeString(undefined, {
//             hour: "2-digit",
//             minute: "2-digit",
//             hour12: true,
//           });

//           const formattedEndTime = new Date(shift.endTime).toLocaleTimeString(
//             undefined,
//             {
//               hour: "2-digit",
//               minute: "2-digit",
//               hour12: true,
//             },
//           );

//           return (
//             <li key={shift.id} className="rounded-md border p-4">
//               <p className="font-semibold">Date: {formattedDate}</p>
//               <p className="text-gray-600">Start Time: {formattedStartTime}</p>
//               <p className="text-gray-600">End Time: {formattedEndTime}</p>
//               <p>Role: {shift.role || "Unassigned"}</p>
//               <p>
//                 Assigned To:{" "}
//                 {shift.assignedTo ? shift.assignedTo.name : "Unassigned"}
//               </p>
//             </li>
//           );
//         })}
//       </ul>
//     </div>
//   );
// }
