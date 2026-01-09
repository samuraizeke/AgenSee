import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ClientForm } from './ClientForm';
import { DashboardHeader } from '@/components/crm/dashboard-header';

export default async function NewClientPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <>
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-2xl mx-auto p-6 space-y-6">
          {/* Page header */}
          <div>
            <h1 className="text-2xl font-bold">Add New Client</h1>
            <p className="text-muted-foreground">
              Create a new client profile.
            </p>
          </div>

          {/* Form */}
          <div className="rounded-lg border bg-card p-6">
            <ClientForm />
          </div>
        </div>
      </main>
    </>
  );
}
