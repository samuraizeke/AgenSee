import { createClient } from '@/lib/supabase/server';
import { getServerApiUrl } from '@/lib/server-api-url';
import { redirect } from 'next/navigation';
import { PolicyForm } from './PolicyForm';
import { DashboardHeader } from '@/components/crm/dashboard-header';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
}

async function getClients(accessToken: string): Promise<Client[]> {
  try {
    const response = await fetch(
      `${getServerApiUrl()}/clients?limit=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.data?.data || [];
  } catch {
    return [];
  }
}

export default async function NewPolicyPage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const clients = await getClients(session.access_token);
  const preselectedClientId = params.client_id || '';

  return (
    <>
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-2xl mx-auto p-6 space-y-6">
          {/* Page header */}
          <div>
            <h1 className="text-2xl font-bold">Add New Policy</h1>
            <p className="text-muted-foreground">
              Create a new insurance policy for a client.
            </p>
          </div>

          {/* Form */}
          <div className="rounded-lg border bg-card p-6">
            <PolicyForm
              clients={clients}
              preselectedClientId={preselectedClientId}
            />
          </div>
        </div>
      </main>
    </>
  );
}
