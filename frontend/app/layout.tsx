import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../lib/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Trading Intelligence Platform',
  description: 'Economic calendar, market data, and trading tools',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-blue-600 text-white p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Trading Intelligence</h1>
            <ul className="flex space-x-6">
              <li><a href="/">Home</a></li>
              <li><a href="/calendar">Calendar</a></li>
              <li><a href="/markets">Markets</a></li>
              <li><a href="/news">News</a></li>
            </ul>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}


