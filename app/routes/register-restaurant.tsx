// app/routes/register-restaurant.tsx

import {
  LoaderFunction,
  ActionFunction,
  json,
  redirect,
} from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { useRef, useEffect, useState } from "react";

import { createRestaurant } from "~/models/restaurant.server";
import { createAdminUser } from "~/models/user.server";
import { validatePhoneNumber, validateEmail } from "~/utils";

export const loader: LoaderFunction = async () => {
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const restaurantName = formData.get("restaurantName");
  const adminName = formData.get("adminName");
  const email = formData.get("email");
  const password = formData.get("password");
  const passwordConfirmation = formData.get("passwordConfirmation");
  const location = formData.get("location");
  const phoneNumber = formData.get("phoneNumber");

  if (password !== passwordConfirmation) {
    return json(
      {
        errors: {
          password: "Passwords do not match",
          passwordConfirmation: null,
        },
      },
      { status: 400 },
    );
  }

  if (
    typeof restaurantName !== "string" ||
    restaurantName.trim().length === 0
  ) {
    return json(
      { errors: { restaurantName: "Restaurant name is required" } },
      { status: 400 },
    );
  }

  if (typeof adminName !== "string" || adminName.trim().length === 0) {
    return json(
      { errors: { adminName: "Admin name is required" } },
      { status: 400 },
    );
  }

  if (typeof email !== "string" || !validateEmail(email)) {
    return json(
      { errors: { email: "Valid email is required" } },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || password.trim().length < 8) {
    return json(
      { errors: { password: "Password must be at least 8 characters long" } },
      { status: 400 },
    );
  }

  if (typeof location !== "string" || location.trim().length === 0) {
    return json(
      { errors: { location: "Location is required" } },
      { status: 400 },
    );
  }

  if (typeof phoneNumber !== "string" || !validatePhoneNumber(phoneNumber)) {
    return json(
      {
        errors: {
          phoneNumber: "Phone number must be a valid format",
        },
      },
      { status: 400 },
    );
  }

  const restaurant = await createRestaurant(
    restaurantName,
    location,
    phoneNumber,
  );

  await createAdminUser(
    adminName,
    email,
    password,
    phoneNumber,
    true,
    restaurant.id,
  );

  return redirect("/account-pending-approval");
};

export default function RegisterRestaurant() {
  const actionData = useActionData<typeof action>();
  const restaurantNameRef = useRef<HTMLInputElement>(null);
  const adminNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmationRef = useRef<HTMLInputElement>(null);
  const phoneNumberRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const darkModePreference =
      localStorage.getItem("theme") === "dark" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(darkModePreference);

    if (actionData?.errors?.restaurantName) {
      restaurantNameRef.current?.focus();
    } else if (actionData?.errors?.adminName) {
      adminNameRef.current?.focus();
    } else if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    } else if (actionData?.errors?.passwordConfirmation) {
      passwordConfirmationRef.current?.focus();
    } else if (actionData?.errors?.phoneNumber) {
      phoneNumberRef.current?.focus();
    } else if (actionData?.errors?.location) {
      locationRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div
      className={`flex min-h-full flex-col justify-center ${isDarkMode ? "dark" : ""}`}
    >
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="restaurantName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Restaurant Name
            </label>
            <input
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              ref={restaurantNameRef}
              id="restaurantName"
              name="restaurantName"
              type="text"
              required
              className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
            />
            {actionData?.errors?.restaurantName ? <p
                className="mt-2 text-sm text-red-600"
                id="restaurantName-error"
              >
                {actionData.errors.restaurantName}
              </p> : null}
          </div>

          <div>
            <label
              htmlFor="adminName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Admin Name
            </label>
            <input
              ref={adminNameRef}
              id="adminName"
              name="adminName"
              type="text"
              required
              className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
            />
            {actionData?.errors?.adminName ? <p className="mt-2 text-sm text-red-600" id="adminName-error">
                {actionData.errors.adminName}
              </p> : null}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Admin Email
            </label>
            <input
              ref={emailRef}
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
            />
            {actionData?.errors?.email ? <p className="mt-2 text-sm text-red-600" id="email-error">
                {actionData.errors.email}
              </p> : null}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Admin Password
            </label>
            <input
              ref={passwordRef}
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
            />
            {actionData?.errors?.password ? <p className="mt-2 text-sm text-red-600" id="password-error">
                {actionData.errors.password}
              </p> : null}
          </div>

          <div>
            <label
              htmlFor="passwordConfirmation"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Confirm Password
            </label>
            <input
              ref={passwordConfirmationRef}
              id="passwordConfirmation"
              name="passwordConfirmation"
              type="password"
              required
              className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
            />
            {actionData?.errors?.passwordConfirmation ? <p
                className="mt-2 text-sm text-red-600"
                id="passwordConfirmation-error"
              >
                {actionData.errors.passwordConfirmation}
              </p> : null}
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Location
            </label>
            <input
              ref={locationRef}
              id="location"
              name="location"
              type="text"
              required
              className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
            />
            {actionData?.errors?.location ? (
              <p className="mt-2 text-sm text-red-600" id="location-error">
                {actionData.errors.location}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Phone Number
            </label>
            <input
              ref={phoneNumberRef}
              id="phoneNumber"
              name="phoneNumber"
              type="text"
              required
              className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
            />
            {actionData?.errors?.phoneNumber ? (
              <p className="mt-2 text-sm text-red-600" id="phoneNumber-error">
                {actionData.errors.phoneNumber}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            Register Restaurant
          </button>
        </Form>
      </div>
      <div className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
        <Link
          className="text-blue-500 underline dark:text-blue-400"
          to="/login"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
