import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const DashboardKeySchema = z.enum(["kern", "service"]);

const PutBodySchema = z.object({
  key: DashboardKeySchema,
  order: z.array(z.string().min(1)).min(1),
});

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  const parsed = DashboardKeySchema.safeParse(key);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid dashboard key" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ order: null });
  }

  const { data } = await supabase
    .from("dashboard_layouts")
    .select("layouts")
    .eq("user_id", user.id)
    .eq("dashboard_key", parsed.data)
    .single();

  // layouts JSONB column stores { order: string[] }
  const order = data?.layouts?.order ?? null;
  return NextResponse.json({ order });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const parsed = PutBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("dashboard_layouts")
    .upsert(
      {
        user_id: user.id,
        dashboard_key: parsed.data.key,
        layouts: { order: parsed.data.order },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,dashboard_key" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
