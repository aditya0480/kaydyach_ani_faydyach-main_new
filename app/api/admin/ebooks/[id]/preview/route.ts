import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma_db } from "@/lib/prisma";
import { getPresignedUrl } from "@/lib/s3";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const params = await context.params;
        const { id } = params;

        const ebook = await prisma_db.ebook.findUnique({
            where: { id },
            select: { fileUrl: true }
        });

        if (!ebook || !ebook.fileUrl) {
            return new NextResponse("Ebook or file not found", { status: 404 });
        }

        // Generate presigned URL valid for 15 minutes checking
        const url = await getPresignedUrl(ebook.fileUrl, 900);

        return NextResponse.json({ url });
    } catch (error) {
        console.error("[PREVIEW_PDF]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
