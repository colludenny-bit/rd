import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';
import {
  Home,
  Target,
  LineChart,
  Brain,
  BookOpen,
  Users,
  Bot,
  Dices,
  BarChart3,
  Sparkles,
  Settings,
  LogOut,
  Moon,
  Sun,
  X,
  TrendingUp,
  Calendar,
  FileText,
  Globe,
  Calculator
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/statistics', icon: FileText, label: 'Report' },
  { path: '/charts', icon: LineChart, label: 'Grafici' },
  { path: '/calendar', icon: Calendar, label: 'Calendario' },
  { path: '/strategy', icon: Target, label: 'Strategia' },
  { path: '/montecarlo', icon: Calculator, label: 'Risk' },
  { path: '/psychology', icon: Brain, label: 'Psicologia' },
  { path: '/journal', icon: BookOpen, label: 'Journal' },
  { path: '/community', icon: Users, label: 'Community' },
  { path: '/ai', icon: Bot, label: 'AI' },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Compact with Labels */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-card/95 backdrop-blur-xl border-r border-border z-50",
          "hidden lg:flex flex-col items-center py-4",
          "w-20"
        )}
        data-testid="sidebar-desktop"
      >
        {/* Logo */}
        <div className="mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>

        {/* Navigation Icons with Labels */}
        <nav className="flex-1 flex flex-col items-center gap-1 w-full px-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "w-full py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200",
                  "hover:bg-primary/10",
                  isActive && "bg-primary/20"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className={cn(
                  "w-7 h-7",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-[9px] font-medium leading-tight text-center",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-1 mt-2 w-full px-1">
          {/* Settings Only */}
          <NavLink
            to="/settings"
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-colors hover:bg-secondary",
              location.pathname === '/settings' && "bg-primary/20"
            )}
            data-testid="nav-settings"
          >
            <Settings className={cn(
              "w-7 h-7",
              location.pathname === '/settings' ? "text-primary" : "text-muted-foreground"
            )} />
          </NavLink>
        </div>
      </aside>

      {/* Mobile Sidebar - Full Width with Labels */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-card/95 backdrop-blur-xl border-r border-border z-50",
          "flex flex-col lg:hidden transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        data-testid="sidebar-mobile"
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">Trading Hub</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            data-testid="sidebar-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Theme Toggle */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4" />
              <span className="text-sm">Modalità Notte</span>
            </div>
            <button
              onClick={toggleTheme}
              className={cn(
                "w-11 h-6 rounded-full transition-colors relative",
                theme === 'dark' ? "bg-primary" : "bg-secondary"
              )}
            >
              <span className={cn(
                "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform",
                theme === 'dark' ? "translate-x-5" : "translate-x-0.5"
              )} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      "hover:bg-secondary/80",
                      isActive && "bg-primary/10 text-primary border border-primary/20"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                    <span className={cn("font-medium", isActive && "text-primary")}>
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                      />
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              "hover:bg-secondary/80",
              location.pathname === '/settings' && "bg-primary/10 text-primary"
            )}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Impostazioni</span>
          </NavLink>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Esci</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
