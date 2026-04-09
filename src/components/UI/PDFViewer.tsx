import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/UI/button';
import { Card } from '@/components/UI/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  FileText,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  url?: string;
  file?: File;
  title?: string;
  onClose?: () => void;
  className?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  url, 
  file, 
  title = "PDF Document", 
  onClose,
  className 
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<string | File | null>(null);
  const [downloadedContent, setDownloadedContent] = useState<Uint8Array | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (file) {
      setPdfData(file);
    } else if (url) {
      setPdfData(url);
    }
  }, [url, file]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
    toast({
      title: "PDF Load Error",
      description: "Failed to load the PDF document",
      variant: "destructive",
    });
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.max(1, Math.min(newPageNumber, numPages));
    });
  };

  const goToPage = (page: number) => {
    setPageNumber(Math.max(1, Math.min(page, numPages)));
  };

  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  };

  const rotate = () => {
    setRotation(prevRotation => (prevRotation + 90) % 360);
  };

  const downloadPDF = async () => {
    try {
      let arrayBuffer: ArrayBuffer;
      
      if (file) {
        arrayBuffer = await file.arrayBuffer();
      } else if (url) {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch PDF');
        }
        arrayBuffer = await response.arrayBuffer();
      } else {
        throw new Error('No PDF source available');
      }

      const uint8Array = new Uint8Array(arrayBuffer);
      setDownloadedContent(uint8Array);
      
      // Create blob and download
      const blob = new Blob([uint8Array], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(blobUrl);
      
      toast({
        title: "Download Complete",
        description: "PDF has been downloaded successfully",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the PDF",
        variant: "destructive",
      });
    }
  };

  const renderControls = () => (
    <div className="flex flex-wrap items-center justify-between gap-2 p-4 bg-background border-b">
      <div className="flex items-center gap-2">
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium truncate max-w-[200px]">{title}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
        {/* Download button */}
        <Button variant="outline" size="sm" onClick={downloadPDF}>
          <Download className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Download</span>
        </Button>
        
        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs px-2 py-1 bg-muted rounded min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Rotate button */}
        <Button variant="outline" size="sm" onClick={rotate}>
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderPageControls = () => (
    <div className="flex items-center justify-center gap-2 p-4 bg-background border-t">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => changePage(-1)} 
        disabled={pageNumber <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2">
        <span className="text-sm">Page</span>
        <input
          type="number"
          min={1}
          max={numPages}
          value={pageNumber}
          onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
          className="w-16 px-2 py-1 text-center border rounded text-sm"
        />
        <span className="text-sm text-muted-foreground">of {numPages}</span>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => changePage(1)} 
        disabled={pageNumber >= numPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <Card className={cn("flex flex-col h-full max-h-screen", className)}>
      {renderControls()}
      
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-4">
        {loading && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading PDF...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center p-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-destructive mb-2">Error loading PDF</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        )}
        
        {!loading && !error && pdfData && (
          <div className="flex flex-col items-center">
            <Document
              file={pdfData}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                loading={
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                }
                className="shadow-lg"
              />
            </Document>
          </div>
        )}
      </div>
      
      {!loading && !error && numPages > 0 && renderPageControls()}
    </Card>
  );
};

export default PDFViewer;
