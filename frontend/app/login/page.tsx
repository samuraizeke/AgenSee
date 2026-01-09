import { Suspense } from 'react';
import { LoginForm } from './LoginForm';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur">
                <span className="font-heading text-2xl font-bold">A</span>
              </div>
              <span className="font-heading text-2xl font-semibold">AgenSee MS</span>
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="font-heading text-xl font-bold text-primary-foreground">A</span>
              </div>
              <span className="font-heading text-xl font-semibold">AgenSee MS</span>
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
