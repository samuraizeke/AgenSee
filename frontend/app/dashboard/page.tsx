import { createClient } from '@/lib/supabase/server';
import { getServerApiUrl } from '@/lib/server-api-url';
import Link from 'next/link';
import { DashboardHeader } from '@/components/crm/dashboard-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Users,
  FileText,
  Clock,
  DollarSign,
  ArrowRight,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { UpcomingRenewals } from './UpcomingRenewals';
import { UrgentRenewalsAlert } from '@/components/crm/urgent-renewals-alert';

interface RenewalPolicy {
  id: string;
  client_id: string;
  client_first_name: string;
  client_last_name: string;
  client_email: string | null;
  client_phone: string | null;
  policy_number: string;
  carrier: string;
  type: string;
  expiration_date: string;
  days_until_expiration: number;
  premium: number;
}

async function getDashboardStats(accessToken: string) {
  try {
    const response = await fetch(
      `${getServerApiUrl()}/dashboard/stats`,
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

async function getUpcomingRenewals(accessToken: string): Promise<RenewalPolicy[]> {
  try {
    const response = await fetch(
      `${getServerApiUrl()}/dashboard/renewals?days=30`,
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

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token || '';

  const [stats, renewals] = await Promise.all([
    getDashboardStats(accessToken),
    getUpcomingRenewals(accessToken),
  ]);

  const urgentRenewals = renewals.filter((p) => p.days_until_expiration <= 7);
  const upcomingRenewals = renewals.filter((p) => p.days_until_expiration > 7);

  return (
    <>
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-7xl mx-auto p-6 space-y-8">
          {/* Page Header */}
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here&apos;s an overview of your agency.
            </p>
          </div>

          {/* Urgent Renewals Alert */}
          <UrgentRenewalsAlert renewals={urgentRenewals} />

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Clients"
              value={stats?.total_clients ?? 0}
              href="/dashboard/clients"
              icon={<Users className="h-5 w-5" />}
              trend="+12% from last month"
            />
            <StatCard
              title="Active Policies"
              value={stats?.active_policies ?? 0}
              href="/dashboard/policies"
              icon={<FileText className="h-5 w-5" />}
              trend="+5% from last month"
            />
            <StatCard
              title="Total Premium"
              value={
                stats?.total_premium
                  ? `$${Number(stats.total_premium).toLocaleString()}`
                  : '$0'
              }
              href="/dashboard/policies"
              icon={<DollarSign className="h-5 w-5" />}
              trend="+8% from last month"
            />
            <Card className="transition-all hover:shadow-md h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg p-2.5 bg-primary/10 text-primary">
                    <Plus className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 space-y-1 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Quick Actions</p>
                  <div className="flex gap-2 pt-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href="/dashboard/clients/new"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <Users className="h-4 w-4" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>New Client</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href="/dashboard/policies/new"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <FileText className="h-4 w-4" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>New Policy</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href="/dashboard/activities/new"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <Clock className="h-4 w-4" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>New Task</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Renewals */}
          <UpcomingRenewals renewals={upcomingRenewals} />
        </div>
      </main>
    </>
  );
}

function StatCard({
  title,
  value,
  href,
  icon,
  variant = 'default',
  trend,
}: {
  title: string;
  value: string | number;
  href: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'warning';
  trend?: string;
}) {
  return (
    <Link href={href} className="block group h-full">
      <Card
        className={`transition-all hover:shadow-md h-full ${
          variant === 'warning'
            ? 'border-secondary bg-secondary/10'
            : ''
        }`}
      >
        <CardContent className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between">
            <div
              className={`rounded-lg p-2.5 ${
                variant === 'warning'
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-primary/10 text-primary'
              }`}
            >
              {icon}
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
          </div>
          <div className="mt-4 space-y-1 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground h-4">
              {trend && (
                <>
                  <TrendingUp className="h-3 w-3 text-primary" />
                  {trend}
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
