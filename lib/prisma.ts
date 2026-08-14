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
    return new PrismaClient({ adapter: null } as any);
  }

  const pool = new Pool({
    connectionString,
    ssl: (connectionString.includes("localhost") || connectionString.includes("127.0.0.1"))
      ? undefined
      : { rejectUnauthorized: false },
    max: process.env.NODE_ENV === "production" ? 5 : 1, // Reduced from 10 to 5 - sufficient for serverless
    min: 0, // Allow pool to scale down to 0 when idle
    idleTimeoutMillis: process.env.NODE_ENV === "production" ? 20000 : 2000, // Faster idle timeout (20s vs 30s)
    connectionTimeoutMillis: 20000, // 20s for serverless cold-start resilience
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
