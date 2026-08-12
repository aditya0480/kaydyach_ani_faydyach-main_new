import { NextResponse } from "next/server";
import { prisma_db } from "@/lib/prisma";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const users = await prisma_db.user.findMany({
    select: { id: true, email: true, name: true, role: true },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(users);
}
