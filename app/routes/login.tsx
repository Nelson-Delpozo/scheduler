// app/routes/login.tsx

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { verifyLogin } from "~/auth.server";
import { getUserByEmail } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import { validateEmail } from "~/utils";

// Loader function to redirect if already logged in
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

// Action function to handle login
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const remember = formData.get("remember");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Invalid email", password: null } },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || password.length < 8) {
    return json(
      {
        errors: {
          email: null,
          password: "Password is required and must be at least 8 characters",
        },
      },
      { status: 400 },
    );
  }

  const user = await getUserByEmail(email);
  if (!user || user.status !== "approved") {
    return json(
      {
        errors: {
          email: "Invalid credentials or unapproved account",
          password: null,
        },
      },
      { status: 400 },
    );
  }

  const isValidPassword = await verifyLogin(email, password);
  if (!isValidPassword) {
    return json(
      { errors: { email: "Invalid email or password", password: null } },
      { status: 400 },
    );
  }

  const redirectPath =
    user.role === "admin"
      ? "/admin-dashboard"
      : user.role === "super-admin"
        ? "/super-admin-dashboard"
        : "/employee-dashboard";
  return createUserSession({
    redirectTo: redirectPath,
    remember: remember === "on" ? true : false,
    request,
    userId: user.id.toString(), // Convert user.id to string
  });
};

// Meta for login page
export const meta: MetaFunction = () => [{ title: "Login" }];

// LoginPage component
export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-full flex-col justify-center dark:bg-gray-900">
      <div className="mx-auto mb-5 w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                ref={emailRef}
                id="email"
                required
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
                className="w-full rounded border border-gray-500 bg-white px-2 py-1 text-lg text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              />
              {actionData?.errors?.email ? (
                <div
                  className="pt-1 text-red-700 dark:text-red-400"
                  id="email-error"
                >
                  {actionData.errors.email}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
                className="w-full rounded border border-gray-500 bg-white px-2 py-1 text-lg text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              />
              {actionData?.errors?.password ? (
                <div
                  className="pt-1 text-red-700 dark:text-red-400"
                  id="password-error"
                >
                  {actionData.errors.password}
                </div>
              ) : null}
            </div>
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Log in
          </button>
          <div className="mt-4 flex flex-col items-center justify-between sm:flex-row">
            <div className="mb-4 flex items-center sm:mb-0">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
              >
                Remember me
              </label>
            </div>
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <span>Don&apos;t have an account? </span>
              <Link
                className="text-blue-500 underline dark:text-blue-400"
                to={{ pathname: "/join", search: searchParams.toString() }}
              >
                Sign up
              </Link>
            </div>
          </div>
        </Form>
        <div className="mt-10 text-center">
          <Link
            to="/register-restaurant"
            className="inline-block w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Register a Restaurant
          </Link>
        </div>
      </div>
    </div>
  );
}
