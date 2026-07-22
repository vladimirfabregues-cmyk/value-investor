import { headers } from "next/headers";
import { ZodError } from "zod";

import {
  FinanceProviderError,
  ToolValidationError,
  analyzeTicker,
} from "@/lib/claude/analyze-stock";
import { saveAnalysis } from "@/lib/db/queries";
import { findRecentBySecurity } from "@/lib/db/queries";
import { resolveSecurity } from "@/lib/finance/exchanges";
import { checkRateLimit } from "@/lib/rate-limit";
import { analyzeRequestSchema, valueInvestingAnalysisSchema } from "@/lib/validation/analysis";

export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

function sseEvent(type: string, data: Record<string, unknown>): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify({ type, ...data })}\n\n`);
}

function errorMessage(error: unknown): { message: string; status: number } {
  if (error instanceof ZodError) {
    return { message: "Invalid analysis output from model. Please retry.", status: 502 };
  }
  if (error instanceof FinanceProviderError) {
    return { message: error.message, status: error.statusCode };
  }
  if (error instanceof ToolValidationError) {
    return { message: error.message, status: error.statusCode };
  }
  if (
    error instanceof Error &&
    error.message === "Structured analysis output failed validation."
  ) {
    return {
      message: "The analysis service returned an invalid structured response. Please retry.",
      status: 502,
    };
  }
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status: number }).status;
    const code =
      "code" in error && typeof (error as { code: unknown }).code === "string"
        ? (error as { code: string }).code
        : null;

    if (status === 401) {
      return {
        message: "Anthropic rejected the API key. Double-check ANTHROPIC_API_KEY in your .env file.",
        status: 401,
      };
    }
    if (status === 429) {
      return {
        message: "Anthropic rate limit reached. Please wait a moment and retry.",
        status: 429,
      };
    }
    if (status >= 400 && status < 500) {
      return {
        message: "Anthropic rejected the analysis request. Please retry.",
        status,
      };
    }
  }

  return { message: "Unexpected internal error while analyzing the ticker.", status: 500 };
}

export async function POST(request: Request) {
  // Validate request before opening the stream
  let ticker: string;
  let exchange: string | undefined;
  try {
    const body = analyzeRequestSchema.parse(await request.json());
    // Market + symbol is the identity; an absent market is inferred from the suffix.
    const security = resolveSecurity(body.ticker, body.exchange);
    ticker = security.ticker;
    exchange = security.exchange;
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: "Invalid analyze request payload.", details: error.flatten() },
        { status: 400 },
      );
    }
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Rate limit by IP
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
    headersList.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: "Too many requests. Please wait a moment before analyzing again." },
      { status: 429 },
    );
  }

  // Return cached analysis if one exists from the last 24 hours
  const recent = await findRecentBySecurity(ticker, exchange);
  if (recent) {
    return Response.json({ id: recent.id, analysis: recent.fullJson });
  }

  // Stream the analysis with progress events
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const analysis = valueInvestingAnalysisSchema.parse(
          await analyzeTicker(ticker, (stage) => {
            controller.enqueue(sseEvent("progress", { stage }));
          }),
        );
        const saved = await saveAnalysis(analysis);
        controller.enqueue(sseEvent("complete", { id: saved.id, analysis }));
      } catch (error) {
        console.error("Analyze route failed", { ticker, exchange, error });
        const { message } = errorMessage(error);
        controller.enqueue(sseEvent("error", { message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
