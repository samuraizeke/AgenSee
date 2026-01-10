import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { LoginForm } from './LoginForm';
import { Skeleton } from '@/components/ui/skeleton';

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/AgenSeeLogo.png"
                alt="AgenSee MS"
                width={48}
                height={48}
                className="rounded-xl"
              />
              <Image
                src="/AgenSeeWordmarkWhite.png"
                alt="AgenSee MS"
                width={160}
                height={40}
                className="h-10 w-auto"
              />
            </div>
          </div>
          <div className="space-y-6">
            <blockquote className="text-2xl font-light leading-relaxed">
              &ldquo;AgenSee MS transformed how we manage our agency. We&apos;ve reduced renewal
              lapses by 40% and our clients love the proactive service.&rdquo;
            </blockquote>
            <div>
              <p className="font-medium">Sarah Johnson</p>
              <p className="text-primary-foreground/70">Principal Agent, Johnson Insurance Group</p>
            </div>
          </div>
          <div className="text-sm text-primary-foreground/60">
            Trusted by 500+ insurance agencies
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-primary-foreground/5" />
        <div className="absolute -top-10 -left-10 h-64 w-64 rounded-full bg-primary-foreground/5" />
      </div>

      {/* Right side - Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="inline-flex items-center gap-2">
              <Image
                src="/AgenSeeLogo.png"
                alt="AgenSee MS"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <Image
                src="/AgenSeeWordmark.png"
                alt="AgenSee MS"
                width={130}
                height={32}
                className="h-8 w-auto"
              />
            </div>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome to AgenSee MS</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in with your Google account to continue
            </p>
          </div>

          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-4 w-3/4 mx-auto" />
    </div>
  );
}
