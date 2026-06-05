import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/lib/context/AuthContext';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import { ToastProvider } from '@/lib/context/ToastContext';
import AuthGate from '@/components/AuthGate';
import Layout from '@/components/Layout';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AuthGate>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </AuthGate>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
