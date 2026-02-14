import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { uploadReportFile } from '@/lib/services/storage-service';
import { SupabaseReportRepository } from '@/lib/repositories';
import { ReportTypeSchema } from '@/lib/schemas';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-excel', // xls
  'text/csv',
  'application/pdf',
]);

const restaurantIdSchema = z.string().regex(/^[a-zA-Z0-9-]+$/).min(1).max(100);
const reportNameSchema = z.string().min(1).max(255);
const reportPeriodSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const restaurantId = formData.get('restaurantId') as string;
    const reportType = formData.get('reportType') as string;
    const reportName = formData.get('reportName') as string;
    const reportPeriod = formData.get('reportPeriod') as string;

    if (!file || !restaurantId || !reportPeriod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate inputs
    const validatedType = ReportTypeSchema.parse(reportType);
    const validatedRestaurantId = restaurantIdSchema.parse(restaurantId);
    const validatedReportName = reportNameSchema.parse(reportName);
    const validatedPeriod = reportPeriodSchema.parse(reportPeriod);

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File exceeds maximum size of 10MB' },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Accepted: xlsx, xls, csv, pdf' },
        { status: 400 }
      );
    }

    // Upload to storage
    const filePath = await uploadReportFile(
      validatedRestaurantId,
      validatedType,
      file,
      validatedPeriod
    );

    // Create database record
    const reportRepo = new SupabaseReportRepository();
    const report = await reportRepo.create({
      restaurantId: validatedRestaurantId,
      reportType: validatedType,
      reportName: validatedReportName,
      reportPeriod: validatedPeriod,
      filePath,
      fileSizeBytes: file.size,
    });

    return NextResponse.json({
      success: true,
      reportId: report.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
