import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Investment Casebook",
    short_name: "Casebook",
    description:
      "Premium investment research — deep company analysis and ETF research, with the reasoning behind every conclusion.",
    start_url: "/value/screen",
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
