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
  TrendingUp
} from 'lucide-react';
import { Switch } from '../ui/switch';

const navItems = [
  { path: '/', icon: Home, labelKey: 'nav.home' },
  { path: '/strategy', icon: Target, labelKey: 'nav.strategy' },
  { path: '/charts', icon: LineChart, labelKey: 'nav.charts' },
  { path: '/psychology', icon: Brain, labelKey: 'nav.psychology' },
  { path: '/journal', icon: BookOpen, labelKey: 'nav.journal' },
  { path: '/community', icon: Users, labelKey: 'nav.community' },
  { path: '/ai', icon: Bot, labelKey: 'nav.ai' },
  { path: '/montecarlo', icon: Dices, labelKey: 'nav.montecarlo' },
  { path: '/statistics', icon: BarChart3, labelKey: 'nav.statistics' },
  { path: '/ascension', icon: Sparkles, labelKey: 'nav.ascension' },
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

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-card/95 backdrop-blur-xl border-r border-border z-50",
          "flex flex-col transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
        data-testid="sidebar"
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight">Trading Hub</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
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
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
              data-testid="theme-toggle"
            />
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
                    data-testid={`nav-${item.labelKey.split('.')[1]}`}
                  >
                    <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                    <span className={cn("font-medium", isActive && "text-primary")}>
                      {t(item.labelKey)}
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
            data-testid="nav-settings"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">{t('nav.settings')}</span>
          </NavLink>
          
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{t('nav.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
