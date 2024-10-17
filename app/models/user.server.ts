// app/models/user.server.ts
import { prisma } from "~/prisma.server";

export async function createUser(email: string, passwordHash: string, role: string) {
  return prisma.user.create({
    data: {
      email,
      password: passwordHash,
      role,
    },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUsersByRole(role: string) {
  return prisma.user.findMany({ where: { role } });
}
