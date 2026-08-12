import { prisma_db } from "../lib/prisma";
import { customAlphabet } from "nanoid";

const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 10);

async function main() {
    const missing = await prisma_db.ebook.findMany({
        where: { shortCode: null },
        select: { id: true, title: true },
    });

    console.log(`Found ${missing.length} ebooks missing shortCode`);

    for (const e of missing) {
        let code = nanoid();
        // Retry on collision
        for (let i = 0; i < 5; i++) {
            const exists = await prisma_db.ebook.findUnique({ where: { shortCode: code }, select: { id: true } });
            if (!exists) break;
            code = nanoid();
        }
        await prisma_db.ebook.update({ where: { id: e.id }, data: { shortCode: code } });
        console.log(`  ${e.title.slice(0, 40)} → /d/${code}`);
    }

    console.log("Done.");
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
