import { availableParallelism } from "node:os";
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

//get availability
export async function getAvailabilityForUser(userId: number) {
  return prisma.availability.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      date: "asc",
    },
  });
}

export async function updateAvailability(
  availabilityId: number,
  date: string,
  startTime: string,
  endTime: string
) {

  try {
    return await prisma.availability.update({
      where: { id: availabilityId },
      data: {
        date: date,
        startTime: startTime,
        endTime: endTime,
      },
    });
  } catch (error) {
    console.error("Error updating availability:", error);
    throw new Error("Unable to update availability. Please try again.");
  }
}


export async function deleteAvailability(availabilityId: number) {
  return await prisma.availability.delete({
    where: { id: availabilityId },
  });
}

