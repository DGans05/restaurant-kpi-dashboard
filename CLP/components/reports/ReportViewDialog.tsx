'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Report } from '@/lib/types';

interface ReportData {
  reportId: string;
  reportType: string;
  reportName: string;
  reportPeriod: string;
  fileSizeBytes: number | null;
  uploadStatus: string;
  uploadedAt: string;
}

interface ReportViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Unknown';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ReportViewDialog({
  open,
  onOpenChange,
  report,
}: ReportViewDialogProps) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadReportData();
    }
  }, [open, report.id]);

  const loadReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/reports/${report.id}/data`);
      if (!response.ok) {
        const errData = await response.json();
        setError(errData.error ?? 'Failed to load report');
        return;
      }
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    window.open(`/api/reports/${report.id}/download`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{report.reportName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {loading && <p className="text-muted-foreground">Loading...</p>}
          {error && <p className="text-destructive">{error}</p>}
          {reportData && (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-muted-foreground">Type</div>
                <div>{reportData.reportType}</div>
                <div className="text-muted-foreground">Period</div>
                <div>{reportData.reportPeriod}</div>
                <div className="text-muted-foreground">File size</div>
                <div>{formatFileSize(reportData.fileSizeBytes)}</div>
                <div className="text-muted-foreground">Status</div>
                <div className="capitalize">{reportData.uploadStatus}</div>
                <div className="text-muted-foreground">Uploaded</div>
                <div>{new Date(reportData.uploadedAt).toLocaleString('nl-NL')}</div>
              </div>
              <Button onClick={handleDownload} className="w-full">
                Download Report
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
