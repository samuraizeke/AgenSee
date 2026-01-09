import { createClient } from '@/lib/supabase/server';
import { getServerApiUrl } from '@/lib/server-api-url';
import { notFound, redirect } from 'next/navigation';
import { EditClientForm } from './EditClientForm';
import { DashboardHeader } from '@/components/crm/dashboard-header';
import Link from 'next/link';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

async function getClient(accessToken: string, id: string): Promise<Client | null> {
  try {
    const response = await fetch(
      `${getServerApiUrl()}/clients/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch {
    return null;
  }
}

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const client = await getClient(session.access_token, id);

  if (!client) {
    notFound();
  }

  return (
    <>
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-2xl mx-auto p-6 space-y-6">
          {/* Page header */}
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/clients/${id}`}
                className="text-muted-foreground hover:text-foreground"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold">Edit Client</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Update {client.first_name} {client.last_name}&apos;s profile information.
            </p>
          </div>

          {/* Form */}
          <div className="rounded-lg border bg-card p-6">
            <EditClientForm client={client} />
          </div>
        </div>
      </main>
    </>
  );
}
