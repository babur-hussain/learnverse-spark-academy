import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface DownloadedPDF {
  id: string;
  title: string;
  url: string;
  downloadedAt: Date;
  size: number;
  data: Uint8Array;
}

interface UsePDFManagerReturn {
  downloadedPDFs: DownloadedPDF[];
  downloadPDF: (url: string, title: string) => Promise<void>;
  getPDFData: (id: string) => Uint8Array | null;
  deletePDF: (id: string) => void;
  clearAllPDFs: () => void;
  isDownloading: boolean;
}

const STORAGE_KEY = 'learnverse_downloaded_pdfs';
const MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB limit

export const usePDFManager = (): UsePDFManagerReturn => {
  const [downloadedPDFs, setDownloadedPDFs] = useState<DownloadedPDF[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((pdf: any) => ({
          ...pdf,
          downloadedAt: new Date(pdf.downloadedAt),
          data: new Uint8Array(pdf.data)
        }));
      }
    } catch (error) {
      console.error('Error loading downloaded PDFs:', error);
    }
    return [];
  });
  
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const savePDFsToStorage = useCallback((pdfs: DownloadedPDF[]) => {
    try {
      const serializable = pdfs.map(pdf => ({
        ...pdf,
        downloadedAt: pdf.downloadedAt.toISOString(),
        data: Array.from(pdf.data)
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    } catch (error) {
      console.error('Error saving PDFs to storage:', error);
      toast({
        title: "Storage Error",
        description: "Failed to save PDF to local storage",
        variant: "destructive",
      });
    }
  }, [toast]);

  const downloadPDF = useCallback(async (url: string, title: string): Promise<void> => {
    setIsDownloading(true);
    
    try {
      // Check if PDF is already downloaded
      const existing = downloadedPDFs.find(pdf => pdf.url === url);
      if (existing) {
        toast({
          title: "Already Downloaded",
          description: "This PDF is already available offline",
        });
        setIsDownloading(false);
        return;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      
      // Check storage size limit
      const currentSize = downloadedPDFs.reduce((total, pdf) => total + pdf.size, 0);
      if (currentSize + data.length > MAX_STORAGE_SIZE) {
        throw new Error('Storage limit exceeded. Please delete some PDFs first.');
      }

      const newPDF: DownloadedPDF = {
        id: `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: title.trim() || 'Untitled PDF',
        url,
        downloadedAt: new Date(),
        size: data.length,
        data
      };

      const updatedPDFs = [...downloadedPDFs, newPDF];
      setDownloadedPDFs(updatedPDFs);
      savePDFsToStorage(updatedPDFs);

      toast({
        title: "Download Complete",
        description: `"${newPDF.title}" is now available offline`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download PDF",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  }, [downloadedPDFs, savePDFsToStorage, toast]);

  const getPDFData = useCallback((id: string): Uint8Array | null => {
    const pdf = downloadedPDFs.find(p => p.id === id);
    return pdf ? pdf.data : null;
  }, [downloadedPDFs]);

  const deletePDF = useCallback((id: string) => {
    const updatedPDFs = downloadedPDFs.filter(pdf => pdf.id !== id);
    setDownloadedPDFs(updatedPDFs);
    savePDFsToStorage(updatedPDFs);
    
    toast({
      title: "PDF Deleted",
      description: "PDF has been removed from offline storage",
    });
  }, [downloadedPDFs, savePDFsToStorage, toast]);

  const clearAllPDFs = useCallback(() => {
    setDownloadedPDFs([]);
    localStorage.removeItem(STORAGE_KEY);
    
    toast({
      title: "All PDFs Cleared",
      description: "All offline PDFs have been removed",
    });
  }, [toast]);

  return {
    downloadedPDFs,
    downloadPDF,
    getPDFData,
    deletePDF,
    clearAllPDFs,
    isDownloading
  };
};
