import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const DashboardKeySchema = z.enum(["kern", "service"]);

const WidgetLayoutItemSchema = z.object({
  i: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  minW: z.number().optional(),
  minH: z.number().optional(),
  maxW: z.number().optional(),
});

const PutBodySchema = z.object({
  key: DashboardKeySchema,
  layouts: z.record(z.string(), z.array(WidgetLayoutItemSchema)),
  hidden: z.array(z.string()),
});

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  const parsed = DashboardKeySchema.safeParse(key);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid dashboard key" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ layouts: null, hidden: [] });
  }

  const { data } = await supabase
    .from("dashboard_layouts")
    .select("layouts")
    .eq("user_id", user.id)
    .eq("dashboard_key", parsed.data)
    .single();

  const stored = data?.layouts ?? {};
  return NextResponse.json({
    layouts: stored.layouts ?? null,
    hidden: stored.hidden ?? [],
  });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const parsed = PutBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("dashboard_layouts").upsert(
    {
      user_id: user.id,
      dashboard_key: parsed.data.key,
      layouts: {
        layouts: parsed.data.layouts,
        hidden: parsed.data.hidden,
      },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,dashboard_key" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
