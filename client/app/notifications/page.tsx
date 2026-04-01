'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { notificationsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Star,
  Clock,
  Bell,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface Notification {
  id: string;
  type: 'PROPOSAL' | 'MILESTONE' | 'MESSAGE' | 'PAYMENT' | 'REVIEW' | 'SYSTEM';
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface RawNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

function mapIcon(type: string): { icon: React.ReactNode; color: string } {
  switch (type) {
    case 'PROPOSAL_RECEIVED':
    case 'PROPOSAL_ACCEPTED':
    case 'PROPOSAL_REJECTED':
      return { icon: <Clock className="w-5 h-5" />, color: 'text-warning' };
    case 'PAYMENT_ESCROWED':
    case 'PAYMENT_RELEASED':
      return { icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-success' };
    case 'NEW_MESSAGE':
      return { icon: <MessageSquare className="w-5 h-5" />, color: 'text-primary' };
    case 'REVIEW_RECEIVED':
      return { icon: <Star className="w-5 h-5" />, color: 'text-yellow-500' };
    default:
      return { icon: <Bell className="w-5 h-5" />, color: 'text-muted-foreground' };
  }
}

function mapAction(referenceType?: string): { actionUrl?: string; actionLabel?: string } {
  switch (referenceType) {
    case 'proposal':
      return { actionUrl: '/proposals', actionLabel: 'Open' };
    case 'payment':
      return { actionUrl: '/contracts', actionLabel: 'Open' };
    case 'review':
      return { actionUrl: '/reviews', actionLabel: 'Open' };
    default:
      return {};
  }
}

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const response = await notificationsAPI.getMine({ page: 1, limit: 50, sortOrder: 'desc' });
    if (!response.success) {
      setNotifications([]);
      setError(response.error?.message || 'Failed to load notifications');
      setLoading(false);
      return;
    }

    const mapped = ((response.data?.items || []) as RawNotification[]).map((item) => {
      const visual = mapIcon(item.type);
      const action = mapAction(item.referenceType);
      return {
        id: item.id,
        type: 'SYSTEM',
        title: item.title,
        description: item.body,
        icon: visual.icon,
        color: visual.color,
        timestamp: formatDate(item.createdAt),
        read: item.isRead,
        actionUrl: action.actionUrl,
        actionLabel: action.actionLabel,
      } as Notification;
    });

    setNotifications(mapped);
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const handleMarkAsRead = async (id: string) => {
    const response = await notificationsAPI.markAsRead(id);
    if (!response.success) {
      setError(response.error?.message || 'Failed to mark as read');
      return;
    }

    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    for (const item of unread) {
      // Sequential calls keep server load predictable for small batches.
      // eslint-disable-next-line no-await-in-loop
      await handleMarkAsRead(item.id);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="border-b border-border bg-background sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <Button size="sm" variant="outline" onClick={handleMarkAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-muted-foreground">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-lg text-muted-foreground mb-4">
              No notifications yet
            </p>
            <p className="text-sm text-muted-foreground">
              You&apos;re all caught up!
            </p>
          </div>
        ) : (
          <Tabs defaultValue="unread" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="unread">
                Unread {unreadCount > 0 && <span className="ml-2 font-bold">{unreadCount}</span>}
              </TabsTrigger>
              <TabsTrigger value="all">
                All {notifications.length > 0 && <span className="ml-2">{notifications.length}</span>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unread" className="space-y-3">
              {notifications.filter(n => !n.read).length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No unread notifications</p>
                  </CardContent>
                </Card>
              ) : (
                notifications
                  .filter(n => !n.read)
                  .map(notification => (
                    <Card key={notification.id} className="hover:border-primary transition">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`shrink-0 p-2 rounded-lg bg-muted ${notification.color}`}>
                            {notification.icon}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-foreground">
                                {notification.title}
                              </h3>
                              <Badge variant="default" className="text-xs shrink-0">
                                New
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {notification.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {notification.timestamp}
                            </p>
                          </div>

                          <div className="shrink-0 flex gap-2">
                            {notification.actionUrl && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleMarkAsRead(notification.id)}
                                asChild
                              >
                                <Link href={notification.actionUrl}>
                                  {notification.actionLabel || 'View'}
                                </Link>
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              ✓
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-3">
              {notifications.map(notification => (
                <Card key={notification.id} className={`transition ${!notification.read ? 'bg-info/5 border-info/30' : 'hover:border-primary'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`shrink-0 p-2 rounded-lg bg-muted ${notification.color}`}>
                        {notification.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className={`font-semibold ${notification.read ? 'text-foreground' : 'text-foreground font-bold'}`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="shrink-0 w-2 h-2 rounded-full bg-primary mt-2"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.timestamp}
                        </p>
                      </div>

                      <div className="shrink-0 flex gap-2">
                        {notification.actionUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <Link href={notification.actionUrl}>
                              {notification.actionLabel || 'View'}
                            </Link>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
