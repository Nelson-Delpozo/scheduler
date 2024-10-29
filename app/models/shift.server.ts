import { prisma } from "~/prisma.server";

// Create a new shift
export async function createShift({
  name,
  date,
  startTime,
  endTime,
  role,
  restaurantId,
  createdById,
  scheduleId,
  assignedToId,
}: {
  name: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  role: string;
  restaurantId: number;
  createdById: number;
  scheduleId?: number;
  assignedToId?: number;
}) {
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

  // Format date and time
  const formattedDate = new Date(date.toDateString()).toISOString();
  const startDateTime = new Date(`${formattedDate.split("T")[0]}T${startTime.toTimeString()}`).toISOString();
  const endDateTime = new Date(`${formattedDate.split("T")[0]}T${endTime.toTimeString()}`).toISOString();

  // Create the shift
  return prisma.shift.create({
    data: {
      name,
      date: formattedDate,
      startTime: startDateTime,
      endTime: endDateTime,
      role,
      restaurantId,
      createdById,
      scheduleId,
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
      name: true,
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
      name: true,
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
shiftId: number, p0: Date, p1: Date, p2: Date, role: string, assignedToId: number | undefined, updateData: { date: string; startTime: string; endTime: string; role: string; assignedToId: number | undefined; }, updateData: {
  name?: string;
  date?: Date;
  startTime?: Date;
  endTime?: Date;
  role?: string;
  assignedToId?: number | null;
}) {
  if (!shiftId) throw new Error("Shift ID is required.");

  // Validate times if provided
  if (updateData.startTime && updateData.endTime && updateData.endTime <= updateData.startTime) {
    throw new Error("End time must be after start time.");
  }

  // Ensure updated restaurant or assigned user exists if IDs are provided
  if (updateData.assignedToId) {
    const userExists = await prisma.user.findUnique({
      where: { id: updateData.assignedToId },
    });
    if (!userExists) throw new Error("Assigned user does not exist.");
  }

  return prisma.shift.update({
    where: { id: shiftId },
    data: {
      ...updateData,
      ...(updateData.date && { date: new Date(updateData.date.toDateString()).toISOString() }),
      ...(updateData.startTime && {
        startTime: new Date(`${updateData.date!.toDateString()}T${updateData.startTime.toTimeString()}`).toISOString(),
      }),
      ...(updateData.endTime && {
        endTime: new Date(`${updateData.date!.toDateString()}T${updateData.endTime.toTimeString()}`).toISOString(),
      }),
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
