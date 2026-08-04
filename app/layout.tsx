import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { LocaleProvider } from "@/lib/i18n/locale-context";

// Permanent public origin (see deployment notes). Used for metadataBase so
// Open Graph / icon URLs resolve to absolute, and for the structured data.
const SITE_ORIGIN = "https://value-investor-vladimirfabregues-1828s-projects.vercel.app";
const SITE_DESCRIPTION =
  "Independent investment research — company analysis and ETF research, with the reasoning behind every conclusion. Informational only; not investment advice.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: "The Investment Casebook",
  description: SITE_DESCRIPTION,
  applicationName: "The Investment Casebook",
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "The Investment Casebook",
    title: "The Investment Casebook — Every conclusion has a case.",
    description: SITE_DESCRIPTION,
    locale: "en_GB",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "The Investment Casebook" }],
  },
  twitter: {
    card: "summary",
    title: "The Investment Casebook — Every conclusion has a case.",
    description: SITE_DESCRIPTION,
    images: ["/icon-512.png"],
  },
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

// Sitewide structured data: the brand as an Organization + the site itself.
// Deliberately conservative — no financial-advice / rating claims.
const SITE_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_ORIGIN}/#organization`,
      name: "The Investment Casebook",
      url: SITE_ORIGIN,
      logo: `${SITE_ORIGIN}/icon-512.png`,
      description: SITE_DESCRIPTION,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_ORIGIN}/#website`,
      name: "The Investment Casebook",
      url: SITE_ORIGIN,
      inLanguage: ["en-GB", "fr"],
      publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSONLD) }}
        />
        <LocaleProvider>
          {children}
          <LanguageToggle />
        </LocaleProvider>
      </body>
    </html>

  );
}
