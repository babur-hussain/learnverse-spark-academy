import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/UI/dialog';
import PDFViewer from './PDFViewer';
import SimplePDFCanvas from './SimplePDFCanvas';

interface PDFViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url?: string;
  file?: File;
  title?: string;
}

const PDFViewerModal: React.FC<PDFViewerModalProps> = ({
  open,
  onOpenChange,
  url,
  file,
  title = "PDF Document"
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {/* Use lightweight PDF.js canvas viewer when a URL is provided; else fallback to existing viewer */}
        {url ? (
          <SimplePDFCanvas url={url} className="h-full" />
        ) : (
          <PDFViewer
            url={url}
            file={file}
            title={title}
            onClose={() => onOpenChange(false)}
            className="h-full border-0 shadow-none"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewerModal;
