// app/routes/join.tsx

import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { getRestaurantById } from "~/models/restaurant.server";
import { createUser, getUserByEmail } from "~/models/user.server";
import { createUserSession } from "~/session.server";
import { safeRedirect, validateEmail, validatePhoneNumber } from "~/utils";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  let phoneNumber = formData.get("phoneNumber");
  const restaurantId = formData.get("restaurantId");
  const consentToText = formData.get("consentToText") === "on"; // Extract consent value
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");

  if (!name || typeof name !== "string") {
    return json(
      {
        errors: {
          name: "Name is required",
          email: null,
          password: null,
          phoneNumber: null,
          restaurantId: null,
        },
      },
      { status: 400 },
    );
  }

  if (!validateEmail(email)) {
    return json(
      {
        errors: {
          name: null,
          email: "Email is invalid",
          password: null,
          phoneNumber: null,
          restaurantId: null,
        },
      },
      { status: 400 },
    );
  }

  if (typeof phoneNumber !== "string" || phoneNumber.length === 0) {
    phoneNumber = ""; // Assign empty string if phone number is not provided
  }

  if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
    return json(
      {
        errors: {
          name: null,
          email: null,
          password: null,
          phoneNumber: "Phone number must be a valid 10-digit US number",
          restaurantId: null,
        },
      },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      {
        errors: {
          name: null,
          email: null,
          password: "Password is required",
          phoneNumber: null,
          restaurantId: null,
        },
      },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return json(
      {
        errors: {
          name: null,
          email: null,
          password: "Password is too short",
          phoneNumber: null,
          restaurantId: null,
        },
      },
      { status: 400 },
    );
  }

  if (!restaurantId || typeof restaurantId !== "string" || isNaN(Number(restaurantId))) {
    return json(
      {
        errors: {
          name: null,
          email: null,
          password: null,
          phoneNumber: null,
          restaurantId: "Restaurant ID is required and must be a valid number",
        },
      },
      { status: 400 }
    );
  }

  const existingRestaurant = await getRestaurantById(Number(restaurantId));
  if (!existingRestaurant) {
    return json(
      {
        errors: {
          name: null,
          email: null,
          password: null,
          phoneNumber: null,
          restaurantId: "Invalid Restaurant ID",
        },
      },
      { status: 400 }
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json(
      {
        errors: {
          name: null,
          email: "A user already exists with this email",
          password: null,
          phoneNumber: null,
          restaurantId: null,
        },
      },
      { status: 400 },
    );
  }

  const user = await createUser(name, email, password, phoneNumber, consentToText, Number(restaurantId));

  // Instead of creating a user session, redirect to a page informing user that admin approval is needed
  return redirect("/account-pending-approval");

  return createUserSession({
    redirectTo,
    remember: false,
    request,
    userId: user.id,
  });
};

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const phoneNumberRef = useRef<HTMLInputElement>(null);
  const restaurantIdRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    } else if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    } else if (actionData?.errors?.phoneNumber) {
      phoneNumberRef.current?.focus();
    } else if (actionData?.errors?.restaurantId) {
      restaurantIdRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <div className="mt-1">
              <input
                ref={nameRef}
                id="name"
                required
                autoFocus
                name="name"
                type="text"
                autoComplete="name"
                aria-invalid={actionData?.errors?.name ? true : undefined}
                aria-describedby="name-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.name ? (
                <div className="pt-1 text-red-700" id="name-error">
                  {actionData.errors.name}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                ref={emailRef}
                id="email"
                required
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.email ? (
                <div className="pt-1 text-red-700" id="email-error">
                  {actionData.errors.email}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.password ? (
                <div className="pt-1 text-red-700" id="password-error">
                  {actionData.errors.password}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <div className="mt-1">
              <input
                id="phoneNumber"
                ref={phoneNumberRef}
                name="phoneNumber"
                type="text"
                autoComplete="tel"
                aria-invalid={
                  actionData?.errors?.phoneNumber ? true : undefined
                }
                aria-describedby="phoneNumber-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.phoneNumber ? (
                <div className="pt-1 text-red-700" id="phoneNumber-error">
                  {actionData.errors.phoneNumber}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="restaurantId"
              className="block text-sm font-medium text-gray-700"
            >
              Restaurant ID
            </label>
            <div className="mt-1">
              <input
                id="restaurantId"
                ref={restaurantIdRef}
                name="restaurantId"
                type="text"
                autoComplete="off"
                aria-invalid={actionData?.errors?.restaurantId ? true : undefined}
                aria-describedby="restaurantId-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.restaurantId ? (
                <div className="pt-1 text-red-700" id="restaurantId-error">
                  {actionData.errors.restaurantId}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              <input type="checkbox" name="consentToText" className="mr-2" />I
              agree to receive text messages for scheduling and updates.
            </label>
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Create Account
          </button>
        </Form>
      </div>
    </div>
  );
}
