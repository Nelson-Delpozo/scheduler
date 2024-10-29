import { prisma } from "~/prisma.server";

// Function to create a restaurant with a unique 5-digit ID
export async function createRestaurant(
  name: string,
  location?: string,
  phoneNumber?: string
) {
  if (!name) throw new Error("Restaurant name is required");

  // Validate phone number format
  if (phoneNumber && !/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
    throw new Error("Invalid phone number format");
  }

  let isUnique = false
  let uniqueId: number | null = null;

while (!isUnique) {
  uniqueId = Math.floor(10000 + Math.random() * 90000);
  const existingRestaurant = await prisma.restaurant.findUnique({
    where: { id: uniqueId },
  });
  if (!existingRestaurant) {
    isUnique = true;
  }
}

if (uniqueId === null) throw new Error("Failed to generate unique ID");

  // Generate and validate a unique 5-digit ID
  while (!isUnique) {
    uniqueId = Math.floor(10000 + Math.random() * 90000); // Random 5-digit number
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: uniqueId },
    });
    if (!existingRestaurant) {
      isUnique = true;
    }
  }

  // Create the restaurant with the unique ID
  return prisma.restaurant.create({
    data: {
      id: uniqueId,
      name,
      location,
      phoneNumber,
      status: "pending", // Default status
    },
  });
}

// Get a restaurant by ID with related data
export async function getRestaurantById(id: number) {
  if (!id) throw new Error("Restaurant ID is required");

  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: {
      users: true,
      schedules: true,
    },
  });
  if (!restaurant) throw new Error("Restaurant not found");

  return restaurant;
}

// Get all restaurants with optional status filter
export async function getAllRestaurants(status?: string) {
  return prisma.restaurant.findMany({
    where: status ? { status } : {},
    include: {
      users: true,
      schedules: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

// Update restaurant by ID with validation
export async function updateRestaurant(
  id: number,
  data: Partial<{ name: string; location: string; phoneNumber: string }>
) {
  if (!id) throw new Error("Restaurant ID is required");

  if (data.phoneNumber && !/^\+?[1-9]\d{1,14}$/.test(data.phoneNumber)) {
    throw new Error("Invalid phone number format");
  }

  return prisma.restaurant.update({
    where: { id },
    data,
  });
}

// Delete restaurant by ID with check for associated users
export async function deleteRestaurant(id: number) {
  if (!id) throw new Error("Restaurant ID is required");

  // Check for associated users to prevent accidental deletions
  const associatedUsers = await prisma.user.count({ where: { restaurantId: id } });
  if (associatedUsers > 0) {
    throw new Error("Cannot delete restaurant with associated users");
  }

  return prisma.restaurant.delete({ where: { id } });
}

// Get restaurants pending approval
export async function getPendingRestaurants() {
  return prisma.restaurant.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
  });
}

// Approve a restaurant and its admin user in a transaction
export async function approveRestaurant(id: number) {
  return prisma.$transaction(async (prisma) => {
    // Update the restaurant status to 'approved'
    await prisma.restaurant.update({
      where: { id },
      data: { status: "approved" },
    });

    // Find and approve the admin user associated with the restaurant
    const adminUser = await prisma.user.findFirst({
      where: { restaurantId: id, role: "admin" },
    });

    if (adminUser) {
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { status: "approved" },
      });
    }
  });
}
