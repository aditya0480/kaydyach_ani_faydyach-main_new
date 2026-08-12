/**
 * Migration script: Assigns permanent short codes to all ebooks that don't have one.
 * Run with: npx tsx scripts/assign-ebook-short-codes.ts
 * 
 * Safe to run multiple times — only fills in NULL shortCodes.
 * No data loss — only UPDATES existing rows, never deletes.
 */

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { customAlphabet } from "nanoid";

// URL-friendly alphabet, 8 chars = 2.8 trillion combinations
const generateCode = customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("DATABASE_URL is required");
        process.exit(1);
    }

    const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: true }, max: 2 });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        // Find all ebooks without a shortCode
        const ebooks = await prisma.ebook.findMany({
            where: { shortCode: null },
            select: { id: true, title: true },
        });

        console.info(`Found ${ebooks.length} ebooks without short codes.\n`);

        if (ebooks.length === 0) {
            console.info("Nothing to do — all ebooks already have short codes.");
            return;
        }

        for (const ebook of ebooks) {
            let code: string;
            let attempts = 0;

            // Generate unique code (retry on collision)
            while (true) {
                code = generateCode();
                const existing = await prisma.ebook.findUnique({ where: { shortCode: code } });
                if (!existing) break;
                attempts++;
                if (attempts > 10) throw new Error("Too many collisions generating short code");
            }

            await prisma.ebook.update({
                where: { id: ebook.id },
                data: { shortCode: code },
            });

            console.info(`  ✅ ${ebook.title} → /d/${code}`);
        }

        console.info(`\nDone! Assigned short codes to ${ebooks.length} ebooks.`);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main().catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
});
