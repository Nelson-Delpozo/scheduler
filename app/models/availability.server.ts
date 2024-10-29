import { prisma } from "~/prisma.server";

// Create a new availability entry
export async function createAvailability({
  name,
  date,
  startTime,
  endTime,
  createdById,
}: {
  name: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  createdById: number;
}) {
  if (endTime <= startTime) {
    throw new Error("End time must be after start time.");
  }

  const formattedDate = new Date(date.toDateString()).toISOString();
  const startDateTime = new Date(`${formattedDate.split("T")[0]}T${startTime.toTimeString()}`).toISOString();
  const endDateTime = new Date(`${formattedDate.split("T")[0]}T${endTime.toTimeString()}`).toISOString();

  return prisma.availability.create({
    data: {
      name,
      date: formattedDate,
      startTime: startDateTime,
      endTime: endDateTime,
      createdById,
    },
  });
}

// Get all availability entries for a user
export async function getAvailabilityForUser(userId: number) {
  if (!userId) throw new Error("User ID is required.");

  return prisma.availability.findMany({
    where: { createdById: userId },
    orderBy: { date: "asc" },
  });
}

// Update an existing availability entry
export async function updateAvailability({
  availabilityId,
  date,
  startTime,
  endTime,
  name,
}: {
  availabilityId: number;
  name?: string;
  date: Date;
  startTime: Date;
  endTime: Date;
}) {
  if (!availabilityId) throw new Error("Availability ID is required.");
  if (endTime <= startTime) throw new Error("End time must be after start time.");

  const formattedDate = new Date(date.toDateString()).toISOString();
  const startDateTime = new Date(`${formattedDate.split("T")[0]}T${startTime.toTimeString()}`).toISOString();
  const endDateTime = new Date(`${formattedDate.split("T")[0]}T${endTime.toTimeString()}`).toISOString();

  return prisma.availability.update({
    where: { id: availabilityId },
    data: {
      name,
      date: formattedDate,
      startTime: startDateTime,
      endTime: endDateTime,
    },
  });
}

// Delete an availability entry by ID
export async function deleteAvailability(availabilityId: number) {
  if (!availabilityId) throw new Error("Availability ID is required.");

  return prisma.availability.delete({
    where: { id: availabilityId },
  });
}
