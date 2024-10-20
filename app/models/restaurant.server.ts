// app/models/restaurant.server.ts

import { prisma } from "~/prisma.server";



export async function createRestaurant(name: string, location?: string, phoneNumber?: string) {
  return prisma.restaurant.create({
    data: {
      name,
      location,
      phoneNumber,
    },
  });
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
    });
  }
  
  // Function to approve a restaurant
  export async function approveRestaurant(id: number) {
    return prisma.restaurant.update({
      where: { id },
      data: {
        status: "approved",
      },
    });
  }
