import { prisma } from "~/prisma.server";

// Create a new schedule with validation
export async function createSchedule({
  name,
  startDate,
  endDate,
  createdById,
  restaurantId,
}: {
  name: string;
  startDate: Date;
  endDate: Date;
  createdById: number;
  restaurantId: number;
}) {
  if (endDate <= startDate) {
    throw new Error("End date must be after start date.");
  }

  // Ensure the restaurant exists
  const restaurantExists = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });
  if (!restaurantExists) {
    throw new Error("Specified restaurant does not exist.");
  }

  return prisma.schedule.create({
    data: {
      name,
      startDate,
      endDate,
      createdById,
      restaurantId,
    },
  });
}

// Get all schedules, optionally filtered by restaurant
export async function getSchedules(restaurantId?: number) {
  return prisma.schedule.findMany({
    where: restaurantId ? { restaurantId } : {},
    include: {
      shifts: true,
      createdBy: true,
    },
    orderBy: { startDate: "asc" },
  });
}

// Get a schedule by ID with related data
export async function getScheduleById(id: number) {
  if (!id) throw new Error("Schedule ID is required.");

  const schedule = await prisma.schedule.findUnique({
    where: { id },
    include: {
      shifts: true,
      createdBy: true,
    },
  });
  if (!schedule) throw new Error("Schedule not found.");

  return schedule;
}

// Get schedules for a specific restaurant
export async function getSchedulesByRestaurant(restaurantId: number) {
  if (!restaurantId) throw new Error("Restaurant ID is required.");

  return prisma.schedule.findMany({
    where: { restaurantId },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      shifts: {
        select: {
          id: true,
          role: true,
          assignedTo: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { startDate: "asc" },
  });
}

// Update a schedule by ID with validation
export async function updateSchedule(
  id: number,
  data: Partial<{ name: string; startDate: Date; endDate: Date }>
) {
  if (data.startDate && data.endDate && data.endDate <= data.startDate) {
    throw new Error("End date must be after start date.");
  }

  return prisma.schedule.update({
    where: { id },
    data,
  });
}

// Delete a schedule by ID with check for existing shifts
export async function deleteSchedule(id: number) {
  const associatedShifts = await prisma.shift.count({
    where: { scheduleId: id },
  });
  if (associatedShifts > 0) {
    throw new Error("Cannot delete a schedule with associated shifts.");
  }

  return prisma.schedule.delete({
    where: { id },
  });
}

// Add a shift to a schedule, checking shift exists
export async function addShiftToSchedule(scheduleId: number, shiftId: number) {
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
  });
  if (!shift) throw new Error("Shift not found.");

  return prisma.shift.update({
    where: { id: shiftId },
    data: { scheduleId },
  });
}

// Remove a shift from a schedule
export async function removeShiftFromSchedule(shiftId: number) {
  return prisma.shift.update({
    where: { id: shiftId },
    data: { scheduleId: null },
  });
}
