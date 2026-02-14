import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseKpiCsv } from "@/lib/parsers/kpi-csv-parser";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 10 MB)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(arrayBuffer);
    const entries = parseKpiCsv(buffer);

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("CSV preview error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to parse file",
      },
      { status: 500 }
    );
  }
}
