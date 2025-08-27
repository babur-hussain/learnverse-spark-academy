import React from 'react';
import PDFLink from './PDFLink';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';

// Example component showing how to use the PDF functionality
const PDFExample: React.FC = () => {
  // Example PDF URLs (you can replace these with actual PDF URLs)
  const examplePDFs = [
    {
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      title: 'Sample PDF Document'
    },
    {
      url: 'https://www.africau.edu/images/default/sample.pdf',
      title: 'Educational Material Sample'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>PDF Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Link style PDFs */}
          <div>
            <h4 className="font-medium mb-2">Link Style:</h4>
            <div className="space-y-2">
              {examplePDFs.map((pdf, index) => (
                <PDFLink 
                  key={index}
                  url={pdf.url} 
                  title={pdf.title}
                  variant="link"
                />
              ))}
            </div>
          </div>
          
          {/* Button style PDFs */}
          <div>
            <h4 className="font-medium mb-2">Button Style:</h4>
            <div className="flex gap-2 flex-wrap">
              {examplePDFs.map((pdf, index) => (
                <PDFLink 
                  key={index}
                  url={pdf.url} 
                  title={pdf.title}
                  variant="button"
                />
              ))}
            </div>
          </div>
          
          {/* Card style PDFs */}
          <div>
            <h4 className="font-medium mb-2">Card Style:</h4>
            <div className="space-y-2">
              {examplePDFs.map((pdf, index) => (
                <PDFLink 
                  key={index}
                  url={pdf.url} 
                  title={pdf.title}
                  variant="card"
                  showDownloadButton={true}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFExample;
