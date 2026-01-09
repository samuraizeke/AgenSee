'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { searchApi, type SearchResult } from '@/lib/api';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search effect
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await searchApi.search(query, 5);
        if (response.success && response.data) {
          setResults(response.data);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (type: 'client' | 'policy' | 'activity', id: string, clientId?: string) => {
    setIsOpen(false);
    setQuery('');
    setResults(null);

    switch (type) {
      case 'client':
        router.push(`/dashboard/clients/${id}`);
        break;
      case 'policy':
        // Navigate to the client's page (which shows their policies)
        router.push(`/dashboard/clients/${clientId}`);
        break;
      case 'activity':
        router.push('/dashboard/activities');
        break;
    }
  };

  const hasResults = results && (
    results.clients.length > 0 ||
    results.policies.length > 0 ||
    results.activities.length > 0
  );

  return (
    <div ref={containerRef} className="relative">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search clients, policies..."
          className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {/* Search icon */}
        <svg
          className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {/* Loading spinner */}
        {isLoading && (
          <svg
            className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {!hasResults && !isLoading && (
            <div className="p-4 text-center text-sm text-gray-500">
              No results found for &quot;{query}&quot;
            </div>
          )}

          {/* Clients Section */}
          {results && results.clients.length > 0 && (
            <div>
              <div className="sticky top-0 flex items-center gap-2 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Clients
              </div>
              {results.clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleResultClick('client', client.id)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-900">
                      {client.first_name} {client.last_name}
                    </div>
                    {client.email && (
                      <div className="truncate text-xs text-gray-500">{client.email}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Policies Section */}
          {results && results.policies.length > 0 && (
            <div>
              <div className="sticky top-0 flex items-center gap-2 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Policies
              </div>
              {results.policies.map((policy) => (
                <button
                  key={policy.id}
                  onClick={() => handleResultClick('policy', policy.id, policy.client_id)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-900">
                      {policy.policy_number} - {policy.carrier}
                    </div>
                    {policy.client_name && (
                      <div className="truncate text-xs text-gray-500">{policy.client_name}</div>
                    )}
                  </div>
                  <span className="flex-shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {policy.type}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Activities Section */}
          {results && results.activities.length > 0 && (
            <div>
              <div className="sticky top-0 flex items-center gap-2 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Activities
              </div>
              {results.activities.map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => handleResultClick('activity', activity.id)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-900 capitalize">
                      {activity.type}: {activity.description.length > 50
                        ? activity.description.slice(0, 50) + '...'
                        : activity.description}
                    </div>
                    {activity.client_name && (
                      <div className="truncate text-xs text-gray-500">{activity.client_name}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
