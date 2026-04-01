'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { contractsAPI, reviewsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Calendar, DollarSign, User, AlertCircle } from 'lucide-react';

interface ContractDetail {
  id: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
  agreedAmount: string | number;
  createdAt: string;
  jobs: {
    id: string;
    title: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  };
  users_contracts_clientIdTousers?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  users_contracts_devIdTousers?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}

interface ContractReview {
  id: string;
  contractId: string;
  devId: string;
  rating: number;
  comment?: string;
  createdAt: string;
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

export default function ContractDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [review, setReview] = useState<ContractReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deliveryNote, setDeliveryNote] = useState('');
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const [reviewReason, setReviewReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);

    const [contractResponse, reviewResponse] = await Promise.all([
      contractsAPI.getById(params.id),
      reviewsAPI.getByContract(params.id),
    ]);

    if (!contractResponse.success || !contractResponse.data?.safeContract) {
      setContract(null);
      setError(contractResponse.error?.message || 'Failed to load contract details');
      setLoading(false);
      return;
    }

    setContract(contractResponse.data.safeContract as ContractDetail);
    if (reviewResponse.success && reviewResponse.data) {
      setReview(reviewResponse.data.review as ContractReview | null);
    } else {
      setReview(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const counterparty = useMemo(() => {
    if (!contract || !user) return null;
    if (user.role === 'DEV') return contract.users_contracts_clientIdTousers;
    return contract.users_contracts_devIdTousers;
  }, [contract, user]);

  const submitDelivery = async () => {
    if (!contract) return;
    if (!deliveryNote.trim()) {
      setError('Delivery note is required.');
      return;
    }

    setActionLoading(true);
    setError(null);
    setActionMessage(null);

    const response = await contractsAPI.submitDelivery(contract.id, {
      deliveryNote: deliveryNote.trim(),
      deliveryUrl: deliveryUrl.trim() || undefined,
    });

    if (!response.success) {
      setError(response.error?.message || 'Failed to submit delivery');
    } else {
      setActionMessage('Delivery submitted successfully.');
      setDeliveryNote('');
      setDeliveryUrl('');
      await loadData();
    }

    setActionLoading(false);
  };

  const reviewDelivery = async (action: 'ACCEPT' | 'DISPUTE') => {
    if (!contract) return;
    if (action === 'DISPUTE' && reviewReason.trim().length < 10) {
      setError('Dispute reason must be at least 10 characters.');
      return;
    }

    setActionLoading(true);
    setError(null);
    setActionMessage(null);

    const response = await contractsAPI.reviewDelivery(contract.id, {
      action,
      reason: action === 'DISPUTE' ? reviewReason.trim() : undefined,
    });

    if (!response.success) {
      setError(response.error?.message || 'Failed to review delivery');
    } else {
      setActionMessage(action === 'ACCEPT' ? 'Delivery accepted.' : 'Dispute opened.');
      setReviewReason('');
      await loadData();
    }

    setActionLoading(false);
  };

  const submitReview = async () => {
    if (!contract) return;
    setActionLoading(true);
    setError(null);
    setActionMessage(null);

    const response = await reviewsAPI.createForContract(contract.id, {
      rating,
      comment: reviewComment.trim() || undefined,
    });

    if (!response.success) {
      setError(response.error?.message || 'Failed to submit review');
    } else {
      setActionMessage('Review submitted successfully.');
      setReviewComment('');
      setRating(5);
      await loadData();
    }

    setActionLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-info/20 text-info border-info/30';
      case 'COMPLETED': return 'bg-success/20 text-success border-success/30';
      case 'DISPUTED': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'CANCELLED': return 'bg-warning/20 text-warning border-warning/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-muted-foreground">Loading contract details...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error || 'Contract not found'}
          </div>
          <Button variant="outline" asChild>
            <Link href="/contracts">Back to contracts</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="border-b border-border bg-background sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/contracts" className="flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to contracts
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{contract.jobs.title}</h1>
              <p className="text-muted-foreground mt-1">
                Contract ID: {contract.id.slice(0, 8)}
              </p>
            </div>
            <Badge variant="outline" className="bg-info/20 text-info border-info/30">
              {contract.status}
            </Badge>
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

        {actionMessage && (
          <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20 text-sm text-success">
            {actionMessage}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(contract.agreedAmount)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <p className="text-sm text-muted-foreground">Created At</p>
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {formatDate(contract.createdAt)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Contract Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Job status</p>
                  <p className="text-sm font-medium text-foreground">{contract.jobs.status}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Contract status</p>
                  <Badge variant="outline" className={getStatusColor(contract.status)}>
                    {contract.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Actions</CardTitle>
                <CardDescription>
                  These actions call the backend contract workflow directly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user?.role === 'DEV' && contract.status === 'ACTIVE' && (
                  <div className="space-y-3 p-4 border border-border rounded-lg">
                    <p className="text-sm font-medium text-foreground">Submit delivery</p>
                    <Textarea
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      placeholder="Describe what was delivered"
                      rows={4}
                    />
                    <Input
                      value={deliveryUrl}
                      onChange={(e) => setDeliveryUrl(e.target.value)}
                      placeholder="Optional URL (e.g. GitHub, Drive, demo)"
                    />
                    <Button onClick={submitDelivery} disabled={actionLoading}>
                      {actionLoading ? 'Submitting...' : 'Submit Delivery'}
                    </Button>
                  </div>
                )}

                {user?.role === 'CLIENT' && contract.status === 'ACTIVE' && (
                  <div className="space-y-3 p-4 border border-border rounded-lg">
                    <p className="text-sm font-medium text-foreground">Review delivery</p>
                    <Textarea
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      placeholder="Reason required for dispute (min 10 chars)"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => reviewDelivery('ACCEPT')} disabled={actionLoading}>
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => reviewDelivery('DISPUTE')}
                        disabled={actionLoading}
                      >
                        Dispute
                      </Button>
                    </div>
                  </div>
                )}

                {user?.role === 'CLIENT' && contract.status === 'COMPLETED' && !review && (
                  <div className="space-y-3 p-4 border border-border rounded-lg">
                    <p className="text-sm font-medium text-foreground">Leave a review</p>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                    />
                    <Textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Optional comment"
                      rows={3}
                    />
                    <Button onClick={submitReview} disabled={actionLoading}>
                      {actionLoading ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                )}

                {user?.role === 'CLIENT' && contract.status === 'COMPLETED' && review && (
                  <p className="text-sm text-muted-foreground">You already submitted a review for this contract.</p>
                )}

                {contract.status === 'DISPUTED' && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    This contract is in disputed state. Resolve dispute in backend workflow before release.
                  </div>
                )}

                {contract.status === 'CANCELLED' && (
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm text-warning">
                    This contract is cancelled.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Review</CardTitle>
              </CardHeader>
              <CardContent>
                {review ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Rating: {review.rating}/5</p>
                    <p className="text-sm text-muted-foreground">{review.comment || 'No comment'}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No review for this contract yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {user?.role === 'DEV' ? 'Client' : 'Developer'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center">
                    {counterparty?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{counterparty?.name || 'Unknown user'}</p>
                    <p className="text-sm text-muted-foreground">ID: {counterparty?.id?.slice(0, 8) || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>
                      This page uses available backend fields only. Detailed milestones/payment timeline are not exposed by current API.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
