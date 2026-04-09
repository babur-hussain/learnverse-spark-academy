
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Button } from '@/components/UI/button';
import { PurchaseButton } from '@/components/UI/PurchaseButton';
import { Download, Eye, IndianRupee, FileText, Clock } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  description?: string;
  price: number;
  file_type: string;
  file_size?: number;
  download_count?: number;
  view_count?: number;
  created_at: string;
  thumbnail_url?: string;
}

interface NotePurchaseCardProps {
  note: Note;
  isPurchased?: boolean;
  onPurchaseSuccess?: () => void;
  className?: string;
}

export const NotePurchaseCard: React.FC<NotePurchaseCardProps> = ({
  note,
  isPurchased = false,
  onPurchaseSuccess,
  className
}) => {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <Badge variant="outline" className="text-xs">
              {note.file_type.toUpperCase()}
            </Badge>
          </div>
          {isPurchased && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Purchased
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
        {note.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {note.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              <span>{note.download_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{note.view_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDate(note.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Size: {formatFileSize(note.file_size)}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            <IndianRupee className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold text-green-600">
              {note.price.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        {isPurchased ? (
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
            <Button className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        ) : (
          <PurchaseButton
            itemType="note"
            itemId={note.id}
            title={note.title}
            amount={note.price}
            onSuccess={onPurchaseSuccess}
            className="w-full bg-green-600 hover:bg-green-700"
          />
        )}
      </CardFooter>
    </Card>
  );
};
