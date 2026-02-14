import { NextRequest, NextResponse } from 'next/server';
import { getReportById } from '@/lib/services/report-service';
import { downloadReportFile } from '@/lib/services/storage-service';

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

    const blob = await downloadReportFile(report.filePath);
    const buffer = await blob.arrayBuffer();

    const extension = report.filePath.split('.').pop() ?? 'xlsx';
    const contentType = extension === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    const fileName = `${report.reportName}.${extension}`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(buffer.byteLength),
      },
    });
  } catch (error) {
    console.error('Download report error:', error);
    return NextResponse.json(
      { error: 'Failed to download report' },
      { status: 500 }
    );
  }
}
