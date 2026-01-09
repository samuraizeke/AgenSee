// Server-side API URL helper for server actions
// Server-side fetch requires absolute URLs, not relative paths

export function getServerApiUrl(): string {
  // In production, NEXT_PUBLIC_API_URL must be set to the backend URL (e.g., Cloud Run)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001/api';
  }

  // Production without API URL configured - this is an error
  console.error('NEXT_PUBLIC_API_URL is not set. API calls will fail.');
  return '';
}
