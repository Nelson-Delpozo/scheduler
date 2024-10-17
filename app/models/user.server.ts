// app/models/user.server.ts
import bcrypt from "bcryptjs";

import { prisma } from "~/prisma.server";


// Function to create a new user
export async function createUser(email: string, password: string, phoneNumber: string | null, consentToText: boolean) {
  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      password: passwordHash,
      phoneNumber, // Add phoneNumber field
      consentToText, // Add consentToText field
      role: "employee", // Default role; change this as per your needs
      status: "pending" // New users require admin approval
    },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      status: true, // Include status field here
    },
  });
}
  
export async function getUsersByRole(role: string) {
  return prisma.user.findMany({ where: { role } });
}

// Function to get a user by ID
export async function getUserById(userId: number) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

// Function to get users pending approval
export async function getUsersPendingApproval() {
  return prisma.user.findMany({
    where: {
      status: "pending",
    },
    select: {
      id: true,
      email: true,
      phoneNumber: true,
    },
  });
}

// Function to approve a user
export async function approveUser(userId: number) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: "approved",
    },
  });
}


// Function to verify a user's login credentials
export async function verifyLogin(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null; // User not found
  }

  // Compare the provided password with the stored hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return null; // Password doesn't match
  }

  return user; // Return the user if email and password are correct
}