import { prisma } from "../prisma.server";

// app/models/availability.server.ts

export async function createAvailability(
  userId: number,
  date: string,
  startTime: string,
  endTime: string,
) {
  return prisma.availability.create({
    data: {
      userId,
      day: new Date(date).toLocaleDateString("en-US", { weekday: "long" }), // Convert date to weekday name
      startTime,
      endTime,
    },
  });
}

export async function getAvailabilityForUser(userId: number) {
  return prisma.availability.findMany({
    where: {
      userId,
    },
  });
}
