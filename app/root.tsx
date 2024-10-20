// app/root.tsx

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
  Link,
  Form,
  useLoaderData,
} from "@remix-run/react";

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

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full flex flex-col">
        {/* Responsive Navbar */}
        <header className="bg-gray-800 text-white">
          <nav className="container mx-auto flex justify-between items-center p-4">
            <Link to="/" className="text-xl font-bold">
              Restaurant Scheduler
            </Link>
            <div className="hidden md:flex space-x-4">
              {user ? <Form action="/logout" method="post" className="inline">
                  <button
                    type="submit"
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Logout
                  </button>
                </Form> : null}
            </div>
            {/* Mobile Menu */}
            <div className="md:hidden">
              {/* Placeholder for a future mobile menu (like a hamburger icon and menu) */}
              <button className="bg-gray-700 p-2 rounded">Menu</button>
            </div>
          </nav>
        </header>

        <main className="container mx-auto flex-grow p-4">
          <Outlet />
        </main>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
