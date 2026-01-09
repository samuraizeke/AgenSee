// Client-side API URL helper for 'use client' components
// This runs in the browser, so we can't access server-only env vars

export function getClientApiUrl(): string {
  // NEXT_PUBLIC_API_URL must be set in production (pointing to Cloud Run backend)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Development fallback
  return 'http://localhost:3001/api';
}
