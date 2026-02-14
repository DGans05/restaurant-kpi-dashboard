'use client';

import { useState } from 'react';
import { Report, ReportTypeMetadata } from '@/lib/types';
import { cn } from '@/lib/utils';
import { UploadDialog } from './UploadDialog';
import { ReportViewDialog } from './ReportViewDialog';

interface ReportCardProps {
  metadata: ReportTypeMetadata;
  report: Report | null;
  restaurantId: string;
  year: number;
  month: number;
}

export function ReportCard({
  metadata,
  report,
  restaurantId,
  year,
  month,
}: ReportCardProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const isParsed = report?.uploadStatus === 'parsed';
  const isUploaded = report?.uploadStatus === 'uploaded';
  const isParsing = report?.uploadStatus === 'parsing';
  const hasReport = isParsed || isUploaded;

  const handleClick = () => {
    if (hasReport) {
      setViewOpen(true);
    } else {
      setUploadOpen(true);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={cn(
          'p-6 rounded-lg border cursor-pointer transition-all hover:shadow-md',
          hasReport
            ? 'bg-card border-border'
            : 'bg-muted border-muted text-muted-foreground'
        )}
      >
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{metadata.name}</h3>
          <p className="text-xs opacity-70">{metadata.description}</p>
          {report && (
            <div className="flex items-center gap-2 text-xs">
              <span
                className={cn(
                  'px-2 py-1 rounded',
                  isParsed && 'bg-green-500/20 text-green-400',
                  isUploaded && 'bg-blue-500/20 text-blue-400',
                  isParsing && 'bg-yellow-500/20 text-yellow-400'
                )}
              >
                {isParsed ? 'Parsed' : isParsing ? 'Parsing...' : 'Uploaded'}
              </span>
            </div>
          )}
        </div>
      </div>

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        metadata={metadata}
        restaurantId={restaurantId}
        year={year}
        month={month}
      />

      {report && (
        <ReportViewDialog
          open={viewOpen}
          onOpenChange={setViewOpen}
          report={report}
        />
      )}
    </>
  );
}
