'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { contractsAPI, jobsAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, MessageSquare, DollarSign, Clock } from 'lucide-react';

interface JobListItem {
  id: string;
  clientId: string;
  title: string;
  budgetMin: string | number;
  budgetMax: string | number;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

interface ProposalSummary {
  id: string;
  jobId: string;
  jobTitle: string;
  developer: string;
  amount: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  submittedAt: string;
}

function toNumber(value: string | number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myOpenJobs, setMyOpenJobs] = useState<JobListItem[]>([]);
  const [recentProposals, setRecentProposals] = useState<ProposalSummary[]>([]);
  const [activeContracts, setActiveContracts] = useState(0);
  const [completedSpent, setCompletedSpent] = useState(0);

  // Redirect non-clients
  useEffect(() => {
    if (user && user.role !== 'CLIENT') {
      router.push(user.role === 'DEV' ? '/dev-dashboard' : '/login');
    }
  }, [user, router]);

  if (!user || user.role !== 'CLIENT') {
    return null;
  }

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      const [jobsResponse, activeContractsResponse, completedContractsResponse] = await Promise.all([
        jobsAPI.list({ page: 1, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }),
        contractsAPI.getMine({ status: 'ACTIVE', page: 1, limit: 50, sortOrder: 'desc' }),
        contractsAPI.getMine({ status: 'COMPLETED', page: 1, limit: 50, sortOrder: 'desc' }),
      ]);

      if (!jobsResponse.success) {
        setError(jobsResponse.error?.message || 'Failed to load dashboard data');
        setLoading(false);
        return;
      }

      const ownJobs = ((jobsResponse.data?.items || []) as JobListItem[]).filter((job) => job.clientId === user.id);
      setMyOpenJobs(ownJobs);

      const proposalResults = await Promise.allSettled(
        ownJobs.map(async (job) => {
          const response = await jobsAPI.getJobProposals(job.id);
          return { job, response };
        }),
      );

      const merged: ProposalSummary[] = [];

      proposalResults.forEach((result) => {
        if (result.status !== 'fulfilled') return;
        const { job, response } = result.value;
        if (!response.success || !response.data?.proposals) return;

        response.data.proposals.forEach((proposal: any) => {
          merged.push({
            id: proposal.id,
            jobId: job.id,
            jobTitle: job.title,
            developer: proposal.users?.name || 'Developer',
            amount: toNumber(proposal.bidAmount),
            status: proposal.status,
            submittedAt: proposal.createdAt,
          });
        });
      });

      merged.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      setRecentProposals(merged.slice(0, 6));

      const activeCount = activeContractsResponse.success
        ? activeContractsResponse.data?.pagination?.totalItems || 0
        : 0;
      setActiveContracts(activeCount);

      const spent = completedContractsResponse.success
        ? (completedContractsResponse.data?.items || []).reduce(
            (sum: number, item: any) => sum + toNumber(item.agreedAmount),
            0,
          )
        : 0;
      setCompletedSpent(spent);

      setLoading(false);
    };

    loadDashboard();
  }, [user.id]);

  const proposalsByJobId = useMemo(() => {
    const map = new Map<string, number>();
    recentProposals.forEach((proposal) => {
      map.set(proposal.jobId, (map.get(proposal.jobId) || 0) + 1);
    });
    return map;
  }, [recentProposals]);

  const stats = [
    { label: 'Active jobs', value: String(myOpenJobs.length), icon: TrendingUp, color: 'text-primary' },
    { label: 'Total proposals', value: String(recentProposals.length), icon: MessageSquare, color: 'text-accent' },
    { label: 'Spent', value: formatCurrency(completedSpent), icon: DollarSign, color: 'text-success' },
    { label: 'Active contracts', value: String(activeContracts), icon: Clock, color: 'text-warning' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-info/20 text-info border-info/30';
      case 'IN_PROGRESS': return 'bg-warning/20 text-warning border-warning/30';
      case 'PENDING': return 'bg-muted text-muted-foreground border-border';
      case 'ACCEPTED': return 'bg-success/20 text-success border-success/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Page Header */}
      <div className="border-b border-border bg-background sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.name}!</p>
            </div>
            <Button asChild>
              <Link href="/jobs/create" className="gap-2">
                <Plus className="w-4 h-4" />
                Post a Job
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-muted-foreground">Loading dashboard...</p>
        ) : (
          <>
        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color} opacity-20`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Jobs */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Active Jobs</h2>
              <Button variant="outline" asChild>
                <Link href="/jobs">View all</Link>
              </Button>
            </div>

            <div className="space-y-4">
              {myOpenJobs.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    You have no open jobs yet.
                  </CardContent>
                </Card>
              ) : (
              myOpenJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <Card className="hover:border-primary transition cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                            <Badge variant="outline" className={getStatusColor(job.status)}>
                              {job.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">Posted {formatDate(job.createdAt)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Budget</p>
                          <p className="font-semibold text-foreground">
                            {formatCurrency(toNumber(job.budgetMin))} - {formatCurrency(toNumber(job.budgetMax))}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Proposals</p>
                          <p className="font-semibold text-foreground">{proposalsByJobId.get(job.id) || 0}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Action</p>
                          <p className="text-sm font-semibold text-primary">View proposals</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )))}
            </div>
          </div>

          {/* Recent Proposals */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Recent Proposals</h2>

            <div className="space-y-4">
              {recentProposals.length === 0 ? (
                <Card>
                  <CardContent className="p-4 text-sm text-muted-foreground">
                    No proposals yet.
                  </CardContent>
                </Card>
              ) : (
              recentProposals.map((proposal) => (
                <Card key={proposal.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-sm">
                        {proposal.developer[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">{proposal.developer}</p>
                        <p className="text-xs text-muted-foreground">
                          {proposal.rating} ⭐ • {proposal.jobs} jobs
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-foreground mb-3 line-clamp-1">{proposal.jobTitle}</p>

                    <div className="flex items-center justify-between">
                      <p className="font-bold text-foreground">{formatCurrency(proposal.amount)}</p>
                      <Badge 
                        variant="outline"
                        className={getStatusColor(proposal.status)}
                      >
                        {proposal.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )))}
            </div>

            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/proposals">View all proposals</Link>
            </Button>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
