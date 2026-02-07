import { createClient } from '@/lib/supabase/server';
import { Report, ReportType } from '@/lib/types';
import { ReportRepository, CreateReportDto } from './report-repository';

export class SupabaseReportRepository implements ReportRepository {
  async findByPeriod(restaurantId: string, year: number, month: number): Promise<Report[]> {
    const supabase = await createClient();
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;

    // Calculate the last day of the month
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .gte('report_period', startDate)
      .lte('report_period', endDate)
      .order('report_period', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.mapToReport);
  }

  async findById(id: string): Promise<Report | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return this.mapToReport(data);
  }

  async create(dto: CreateReportDto): Promise<Report> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reports')
      .insert({
        restaurant_id: dto.restaurantId,
        report_type: dto.reportType,
        report_name: dto.reportName,
        report_period: dto.reportPeriod,
        file_path: dto.filePath,
        file_size_bytes: dto.fileSizeBytes,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToReport(data);
  }

  async updateStatus(id: string, status: string, error?: string): Promise<void> {
    const supabase = await createClient();
    await supabase
      .from('reports')
      .update({
        upload_status: status,
        upload_error: error,
        parsed_at: status === 'parsed' ? new Date().toISOString() : null,
      })
      .eq('id', id);
  }

  async getAvailableYears(restaurantId: string): Promise<number[]> {
    const supabase = await createClient();
    const { data } = await supabase
      .from('reports')
      .select('report_period')
      .eq('restaurant_id', restaurantId)
      .order('report_period', { ascending: false });

    if (!data || data.length === 0) return [new Date().getFullYear()];

    const years = new Set(data.map(r => new Date(r.report_period).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }

  private mapToReport(row: any): Report {
    return {
      id: row.id,
      restaurantId: row.restaurant_id,
      reportType: row.report_type,
      reportName: row.report_name,
      reportPeriod: row.report_period,
      filePath: row.file_path,
      fileSizeBytes: row.file_size_bytes,
      uploadStatus: row.upload_status,
      uploadError: row.upload_error,
      uploadedAt: new Date(row.uploaded_at),
      parsedAt: row.parsed_at ? new Date(row.parsed_at) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
