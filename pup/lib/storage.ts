import { getSupabase } from "./supabase";

const BUCKET = "puppy-media";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9._-]/gi, "_").toLowerCase();
}

export async function uploadPhoto(
  file: File,
  puppyId: string,
  folder: "photos" | "milestones" | "avatar"
): Promise<string> {
  const filename = `${Date.now()}-${sanitizeFilename(file.name)}`;
  const path = `${puppyId}/${folder}/${filename}`;

  const { error } = await getSupabase().storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });

  if (error) throw new Error(error.message);
  return path;
}

export function getPhotoUrl(storagePath: string): string {
  const { data } = getSupabase().storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}
