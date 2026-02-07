import { Report, ReportType } from '@/lib/types';
import { CreateReportDtoSchema } from '@/lib/schemas';
import { z } from 'zod';

export type CreateReportDto = z.infer<typeof CreateReportDtoSchema>;

export interface ReportRepository {
  findByPeriod(restaurantId: string, year: number, month: number): Promise<Report[]>;
  findById(id: string): Promise<Report | null>;
  create(data: CreateReportDto): Promise<Report>;
  updateStatus(id: string, status: string, error?: string): Promise<void>;
  getAvailableYears(restaurantId: string): Promise<number[]>;
}
