import { PrismaClient } from "@prisma/client";

// Singleton pour éviter d'ouvrir une nouvelle connexion à chaque hot-reload en dev.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
