import type { ReactNode } from 'react';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import { useAuth } from '@/lib/context/AuthContext';

export default function Layout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const isAuthPage = router.pathname === '/auth';
  const isApiRoute = router.pathname.startsWith('/api');

  if (isApiRoute) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark text-text-primary dark:text-text-primary-dark transition-colors duration-300">
      {!isAuthPage && user && <Navbar />}
      {isAuthPage && <Navbar />}
      <main className={`mx-auto max-w-7xl px-4 ${user && !isAuthPage ? 'py-6' : 'py-0'}`}>
        {children}
      </main>
    </div>
  );
}
