"use client";

import { useTranslation } from "@/lib/i18n/locale-context";

const LINKEDIN = "https://www.linkedin.com/in/vladimir-fabregues/";

/**
 * "Connect on LinkedIn" call-to-action for the About page. A client component
 * so its label follows the active locale; the link itself is a plain anchor
 * out to LinkedIn.
 */
export function AboutConnect() {
  const { t } = useTranslation();
  return (
    <a
      href={LINKEDIN}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/40 px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-4 w-4">
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
      </svg>
      {t("about.connect")}
    </a>
  );
}
