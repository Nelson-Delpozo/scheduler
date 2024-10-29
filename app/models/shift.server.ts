import { prisma } from "~/prisma.server";

// Create a new shift
export async function createShift(
  name: string, // Ensure name is included
  date: Date,
  startTime: Date,
  endTime: Date,
  role: string,
  restaurantId: number,
  createdById: number,
  assignedToId?: number,
) {
  if (!role) {
    throw new Error("Role is required when creating a shift.");
  }

  // Check if end time is after start time
  if (endTime <= startTime) {
    throw new Error("End time must be after start time.");
  }

  // Ensure restaurant ID exists
  const restaurantExists = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });
  if (!restaurantExists) {
    throw new Error("Specified restaurant does not exist.");
  }

  // Format the date and time values to ISO strings
  const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
  const formattedStartTime = startTime.toISOString(); // Full ISO for start time
  const formattedEndTime = endTime.toISOString(); // Full ISO for end time

  // Create the shift
  return prisma.shift.create({
    data: {
      name,
      date: formattedDate,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      role,
      restaurantId,
      createdById,
      ...(assignedToId && { assignedToId }),
    },
  });
}

// Get all shifts assigned to an employee
export async function getShiftsForEmployee(employeeId: number) {
  if (!employeeId) throw new Error("Employee ID is required.");

  return prisma.shift.findMany({
    where: { assignedToId: employeeId },
    select: {
      id: true,
      date: true,
      startTime: true,
      endTime: true,
      role: true,
    },
    orderBy: { date: "asc" },
  });
}

// Get shifts for a specific restaurant
export async function getShiftsByRestaurant(restaurantId: number) {
  if (!restaurantId) throw new Error("Restaurant ID is required.");

  return prisma.shift.findMany({
    where: { restaurantId },
    select: {
      id: true,
      date: true,
      startTime: true,
      endTime: true,
      role: true,
      assignedTo: {
        select: { id: true, name: true },
      },
    },
    orderBy: { date: "asc" },
  });
}

// Get a shift by ID
export async function getShiftById(id: number) {
  if (!id) throw new Error("Shift ID is required.");

  const shift = await prisma.shift.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true } },
    },
  });

  if (!shift) throw new Error("Shift not found.");
  return shift;
}

// Update a shift by ID with edge case handling
export async function updateShift(
  shiftId: number,
  updateData: {
    date?: string;
    startTime?: string;
    endTime?: string;
    role?: string;
    assignedToId?: number | null;
  },
) {
  if (!shiftId) throw new Error("Shift ID is required.");
  if (
    updateData.startTime &&
    updateData.endTime &&
    new Date(updateData.endTime) <= new Date(updateData.startTime)
  ) {
    throw new Error("End time must be after start time.");
  }

  if (updateData.assignedToId) {
    const userExists = await prisma.user.findUnique({
      where: { id: updateData.assignedToId },
    });
    if (!userExists) throw new Error("Assigned user does not exist.");
  }

  const formattedDate = updateData.date
    ? new Date(updateData.date).toISOString().split("T")[0]
    : undefined;
  const startDateTime = updateData.startTime
    ? new Date(`${formattedDate}T${updateData.startTime}:00`).toISOString()
    : undefined;
  const endDateTime = updateData.endTime
    ? new Date(`${formattedDate}T${updateData.endTime}:00`).toISOString()
    : undefined;

  return prisma.shift.update({
    where: { id: shiftId },
    data: {
      ...(formattedDate && { date: formattedDate }),
      ...(startDateTime && { startTime: startDateTime }),
      ...(endDateTime && { endTime: endDateTime }),
      ...(updateData.role && { role: updateData.role }),
      ...(updateData.assignedToId && { assignedToId: updateData.assignedToId }),
    },
  });
}

// Delete a shift by ID
export async function deleteShift(shiftId: number) {
  if (!shiftId) throw new Error("Shift ID is required.");

  return prisma.shift.delete({
    where: { id: shiftId },
  });
}
