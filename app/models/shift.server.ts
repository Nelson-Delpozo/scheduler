// app/models/shift.server.ts
import { prisma } from "../prisma.server";

// Function to create a new shift
export async function createShift(
  date: Date,
  startTime: Date,
  endTime: Date,
  restaurantId: number,
  createdById: number,
  scheduleId?: number,
  assignedToId?: number,
  role?: string, // New parameter for shift role
) {
  return prisma.shift.create({
    data: {
      date,
      startTime,
      endTime,
      restaurantId,
      createdById,
      scheduleId,
      assignedToId,
      role
    },
  });
}

export async function getShiftsForEmployee(employeeId: number) {
  return prisma.shift.findMany({
    where: { assignedToId: employeeId },
    select: {
      id: true,
      date: true,
      startTime: true,
      endTime: true,
      role: true, // Ensure the role field is selected
    },
    orderBy: {
      date: 'desc',
    },
  });
}

export async function getShiftsByRestaurant(restaurantId: number) {
  return prisma.shift.findMany({
    where: { restaurantId },
    select: {
      id: true,
      date: true,
      startTime: true,
      endTime: true,
      role: true, // Include the role field
      assignedTo: {
        select: { id: true, name: true },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });
}


// Function to get shift by ID
export async function getShiftById(id: number) {
  return prisma.shift.findUnique({
    where: { id },
    include: {
      assignedTo: {
        select: { id: true, name: true },
      },
    },
  });
}

// Function to update a shift
export async function updateShift(
  id: number,
  data: Partial<{
    date: Date;
    startTime: Date;
    endTime: Date;
    assignedToId: number;
  }>,
) {
  return prisma.shift.update({
    where: { id },
    data,
  });
}

// Function to delete a shift
export async function deleteShift(id: number) {
  return prisma.shift.delete({
    where: { id },
  });
}

// export { createShift, getShiftsByRestaurant, getShiftById, updateShift, deleteShift };
