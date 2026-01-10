import { createClient } from '@/lib/supabase/server';
import { getServerApiUrl } from '@/lib/server-api-url';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ClientDocuments } from './ClientDocuments';
import { ClientPolicies } from './ClientPolicies';
import { ClientNotes } from './ClientNotes';
import { DashboardHeader } from '@/components/crm/dashboard-header';

interface Policy {
  id: string;
  carrier: string;
  policy_number: string;
  type: string;
  effective_date: string;
  expiration_date: string;
  premium: number;
  status: string;
}

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  policies: Policy[];
}

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_at: string;
}

interface Note {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
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

async function getClientDocuments(accessToken: string, clientId: string): Promise<Document[]> {
  try {
    const response = await fetch(
      `${getServerApiUrl()}/documents?client_id=${clientId}`,
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

async function getClientNotes(accessToken: string, clientId: string): Promise<Note[]> {
  try {
    const response = await fetch(
      `${getServerApiUrl()}/notes?client_id=${clientId}`,
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
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function ClientDetailPage({
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
    notFound();
  }

  const [client, documents, notes] = await Promise.all([
    getClient(session.access_token, id),
    getClientDocuments(session.access_token, id),
    getClientNotes(session.access_token, id),
  ]);

  if (!client) {
    notFound();
  }

  const activePolicies = client.policies?.filter((p) => p.status === 'active') || [];
  const totalPremium = activePolicies.reduce((sum, p) => sum + Number(p.premium), 0);

  return (
    <>
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/clients"
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
                <h1 className="text-2xl font-bold">
                  {client.first_name} {client.last_name}
                </h1>
              </div>
              <p className="mt-1 text-muted-foreground">
                Client since {new Date(client.created_at).toLocaleDateString()}
              </p>
            </div>
            <Link
              href={`/dashboard/clients/${client.id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </Link>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm font-medium text-muted-foreground">Active Policies</p>
              <p className="mt-1 text-2xl font-semibold">
                {activePolicies.length}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm font-medium text-muted-foreground">Total Premium</p>
              <p className="mt-1 text-2xl font-semibold">
                ${totalPremium.toLocaleString()}/yr
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm font-medium text-muted-foreground">Documents</p>
              <p className="mt-1 text-2xl font-semibold">
                {documents.length}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column - Contact info */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="rounded-lg border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">
                  Contact Information
                </h2>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                    <dd className="mt-1">
                      {client.email ? (
                        <a
                          href={`mailto:${client.email}`}
                          className="text-primary hover:underline"
                        >
                          {client.email}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                    <dd className="mt-1">
                      {client.phone ? (
                        <a
                          href={`tel:${client.phone}`}
                          className="text-primary hover:underline"
                        >
                          {client.phone}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                    <dd className="mt-1">
                      {client.address || <span className="text-muted-foreground">-</span>}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Notes */}
              <ClientNotes clientId={client.id} initialNotes={notes} />
            </div>

            {/* Right column - Policies and Documents */}
            <div className="space-y-6 lg:col-span-2">
              {/* Policies */}
              <ClientPolicies
                policies={client.policies || []}
                clientId={client.id}
                clientName={`${client.first_name} ${client.last_name}`}
              />

              {/* Documents */}
              <ClientDocuments
                clientId={client.id}
                initialDocuments={documents}
                accessToken={session.access_token}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
