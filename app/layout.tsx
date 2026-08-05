import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { BRAND } from "@/lib/brand";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { LocaleProvider } from "@/lib/i18n/locale-context";

export const metadata: Metadata = {
  // metadataBase makes Open Graph / icon URLs resolve to absolute.
  metadataBase: new URL(BRAND.origin),
  title: BRAND.seo.title,
  description: BRAND.description,
  applicationName: BRAND.name,
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title: BRAND.seo.ogTitle,
    description: BRAND.description,
    locale: "en_GB",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: BRAND.name }],
  },
  twitter: {
    card: "summary",
    title: BRAND.seo.ogTitle,
    description: BRAND.description,
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
    title: BRAND.appShortName,
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
      "@id": `${BRAND.origin}/#organization`,
      name: BRAND.name,
      url: BRAND.origin,
      logo: `${BRAND.origin}/icon-512.png`,
      description: BRAND.description,
    },
    {
      "@type": "WebSite",
      "@id": `${BRAND.origin}/#website`,
      name: BRAND.name,
      url: BRAND.origin,
      inLanguage: ["en-GB", "fr"],
      publisher: { "@id": `${BRAND.origin}/#organization` },
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
