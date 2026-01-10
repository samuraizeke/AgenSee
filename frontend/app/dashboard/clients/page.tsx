import { createClient } from '@/lib/supabase/server';
import { getServerApiUrl } from '@/lib/server-api-url';
import { ClientsTable } from './ClientsTable';
import { DashboardHeader } from '@/components/crm/dashboard-header';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  policy_count: number;
  active_policies: number;
  total_premium: number;
  created_at: string;
}

interface ClientsResponse {
  success: boolean;
  data: {
    data: Client[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

async function getClients(
  accessToken: string,
  page: number = 1,
  search?: string,
  sortBy?: string,
  sortOrder?: string
): Promise<ClientsResponse | null> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
    });

    if (search) {
      params.set('search', search);
    }
    if (sortBy) {
      params.set('sortBy', sortBy);
    }
    if (sortOrder) {
      params.set('sortOrder', sortOrder);
    }

    const response = await fetch(
      `${getServerApiUrl()}/clients?${params}`,
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

    return response.json();
  } catch {
    return null;
  }
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; sortBy?: string; sortOrder?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token || '';
  const page = parseInt(params.page || '1');
  const search = params.search || '';
  const sortBy = params.sortBy || null;
  const sortOrder = (params.sortOrder as 'asc' | 'desc' | null) || null;

  const response = await getClients(accessToken, page, search, sortBy || undefined, sortOrder || undefined);

  return (
    <>
      <DashboardHeader action={{ label: 'Add Client', href: '/dashboard/clients/new' }} />
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-7xl mx-auto p-6 space-y-6">
          {/* Page header */}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Clients</h1>
            <p className="text-muted-foreground mt-1">
              Manage your client relationships and contact information.
            </p>
          </div>

          {/* Clients table */}
          <ClientsTable
            clients={response?.data.data || []}
            total={response?.data.total || 0}
            page={page}
            totalPages={response?.data.totalPages || 1}
            search={search}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </div>
      </main>
    </>
  );
}
