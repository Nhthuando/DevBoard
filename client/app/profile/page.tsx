'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { contractsAPI, jobsAPI, proposalsAPI, reviewsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Mail, UserCircle, Award, Briefcase, Wallet, ClipboardList } from 'lucide-react';

interface ProfileStats {
  totalValue: number;
  activeContracts: number;
  completedContracts: number;
  totalReviews: number;
  averageRating: number;
  totalProposals: number;
}

function toNumber(value: string | number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`;
}

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    totalValue: 0,
    activeContracts: 0,
    completedContracts: 0,
    totalReviews: 0,
    averageRating: 0,
    totalProposals: 0,
  });

  useEffect(() => {
    const loadProfileStats = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const [allContractsRes, activeContractsRes, completedContractsRes] = await Promise.all([
        contractsAPI.getMine({ page: 1, limit: 50, sortOrder: 'desc' }),
        contractsAPI.getMine({ status: 'ACTIVE', page: 1, limit: 50, sortOrder: 'desc' }),
        contractsAPI.getMine({ status: 'COMPLETED', page: 1, limit: 50, sortOrder: 'desc' }),
      ]);

      if (!allContractsRes.success) {
        setError(allContractsRes.error?.message || 'Failed to load profile stats');
        setLoading(false);
        return;
      }

      const completedItems = completedContractsRes.success ? completedContractsRes.data?.items || [] : [];
      const totalValue = completedItems.reduce((sum: number, item: any) => sum + toNumber(item.agreedAmount), 0);

      let totalProposals = 0;
      if (user.role === 'DEV') {
        const proposalsRes = await proposalsAPI.getMine({ page: 1, limit: 1 });
        if (proposalsRes.success) {
          totalProposals = proposalsRes.data?.pagination?.totalItems || 0;
        }
      } else {
        const jobsRes = await jobsAPI.list({ page: 1, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' });
        if (jobsRes.success) {
          const ownJobs = (jobsRes.data?.items || []).filter((job: any) => job.clientId === user.id);
          const proposalResponses = await Promise.allSettled(
            ownJobs.map(async (job: any) => jobsAPI.getJobProposals(job.id)),
          );
          totalProposals = proposalResponses.reduce((sum, result) => {
            if (result.status !== 'fulfilled') return sum;
            if (!result.value.success) return sum;
            return sum + (result.value.data?.proposals?.length || 0);
          }, 0);
        }
      }

      let totalReviews = 0;
      let averageRating = 0;

      if (user.role === 'DEV') {
        const devReviewRes = await reviewsAPI.getDevReviews(user.id, { page: 1, limit: 1 });
        if (devReviewRes.success) {
          totalReviews = devReviewRes.data?.summary?.totalReviews || 0;
          averageRating = devReviewRes.data?.summary?.avgRating || 0;
        }
      } else {
        const myReviewRes = await reviewsAPI.getMine({ page: 1, limit: 1 });
        if (myReviewRes.success) {
          totalReviews = myReviewRes.data?.pagination?.totalItems || (myReviewRes.data?.items?.length || 0);
        }
      }

      setStats({
        totalValue,
        activeContracts: activeContractsRes.success ? activeContractsRes.data?.pagination?.totalItems || 0 : 0,
        completedContracts: completedContractsRes.success ? completedContractsRes.data?.pagination?.totalItems || 0 : 0,
        totalReviews,
        averageRating,
        totalProposals,
      });

      setLoading(false);
    };

    loadProfileStats();
  }, [isAuthenticated, user]);

  const roleLabel = useMemo(
    () => (user?.role === 'CLIENT' ? 'Hiring Client' : 'Developer'),
    [user?.role],
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="border-b border-border bg-linear-to-r from-primary/10 to-accent/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-4xl shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{user?.name}</h1>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-foreground">
                    {stats.averageRating.toFixed(1)} ({stats.totalReviews} reviews)
                  </span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{roleLabel}</Badge>
                  {user?.verified && <Badge className="bg-success/20 text-success border-success/30">Verified</Badge>}
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-muted-foreground">Loading profile...</p>
        ) : (
          <>
            <Tabs defaultValue="about" className="mb-8">
              <TabsList>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* About Tab */}
              <TabsContent value="about" className="space-y-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-xs text-muted-foreground mb-1">
                        {user?.role === 'DEV' ? 'Total Earned' : 'Total Spent'}
                      </p>
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalValue)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-xs text-muted-foreground mb-1">Completed Contracts</p>
                      <p className="text-2xl font-bold text-foreground">{stats.completedContracts}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-xs text-muted-foreground mb-1">Active Contracts</p>
                      <p className="text-2xl font-bold text-foreground">{stats.activeContracts}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Account</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <UserCircle className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium text-foreground">{user?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Role</p>
                        <p className="font-medium text-foreground">{roleLabel}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="p-4 rounded-lg bg-info/10 border border-info/20 text-sm text-info">
                  Profile editing is currently disabled because the backend does not expose update profile endpoints yet.
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      Activity Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Total Proposals</p>
                        <p className="text-2xl font-bold text-foreground">{stats.totalProposals}</p>
                      </div>
                      <div className="p-4 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Total Reviews</p>
                        <p className="text-2xl font-bold text-foreground">{stats.totalReviews}</p>
                      </div>
                    </div>

                    {user?.role === 'DEV' && (
                      <div className="p-4 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Average Rating</p>
                        <p className="text-2xl font-bold text-foreground">{stats.averageRating.toFixed(1)} / 5.0</p>
                      </div>
                    )}

                    {user?.role === 'CLIENT' && (
                      <div className="p-4 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Hiring Through Contracts</p>
                        <p className="text-sm text-muted-foreground">
                          Your spending metrics are based on completed contracts returned by backend.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-primary" />
                      Financial Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {user?.role === 'DEV' ? 'Estimated Total Earnings' : 'Estimated Total Spending'}
                      </p>
                      <p className="text-3xl font-bold text-foreground">{formatCurrency(stats.totalValue)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Computed from completed contracts and agreed amounts.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/settings">Account Preferences</Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/settings">Privacy & Security</Link>
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={logout}
                    >
                      Logout
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-primary" />
                      API Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>- This profile page only uses backend endpoints currently available.</p>
                    <p>- Updating bio, social links, and advanced profile fields requires backend support.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
