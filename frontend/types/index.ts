// Database types - mirror server types
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

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface CreateClientForm {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface CreatePolicyForm {
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

export interface CreateActivityForm {
  type: ActivityType;
  description: string;
  client_id?: string;
  policy_id?: string;
  due_date?: string;
}
