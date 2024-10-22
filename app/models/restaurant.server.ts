// app/models/restaurant.server.ts

import { prisma } from "~/prisma.server";


export async function createRestaurant(
  name: string,
  location?: string,
  phoneNumber?: string
) {
  let isUnique = false;
  let uniqueId;

  // Generate and validate a unique 5-digit ID
  while (!isUnique) {
    uniqueId = Math.floor(10000 + Math.random() * 90000); // Generates a random 5-digit number
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: uniqueId },
    });

    if (!existingRestaurant) {
      isUnique = true;
    }
  }

  // Create the restaurant with the unique ID
  const newRestaurant = await prisma.restaurant.create({
    data: {
      id: uniqueId,
      name,
      location,
      phoneNumber,
    },
  });

  return newRestaurant;
}


export async function getRestaurantById(id: number) {
  return prisma.restaurant.findUnique({
    where: { id },
    include: {
      users: true,
      schedules: true,
    },
  });
}

export async function getAllRestaurants() {
  return prisma.restaurant.findMany({
    include: {
      users: true,
      schedules: true,
    },
    orderBy: {
      updatedAt: 'desc',
    }
  });
}

export async function updateRestaurant(id: number, data: Partial<{ name: string; location: string; phoneNumber: string }>) {
  return prisma.restaurant.update({
    where: { id },
    data,
  });
}

export async function deleteRestaurant(id: number) {
  return prisma.restaurant.delete({ where: { id } });
}

// Function to get restaurants pending approval
export async function getPendingRestaurants() {
    return prisma.restaurant.findMany({
      where: {
        status: "pending",
      },
      orderBy: {
     createdAt: 'asc',
    }
  });
}
  
//  // Example implementation in restaurant.server.ts
// export async function approveRestaurant(id: number) {
//   // Make sure this function properly updates the status of the restaurant
//   return await prisma.restaurant.update({
//     where: { id },
//     data: { status: "approved" },
    
//   });
// }

export async function approveRestaurant(id: number) {
  // Start a transaction to ensure both updates happen together
  return prisma.$transaction(async (prisma) => {
    // Update the restaurant status to 'approved'
    await prisma.restaurant.update({
      where: { id },
      data: { status: "approved" },
    });

    // Find the admin user associated with the restaurant
    const adminUser = await prisma.user.findFirst({
      where: {
        restaurantId: id,
        role: "admin", // Assuming 'admin' is the role for restaurant admins
      },
    });

    // If an admin user is found, update their status to 'approved'
    if (adminUser) {
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { status: "approved" },
      });
    }
  });
}

