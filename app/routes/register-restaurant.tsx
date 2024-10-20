import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useRef, useEffect } from "react";


import { createRestaurant } from "~/models/restaurant.server";
import { createAdminUser, createUser } from "~/models/user.server";
import { validatePhoneNumber, validateEmail } from "~/utils";

export const loader: LoaderFunction = async () => {
  // Just return an empty object, allowing the form to render
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const location = formData.get("location");
  const phoneNumber = formData.get("phoneNumber");

  // Validate required fields
  if (typeof name !== "string" || name.trim().length === 0) {
    return json({ errors: { name: "Restaurant name is required" } }, { status: 400 });
  }

  if (typeof email !== "string" || !validateEmail(email)) {
    return json({ errors: { email: "Valid email is required" } }, { status: 400 });
  }

  if (typeof password !== "string" || password.trim().length < 8) {
    return json(
      { errors: { password: "Password must be at least 8 characters long" } },
      { status: 400 }
    );
  }

  if (typeof location !== "string" || location.trim().length === 0) {
    return json({ errors: { location: "Location is required" } }, { status: 400 });
  }

  if (typeof phoneNumber !== "string" || !validatePhoneNumber(phoneNumber)) {
    return json(
      { errors: { phoneNumber: "Phone number must be a valid 10-digit US number" } },
      { status: 400 }
    );
  }

  // Create new restaurant
  const restaurant = await createRestaurant(name, location, phoneNumber);

  // Create admin user for the restaurant
  await createAdminUser(name, email, password, phoneNumber, true, restaurant.id);

  return redirect("/account-pending-approval");
};

export default function RegisterRestaurant() {
  const actionData = useActionData<typeof action>();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const phoneNumberRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    } else if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    } else if (actionData?.errors?.phoneNumber) {
      phoneNumberRef.current?.focus();
    } else if (actionData?.errors?.location) {
      locationRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Restaurant Name
            </label>
            <input
              ref={nameRef}
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
            />
            {actionData?.errors?.name ? <p className="mt-2 text-sm text-red-600" id="name-error">
                {actionData.errors.name}
              </p> : null}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Admin Email
            </label>
            <input
              ref={emailRef}
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
            />
            {actionData?.errors?.email ? <p className="mt-2 text-sm text-red-600" id="email-error">
                {actionData.errors.email}
              </p> : null}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Admin Password
            </label>
            <input
              ref={passwordRef}
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
            />
            {actionData?.errors?.password ? <p className="mt-2 text-sm text-red-600" id="password-error">
                {actionData.errors.password}
              </p> : null}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              ref={locationRef}
              id="location"
              name="location"
              type="text"
              required
              className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
            />
            {actionData?.errors?.location ? <p className="mt-2 text-sm text-red-600" id="location-error">
                {actionData.errors.location}
              </p> : null}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              ref={phoneNumberRef}
              id="phoneNumber"
              name="phoneNumber"
              type="text"
              required
              className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
            />
            {actionData?.errors?.phoneNumber ? <p className="mt-2 text-sm text-red-600" id="phoneNumber-error">
                {actionData.errors.phoneNumber}
              </p> : null}
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Register Restaurant
          </button>
        </Form>
      </div>
    </div>
  );
}
