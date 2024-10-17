import bcrypt from "bcryptjs";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";

import { prisma } from "./prisma.server";
import { sessionStorage } from "./session.server";

// Initialize an authenticator using the session storage mechanism
const authenticator = new Authenticator(sessionStorage);

// Use a form-based authentication strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    // Extract email and password from the submitted form
    let email = form.get("email");
    let password = form.get("password");

    // Validate that email and password are provided and are strings
    if (typeof email !== "string" || typeof password !== "string") {
      throw new Error("Invalid form submission");
    }

    // Find the user in the database by email
    let user = await prisma.user.findUnique({ where: { email } });
    
    // Check if user exists and the password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid email or password");
    }

    // Return the authenticated user
    return user;
  })
);

// Export the authenticator for use in the application
export { authenticator };
