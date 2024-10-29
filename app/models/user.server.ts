import bcrypt from "bcryptjs";

import { prisma } from "~/prisma.server";

// Function to create a new user
export async function createUser(
  name: string,
  email: string,
  password: string,
  phoneNumber: string,
  consentToText: boolean,
  restaurantId: number,
) {
  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      phoneNumber, // Add phoneNumber field
      consentToText, // Add consentToText field
      role: "employee", // Default role; change this as per your needs
      status: "pending", // New users require admin approval
      restaurantId, // Associate the user with a restaurant
    },
  });
}

// Function to create a new admin user
export async function createAdminUser(
  name: string,
  email: string,
  password: string,
  phoneNumber: string,
  consentToText: boolean,
  restaurantId: number,
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      consentToText,
      restaurantId,
      role: "admin",
      status: "pending", // Default status; adjust if needed
    },
  });
}

// Approve a user by ID
export async function approveUser(id: number) {
  return prisma.user.update({
    where: { id },
    data: {
      status: "approved",
    },
  });
}

// Get a user by ID
export async function getUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

// Get all users
export async function getAllUsers() {
  return prisma.user.findMany();
}

// Get all users by restaurant ID
export async function getUsersByRestaurant(restaurantId: number) {
  return prisma.user.findMany({
    where: { restaurantId },
  });
}

export async function getUsersPendingApprovalByRestaurantId(
  restaurantId: number,
) {
  if (!restaurantId) throw new Error("Restaurant ID is required.");

  return prisma.user.findMany({
    where: {
      restaurantId,
      status: "pending", // Fetch users with 'pending' status
    },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getUsersByRestaurantId(restaurantId: number) {
  if (!restaurantId) throw new Error("Restaurant ID is required.");

  return prisma.user.findMany({
    where: {
      restaurantId,
      status: "approved", // Only fetch approved users
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phoneNumber: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

// Update user by ID
export async function updateUser(
  id: number,
  data: Partial<{
    email: string;
    password: string;
    role: string;
    name: string;
    phoneNumber: string;
    consentToText: boolean;
    restaurantId: number;
    status: string;
  }>,
) {
  return prisma.user.update({
    where: { id },
    data,
  });
}

// Delete user by ID
export async function deleteUser(id: number) {
  return prisma.user.delete({
    where: { id },
  });
}
