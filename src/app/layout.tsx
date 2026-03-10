import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Kid's Paradise Dashboard",
  description: 'Manage your WooCommerce store beautifully.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.className} flex h-full bg-zinc-950 text-zinc-100 antialiased selection:bg-indigo-500/30`}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-zinc-950/50">
          <div className="mx-auto max-w-7xl p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
