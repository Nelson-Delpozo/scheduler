// app/routes/admin-approve-restaurant.tsx

import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import { approveRestaurant } from "~/models/restaurant.server";
import { requireSuperAdmin } from "~/session.server";

export const action: ActionFunction = async ({ request }) => {
  const user = await requireSuperAdmin(request);
  if (!user) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const restaurantId = formData.get("restaurantId");

  if (typeof restaurantId === "string") {
    const parsedRestaurantId = parseInt(restaurantId);
    await approveRestaurant(parsedRestaurantId);
    return json({ success: true });
  }

  return json({ success: false, error: "Invalid restaurant ID" }, { status: 400 });
};
