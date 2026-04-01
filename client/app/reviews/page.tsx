'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { contractsAPI, reviewsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, TrendingUp, Award } from 'lucide-react';

interface Review {
  id: string;
  contractId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  jobTitle?: string;
  counterpartyName?: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

const calculateStats = (reviews: Review[]): ReviewStats => {
  const total = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  reviews.forEach(r => {
    distribution[r.rating]++;
  });

  return {
    averageRating: total > 0 ? sum / total : 0,
    totalReviews: total,
    ratingDistribution: distribution
  };
};

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [reviewableContracts, setReviewableContracts] = useState<Array<{ id: string; title: string }>>([]);
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async () => {
    if (!user) {
      setReviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const reviewResponse = await reviewsAPI.getMine({ page: 1, limit: 50, sortOrder: 'desc' });
    if (!reviewResponse.success) {
      setReviews([]);
      setError(reviewResponse.error?.message || 'Failed to load reviews');
      setLoading(false);
      return;
    }

    const baseReviews = (reviewResponse.data?.items || []).map((item: any) => ({
      id: item.id,
      contractId: item.contractId,
      rating: item.rating,
      comment: item.comment,
      createdAt: item.createdAt,
    })) as Review[];

    const enriched = await Promise.all(
      baseReviews.map(async (item) => {
        const contractResponse = await contractsAPI.getById(item.contractId);
        if (!contractResponse.success || !contractResponse.data?.safeContract) {
          return item;
        }

        const safeContract = contractResponse.data.safeContract as any;
        const counterparty =
          user.role === 'DEV'
            ? safeContract.users_contracts_clientIdTousers?.name
            : safeContract.users_contracts_devIdTousers?.name;

        return {
          ...item,
          jobTitle: safeContract.jobs?.title,
          counterpartyName: counterparty,
        } as Review;
      }),
    );

    setReviews(enriched);

    if (user.role === 'CLIENT') {
      const completedContracts = await contractsAPI.getMine({ status: 'COMPLETED', page: 1, limit: 50, sortOrder: 'desc' });
      if (completedContracts.success) {
        const contractItems = completedContracts.data?.items || [];
        const canReview: Array<{ id: string; title: string }> = [];

        for (const contract of contractItems) {
          // eslint-disable-next-line no-await-in-loop
          const existing = await reviewsAPI.getByContract(contract.id);
          if (existing.success && !existing.data?.review) {
            canReview.push({ id: contract.id, title: contract.jobs?.title || contract.id });
          }
        }

        setReviewableContracts(canReview);
        if (canReview.length > 0) {
          setSelectedContractId((prev) => prev || canReview[0].id);
        }
      } else {
        setReviewableContracts([]);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  const stats = useMemo(() => calculateStats(reviews), [reviews]);

  const handleSubmitReview = async () => {
    if (!selectedContractId) {
      setError('Please choose a contract to review.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const response = await reviewsAPI.createForContract(selectedContractId, {
      rating: reviewRating,
      comment: reviewText.trim() || undefined,
    });

    if (!response.success) {
      setError(response.error?.message || 'Failed to submit review');
      setSubmitting(false);
      return;
    }

    setReviewText('');
    setReviewRating(5);
    setShowReviewForm(false);
    setSubmitting(false);
    await loadReviews();
  };

  const StarRating = ({ rating, interactive = false, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => interactive && onChange?.(star)}
          className={`${interactive ? 'cursor-pointer' : 'cursor-default'} transition`}
          type="button"
        >
          <Star
            className={`w-5 h-5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="border-b border-border bg-background sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-foreground">Reviews & Ratings</h1>
            {user?.role === 'DEV' && (
              <div className="text-right">
                <p className="text-3xl font-bold text-foreground">
                  {stats.averageRating.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">
                  ({stats.totalReviews} reviews)
                </p>
              </div>
            )}
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
          <p className="text-muted-foreground">Loading reviews...</p>
        ) : (
          <>
            {user?.role === 'DEV' && (
              <div className="mb-8">
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  {/* Overall Rating */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-5xl font-bold text-foreground mb-2">
                          {stats.averageRating.toFixed(1)}
                        </p>
                        <StarRating rating={Math.round(stats.averageRating)} />
                        <p className="text-sm text-muted-foreground mt-2">
                          Based on {stats.totalReviews} reviews
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rating Distribution */}
                  <Card className="sm:col-span-2">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(rating => {
                          const count = stats.ratingDistribution[rating];
                          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                          return (
                            <div key={rating} className="flex items-center gap-3">
                              <div className="flex gap-1 w-16 shrink-0">
                                {[...Array(rating)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                ))}
                                {[...Array(5 - rating)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 text-muted-foreground" />
                                ))}
                              </div>
                              <div className="flex-1">
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                    className="bg-yellow-400 h-2 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground w-8 text-right">{count}</p>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
          {/* Reviews List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {user?.role === 'DEV' ? 'Reviews I\'ve Received' : 'Reviews I\'ve Given'}
              </h2>
              {user?.role === 'CLIENT' && reviewableContracts.length > 0 && (
                <Button onClick={() => setShowReviewForm(true)}>
                  Write Review
                </Button>
              )}
            </div>

            {reviews.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No reviews yet</p>
                  {user?.role === 'CLIENT' && reviewableContracts.length > 0 && (
                    <Button onClick={() => setShowReviewForm(true)}>
                      Write the first review
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">
                            {(review.counterpartyName || 'U')[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{review.counterpartyName || 'Counterparty'}</p>
                            <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{review.comment || 'No comment provided.'}</p>

                      <Badge variant="outline" className="text-xs">
                        {review.jobTitle || `Contract ${review.contractId.slice(0, 8)}`}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
            {/* Achievements */}
            {user?.role === 'DEV' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0">
                      ⭐
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Top Rated</p>
                      <p className="text-xs text-muted-foreground">Rating above 4.8</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 text-green-500 flex items-center justify-center shrink-0">
                      ✓
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Verified</p>
                      <p className="text-xs text-muted-foreground">Email verified</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review Count Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Reviews</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalReviews}</p>
                </div>
                {user?.role === 'DEV' && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.averageRating.toFixed(1)}/5.0
                    </p>
                  </div>
                )}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/profile">View Full Profile</Link>
                </Button>
              </CardContent>
            </Card>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Review Form Dialog */}
      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience working with this person
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Contract</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedContractId}
                onChange={(e) => setSelectedContractId(e.target.value)}
              >
                {reviewableContracts.map((contract) => (
                  <option key={contract.id} value={contract.id}>
                    {contract.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Rating</label>
              <StarRating
                rating={reviewRating}
                interactive={true}
                onChange={setReviewRating}
              />
            </div>

            {/* Review Text */}
            <div className="space-y-2">
              <label htmlFor="review" className="text-sm font-medium text-foreground">
                Your review
              </label>
              <Textarea
                id="review"
                placeholder="Share your experience. What went well? Any suggestions for improvement?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={6}
                className="bg-muted border-input"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitReview} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
