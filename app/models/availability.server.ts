import { prisma } from "../prisma.server";

// app/models/availability.server.ts

export async function createAvailability(
  userId: number,
  date: string,
  startTime: string,
  endTime: string,
) {
  // Create a complete DateTime without setting it to UTC
  const formattedDate = new Date(`${date}T00:00:00`).toISOString(); // Without 'Z', it will use the local timezone

  // Create full DateTime strings for startTime and endTime using the date
  const startDateTime = new Date(`${date}T${startTime}`).toISOString();
  const endDateTime = new Date(`${date}T${endTime}`).toISOString();

  return prisma.availability.create({
    data: {
      userId,
      date: formattedDate, // Uses the local timezone
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
