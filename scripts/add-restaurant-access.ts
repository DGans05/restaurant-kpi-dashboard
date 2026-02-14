import { createClient } from "@supabase/supabase-js";

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const email = process.argv[2];
  const restaurantId = process.argv[3];
  const role = (process.argv[4] ?? "viewer") as "owner" | "manager" | "viewer";

  if (!email || !restaurantId) {
    console.error("Usage: tsx scripts/add-restaurant-access.ts <email> <restaurantId> [role]");
    process.exit(1);
  }

  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  const user = users.users.find((u) => u.email === email);
  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }
  console.log(`Found user: ${user.id} (${user.email})`);

  // Get existing profile to copy display_name/is_admin
  const { data: existing } = await supabase
    .from("user_profiles")
    .select("display_name, is_admin")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .limit(1)
    .single();

  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(
      {
        user_id: user.id,
        restaurant_id: restaurantId,
        role,
        display_name: existing?.display_name ?? null,
        is_admin: existing?.is_admin ?? false,
        deleted_at: null,
      },
      { onConflict: "user_id,restaurant_id" }
    )
    .select()
    .single();

  if (error) throw error;

  console.log(`✓ Added '${restaurantId}' (${role}) to ${email}`);
  console.log(data);
}

main().catch((e) => { console.error(e); process.exit(1); });
