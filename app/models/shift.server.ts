// app/models/shift.server.ts
import { prisma } from "../prisma.server";


export async function createShift(date: Date, startTime: Date, endTime: Date, assignedToId?: number) {
  return prisma.shift.create({
    data: {
      date,
      startTime,
      endTime,
      assignedToId,
    },
  });
}

export async function getShifts() {
  return prisma.shift.findMany();
}

export async function getShiftById(id: number) {
  return prisma.shift.findUnique({ where: { id } });
}

export async function updateShift(id: number, data: Partial<{ date: Date; startTime: Date; endTime: Date; assignedToId: number }>) {
  return prisma.shift.update({ where: { id }, data });
}

export async function deleteShift(id: number) {
  return prisma.shift.delete({ where: { id } });
}
