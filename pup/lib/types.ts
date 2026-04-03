export type SyncStatus = "idle" | "syncing" | "synced" | "offline";

export interface PuppyProfile {
  puppy_id: string;
  name: string;
  breed: string;
  birth_date: string | null;
  arrival_date: string;
  avatar_path: string | null;
  updated_at: string;
}

export interface WeightLog {
  id: string;
  puppy_id: string;
  weight_kg: number;
  notes: string | null;
  logged_at: string;
  created_at: string;
}

export interface FeedingLog {
  id: string;
  puppy_id: string;
  food_type: string;
  amount_g: number | null;
  notes: string | null;
  fed_at: string;
  created_at: string;
}

export interface WalkLog {
  id: string;
  puppy_id: string;
  duration_min: number;
  notes: string | null;
  walked_at: string;
  created_at: string;
}

export interface Photo {
  id: string;
  puppy_id: string;
  storage_path: string;
  caption: string | null;
  taken_at: string;
  created_at: string;
}

export type MilestoneType =
  | "eerste_bad"
  | "eerste_wandeling"
  | "eerste_nacht"
  | "eerste_kat"
  | "eerste_commando"
  | "anders";

export interface Milestone {
  id: string;
  puppy_id: string;
  title: string;
  description: string | null;
  photo_path: string | null;
  occurred_at: string;
  created_at: string;
}

export type HealthRecordType = "dierenarts" | "vaccinatie" | "medicatie";

export interface HealthRecord {
  id: string;
  puppy_id: string;
  record_type: HealthRecordType;
  title: string;
  description: string | null;
  provider: string | null;
  next_due_at: string | null;
  occurred_at: string;
  created_at: string;
}
