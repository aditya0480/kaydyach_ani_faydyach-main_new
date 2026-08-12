import { ImageResponse } from "next/og";
import { prisma_db } from "@/lib/prisma";

// Route segment config
export const runtime = "nodejs";

// Image metadata
export const alt = "Ebook Cover";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ebook = await prisma_db.ebook.findUnique({
    where: { id },
  });

  // Fetch fonts for ₹ symbol and Marathi (Devanagari) support
  // Using jsdelivr with Promise.allSettled for maximum resilience
  const fontResults = await Promise.allSettled([
    fetch(
      "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/inter/static/Inter-Bold.ttf",
      { cache: "force-cache" },
    ).then((res) =>
      res.ok ? res.arrayBuffer() : Promise.reject("Failed to fetch Inter"),
    ),
    fetch(
      "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/notosansdevanagari/NotoSansDevanagari-Bold.ttf",
      { cache: "force-cache" },
    ).then((res) =>
      res.ok
        ? res.arrayBuffer()
        : Promise.reject("Failed to fetch Noto Sans Devanagari"),
    ),
  ]);

  const interData =
    fontResults[0].status === "fulfilled"
      ? fontResults[0].value
      : new ArrayBuffer(0);
  const devanagariData =
    fontResults[1].status === "fulfilled"
      ? fontResults[1].value
      : new ArrayBuffer(0);

  const fonts: {
    name: string;
    data: ArrayBuffer;
    style: "normal" | "italic";
    weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  }[] = [];
  if (interData.byteLength > 0) {
    fonts.push({
      name: "Inter",
      data: interData,
      style: "normal",
      weight: 700,
    });
  }
  if (devanagariData.byteLength > 0) {
    fonts.push({
      name: "Noto Sans Devanagari",
      data: devanagariData,
      style: "normal",
      weight: 700,
    });
  }

  const { SALE_CONFIG, getInflatedOriginalPrice } =
    await import("@/lib/sale-config");

  if (!ebook) {
    return new ImageResponse(
      <div
        style={{
          fontSize: 64,
          background: "#0A2342", // Brand Navy
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 700,
          fontFamily: fonts.length > 0 ? fonts[0].name : "sans-serif",
        }}
      >
        कायद्याचं आणि फायद्याचं
      </div>,
      {
        ...size,
        fonts: fonts.length > 0 ? fonts : undefined,
      },
    );
  }

  const price = Number(ebook.price);
  const inflatedPrice = getInflatedOriginalPrice(price);
  const isSaleActive = SALE_CONFIG.isActive;

  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #0A2342 0%, #0f2d52 100%)", // Brand Navy
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "60px",
        fontFamily: "Noto Sans Devanagari, Inter",
      }}
    >
      {/* Book Cover Container */}
      <div
        style={{
          display: "flex",
          position: "relative",
          width: "380px",
          height: "540px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          overflow: "hidden",
          border: "4px solid rgba(255,211,1,0.2)", // Brand Gold tint
        }}
      >
        {ebook.coverImage ? (
          <img
            src={ebook.coverImage}
            alt={ebook.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              color: "#94a3b8",
              fontSize: "24px",
              backgroundColor: "#e2e8f0",
            }}
          >
            Cover Image
          </div>
        )}
      </div>

      {/* Info Column */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginLeft: "60px",
          flex: 1,
          height: "100%",
          justifyContent: "space-between",
          paddingTop: "20px",
          paddingBottom: "20px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                backgroundColor: "#FFD301",
                width: "40px",
                height: "4px",
                borderRadius: "2px",
              }}
            ></div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#FFD301",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Premium Legal Guide
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "52px",
              fontWeight: 700,
              lineHeight: 1.1,
              color: "#f8fafc",
              maxHeight: "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              WebkitLineClamp: 3,
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
            }}
          >
            {ebook.title}
          </div>
        </div>

        {/* Pricing Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {isSaleActive && (
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span
                style={{
                  fontSize: "24px",
                  textDecoration: "line-through",
                  color: "#94a3b8",
                  fontWeight: 700,
                }}
              >
                ₹{inflatedPrice}
              </span>
              <div
                style={{
                  backgroundColor: "#DC2626",
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  fontSize: "18px",
                  fontWeight: 700,
                  display: "flex",
                }}
              >
                {SALE_CONFIG.discountPercent}% OFF
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span
              style={{
                fontSize: "80px",
                fontWeight: 700,
                color: "#FFD301",
                lineHeight: 1,
              }}
            >
              ₹{price}
            </span>
            {!isSaleActive && (
              <span
                style={{ fontSize: "24px", color: "#94a3b8", fontWeight: 700 }}
              >
                only
              </span>
            )}
            {isSaleActive && (
              <span
                style={{ fontSize: "24px", color: "#FFD301", fontWeight: 700 }}
              >
                Limited Deal
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            marginTop: "20px",
            borderTop: "2px solid rgba(255,255,255,0.1)",
            paddingTop: "20px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                background: "#FFD301",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0A2342",
                fontWeight: 700,
                fontSize: "24px",
              }}
            >
              K
            </div>
            <span
              style={{ fontSize: "24px", fontWeight: 700, color: "#f8fafc" }}
            >
              kaydyanch_ani_faydyach
            </span>
          </div>
          <div
            style={{
              display: "flex",
              backgroundColor: "#FFD301",
              color: "#0A2342",
              padding: "10px 24px",
              borderRadius: "50px",
              fontSize: "20px",
              fontWeight: 700,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            Download Now
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: fonts.length > 0 ? fonts : undefined,
    },
  );
}
