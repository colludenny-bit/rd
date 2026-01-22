import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Particles } from '../ui/Particles';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Particles Background */}
      <Particles />
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main className="lg:ml-20 min-h-screen pb-20 lg:pb-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 glass border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              data-testid="mobile-menu-btn"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-lg">Trading Hub</span>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav onSearchClick={() => {}} />
    </div>
  );
};

export default Layout;
