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
import { FaSun, FaMoon } from "react-icons/fa";

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
    const darkModePreference =
      localStorage.getItem("theme") === "dark" ||
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
      <body
        className={`flex h-full flex-col ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}
      >
        <header className="bg-gray-800 text-white">
          <nav className="container mx-auto flex items-center justify-between p-4">
            <h2 className="text-xl font-bold">Restaurant Scheduler</h2>
            <div className="flex items-center space-x-4">
              {user ? <p>Welcome, {user.name}</p> : null}
              <div className="flex items-center">
                {/* Sun icon for Dark Mode */}
                {isDarkMode ? (
                  <FaSun className="mr-2 text-yellow-500 transition-all duration-300" />
                ) : null}
                <button
                  onClick={toggleDarkMode}
                  className={`relative flex h-8 w-14 items-center rounded-full ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-300"
                  } p-1 transition-colors duration-300`}
                >
                  <span
                    className={`absolute h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                      isDarkMode ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
                {/* Moon icon for Light Mode */}
                {!isDarkMode ? (
                  <FaMoon className="ml-2 text-gray-300 transition-all duration-300" />
                ) : null}
              </div>
              {user ? (
                <Form action="/logout" method="post">
                  <button
                    type="submit"
                    className="rounded bg-red-600 px-4 py-2 text-white"
                  >
                    Logout
                  </button>
                </Form>
              ) : null}
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
