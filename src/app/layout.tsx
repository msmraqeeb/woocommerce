"use client";

import { useState } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { MobileHeader } from '@/components/MobileHeader';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.className} flex flex-col h-full bg-zinc-950 text-zinc-100 antialiased selection:bg-indigo-500/30 lg:flex-row`}>
        <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto bg-zinc-950/50 flex flex-col">
          <div className="flex-1 mx-auto max-w-7xl p-4 sm:p-8 w-full">
            {children}
          </div>
          <footer className="border-t border-zinc-800/50 p-6 text-center text-sm text-zinc-500">
            <p className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <span>&copy; {new Date().getFullYear()} <a href="https://kidsparadise.com.bd/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">Kids Paradise</a>. All rights reserved.</span>
              <span className="hidden sm:inline mx-2 text-zinc-800">|</span>
              <span>Developed by: <a href="https://shakilmahmud.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-indigo-400 transition-colors font-medium">Shakil Mahmud</a></span>
            </p>
          </footer>
        </main>
      </body>
    </html>
  );
}
