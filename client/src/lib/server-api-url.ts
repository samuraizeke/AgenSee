// Server-side API URL helper for server actions
// Server-side fetch requires absolute URLs, not relative paths

export function getServerApiUrl(): string {
  // If explicitly set, use that
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // On Vercel, construct URL from VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api`;
  }

  // Development fallback
  return 'http://localhost:3001/api';
}
