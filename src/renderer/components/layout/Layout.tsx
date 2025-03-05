import React from 'react';
import { Navigation } from './Navigation';
import { MobileNavigation } from './MobileNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-gray-200 bg-white px-6 pt-6 dark:border-gray-800 dark:bg-gray-900 lg:block">
          <div className="flex h-16 items-center">
            <span className="text-xl font-bold text-gray-900 dark:text-white">PromptNova</span>
          </div>
          <Navigation className="mt-6" />
        </div>
        
        {/* Mobile navigation */}
        <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 lg:hidden">
          <div className="flex items-center gap-4">
            <MobileNavigation />
            <span className="text-lg font-bold text-gray-900 dark:text-white">PromptNova</span>
          </div>
        </div>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto pt-14 lg:pl-64">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}