import { NextRequest, NextResponse } from 'next/server';
import { getReportById } from '@/lib/services/report-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await getReportById(id);

    if (!report || !report.filePath) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      reportId: report.id,
      reportType: report.reportType,
      reportName: report.reportName,
      reportPeriod: report.reportPeriod,
      fileSizeBytes: report.fileSizeBytes,
      uploadStatus: report.uploadStatus,
      uploadedAt: report.uploadedAt,
    });
  } catch (error) {
    console.error('Get report data error:', error);
    return NextResponse.json(
      { error: 'Failed to get report data' },
      { status: 500 }
    );
  }
}
