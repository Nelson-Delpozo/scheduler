import { User } from "@prisma/client";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import bcrypt from "bcryptjs";
import invariant from "tiny-invariant";


import { getUserById } from "~/models/user.server";
import { prisma } from "~/prisma.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
    expires: null,
  },
});

const USER_SESSION_KEY = "userId";

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie") ?? "";
  return sessionStorage.getSession(cookie);
}

export async function verifyLogin(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Return false if no user found or the user is not approved
  if (!user || user.status !== "approved") {
    return false;
  }

  // Check if the provided password matches the hashed password in the database
  const isPasswordValid = await bcrypt.compare(password, user.password);
  return isPasswordValid ? user : false;
}


export async function requireAdmin(request: Request) {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);
  if (!userId) throw redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== "admin") {
    throw redirect("/unauthorized"); // Redirect to an unauthorized page if available
  }

  return user;
}

export async function requireSuperAdmin(request: Request) {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);

  if (!userId) throw redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== "super-admin") {
    throw redirect("/unauthorized"); // Redirect if unauthorized
  }

  return user;
}

export async function getUserId(request: Request): Promise<User["id"] | undefined> {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return null;

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember ? 60 * 60 * 24 * 7 : undefined, // 7 days for remember
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
