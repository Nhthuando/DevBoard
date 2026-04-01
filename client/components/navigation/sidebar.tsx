'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import {
  Home,
  Briefcase,
  MessageSquare,
  FileText,
  DollarSign,
  Star,
  Settings,
  Menu,
  X,
} from 'lucide-react';

const clientMenuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Post Job', href: '/jobs/create', icon: Briefcase },
  { label: 'My Jobs', href: '/jobs', icon: FileText },
  { label: 'Messages', href: '/messages', icon: MessageSquare },
  { label: 'Contracts', href: '/contracts', icon: FileText },
  { label: 'Payments', href: '/payments', icon: DollarSign },
  { label: 'Reviews', href: '/reviews', icon: Star },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const devMenuItems = [
  { label: 'Dashboard', href: '/dev-dashboard', icon: Home },
  { label: 'Explore Jobs', href: '/jobs', icon: Briefcase },
  { label: 'My Proposals', href: '/proposals', icon: MessageSquare },
  { label: 'My Contracts', href: '/contracts', icon: FileText },
  { label: 'Earnings', href: '/earnings', icon: DollarSign },
  { label: 'Reviews', href: '/reviews', icon: Star },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const menuItems = user.role === 'CLIENT' ? clientMenuItems : devMenuItems;

  const sidebarContent = (
    <nav className="space-y-1 px-3">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-muted'
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 md:hidden p-3 bg-primary text-primary-foreground rounded-full shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed left-0 top-16 bottom-0 z-40 w-64 border-r border-border bg-sidebar overflow-y-auto transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="py-4">
          {sidebarContent}
        </div>
      </aside>

      {/* Reserve width for fixed desktop sidebar so main content stays centered */}
      <div className="hidden md:block w-64 shrink-0" aria-hidden="true" />
    </>
  );
}
