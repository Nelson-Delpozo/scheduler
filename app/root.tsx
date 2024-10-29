import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  Form,
} from "@remix-run/react";
import { useEffect, useState } from "react";

import DisableBackForward from "~/components/DisableBackForward";
import { getUser } from "~/session.server";
import stylesheet from "~/tailwind.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({ user: await getUser(request) });
};

export default function App() {
  const { user } = useLoaderData<typeof loader>();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const darkModePreference = localStorage.getItem("theme") === "dark" || 
                               window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(darkModePreference);
  }, []);

  const toggleDarkMode = () => {
    const newTheme = !isDarkMode ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    setIsDarkMode(!isDarkMode);
  };

  return (
    <html lang="en" className={`${isDarkMode ? "dark" : ""} h-full`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={`h-full flex flex-col ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
        <header className="bg-gray-800 text-white">
          <nav className="container mx-auto flex justify-between items-center p-4">
            <h2 className="text-xl font-bold">Restaurant Scheduler</h2>
            <div className="flex items-center space-x-4">
              {user ? <p>Welcome, {user.name}</p> : null}
              <button
                onClick={toggleDarkMode}
                className="text-white bg-gray-700 px-4 py-2 rounded"
              >
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </button>
              {user ? <Form action="/logout" method="post">
                  <button
                    type="submit"
                    className="text-white bg-red-600 px-4 py-2 rounded"
                  >
                    Logout
                  </button>
                </Form> : null}
            </div>
          </nav>
        </header>
        <main className="container mx-auto flex-grow p-4">
          <DisableBackForward />
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
