
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useEffect } from 'react';
import { handleError } from '@/utils/errorHandling';
import { useToast } from '@/hooks/use-toast';

export function useSafeQuery<TData = unknown, TError = Error>(
  options: UseQueryOptions<TData, TError> & {
    showErrorToast?: boolean;
    errorMessage?: string;
  }
) {
  const { toast } = useToast();
  const { showErrorToast = false, errorMessage, ...queryOptions } = options;

  const result = useQuery({
    ...queryOptions,
  });

  // Handle errors using useEffect to watch for error state changes
  useEffect(() => {
    if (result.error && showErrorToast) {
      const message = handleError(result.error, errorMessage);
      console.error('Query error:', message);
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    }
  }, [result.error, showErrorToast, errorMessage, toast]);

  return result;
}
