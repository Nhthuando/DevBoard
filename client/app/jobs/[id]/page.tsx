'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { jobsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { DollarSign, Clock, User, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

interface JobDetail {
  id: string;
  clientId: string;
  title: string;
  description: string;
  budgetMin: string | number;
  budgetMax: string | number;
  deadline: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  users?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  skillsArray?: string[];
}

function toNumber(value: string | number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: string | number): string {
  return `$${toNumber(value).toLocaleString()}`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalText, setProposalText] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true);
      setError(null);

      const response = await jobsAPI.getById(params.id);
      if (!response.success || !response.data) {
        setJob(null);
        setError(response.error?.message || 'Failed to load job details');
      } else {
        setJob(response.data as JobDetail);
      }

      setIsLoading(false);
    };

    fetchJob();
  }, [params.id]);

  const handleSubmitProposal = async () => {
    if (!proposalText.trim()) {
      setSubmitError('Please enter your proposal.');
      return;
    }

    if (proposalText.trim().length < 50) {
      setSubmitError('Proposal must be at least 50 characters.');
      return;
    }

    const amount = Number(bidAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setSubmitError('Please enter a valid bid amount.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitMessage(null);

    const response = await jobsAPI.apply(params.id, {
      coverLetter: proposalText.trim(),
      bidAmount: amount,
    });

    if (!response.success) {
      setSubmitError(response.error?.message || 'Failed to submit proposal.');
    } else {
      setSubmitMessage('Proposal submitted successfully.');
      setProposalText('');
      setBidAmount('');
      setShowProposalForm(false);
    }

    setSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error || 'Job not found'}
          </div>
          <Button variant="outline" asChild>
            <Link href="/jobs">Back to jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="border-b border-border bg-background sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/jobs" className="flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to jobs
          </Link>
          <h1 className="text-3xl font-bold text-foreground">{job.title}</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error}
          </div>
        )}

        {submitMessage && (
          <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20 text-sm text-success">
            {submitMessage}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Budget</p>
                <p className="font-bold text-foreground flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {formatCurrency(job.budgetMin)} - {formatCurrency(job.budgetMax)}
                </p>
                <p className="text-xs text-muted-foreground">Fixed price</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Deadline</p>
                <p className="font-bold text-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(job.deadline)}
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Status</p>
                <p className="font-bold text-foreground">{job.status}</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Posted</p>
                <p className="font-bold text-foreground">{formatDate(job.createdAt)}</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>About this job</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{job.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Required skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(job.skillsArray || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No skills listed.</p>
                  ) : (
                    job.skillsArray?.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {user?.role === 'DEV' && (
              <Button
                size="lg"
                className="w-full"
                onClick={() => setShowProposalForm(!showProposalForm)}
              >
                Send Proposal
              </Button>
            )}

            {user?.role === 'CLIENT' && (
              <Button size="lg" variant="outline" className="w-full" asChild>
                <Link href="/proposals">View Proposals</Link>
              </Button>
            )}

            {!user && (
              <Button size="lg" className="w-full" asChild>
                <Link href="/signup">Sign up to apply</Link>
              </Button>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About the client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center">
                    {job.users?.name?.[0]?.toUpperCase() || 'C'}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{job.users?.name || 'Client'}</p>
                    <p className="text-sm text-muted-foreground">ID: {job.clientId.slice(0, 8)}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Posted on</p>
                    <p className="text-sm font-medium text-foreground">{formatDate(job.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Application deadline</p>
                    <p className="text-sm text-muted-foreground">{formatDate(job.deadline)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {showProposalForm && user?.role === 'DEV' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Send your proposal</CardTitle>
                <CardDescription>Tell the client why you are a good fit for this project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {submitError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    {submitError}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="bidAmount" className="text-sm font-medium text-foreground">
                    Bid amount (USD)
                  </label>
                  <Input
                    id="bidAmount"
                    type="number"
                    placeholder="2500"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="bg-muted border-input"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="proposal" className="text-sm font-medium text-foreground">
                    Your proposal
                  </label>
                  <Textarea
                    id="proposal"
                    placeholder="Describe your relevant experience, implementation plan, timeline, and key deliverables..."
                    value={proposalText}
                    onChange={(e) => setProposalText(e.target.value)}
                    rows={8}
                    className="bg-muted border-input"
                  />
                  <p className="text-xs text-muted-foreground">Minimum 50 characters.</p>
                </div>

                <div className="p-3 rounded-lg bg-success/10 border border-success/20 flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                  <p className="text-sm text-foreground">
                    After submission, you can manage pending proposals from the proposals page.
                  </p>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setShowProposalForm(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitProposal} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit proposal'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
