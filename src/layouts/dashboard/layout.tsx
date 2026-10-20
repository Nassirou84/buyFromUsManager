'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar, pathToNavigationPath } from './Sidebar';
import { Header } from './Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const currentPath = pathToNavigationPath(usePathname());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#0b1329] text-[#0b1c30] dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. Left Fixed Sidebar */}
      <Sidebar
        currentPath={currentPath}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* 2. Top Header Navigation */}
      <Header
        currentPath={currentPath}
        collapsed={sidebarCollapsed}
        searchQuery={globalSearch}
        onSearchChange={setGlobalSearch}
      />

      {/* 3. Main Workspace Area */}
      <main
        className={`flex-1 pt-16 transition-all duration-300 ${sidebarCollapsed ? 'pl-20' : 'pl-72'
          }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1520px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}