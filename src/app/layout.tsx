import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientLayout } from '@/components/ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kids Paradise',
  description: 'WooCommerce Management Dashboard for Kids Paradise',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.className} flex flex-col h-full bg-zinc-950 text-zinc-100 antialiased selection:bg-indigo-500/30 lg:flex-row`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
