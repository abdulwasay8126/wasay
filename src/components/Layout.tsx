import React, { useState } from 'react';
import { Sidebar } from './Sidebar';

export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b">
          <div className="px-4 py-3 flex items-center gap-3">
            <button className="md:hidden p-2 rounded hover:bg-gray-100" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle sidebar">☰</button>
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
        </header>
        <main className="p-4 max-w-4xl w-full mx-auto flex-1">{children}</main>
      </div>
    </div>
  );
};

