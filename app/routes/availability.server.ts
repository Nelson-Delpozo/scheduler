import { prisma } from "../prisma.server";

export async function createAvailability(userId: number, date: Date, startTime: Date, endTime: Date) {
  return prisma.availability.create({
    data: {
      userId,
      day: date.toLocaleDateString('en-US', { weekday: 'long' }), // Convert date to day string, e.g., "Monday"
      startTime: startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), // Convert Date to time string
      endTime: endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), // Convert Date to time string
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
