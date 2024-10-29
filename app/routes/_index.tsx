import { LoaderFunction, redirect, json } from "@remix-run/node";
import { Link, useLoaderData, Form } from "@remix-run/react";

import { getUserById } from "~/models/user.server";
import { getUserId } from "~/session.server";


interface LoaderData {
  user: {
    id: number;
    name: string;
    role: string;
  };
}

// Loader function to handle redirection for logged-out users
export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (!userId) {
    return redirect("/login");
  }
  const user = await getUserById(userId);
  if (!user) {
    return redirect("/logout");
  }
  return json<LoaderData>({ user });
};

// Main landing page component
export default function Index() {
  const { user } = useLoaderData<LoaderData>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
        {user.role === "manager" ? (
          <Link to="/admin-dashboard">
            <button className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded dark:bg-blue-700 dark:hover:bg-blue-800">
              Manager Dashboard
            </button>
          </Link>
        ) : (
          <Link to="/employee-dashboard">
            <button className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded dark:bg-blue-700 dark:hover:bg-blue-800">
              Employee Dashboard
            </button>
          </Link>
        )}
        <Form action="/logout" method="post" className="mt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded dark:bg-red-700 dark:hover:bg-red-800"
          >
            Logout
          </button>
        </Form>
      </div>
    </div>
  );
}
