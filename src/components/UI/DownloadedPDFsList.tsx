import React, { useState } from 'react';
import { Button } from '@/components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import PDFViewerModal from './PDFViewerModal';
import { usePDFManager } from '@/hooks/use-pdf-manager';
import { 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Calendar,
  HardDrive,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DownloadedPDFsListProps {
  className?: string;
}

const DownloadedPDFsList: React.FC<DownloadedPDFsListProps> = ({ className }) => {
  const { downloadedPDFs, getPDFData, deletePDF, clearAllPDFs } = usePDFManager();
  const [selectedPDF, setSelectedPDF] = useState<{ data: Uint8Array; title: string } | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalSize = (): string => {
    const total = downloadedPDFs.reduce((sum, pdf) => sum + pdf.size, 0);
    return formatFileSize(total);
  };

  const handleViewPDF = (id: string, title: string) => {
    const data = getPDFData(id);
    if (data) {
      setSelectedPDF({ data, title });
      setViewerOpen(true);
    }
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setSelectedPDF(null);
  };

  if (downloadedPDFs.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Downloaded PDFs</h3>
          <p className="text-muted-foreground">
            Download PDFs to view them offline within the app
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Downloaded PDFs ({downloadedPDFs.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {getTotalSize()}
              </Badge>
              {downloadedPDFs.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllPDFs}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {downloadedPDFs.map((pdf) => (
              <div
                key={pdf.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{pdf.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Downloaded {formatDistanceToNow(pdf.downloadedAt, { addSuffix: true })}
                      </span>
                      <span>•</span>
                      <span>{formatFileSize(pdf.size)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewPDF(pdf.id, pdf.title)}
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePDF(pdf.id)}
                    className="hover:bg-destructive/10 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedPDF && (
        <PDFViewerModal
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          file={new File([selectedPDF.data], `${selectedPDF.title}.pdf`, { type: 'application/pdf' })}
          title={selectedPDF.title}
        />
      )}
    </>
  );
};

export default DownloadedPDFsList;
