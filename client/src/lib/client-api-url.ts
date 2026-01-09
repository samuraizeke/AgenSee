// Client-side API URL helper for 'use client' components
// This runs in the browser, so we can't access VERCEL_URL

export function getClientApiUrl(): string {
  // If explicitly set, use that
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // In browser, check if we're on localhost
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3001/api';
  }

  // In production (or SSR on Vercel), use relative path
  return '/api';
}
