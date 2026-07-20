import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getAnalysesByIds } from "@/lib/db/queries";
import { compareRequestSchema } from "@/lib/validation/analysis";
import type { CompareResponse } from "@/types/api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = compareRequestSchema.parse(await request.json());
    const items = await getAnalysesByIds(body.ids);

    if (items === null) {
      return NextResponse.json(
        { error: "One or more of the requested analyses could not be found." },
        { status: 404 },
      );
    }

    return NextResponse.json<CompareResponse>({
      items,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid compare request payload.",
          details: error.flatten(),
        },
        { status: 400 },
      );
    }

    console.error("Compare route failed", error);
    return NextResponse.json(
      {
        error: "Unable to load the requested analyses.",
      },
      { status: 500 },
    );
  }
}
