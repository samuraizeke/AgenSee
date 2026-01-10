import type {
  Client,
  Policy,
  Activity,
  Document,
  ApiResponse,
  PaginatedResponse,
  CreateClientForm,
  CreatePolicyForm,
  CreateActivityForm,
} from '@/types';

// API URL must be set via NEXT_PUBLIC_API_URL in production (pointing to Cloud Run backend)
// In development, defaults to localhost:3001 where the Express server runs
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'An error occurred');
  }

  return data;
}

// Clients API
export const clientsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    return fetchApi<ApiResponse<PaginatedResponse<Client>>>(
      `/clients${query ? `?${query}` : ''}`
    );
  },

  get: (id: string) => fetchApi<ApiResponse<Client>>(`/clients/${id}`),

  create: (data: CreateClientForm) =>
    fetchApi<ApiResponse<Client>>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateClientForm>) =>
    fetchApi<ApiResponse<Client>>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<ApiResponse<null>>(`/clients/${id}`, {
      method: 'DELETE',
    }),
};

// Policies API
export const policiesApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    client_id?: string;
    status?: string;
    type?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.client_id) searchParams.set('client_id', params.client_id);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    return fetchApi<ApiResponse<PaginatedResponse<Policy>>>(
      `/policies${query ? `?${query}` : ''}`
    );
  },

  get: (id: string) => fetchApi<ApiResponse<Policy>>(`/policies/${id}`),

  getExpiring: (days?: number) =>
    fetchApi<ApiResponse<Policy[]>>(
      `/policies/expiring${days ? `?days=${days}` : ''}`
    ),

  create: (data: CreatePolicyForm) =>
    fetchApi<ApiResponse<Policy>>('/policies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Omit<CreatePolicyForm, 'client_id'>>) =>
    fetchApi<ApiResponse<Policy>>(`/policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<ApiResponse<null>>(`/policies/${id}`, {
      method: 'DELETE',
    }),
};

// Activities API
export const activitiesApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    client_id?: string;
    policy_id?: string;
    type?: string;
    completed?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.client_id) searchParams.set('client_id', params.client_id);
    if (params?.policy_id) searchParams.set('policy_id', params.policy_id);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.completed !== undefined)
      searchParams.set('completed', params.completed.toString());
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    return fetchApi<ApiResponse<PaginatedResponse<Activity>>>(
      `/activities${query ? `?${query}` : ''}`
    );
  },

  get: (id: string) => fetchApi<ApiResponse<Activity>>(`/activities/${id}`),

  getUpcoming: (days?: number) =>
    fetchApi<ApiResponse<Activity[]>>(
      `/activities/upcoming${days ? `?days=${days}` : ''}`
    ),

  create: (data: CreateActivityForm) =>
    fetchApi<ApiResponse<Activity>>('/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: Partial<CreateActivityForm> & { completed?: boolean }
  ) =>
    fetchApi<ApiResponse<Activity>>(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<ApiResponse<null>>(`/activities/${id}`, {
      method: 'DELETE',
    }),
};

// Documents API
export const documentsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    client_id?: string;
    policy_id?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.client_id) searchParams.set('client_id', params.client_id);
    if (params?.policy_id) searchParams.set('policy_id', params.policy_id);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    return fetchApi<ApiResponse<PaginatedResponse<Document>>>(
      `/documents${query ? `?${query}` : ''}`
    );
  },

  get: (id: string) => fetchApi<ApiResponse<Document>>(`/documents/${id}`),

  getDownloadUrl: (id: string, expiresIn?: number) =>
    fetchApi<ApiResponse<{ url: string }>>(
      `/documents/${id}/url${expiresIn ? `?expiresIn=${expiresIn}` : ''}`
    ),

  getUploadUrl: (data: {
    fileName: string;
    contentType?: string;
    clientId?: string;
    policyId?: string;
  }) =>
    fetchApi<ApiResponse<{ url: string; path: string }>>('/documents/upload-url', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  create: (data: {
    client_id?: string;
    policy_id?: string;
    file_name: string;
    file_path: string;
    file_size?: number;
    mime_type?: string;
  }) =>
    fetchApi<ApiResponse<Document>>('/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<ApiResponse<null>>(`/documents/${id}`, {
      method: 'DELETE',
    }),
};

// Search result types
export interface SearchResultClient {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
}

export interface SearchResultPolicy {
  id: string;
  policy_number: string;
  carrier: string;
  type: string;
  client_id: string;
  client_name: string | null;
}

export interface SearchResultActivity {
  id: string;
  type: string;
  description: string;
  client_id: string | null;
  client_name: string | null;
}

export interface SearchResult {
  clients: SearchResultClient[];
  policies: SearchResultPolicy[];
  activities: SearchResultActivity[];
}

// Search API
export const searchApi = {
  search: (q: string, limit?: number, token?: string) => {
    const params = new URLSearchParams();
    params.set('q', q);
    if (limit) params.set('limit', limit.toString());
    return fetchApi<ApiResponse<SearchResult>>(`/search?${params}`, { token });
  },
};

export { ApiError };
