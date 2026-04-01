'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { contractsAPI, jobsAPI, proposalsAPI, reviewsAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, MessageSquare, DollarSign, Star, ArrowRight } from 'lucide-react';

interface DashboardContract {
  id: string;
  title: string;
  client: string;
  amount: number;
  status: 'ACTIVE' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
  createdAt: string;
}

interface DashboardProposal {
  id: string;
  title: string;
  budgetMin: number;
  budgetMax: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  submittedAt: string;
}

interface RecommendedJob {
  id: string;
  title: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
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

export default function DevDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeContracts, setActiveContracts] = useState<DashboardContract[]>([]);
  const [myProposals, setMyProposals] = useState<DashboardProposal[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);
  const [rating, setRating] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalProposals, setTotalProposals] = useState(0);

  useEffect(() => {
    if (user && user.role !== 'DEV') {
      router.push(user.role === 'CLIENT' ? '/dashboard' : '/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (!user || user.role !== 'DEV') return;

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      const [
        activeContractsRes,
        completedContractsRes,
        proposalsRes,
        jobsRes,
        reviewRes,
      ] = await Promise.all([
        contractsAPI.getMine({ status: 'ACTIVE', page: 1, limit: 50, sortOrder: 'desc' }),
        contractsAPI.getMine({ status: 'COMPLETED', page: 1, limit: 50, sortOrder: 'desc' }),
        proposalsAPI.getMine({ page: 1, limit: 50, sortOrder: 'desc' }),
        jobsAPI.list({ page: 1, limit: 8, sortBy: 'createdAt', sortOrder: 'desc' }),
        reviewsAPI.getDevReviews(user.id, { page: 1, limit: 1 }),
      ]);

      if (!activeContractsRes.success && !proposalsRes.success && !jobsRes.success) {
        setError('Failed to load dashboard data.');
        setLoading(false);
        return;
      }

      const mappedContracts = activeContractsRes.success
        ? (activeContractsRes.data?.items || []).map((item: any) => ({
            id: item.id,
            title: item.jobs?.title || 'Untitled job',
            client: item.users_contracts_clientIdTousers?.name || 'Client',
            amount: toNumber(item.agreedAmount),
            status: item.status,
            createdAt: item.createdAt,
          }))
        : [];
      setActiveContracts(mappedContracts);

      const mappedProposals = proposalsRes.success
        ? (proposalsRes.data?.items || []).map((item: any) => ({
            id: item.id,
            title: item.jobs?.title || 'Untitled job',
            budgetMin: toNumber(item.jobs?.budgetMin || 0),
            budgetMax: toNumber(item.jobs?.budgetMax || 0),
            status: item.status,
            submittedAt: item.createdAt,
          }))
        : [];
      setMyProposals(mappedProposals.slice(0, 6));
      setTotalProposals(proposalsRes.success ? proposalsRes.data?.pagination?.totalItems || 0 : 0);

      const mappedJobs = jobsRes.success
        ? (jobsRes.data?.items || []).map((item: any) => ({
            id: item.id,
            title: item.title,
            budgetMin: toNumber(item.budgetMin),
            budgetMax: toNumber(item.budgetMax),
            deadline: item.deadline,
          }))
        : [];
      setRecommendedJobs(mappedJobs.slice(0, 4));

      const earned = completedContractsRes.success
        ? (completedContractsRes.data?.items || []).reduce(
            (sum: number, item: any) => sum + toNumber(item.agreedAmount),
            0,
          )
        : 0;
      setTotalEarned(earned);

      if (reviewRes.success) {
        setRating(reviewRes.data?.summary?.avgRating || 0);
      }

      setLoading(false);
    };

    loadDashboard();
  }, [user]);

  if (!user || user.role !== 'DEV') {
    return null;
  }

  const stats = [
    { label: 'Active contracts', value: String(activeContracts.length), icon: TrendingUp, color: 'text-primary' },
    { label: 'Proposals sent', value: String(totalProposals), icon: MessageSquare, color: 'text-accent' },
    { label: 'Total earned', value: formatCurrency(totalEarned), icon: DollarSign, color: 'text-success' },
    { label: 'Rating', value: rating.toFixed(1), icon: Star, color: 'text-warning' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-info/20 text-info border-info/30';
      case 'PENDING':
        return 'bg-muted text-muted-foreground border-border';
      case 'ACCEPTED':
        return 'bg-success/20 text-success border-success/30';
      case 'COMPLETED':
        return 'bg-success/20 text-success border-success/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="border-b border-border bg-background sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.name}!</p>
            </div>
            <Button asChild>
              <Link href="/jobs" className="gap-2">
                <ArrowRight className="w-4 h-4" />
                Find Jobs
              </Link>
            </Button>
          </div>
        </div>
      </div>

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
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Active Contracts</h2>
                  <Button variant="outline" asChild>
                    <Link href="/contracts">View all</Link>
                  </Button>
                </div>

                <div className="space-y-4">
                  {activeContracts.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center text-muted-foreground">
                        No active contracts.
                      </CardContent>
                    </Card>
                  ) : (
                    activeContracts.map((contract) => (
                      <Link key={contract.id} href={`/contracts/${contract.id}`}>
                        <Card className="hover:border-primary transition cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-foreground mb-1">
                                  {contract.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">{contract.client}</p>
                              </div>
                              <Badge variant="outline" className={getStatusColor(contract.status)}>
                                {contract.status}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-border">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Created</p>
                                <p className="font-semibold text-foreground">{formatDate(contract.createdAt)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground mb-1">Amount</p>
                                <p className="font-bold text-primary text-lg">{formatCurrency(contract.amount)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">My Proposals</h2>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/proposals">View all</Link>
                  </Button>
                </div>

                <div className="space-y-4">
                  {myProposals.length === 0 ? (
                    <Card>
                      <CardContent className="p-4 text-sm text-muted-foreground">
                        No proposals yet.
                      </CardContent>
                    </Card>
                  ) : (
                    myProposals.map((proposal) => (
                      <Card key={proposal.id} className="hover:border-primary transition">
                        <CardContent className="p-4">
                          <div className="mb-3">
                            <p className="font-semibold text-foreground text-sm leading-snug">{proposal.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Submitted {formatDate(proposal.submittedAt)}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-medium text-foreground">
                              {formatCurrency(proposal.budgetMin)} - {formatCurrency(proposal.budgetMax)}
                            </p>
                          </div>

                          <Badge
                            variant="outline"
                            className={`${getStatusColor(proposal.status)} text-xs w-full text-center`}
                          >
                            {proposal.status}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Recommended for You</h2>
                <Button variant="outline" asChild>
                  <Link href="/jobs">Browse all jobs</Link>
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {recommendedJobs.length === 0 ? (
                  <Card>
                    <CardContent className="p-4 text-sm text-muted-foreground">
                      No recommended jobs available.
                    </CardContent>
                  </Card>
                ) : (
                  recommendedJobs.map((job) => (
                    <Card key={job.id} className="hover:border-primary transition">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="font-semibold text-foreground">{job.title}</h3>
                          <Badge className="bg-success/20 text-success border-success/30">OPEN</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">Deadline: {formatDate(job.deadline)}</p>
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-foreground">
                            {formatCurrency(job.budgetMin)} - {formatCurrency(job.budgetMax)}
                          </p>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/jobs/${job.id}`}>View</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
