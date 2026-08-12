import { prisma_db } from "@/lib/prisma";

const DEFAULT_PRICE = 99;

export async function getConsultationPrice(): Promise<number> {
    const config = await prisma_db.consultationConfig.findUnique({ where: { id: 1 } });
    return config ? Number(config.price) : DEFAULT_PRICE;
}

export async function setConsultationPrice(price: number): Promise<number> {
    const config = await prisma_db.consultationConfig.upsert({
        where: { id: 1 },
        update: { price },
        create: { id: 1, price },
    });
    return Number(config.price);
}
