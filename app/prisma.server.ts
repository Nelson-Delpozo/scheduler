// app/prisma.server.ts
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

// Check if we are running in production or development
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // To avoid creating multiple instances of PrismaClient in development
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export { prisma };
