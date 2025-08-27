
export const handleError = (error: unknown, fallbackMessage: string = "An unexpected error occurred") => {
  console.error('Error:', error);
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return fallbackMessage;
};

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof Error && (
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    error.message.includes('NetworkError')
  );
};

export const isAuthError = (error: unknown): boolean => {
  return error instanceof Error && (
    error.message.includes('auth') ||
    error.message.includes('unauthorized') ||
    error.message.includes('403') ||
    error.message.includes('401')
  );
};
