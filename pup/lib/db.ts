import { getSupabase } from "./supabase";
import type {
  PuppyProfile,
  WeightLog,
  FeedingLog,
  WalkLog,
  Photo,
  Milestone,
  HealthRecord
} from "./types";

const PUPPY_ID = "default";

// ─── Puppy Profile ────────────────────────────────────────────────────────────

export async function getPuppyProfile(): Promise<PuppyProfile | null> {
  const { data, error } = await getSupabase()
    .from("puppy_profiles")
    .select("*")
    .eq("puppy_id", PUPPY_ID)
    .single();
  if (error) return null;
  return data as PuppyProfile;
}

export async function upsertPuppyProfile(
  profile: Omit<PuppyProfile, "updated_at">
): Promise<void> {
  await getSupabase()
    .from("puppy_profiles")
    .upsert({ ...profile, updated_at: new Date().toISOString() });
}

// ─── Weight Logs ─────────────────────────────────────────────────────────────

export async function getWeightLogs(): Promise<WeightLog[]> {
  const { data, error } = await getSupabase()
    .from("weight_logs")
    .select("*")
    .eq("puppy_id", PUPPY_ID)
    .order("logged_at", { ascending: false });
  if (error) return [];
  return data as WeightLog[];
}

export async function addWeightLog(
  entry: Pick<WeightLog, "weight_kg" | "notes" | "logged_at">
): Promise<WeightLog | null> {
  const { data, error } = await getSupabase()
    .from("weight_logs")
    .insert({ ...entry, puppy_id: PUPPY_ID })
    .select()
    .single();
  if (error) return null;
  return data as WeightLog;
}

export async function deleteWeightLog(id: string): Promise<void> {
  await getSupabase().from("weight_logs").delete().eq("id", id);
}

// ─── Feeding Logs ─────────────────────────────────────────────────────────────

export async function getFeedingLogs(): Promise<FeedingLog[]> {
  const { data, error } = await getSupabase()
    .from("feeding_logs")
    .select("*")
    .eq("puppy_id", PUPPY_ID)
    .order("fed_at", { ascending: false });
  if (error) return [];
  return data as FeedingLog[];
}

export async function addFeedingLog(
  entry: Pick<FeedingLog, "food_type" | "amount_g" | "notes" | "fed_at">
): Promise<FeedingLog | null> {
  const { data, error } = await getSupabase()
    .from("feeding_logs")
    .insert({ ...entry, puppy_id: PUPPY_ID })
    .select()
    .single();
  if (error) return null;
  return data as FeedingLog;
}

export async function deleteFeedingLog(id: string): Promise<void> {
  await getSupabase().from("feeding_logs").delete().eq("id", id);
}

// ─── Walk Logs ────────────────────────────────────────────────────────────────

export async function getWalkLogs(): Promise<WalkLog[]> {
  const { data, error } = await getSupabase()
    .from("walk_logs")
    .select("*")
    .eq("puppy_id", PUPPY_ID)
    .order("walked_at", { ascending: false });
  if (error) return [];
  return data as WalkLog[];
}

export async function addWalkLog(
  entry: Pick<WalkLog, "duration_min" | "notes" | "walked_at">
): Promise<WalkLog | null> {
  const { data, error } = await getSupabase()
    .from("walk_logs")
    .insert({ ...entry, puppy_id: PUPPY_ID })
    .select()
    .single();
  if (error) return null;
  return data as WalkLog;
}

export async function deleteWalkLog(id: string): Promise<void> {
  await getSupabase().from("walk_logs").delete().eq("id", id);
}

// ─── Photos ───────────────────────────────────────────────────────────────────

export async function getPhotos(): Promise<Photo[]> {
  const { data, error } = await getSupabase()
    .from("photos")
    .select("*")
    .eq("puppy_id", PUPPY_ID)
    .order("taken_at", { ascending: false });
  if (error) return [];
  return data as Photo[];
}

export async function addPhoto(
  entry: Pick<Photo, "storage_path" | "caption" | "taken_at">
): Promise<Photo | null> {
  const { data, error } = await getSupabase()
    .from("photos")
    .insert({ ...entry, puppy_id: PUPPY_ID })
    .select()
    .single();
  if (error) return null;
  return data as Photo;
}

export async function deletePhoto(id: string): Promise<void> {
  await getSupabase().from("photos").delete().eq("id", id);
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export async function getMilestones(): Promise<Milestone[]> {
  const { data, error } = await getSupabase()
    .from("milestones")
    .select("*")
    .eq("puppy_id", PUPPY_ID)
    .order("occurred_at", { ascending: false });
  if (error) return [];
  return data as Milestone[];
}

export async function addMilestone(
  entry: Pick<Milestone, "title" | "description" | "photo_path" | "occurred_at">
): Promise<Milestone | null> {
  const { data, error } = await getSupabase()
    .from("milestones")
    .insert({ ...entry, puppy_id: PUPPY_ID })
    .select()
    .single();
  if (error) return null;
  return data as Milestone;
}

export async function deleteMilestone(id: string): Promise<void> {
  await getSupabase().from("milestones").delete().eq("id", id);
}

// ─── Health Records ───────────────────────────────────────────────────────────

export async function getHealthRecords(): Promise<HealthRecord[]> {
  const { data, error } = await getSupabase()
    .from("health_records")
    .select("*")
    .eq("puppy_id", PUPPY_ID)
    .order("occurred_at", { ascending: false });
  if (error) return [];
  return data as HealthRecord[];
}

export async function addHealthRecord(
  entry: Pick<
    HealthRecord,
    "record_type" | "title" | "description" | "provider" | "next_due_at" | "occurred_at"
  >
): Promise<HealthRecord | null> {
  const { data, error } = await getSupabase()
    .from("health_records")
    .insert({ ...entry, puppy_id: PUPPY_ID })
    .select()
    .single();
  if (error) return null;
  return data as HealthRecord;
}

export async function deleteHealthRecord(id: string): Promise<void> {
  await getSupabase().from("health_records").delete().eq("id", id);
}
