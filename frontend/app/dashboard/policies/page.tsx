import { createClient } from '@/lib/supabase/server';
import { getServerApiUrl } from '@/lib/server-api-url';
import { PoliciesTable } from './PoliciesTable';
import { DashboardHeader } from '@/components/crm/dashboard-header';

interface Policy {
  id: string;
  client_id: string;
  carrier: string;
  policy_number: string;
  type: string;
  effective_date: string;
  expiration_date: string;
  premium: number;
  status: string;
  created_at: string;
  clients?: {
    first_name: string;
    last_name: string;
  };
}

interface PoliciesResponse {
  success: boolean;
  data: {
    data: Policy[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

async function getPolicies(
  accessToken: string,
  page: number = 1,
  filter?: string,
  status?: string,
  type?: string
): Promise<PoliciesResponse | null> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
    });

    if (status) params.set('status', status);
    if (type) params.set('type', type);

    const url = `${getServerApiUrl()}/policies?${params}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export default async function PoliciesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; filter?: string; status?: string; type?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token || '';
  const page = parseInt(params.page || '1');
  const filter = params.filter || '';
  const status = params.status || '';
  const type = params.type || '';

  const response = await getPolicies(accessToken, page, filter, status, type);

  return (
    <>
      <DashboardHeader action={{ label: 'Add Policy', href: '/dashboard/policies/new' }} />
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-7xl mx-auto p-6 space-y-6">
          {/* Page header */}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Policies</h1>
            <p className="text-muted-foreground mt-1">
              Manage insurance policies across all your clients.
            </p>
          </div>

          {/* Policies table */}
          <PoliciesTable
            policies={response?.data.data || []}
            total={response?.data.total || 0}
            page={page}
            totalPages={response?.data.totalPages || 1}
            currentFilter={filter}
            currentStatus={status}
            currentType={type}
          />
        </div>
      </main>
    </>
  );
}
