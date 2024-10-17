// app/models/schedule.server.ts
import { prisma } from "~/prisma.server";

// Create a new schedule
export async function createSchedule(name: string, startDate: Date, endDate: Date, createdById: number) {
  return prisma.schedule.create({
    data: {
      name,
      startDate,
      endDate,
      createdById,
    },
  });
}

// Get all schedules
export async function getSchedules() {
  return prisma.schedule.findMany({
    include: {
      shifts: true,
      createdBy: true,
    },
  });
}

// Get a schedule by ID
export async function getScheduleById(id: number) {
  return prisma.schedule.findUnique({
    where: { id },
    include: {
      shifts: true,
      createdBy: true,
    },
  });
}

// Update a schedule by ID
export async function updateSchedule(id: number, data: Partial<{ name: string; startDate: Date; endDate: Date }>) {
  return prisma.schedule.update({
    where: { id },
    data,
  });
}

// Delete a schedule by ID
export async function deleteSchedule(id: number) {
  return prisma.schedule.delete({
    where: { id },
  });
}

// Add a shift to a schedule
export async function addShiftToSchedule(scheduleId: number, shiftId: number) {
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
