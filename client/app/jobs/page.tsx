'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { jobsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, DollarSign, Clock, ArrowRight, Filter } from 'lucide-react';

interface JobListItem {
  id: string;
  clientId: string;
  title: string;
  description: string;
  budgetMin: string | number;
  budgetMax: string | number;
  deadline: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
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

export default function JobsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const allSkills = ['React', 'TypeScript', 'Node.js', 'Next.js', 'Tailwind CSS', 'PostgreSQL', 'Firebase'];

  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      const response = await jobsAPI.list({
        page: 1,
        limit: 50,
        search: searchQuery || undefined,
        skills: selectedSkills.length > 0 ? selectedSkills.join(',') : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (!response.success) {
        setJobs([]);
        setError(response.error?.message || 'Failed to load jobs');
      } else {
        setJobs(response.data?.items || []);
      }

      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedSkills]);

  const resultsText = useMemo(() => {
    if (isLoading) return 'Loading jobs...';
    return `${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'} found`;
  }, [isLoading, jobs.length]);

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-16 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted border-0"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>

            {user?.role === 'CLIENT' && (
              <Button asChild>
                <Link href="/jobs/create">Post a Job</Link>
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 p-4 border border-border rounded-lg bg-muted/30">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {allSkills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() =>
                        setSelectedSkills((prev) =>
                          prev.includes(skill)
                            ? prev.filter((s) => s !== skill)
                            : [...prev, skill],
                        )
                      }
                      className={`px-3 py-1.5 text-sm rounded-full border transition ${
                        selectedSkills.includes(skill)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error}
          </div>
        )}

        {isLoading ? (
          <p className="text-muted-foreground">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">No jobs found</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedSkills([]);
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{resultsText}</p>

            {jobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card className="hover:border-primary transition cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground leading-snug">{job.title}</h3>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {job.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Budget</p>
                        <p className="font-semibold text-foreground flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {formatCurrency(job.budgetMin)} - {formatCurrency(job.budgetMax)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Deadline</p>
                        <p className="font-semibold text-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(job.deadline)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Posted</p>
                        <p className="font-semibold text-foreground">{formatDate(job.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Client</p>
                        <p className="font-semibold text-foreground">{job.clientId.slice(0, 8)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-4 border-t border-border">
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
