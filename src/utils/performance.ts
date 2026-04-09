
// Performance utilities for production
export const createQueryOptions = (key: string[], staleTime?: number, cacheTime?: number) => ({
  queryKey: key,
  staleTime: staleTime || 2 * 60 * 1000, // 2 minutes
  cacheTime: cacheTime || 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: false,
  retry: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
});

export const createMutationOptions = () => ({
  retry: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
});

// Utility to preload critical data
export const preloadCriticalData = async () => {
  // This can be used to preload essential data on app start
  console.log('Preloading critical data...');
};

// Image optimization utility
export const optimizeImageUrl = (url: string, width?: number, height?: number): string => {
  if (!url) return url;
  
  // Add image optimization parameters if using a service like Cloudinary or similar
  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  params.append('q', 'auto');
  params.append('f', 'auto');
  
  const separator = url.includes('?') ? '&' : '?';
  return params.toString() ? `${url}${separator}${params.toString()}` : url;
};
