// app/routes/_index.tsx

import { LoaderFunction, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { getUserId } from "~/session.server";

import { getUserById } from "../models/user.server";

// Loader function to handle redirection for logged-out users
export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (!userId) {
    // Redirect to login if the user is not authenticated
    return redirect("/login");
  }
  const user = await getUserById(userId);
  if (!user) {
    return redirect("/logout");
  }
  return { user };
};

// Main landing page component
export default function Index() {
  const { user } = useLoaderData();

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      {user.role === "manager" ? (
        <Link to="/admin-dashboard">
          <button className="btn-primary">Manager Dashboard</button>
        </Link>
      ) : (
        <Link to="/employee-dashboard">
          <button className="btn-primary">View My Shifts</button>
        </Link>
      )}
    </div>
  );
}
