// Database types - these should match your Supabase schema

export type PolicyStatus = 'active' | 'expired' | 'cancelled' | 'pending';
export type PolicyType = 'auto' | 'home' | 'life' | 'health' | 'business' | 'umbrella' | 'other';
export type ActivityType = 'call' | 'email' | 'task' | 'meeting' | 'note';

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Policy {
  id: string;
  client_id: string;
  carrier: string;
  policy_number: string;
  type: PolicyType;
  effective_date: string;
  expiration_date: string;
  premium: number;
  details: Record<string, unknown>;
  status: PolicyStatus;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  client_id: string | null;
  policy_id: string | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  client_id: string | null;
  policy_id: string | null;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_at: string;
}

// API Request/Response types
export interface CreateClientRequest {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {}

export interface CreatePolicyRequest {
  client_id: string;
  carrier: string;
  policy_number: string;
  type: PolicyType;
  effective_date: string;
  expiration_date: string;
  premium: number;
  details?: Record<string, unknown>;
  status?: PolicyStatus;
}

export interface UpdatePolicyRequest extends Partial<Omit<CreatePolicyRequest, 'client_id'>> {}

export interface CreateActivityRequest {
  type: ActivityType;
  description: string;
  client_id?: string;
  policy_id?: string;
  due_date?: string;
}

export interface UpdateActivityRequest extends Partial<CreateActivityRequest> {
  completed?: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
