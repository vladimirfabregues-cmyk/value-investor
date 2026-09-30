#!/usr/bin/env node
/**
 * Email the monthly report PDF through Resend.
 * Env: RESEND_API_KEY, REPORT_EMAIL_TO, REPORT_MONTH (YYYY-MM), REPORT_PDF (path), REPORT_URL.
 */
import { readFileSync } from "node:fs";

const { RESEND_API_KEY, REPORT_EMAIL_TO, REPORT_MONTH, REPORT_PDF, REPORT_URL } = process.env;
if (!RESEND_API_KEY || !REPORT_EMAIL_TO) {
  console.error("Missing RESEND_API_KEY or REPORT_EMAIL_TO");
  process.exit(1);
}
const monthName = new Date(`${REPORT_MONTH}-01T00:00:00Z`).toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    // Resend's shared sender works without owning a domain, for mail to the account's own address.
    from: "Investment Casebook <onboarding@resend.dev>",
    to: [REPORT_EMAIL_TO],
    subject: `Casebook monthly report — ${monthName}`,
    html: `<p>Your monthly report for ${monthName} is attached.</p><p>Online version: <a href="${REPORT_URL}">${REPORT_URL}</a></p>`,
    attachments: [{ filename: `casebook-report-${REPORT_MONTH}.pdf`, content: readFileSync(REPORT_PDF).toString("base64") }],
  }),
});
const body = await res.text();
console.log(res.status, body);
if (!res.ok) process.exit(1);
