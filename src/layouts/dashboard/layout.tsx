'use client';

import { useState, useEffect } from 'react';
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


  // Toggle Dark Mode with local storage persistence and multi-level class & attribute support
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('flot_dark_mode');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
      localStorage.setItem('flot_dark_mode', 'true');
    } else {
      root.classList.remove('dark');
      root.removeAttribute('data-theme');
      document.body.classList.remove('dark');
      localStorage.setItem('flot_dark_mode', 'false');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#0b1329] text-[#0b1c30] dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. Left Fixed Sidebar */}
      <Sidebar
        currentPath={currentPath}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
      />

      {/* 2. Top Header Navigation */}
      <Header
        currentPath={currentPath}
        collapsed={sidebarCollapsed}
        searchQuery={globalSearch}
        onSearchChange={setGlobalSearch}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
      />

      {/* 3. Main Workspace Area */}
      <main
        className={`flex-1 pt-16 transition-all duration-300 ${sidebarCollapsed ? 'pl-20' : 'pl-64'
          }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1520px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}