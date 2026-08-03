import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { LocaleProvider } from "@/lib/i18n/locale-context";

export const metadata: Metadata = {
  title: "The Investment Casebook",
  description:
    "Premium investment research — deep company analysis and ETF research, with the reasoning behind every conclusion. Every conclusion has a case.",
  applicationName: "The Investment Casebook",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Casebook",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a101c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <LocaleProvider>
          {children}
          <LanguageToggle />
        </LocaleProvider>
      </body>
    </html>
  );
}
