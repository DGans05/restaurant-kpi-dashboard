'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';

interface ImportExportProps {
  onImportSuccess?: () => void;
}

export function ImportExportKPIs({ onImportSuccess }: ImportExportProps) {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/kpis/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setImportResult({
          type: 'error',
          message: data.error || 'Import failed',
        });
        return;
      }

      setImportResult({
        type: 'success',
        message: `Successfully imported ${data.imported} KPI entries${
          data.failed > 0 ? ` (${data.failed} failed)` : ''
        }`,
        details: data,
      });

      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (error) {
      setImportResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Import failed',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('from_date', fromDate);
      if (toDate) params.append('to_date', toDate);

      const response = await fetch(`/api/kpis/export?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        setImportResult({
          type: 'error',
          message: error.error || 'Export failed',
        });
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kpi-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setImportResult({
        type: 'success',
        message: 'Export completed successfully',
      });
    } catch (error) {
      setImportResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Export failed',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Import Card */}
      <Card>
        <CardHeader>
          <CardTitle>Import KPI Data</CardTitle>
          <CardDescription>
            Upload a CSV file to import KPI entries in bulk
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors">
            <label htmlFor="csv-import" className="cursor-pointer">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">
                Click to select a CSV file
              </p>
              <p className="text-xs text-muted-foreground">
                or drag and drop
              </p>
              <input
                id="csv-import"
                type="file"
                accept=".csv"
                onChange={handleImport}
                disabled={importing}
                className="hidden"
              />
            </label>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md text-sm text-blue-900 dark:text-blue-200">
            <p className="font-semibold mb-2">CSV Format:</p>
            <p className="font-mono text-xs">
              restaurant_id, date (YYYY-MM-DD), revenue, labour_cost, food_cost, order_count
            </p>
          </div>

          {importResult && (
            <div
              className={`flex gap-3 p-3 rounded-md ${
                importResult.type === 'success'
                  ? 'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-200'
                  : 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-200'
              }`}
            >
              {importResult.type === 'success' ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <div className="text-sm">
                <p className="font-semibold">{importResult.message}</p>
                {importResult.details?.errors && (
                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer underline">
                      View errors ({importResult.details.errors.length})
                    </summary>
                    <pre className="mt-1 overflow-auto max-h-32 bg-black/10 p-2 rounded">
                      {JSON.stringify(importResult.details.errors, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Card */}
      <Card>
        <CardHeader>
          <CardTitle>Export KPI Data</CardTitle>
          <CardDescription>
            Download KPI data as CSV for analysis or backup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">From Date (optional)</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                disabled={exporting}
              />
            </div>
            <div>
              <label className="text-sm font-medium">To Date (optional)</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                disabled={exporting}
              />
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={exporting}
            className="w-full"
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export to CSV'}
          </Button>

          <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-md text-sm text-amber-900 dark:text-amber-200">
            <p className="font-semibold mb-1">Export includes:</p>
            <ul className="text-xs space-y-1">
              <li>• Basic KPI data (revenue, costs, orders)</li>
              <li>• Calculated percentages</li>
              <li>• Revenue per order average</li>
            </ul>
          </div>

          {importResult?.type === 'success' && (
            <div className="flex gap-3 p-3 rounded-md bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-200">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{importResult.message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
