import * as React from 'react';
import { Header } from './Header';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-[100dvh] flex-col relative font-sans antialiased text-foreground bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/landscape_bg.jpg')" }}
    >
      {/* Very subtle warm tint overlay */}
      <div className="absolute inset-0 bg-amber-900/5 dark:bg-black/25 pointer-events-none" />
      <Header />
      <main className="relative flex-1 overflow-hidden p-2 sm:p-4 lg:p-6">
        <div className="mx-auto w-full max-w-7xl h-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
