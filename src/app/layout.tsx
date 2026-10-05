import { Inter } from 'next/font/google';
import './globals.css';
import AppQueryProvider from '@/provider/query-provider';
import { Toaster } from 'sonner';
import { AuthConsumer, AuthProvider } from '@/auth/context';
import { LocalizationProvider } from '@/locales';
import ErrorBoundary from '@/components/error/error-boundary';
import FullPageError from '@/components/error/full-page-error';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <ErrorBoundary fallbackUI={<FullPageError />}>
          <LocalizationProvider>
            <AuthProvider>
              <AppQueryProvider>
                <Toaster position="bottom-right" />
                <AuthConsumer>{children}</AuthConsumer>
              </AppQueryProvider>
            </AuthProvider>
          </LocalizationProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
