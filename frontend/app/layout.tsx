import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../lib/globals.css';
import { AuthProvider } from '@/lib/authContext';
import { Sidebar } from '@/components/layout/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TradingHub - Real-time Market Intelligence',
  description: 'Professional trading platform with real-time market data, economic calendar, news aggregation, and advanced trading tools',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100`}>
        <AuthProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}


