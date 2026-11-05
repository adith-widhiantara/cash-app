import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Prisma 7 opens the connection through a driver adapter, not from the
// schema. DATABASE_URL is set in compose.yaml.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. It comes from compose.yaml.");
}

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });

// Next.js reloads modules in development, which would otherwise open a new
// connection on every change until SQLite runs out of handles.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
