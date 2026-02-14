'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ReportTypeMetadata } from '@/lib/types';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metadata: ReportTypeMetadata;
  restaurantId: string;
  year: number;
  month: number;
}

export function UploadDialog({
  open,
  onOpenChange,
  metadata,
  restaurantId,
  year,
  month,
}: UploadDialogProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('reportType', metadata.type);
      formData.append('reportName', metadata.name);
      formData.append('restaurantId', restaurantId);
      formData.append(
        'reportPeriod',
        `${year}-${String(month).padStart(2, '0')}-01`
      );

      const response = await fetch('/api/reports/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      // Refresh page to show new report
      router.refresh();
      onOpenChange(false);
      setFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload report');
    } finally {
      setUploading(false);
    }
  };

  const acceptedTypes =
    metadata.fileType === 'excel'
      ? '.xlsx,.xls'
      : metadata.fileType === 'pdf'
      ? '.pdf'
      : '.xlsx,.xls,.pdf';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload {metadata.name}</DialogTitle>
          <DialogDescription>{metadata.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select File
            </label>
            <input
              type="file"
              accept={acceptedTypes}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || uploading}>
              {uploading ? 'Uploading...' : 'Upload & Parse'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
