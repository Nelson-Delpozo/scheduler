import { prisma } from "../prisma.server";

// app/models/availability.server.ts

export async function createAvailability(
  userId: number,
  date: string,
  startTime: string,
  endTime: string,
) {
  // Create a complete DateTime by appending a time to the date
  const formattedDate = new Date(`${date}T00:00:00Z`).toISOString(); // Adds a time component to the date

  // Create full DateTime strings for startTime and endTime using the date
  const startDateTime = new Date(`${date}T${startTime}`).toISOString();
  const endDateTime = new Date(`${date}T${endTime}`).toISOString();

  return prisma.availability.create({
    data: {
      userId,
      date: formattedDate, // A full ISO DateTime with a default time of 00:00:00
      startTime: startDateTime,
      endTime: endDateTime,
    },
  });
}

export async function getAvailabilityForUser(userId: number) {
  return prisma.availability.findMany({
    where: {
      userId: userId,
    },
  });
}
