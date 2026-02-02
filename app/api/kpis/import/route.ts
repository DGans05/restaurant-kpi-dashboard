import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/auth';
import { kpiCSVRowSchema } from '@/lib/validations/kpi.schema';
import { createAuditLog } from '@/lib/utils/audit';
import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user || (user.profile?.role !== 'admin' && user.profile?.role !== 'manager')) {
      return NextResponse.json(
        { error: 'Only managers and admins can import data' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are supported' },
        { status: 400 }
      );
    }

    const csvText = await file.text();
    let results: any[] = [];
    let parseError: string | null = null;

    // Parse CSV
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (data) => {
        results = data.data;
      },
      error: (error: any) => {
        parseError = error.message;
      },
    });

    if (parseError) {
      return NextResponse.json(
        { error: `CSV parsing error: ${parseError}` },
        { status: 400 }
      );
    }

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty' },
        { status: 400 }
      );
    }

    // Validate and insert rows
    const imported: any[] = [];
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      const validation = kpiCSVRowSchema.safeParse(row);

      if (!validation.success) {
        errors.push({
          row: i + 2, // +2 for header and 1-based indexing
          error: validation.error.errors[0]?.message || 'Validation failed',
        });
        continue;
      }

      const { restaurant_id, date, revenue, labour_cost, food_cost, order_count } =
        validation.data;

      const { data: insertedKpi, error: insertError } = await supabase
        .from('kpis')
        .insert({
          restaurant_id,
          date,
          revenue,
          labour_cost,
          food_cost,
          order_count,
        })
        .select()
        .single();

      if (insertError) {
        errors.push({
          row: i + 2,
          error: insertError.message,
        });
        continue;
      }

      imported.push(insertedKpi);

      // Log each import
      await createAuditLog({
        action: 'kpi_import',
        resource_type: 'kpi',
        resource_id: insertedKpi.id,
        changes: {
          source: 'csv_import',
          filename: file.name,
        },
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
      });
    }

    return NextResponse.json({
      success: true,
      imported: imported.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
