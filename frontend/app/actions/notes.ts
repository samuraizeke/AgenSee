'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getServerApiUrl } from '@/lib/server-api-url';

interface ActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export async function createNoteAction(
  clientId: string,
  content: string
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
      `${getServerApiUrl()}/notes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ client_id: clientId, content }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to create note' };
    }

    revalidatePath(`/dashboard/clients/${clientId}`);

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error creating note:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function updateNoteAction(
  noteId: string,
  clientId: string,
  content: string
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
      `${getServerApiUrl()}/notes/${noteId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ content }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to update note' };
    }

    revalidatePath(`/dashboard/clients/${clientId}`);

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error updating note:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function deleteNoteAction(
  noteId: string,
  clientId: string
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
      `${getServerApiUrl()}/notes/${noteId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to delete note' };
    }

    revalidatePath(`/dashboard/clients/${clientId}`);

    return { success: true };
  } catch (error) {
    console.error('Error deleting note:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
