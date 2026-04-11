import React, { useState } from 'react';
import { Button } from '@/components/UI/button';
import PDFViewerModal from './PDFViewerModal';
import { usePDFManager } from '@/hooks/use-pdf-manager';
import { FileText, Download, Eye, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PDFLinkProps {
  url: string;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  variant?: 'link' | 'button' | 'card';
  showDownloadButton?: boolean;
}

const PDFLink: React.FC<PDFLinkProps> = ({
  url,
  title,
  children,
  className,
  variant = 'link',
  showDownloadButton = true
}) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const { downloadPDF, isDownloading, downloadedPDFs } = usePDFManager();
  
  const displayTitle = title || children?.toString() || 'PDF Document';
  const isDownloaded = downloadedPDFs.some(pdf => pdf.url === url);

  const handleViewPDF = (e: React.MouseEvent) => {
    e.preventDefault();
    setViewerOpen(true);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await downloadPDF(url, displayTitle);
  };

  if (variant === 'card') {
    return (
      <>
        <div 
          className={cn(
            "group border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer",
            className
          )}
          onClick={handleViewPDF}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <h4 className="font-medium group-hover:text-blue-600 transition-colors">
                  {displayTitle}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Click to view PDF in app
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isDownloaded && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Downloaded
                </span>
              )}
              {showDownloadButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isDownloading || isDownloaded}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewPDF}
                className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <PDFViewerModal
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          url={url}
          title={displayTitle}
        />
      </>
    );
  }

  if (variant === 'button') {
    return (
      <>
        <Button
          variant="outline"
          onClick={handleViewPDF}
          className={cn("flex items-center gap-2", className)}
          aria-label={`Open PDF: ${displayTitle}`}
        >
          <FileText className="h-4 w-4" />
          Open
        </Button>
        
        <PDFViewerModal
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          url={url}
          title={displayTitle}
        />
      </>
    );
  }

  // Default link variant
  return (
    <>
      <a
        href="#"
        onClick={handleViewPDF}
        className={cn(
          "inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors text-sm",
          className
        )}
      >
        <FileText className="h-4 w-4" />
        Open
      </a>
      
      <PDFViewerModal
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        url={url}
        title={displayTitle}
      />
    </>
  );
};

export default PDFLink;
