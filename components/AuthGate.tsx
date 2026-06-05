import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/context/AuthContext';

const PUBLIC_ROUTES = ['/auth'];

export default function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user && !PUBLIC_ROUTES.includes(router.pathname)) {
      router.replace('/auth');
    }
    if (user && router.pathname === '/auth') {
      router.replace('/');
    }
  }, [user, loading, router.pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}