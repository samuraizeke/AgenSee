import { createClient } from '@/lib/supabase/server';
import { getServerApiUrl } from '@/lib/server-api-url';
import { ActivitiesTable } from './ActivitiesTable';
import { DashboardHeader } from '@/components/crm/dashboard-header';

interface Activity {
  id: string;
  type: 'call' | 'email' | 'task' | 'meeting' | 'note';
  description: string;
  client_id: string | null;
  client_name?: string;
  policy_id: string | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

interface ActivitiesResponse {
  success: boolean;
  data: {
    data: Activity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

async function getActivities(
  accessToken: string,
  page: number = 1,
  search?: string,
  type?: string,
  completed?: string
): Promise<ActivitiesResponse | null> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
    });

    if (search) {
      params.set('search', search);
    }
    if (type && type !== 'all') {
      params.set('type', type);
    }
    if (completed && completed !== 'all') {
      params.set('completed', completed);
    }

    const response = await fetch(
      `${getServerApiUrl()}/activities?${params}`,
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

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; type?: string; completed?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token || '';
  const page = parseInt(params.page || '1');
  const search = params.search || '';
  const type = params.type || '';
  const completed = params.completed || '';

  const response = await getActivities(accessToken, page, search, type, completed);

  return (
    <>
      <DashboardHeader action={{ label: 'New Activity', href: '/dashboard/activities/new' }} />
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-7xl mx-auto p-6 space-y-6">
          {/* Page header */}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Activities</h1>
            <p className="text-muted-foreground mt-1">
              Track calls, emails, tasks, and meetings with your clients.
            </p>
          </div>

          {/* Activities table */}
          <ActivitiesTable
            activities={response?.data.data || []}
            total={response?.data.total || 0}
            page={page}
            totalPages={response?.data.totalPages || 1}
            search={search}
            typeFilter={type}
            completedFilter={completed}
            accessToken={accessToken}
          />
        </div>
      </main>
    </>
  );
}
