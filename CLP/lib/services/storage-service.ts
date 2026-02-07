import { createClient } from '@/lib/supabase/server';
import { ReportType } from '@/lib/types';

const BUCKET_NAME = 'reports';

const ALLOWED_EXTENSIONS = new Set(['xlsx', 'xls', 'csv', 'pdf']);

const RESTAURANT_ID_PATTERN = /^[a-zA-Z0-9-]+$/;

/**
 * Sanitize restaurant ID — strip path separators, validate pattern
 */
function sanitizeRestaurantId(id: string): string {
  const cleaned = id.replace(/[/\\]/g, '');
  if (!RESTAURANT_ID_PATTERN.test(cleaned)) {
    throw new Error('Invalid restaurant ID format');
  }
  return cleaned;
}

/**
 * Upload a report file to Supabase Storage
 * File path: {restaurantId}/{reportType}/{year}/{month}/{fileName}
 */
export async function uploadReportFile(
  restaurantId: string,
  reportType: ReportType,
  file: File,
  reportPeriod: string // YYYY-MM-DD
): Promise<string> {
  const supabase = await createClient();

  const safeRestaurantId = sanitizeRestaurantId(restaurantId);

  // Extract and validate extension
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new Error(`File extension not allowed: ${extension}`);
  }

  const [year, month] = reportPeriod.split('-');
  const fileName = `${reportType}_${reportPeriod}_${Date.now()}.${extension}`;
  const filePath = `${safeRestaurantId}/${reportType}/${year}/${month}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, { upsert: false });

  if (error) throw error;
  return filePath;
}

/**
 * Download a report file from Supabase Storage
 */
export async function downloadReportFile(filePath: string): Promise<Blob> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(filePath);

  if (error) throw error;
  return data;
}

/**
 * Get a signed URL for a report file (1 hour expiry)
 */
export async function getReportUrl(filePath: string): Promise<string> {
  const supabase = await createClient();

  const { data } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, 3600);

  return data?.signedUrl || '';
}
