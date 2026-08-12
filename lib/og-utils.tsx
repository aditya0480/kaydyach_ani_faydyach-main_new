import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const OgImageSize = { width: 1200, height: 630 };

// Load fonts from local filesystem (no network dependency)
const loadFonts = async () => {
  const fontConfigs = [
    { path: "public/fonts/inter-700.woff", name: "Inter" },
    { path: "public/fonts/noto-sans-devanagari-700.woff", name: "Noto Sans Devanagari" },
  ];

  const fontResults = await Promise.allSettled(
    fontConfigs.map(async ({ path }) => {
      const absolutePath = join(process.cwd(), path);
      const buffer = await readFile(absolutePath);
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    }),
  );

  const fonts: {
    name: string;
    data: ArrayBuffer;
    weight: 700;
    style: "normal";
  }[] = [];

  fontResults.forEach((result, i) => {
    if (result.status === "fulfilled") {
      fonts.push({
        name: fontConfigs[i].name,
        data: result.value,
        weight: 700,
        style: "normal",
      });
    } else {
      console.warn(`[OG] Font "${fontConfigs[i].name}" failed to load:`, result.reason);
    }
  });

  return fonts;
};

// Simplified image fetcher (Base64 conversion for stability)
export const fetchImageAsBase64 = async (
  url: string,
): Promise<string | null> => {
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const type = res.headers.get("content-type") || "image/png";
      return `data:${type};base64,${base64}`;
    }
  } catch (e) {
    console.error("OG Image fetch error:", e);
  }
  return null;
};

interface OgImageOptions {
  title: string;
  subtitle?: string;
  price?: number | string;
  coverImageUrl?: string | null;
  tag?: string;
}

export async function generateOgImage(options: OgImageOptions) {
  const { title, subtitle, price, coverImageUrl, tag } = options;

  // Parallel usage of fonts and image
  const [fonts, coverImageBase64] = await Promise.all([
    loadFonts(),
    coverImageUrl ? fetchImageAsBase64(coverImageUrl) : Promise.resolve(null),
  ]);

  // Truncate title if too long
  const displayTitle =
    title.length > 60 ? title.substring(0, 60) + "..." : title;
  const titleFontSize = displayTitle.length > 40 ? "48px" : "64px";

  return new ImageResponse(
    <div
      style={{
        backgroundColor: "#0A2342", // Brand Navy
        backgroundImage: "linear-gradient(135deg, #0A2342 0%, #153a63 100%)",
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "60px",
        color: "white",
        fontFamily: "Noto Sans Devanagari, Inter",
      }}
    >
      {/* Book Cover / Left Visual */}
      <div style={{ display: "flex", marginRight: "60px" }}>
        <div
          style={{
            width: "360px",
            height: "510px",
            backgroundColor: "#111827",
            display: "flex",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.7)",
            border: "2px solid rgba(255,255,255,0.1)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {coverImageBase64 ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundImage: `url(${coverImageBase64})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          ) : (
            <div
              style={{
                fontSize: "100px",
                opacity: 0.2,
                fontWeight: 900,
                color: "white",
              }}
            >
              K
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              background: "#FFD301",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0A2342",
              fontWeight: 900,
              fontSize: "24px",
            }}
          >
            K
          </div>
          <div style={{ fontSize: "28px", color: "#FFD301", fontWeight: 800 }}>
            Kaydyanch Ani Faydyach
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: titleFontSize,
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: "40px",
            textShadow: "0 4px 12px rgba(0,0,0,0.3)",
            display: "-webkit-box",
            overflow: "hidden",
          }}
        >
          {displayTitle}
        </div>

        {/* Metadata: Price & Tag */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {price ? (
            <div
              style={{
                backgroundColor: "#FFD301",
                color: "#0A2342",
                padding: "12px 30px",
                borderRadius: "16px",
                fontSize: "42px",
                fontWeight: 900,
                boxShadow: "0 4px 14px rgba(255, 211, 1, 0.4)",
              }}
            >
              ₹{price}
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "white",
                marginBottom: "4px",
              }}
            >
              {subtitle || "Premium Content"}
            </div>
            <div
              style={{ fontSize: "16px", color: "#94a3b8", fontWeight: 700 }}
            >
              {tag || "Marathi Edition • Instant Download"}
            </div>
          </div>
        </div>
      </div>
    </div>,
    {
      ...OgImageSize,
      fonts,
    },
  );
}
