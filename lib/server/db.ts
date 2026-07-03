import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

// Bump PRISMA_SCHEMA_VERSION whenever you run `prisma generate` in dev
// to force the globalThis singleton cache to reset.
const PRISMA_SCHEMA_VERSION = "v2"; // phase-2 models added

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion: string | undefined;
};

// If schema version changed, discard the cached instance
if (globalForPrisma.prismaSchemaVersion !== PRISMA_SCHEMA_VERSION) {
  globalForPrisma.prisma = undefined;
  globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
