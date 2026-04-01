'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { contractsAPI, jobsAPI, proposalsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, CheckCircle2, Clock, XCircle, Archive } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Proposal {
  id: string;
  jobId: string;
  jobTitle: string;
  amount: number;
  coverLetter: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  submittedAt: string;
  lastUpdated: string;
  clientOrDev: {
    name: string;
    avatarUrl?: string | null;
  };
  canCreateContract?: boolean;
}

interface JobListItem {
  id: string;
  clientId: string;
  title: string;
}

function toNumber(value: string | number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
}

export default function ProposalsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadProposals = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    if (user.role === 'DEV') {
      const response = await proposalsAPI.getMine({ page: 1, limit: 50, sortOrder: 'desc' });
      if (!response.success) {
        setProposals([]);
        setError(response.error?.message || 'Failed to load proposals');
      } else {
        const items = (response.data?.items || []).map((item: any) => ({
          id: item.id,
          jobId: item.jobId,
          jobTitle: item.jobs?.title || 'Untitled job',
          amount: toNumber(item.bidAmount),
          coverLetter: item.coverLetter,
          status: item.status,
          submittedAt: item.createdAt,
          lastUpdated: item.updatedAt || item.createdAt,
          clientOrDev: {
            name: 'Client',
          },
          canCreateContract: false,
        })) as Proposal[];
        setProposals(items);
      }
      setLoading(false);
      return;
    }

    const jobsResponse = await jobsAPI.list({ page: 1, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' });
    if (!jobsResponse.success) {
      setProposals([]);
      setError(jobsResponse.error?.message || 'Failed to load jobs for proposals');
      setLoading(false);
      return;
    }

    const ownJobs = ((jobsResponse.data?.items || []) as JobListItem[]).filter((job) => job.clientId === user.id);

    if (ownJobs.length === 0) {
      setProposals([]);
      setLoading(false);
      return;
    }

    const proposalResponses = await Promise.allSettled(
      ownJobs.map(async (job) => {
        const response = await jobsAPI.getJobProposals(job.id);
        return { job, response };
      }),
    );

    const merged: Proposal[] = [];

    proposalResponses.forEach((entry) => {
      if (entry.status !== 'fulfilled') return;
      const { job, response } = entry.value;

      if (!response.success) {
        if (response.status === 404) return;
        return;
      }

      (response.data?.proposals || []).forEach((proposal: any) => {
        merged.push({
          id: proposal.id,
          jobId: job.id,
          jobTitle: job.title,
          amount: toNumber(proposal.bidAmount),
          coverLetter: proposal.coverLetter,
          status: proposal.status,
          submittedAt: proposal.createdAt,
          lastUpdated: proposal.createdAt,
          clientOrDev: {
            name: proposal.users?.name || 'Developer',
            avatarUrl: proposal.users?.avatarUrl,
          },
          canCreateContract: proposal.status === 'ACCEPTED',
        });
      });
    });

    merged.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    setProposals(merged);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    loadProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  const filteredProposals = useMemo(
    () =>
      proposals.filter(
        (p) =>
          p.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.clientOrDev.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [proposals, searchQuery],
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'PENDING': return <Clock className="w-5 h-5 text-warning" />;
      case 'REJECTED': return <XCircle className="w-5 h-5 text-destructive" />;
      case 'WITHDRAWN': return <Archive className="w-5 h-5 text-muted-foreground" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-success/20 text-success border-success/30';
      case 'PENDING': return 'bg-warning/20 text-warning border-warning/30';
      case 'REJECTED': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'WITHDRAWN': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const handleUpdateStatus = async (proposalId: string, status: 'ACCEPTED' | 'REJECTED') => {
    setActionLoadingId(proposalId);
    setError(null);

    const response = await proposalsAPI.updateStatus(proposalId, status);
    if (!response.success) {
      setError(response.error?.message || `Failed to ${status.toLowerCase()} proposal`);
    } else {
      await loadProposals();
    }

    setActionLoadingId(null);
  };

  const handleWithdraw = async (proposalId: string) => {
    setActionLoadingId(proposalId);
    setError(null);

    const response = await proposalsAPI.withdraw(proposalId);
    if (!response.success) {
      setError(response.error?.message || 'Failed to withdraw proposal');
    } else {
      await loadProposals();
    }

    setActionLoadingId(null);
  };

  const handleCreateContract = async (proposalId: string, jobId: string) => {
    setActionLoadingId(proposalId);
    setError(null);

    const contractResponse = await contractsAPI.createFromProposal(proposalId);
    if (!contractResponse.success) {
      setError(contractResponse.error?.message || 'Failed to create contract');
      setActionLoadingId(null);
      return;
    }

    // Best-effort close job after contract creation to reflect workflow state.
    await jobsAPI.close(jobId);
    await loadProposals();
    setActionLoadingId(null);
  };

  const proposalsByStatus = {
    all: filteredProposals,
    active: filteredProposals.filter(p => ['PENDING', 'ACCEPTED'].includes(p.status)),
    accepted: filteredProposals.filter(p => p.status === 'ACCEPTED'),
    pending: filteredProposals.filter(p => p.status === 'PENDING'),
    archived: filteredProposals.filter(p => ['REJECTED', 'WITHDRAWN'].includes(p.status))
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="border-b border-border bg-background sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {user?.role === 'CLIENT' ? 'Proposals' : 'My Proposals'}
          </h1>
          
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={user?.role === 'CLIENT' ? 'Search by developer...' : 'Search by project...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted border-0"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
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
          <p className="text-muted-foreground">Loading proposals...</p>
        ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({proposalsByStatus.all.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({proposalsByStatus.active.length})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({proposalsByStatus.accepted.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({proposalsByStatus.pending.length})</TabsTrigger>
            <TabsTrigger value="archived">Archived ({proposalsByStatus.archived.length})</TabsTrigger>
          </TabsList>

          {Object.entries(proposalsByStatus).map(([key, items]) => (
            <TabsContent key={key} value={key} className="space-y-4 mt-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No proposals found</p>
                  {user?.role === 'DEV' && (
                    <Button variant="outline" asChild>
                      <a href="/jobs">Browse jobs</a>
                    </Button>
                  )}
                </div>
              ) : (
                items.map((proposal) => (
                  <Card key={proposal.id} className="hover:border-primary transition">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {proposal.jobTitle}
                            </h3>
                            <Badge variant="outline" className={getStatusColor(proposal.status)}>
                              {proposal.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {user?.role === 'CLIENT'
                              ? `Proposed by ${proposal.clientOrDev.name}`
                              : 'Submitted to job owner'}
                          </p>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-2">
                          {getStatusIcon(proposal.status)}
                          <p className="text-2xl font-bold text-foreground">${proposal.amount.toLocaleString()}</p>
                        </div>
                      </div>

                      <p className="text-sm text-foreground line-clamp-2 mb-4">
                        {proposal.coverLetter}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          Submitted {formatDate(proposal.submittedAt)}
                        </p>
                        <div className="flex gap-2">
                          {user?.role === 'CLIENT' && proposal.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(proposal.id, 'REJECTED')}
                                disabled={actionLoadingId === proposal.id}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(proposal.id, 'ACCEPTED')}
                                disabled={actionLoadingId === proposal.id}
                              >
                                Accept
                              </Button>
                            </>
                          )}

                          {user?.role === 'DEV' && proposal.status === 'PENDING' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleWithdraw(proposal.id)}
                              disabled={actionLoadingId === proposal.id}
                            >
                              Withdraw
                            </Button>
                          )}

                          {user?.role === 'CLIENT' && proposal.canCreateContract && (
                            <Button
                              size="sm"
                              onClick={() => handleCreateContract(proposal.id, proposal.jobId)}
                              disabled={actionLoadingId === proposal.id}
                            >
                              Create Contract
                            </Button>
                          )}

                          {actionLoadingId === proposal.id && (
                            <Button size="sm" variant="ghost" disabled>
                              Processing...
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
        )}
      </div>
    </div>
  );
}
