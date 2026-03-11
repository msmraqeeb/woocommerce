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
        <main className="flex-1 overflow-y-auto bg-zinc-950/50 flex flex-col">
          <div className="flex-1 mx-auto max-w-7xl p-8 w-full">
            {children}
          </div>
          <footer className="border-t border-zinc-800/50 p-6 text-center text-sm text-zinc-500">
            <p>
              &copy; {new Date().getFullYear()} Herb69. All rights reserved.
              <span className="mx-2 text-zinc-800">|</span>
              Developed by: <a href="https://shakilmahmud.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-indigo-400 transition-colors font-medium">Shakil Mahmud</a>
            </p>
          </footer>
        </main>
      </body>
    </html>
  );
}
