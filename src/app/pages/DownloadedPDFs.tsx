import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import DownloadedPDFsList from '@/components/UI/DownloadedPDFsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { usePDFManager } from '@/hooks/use-pdf-manager';
import { 
  HardDrive, 
  FileText, 
  Download, 
  Info,
  Smartphone,
  Wifi,
  WifiOff
} from 'lucide-react';

const DownloadedPDFs = () => {
  const { downloadedPDFs } = usePDFManager();
  
  const getTotalSize = (): string => {
    const total = downloadedPDFs.reduce((sum, pdf) => sum + pdf.size, 0);
    if (total === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(total) / Math.log(k));
    return parseFloat((total / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <HardDrive className="h-6 w-6" />
              Downloaded PDFs
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your offline PDF documents
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {downloadedPDFs.length} files
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              {getTotalSize()}
            </Badge>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">In-App Viewing</h3>
                  <p className="text-xs text-muted-foreground">
                    View PDFs without leaving the app
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <WifiOff className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Offline Access</h3>
                  <p className="text-xs text-muted-foreground">
                    Available without internet connection
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Download className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Secure Storage</h3>
                  <p className="text-xs text-muted-foreground">
                    Stored locally on your device
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Storage Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5" />
              Storage Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Storage Used:</span>
                <span className="font-medium">{getTotalSize()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Storage Limit:</span>
                <span className="font-medium">50 MB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min((downloadedPDFs.reduce((sum, pdf) => sum + pdf.size, 0) / (50 * 1024 * 1024)) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                PDFs are stored locally on your device for offline access. 
                Delete files you no longer need to free up space.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Downloaded PDFs List */}
        <DownloadedPDFsList />

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Download PDFs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                Find a PDF link anywhere in the app (courses, notes, resources)
              </p>
              <p className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                Click the download button next to the PDF link
              </p>
              <p className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                The PDF will be saved locally and available offline
              </p>
              <p className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                Access your downloaded PDFs from this page anytime
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default DownloadedPDFs;
