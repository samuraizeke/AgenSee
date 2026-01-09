'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getServerApiUrl } from '@/lib/server-api-url';

interface CreatePolicyData {
  client_id: string;
  carrier: string;
  policy_number: string;
  type: string;
  effective_date: string;
  expiration_date: string;
  premium: number;
  status: string;
  details?: Record<string, unknown>;
}

interface ActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export async function createPolicy(data: CreatePolicyData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const response = await fetch(
      `${getServerApiUrl()}/policies`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to create policy' };
    }

    // Revalidate all affected pages
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/policies');
    revalidatePath(`/dashboard/clients/${data.client_id}`);

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error creating policy:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function updatePolicy(
  id: string,
  data: Partial<Omit<CreatePolicyData, 'client_id'>>
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const response = await fetch(
      `${getServerApiUrl()}/policies/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to update policy' };
    }

    // Revalidate affected pages
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/policies');
    revalidatePath(`/dashboard/policies/${id}`);

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error updating policy:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function deletePolicy(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const response = await fetch(
      `${getServerApiUrl()}/policies/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to delete policy' };
    }

    // Revalidate affected pages
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/policies');

    return { success: true };
  } catch (error) {
    console.error('Error deleting policy:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Utility function to revalidate dashboard data
export async function revalidateDashboard(): Promise<void> {
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/policies');
  revalidatePath('/dashboard/clients');
}
