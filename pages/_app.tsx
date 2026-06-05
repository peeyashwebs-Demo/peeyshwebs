import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Component as ReactComponent } from 'react';
import { AuthProvider } from '@/lib/context/AuthContext';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import { ToastProvider } from '@/lib/context/ToastContext';
import AuthGate from '@/components/AuthGate';
import Layout from '@/components/Layout';

class ErrorBoundary extends ReactComponent<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-white p-8">
          <div className="max-w-lg text-center">
            <h1 className="text-xl font-bold text-red-600 mb-4">Error</h1>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap break-all text-left max-h-96 overflow-auto">
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
