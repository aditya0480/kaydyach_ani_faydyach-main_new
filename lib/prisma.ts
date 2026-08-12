import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

// Force reload comment
const globalForPrisma = globalThis as unknown as {
  prismaDb: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL || process.env.NEXT_POSTGRES_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    if (process.env.NODE_ENV === "production" && !process.env.NEXT_PHASE) {
      console.warn("⚠️ Missing DATABASE_URL environment variable. Prisma might fail if queried.");
    }
    // Return standard client without pg adapter if during build or no DB string
    // @ts-expect-error - Fallback PrismaClient instantiation without adapter
    return new PrismaClient({ adapter: null });
  }

  const pool = new Pool({
    connectionString,
    // Enforce SSL for Neon (Strict), Disable for Localhost, Lenient for others in Prod
    ssl: connectionString.includes("neon.tech")
      ? { rejectUnauthorized: true }
      : (connectionString.includes("localhost") || connectionString.includes("127.0.0.1"))
        ? undefined
        : (process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined),
    max: process.env.NODE_ENV === "production" ? 5 : 1, // Reduced from 10 to 5 - sufficient for serverless
    min: 0, // Allow pool to scale down to 0 when idle
    idleTimeoutMillis: process.env.NODE_ENV === "production" ? 20000 : 2000, // Faster idle timeout (20s vs 30s)
    connectionTimeoutMillis: 10000, // Reduced from 15s to 10s
    allowExitOnIdle: true,
    maxUses: 7500,
    // Enable statement timeout to prevent long-running queries
    statement_timeout: 30000, // 30 second query timeout
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

export const prisma_db = globalForPrisma.prismaDb ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaDb = prisma_db;
