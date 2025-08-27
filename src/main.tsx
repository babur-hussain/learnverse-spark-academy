
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// Temporarily import app routes directly to bypass alias issues
import AppRoot from './app/AppRoot'

const queryClient = new QueryClient()

// Ensure proper viewport handling for devices with notches
if (document.querySelector('meta[name="viewport"]')) {
  document.querySelector('meta[name="viewport"]')!.setAttribute(
    'content',
    'width=device-width, initial-scale=1.0, viewport-fit=cover'
  );
}

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <AppRoot />
  </QueryClientProvider>
)
