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
    expires: undefined, // Session expires when browser is closed
  },
});

const USER_SESSION_KEY = "userId";
const ROLES = {
  ADMIN: "admin",
  SUPER_ADMIN: "super-admin",
};
const STATUS = {
  APPROVED: "approved",
};

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie") ?? "";
  return sessionStorage.getSession(cookie);
}

export async function verifyLogin(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User not found");
  }
  if (user.status !== STATUS.APPROVED) {
    throw new Error("Account not approved");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  return user;
}

export async function requireRole(request: Request, role: string) {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);
  if (!userId) throw redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== role) {
    throw redirect("/unauthorized");
  }

  return user;
}

export async function requireAdmin(request: Request) {
  return requireRole(request, ROLES.ADMIN);
}

export async function requireSuperAdmin(request: Request) {
  return requireRole(request, ROLES.SUPER_ADMIN);
}

export async function getUserId(
  request: Request,
): Promise<User["id"] | undefined> {
  const session = await getSession(request);
  return session.get(USER_SESSION_KEY);
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

  const maxAge = remember ? 60 * 60 * 24 * 7 : undefined; // 7 days if remembered
  const isSafeRedirect = safeRedirect(redirectTo);

  return redirect(isSafeRedirect, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, { maxAge }),
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

function safeRedirect(redirectTo: string, defaultPath = "/") {
  // Basic check to prevent open redirects
  return redirectTo.startsWith("/") ? redirectTo : defaultPath;
}
