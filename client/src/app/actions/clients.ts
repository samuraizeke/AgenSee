'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getServerApiUrl } from '@/lib/server-api-url';

interface CreateClientData {
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

interface ActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export async function createClientAction(data: CreateClientData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const response = await fetch(
      `${getServerApiUrl()}/clients`,
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
      return { success: false, error: result.error || 'Failed to create client' };
    }

    // Revalidate all affected pages
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/clients');

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error creating client:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function updateClientAction(
  id: string,
  data: Partial<CreateClientData>
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
      `${getServerApiUrl()}/clients/${id}`,
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
      return { success: false, error: result.error || 'Failed to update client' };
    }

    // Revalidate all affected pages
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/clients');
    revalidatePath(`/dashboard/clients/${id}`);

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error updating client:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
