import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { logout } from "~/session.server";

// Handles logout action, ending the user's session and clearing cookies
export const action = async ({ request }: ActionFunctionArgs) =>
  logout(request);

// Redirects to home page when accessing the logout route directly
export const loader = async () => redirect("/");
