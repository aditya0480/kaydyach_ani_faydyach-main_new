import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { getUploadPresignedUrl, getPublicUrlForKey } from "@/lib/s3";

type Kind = "cover" | "sample" | "ebook";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const ALLOWED_PDF_TYPES = ["application/pdf"];

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { filename, contentType, kind } = (await req.json()) as {
            filename?: string;
            contentType?: string;
            kind?: Kind;
        };

        if (!filename || !contentType || !kind) {
            return NextResponse.json({ error: "Missing filename/contentType/kind" }, { status: 400 });
        }

        const isImage = kind === "cover" || kind === "sample";
        const allowed = isImage ? ALLOWED_IMAGE_TYPES : ALLOWED_PDF_TYPES;
        if (!allowed.includes(contentType)) {
            return NextResponse.json({ error: `Invalid contentType for kind=${kind}` }, { status: 400 });
        }

        const ext = (filename.includes(".") ? filename.split(".").pop() : (isImage ? "jpg" : "pdf")) || (isImage ? "jpg" : "pdf");
        const prefix = kind === "ebook" ? "ebooks" : "avatars";
        const key = `${prefix}/${crypto.randomUUID()}.${ext.toLowerCase()}`;

        const uploadUrl = await getUploadPresignedUrl(key, contentType, 600);
        const publicUrl = isImage ? getPublicUrlForKey(key) : null;

        return NextResponse.json({ uploadUrl, key, publicUrl });
    } catch (err) {
        console.error("[EBOOKS_PRESIGN]", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
