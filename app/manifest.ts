import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Value Investor — Conservative Equity Analysis",
    short_name: "Value Investor",
    description:
      "Graham & Buffett-style equity screening and intrinsic-value analysis across US, UK, European, and Japanese markets.",
    start_url: "/screen",
    display: "standalone",
    orientation: "portrait",
    background_color: "#060a12",
    theme_color: "#0a101c",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
