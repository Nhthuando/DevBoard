import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Briefcase, ChevronRight, DollarSign, Search } from 'lucide-react'
import { listJobs } from '@/services/jobsService'
import { getApiErrorMessage } from '@/lib/api-error'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/context/auth-context'

const initialFilters = {
  search: '',
  skills: '',
  budgetMin: '',
  budgetMax: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
}

function BudgetText({ min, max }) {
  return <span>{`${formatCurrency(min)} - ${formatCurrency(max)}`}</span>
}

export default function JobsPage() {
  const { role, isAuthenticated } = useAuth()
  const [filters, setFilters] = useState(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [jobs, setJobs] = useState([])
  const [pagination, setPagination] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const canCreateJob = isAuthenticated && role === 'CLIENT'

  const queryParams = useMemo(
    () => ({
      ...filters,
      page: currentPage,
      limit: 8,
    }),
    [currentPage, filters],
  )

  const fetchJobs = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await listJobs(queryParams)
      setJobs(response?.items || [])
      setPagination(response?.pagination || null)
    } catch (error) {
      setJobs([])
      setPagination(null)
      setErrorMessage(getApiErrorMessage(error, 'Could not load jobs.'))
    } finally {
      setIsLoading(false)
    }
  }, [queryParams])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  function handleFilterChange(key, value) {
    setCurrentPage(1)
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function clearFilters() {
    setCurrentPage(1)
    setFilters(initialFilters)
  }

  function goToPage(page) {
    if (!pagination) return
    if (page < 1 || page > pagination.totalPages) return
    setCurrentPage(page)
  }

  return (
    <div className="page-enter min-h-screen bg-background">
      <div className="border-b border-border/40 bg-card/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Browse Jobs</h1>
              <p className="text-foreground/70">Live data from backend /api/jobs/listJobs</p>
            </div>
            {canCreateJob ? (
              <Button asChild>
                <Link to="/jobs/new">Post A Job</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="p-6 border-border/50 bg-card h-fit sticky top-24 space-y-4">
              <h2 className="font-semibold text-foreground">Filters</h2>

              <div>
                <label className="text-sm font-medium text-foreground/70 block mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                  <Input
                    placeholder="Search title or description"
                    className="pl-10 bg-background/50"
                    value={filters.search}
                    onChange={(event) => handleFilterChange('search', event.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground/70 block mb-2">Skills</label>
                <Input
                  placeholder="React, Node"
                  className="bg-background/50"
                  value={filters.skills}
                  onChange={(event) => handleFilterChange('skills', event.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground/70 block mb-2">Min</label>
                  <Input
                    type="number"
                    min="0"
                    className="bg-background/50"
                    value={filters.budgetMin}
                    onChange={(event) => handleFilterChange('budgetMin', event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 block mb-2">Max</label>
                  <Input
                    type="number"
                    min="0"
                    className="bg-background/50"
                    value={filters.budgetMax}
                    onChange={(event) => handleFilterChange('budgetMax', event.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground/70 block mb-2">Sort By</label>
                <select
                  className="w-full rounded-md border border-border/50 bg-background/50 h-10 px-3 text-sm"
                  value={filters.sortBy}
                  onChange={(event) => handleFilterChange('sortBy', event.target.value)}
                >
                  <option value="createdAt">Created At</option>
                  <option value="budgetMin">Budget Min</option>
                  <option value="deadline">Deadline</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground/70 block mb-2">Order</label>
                <select
                  className="w-full rounded-md border border-border/50 bg-background/50 h-10 px-3 text-sm"
                  value={filters.sortOrder}
                  onChange={(event) => handleFilterChange('sortOrder', event.target.value)}
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>

              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {errorMessage ? (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Load jobs failed</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            {isLoading ? (
              <Card className="p-8 border-border/50 bg-card flex items-center gap-2 text-foreground/70">
                <Spinner /> Loading jobs...
              </Card>
            ) : (
              <div className="space-y-4">
                {jobs.length === 0 ? (
                  <Card className="p-8 border-border/50 bg-card">
                    <p className="text-foreground/70">No jobs matched your filters.</p>
                  </Card>
                ) : (
                  jobs.map((job) => (
                    <Link key={job.id} to={`/jobs/${job.id}`}>
                      <Card className="job-card p-6 border-border/50 bg-card hover:bg-card/80 cursor-pointer transition group">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-6 h-6 text-primary" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition truncate">
                              {job.title}
                            </h3>
                            <p className="text-sm text-foreground/70 mb-2">Client ID: {job.clientId}</p>
                            <p className="text-foreground/60 text-sm mb-4 line-clamp-2">{job.description}</p>

                            <div className="flex flex-wrap gap-2 mb-4">
                              <Badge variant="secondary">{job.status}</Badge>
                              <Badge variant="secondary">Deadline: {formatDate(job.deadline)}</Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/70">
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span className="font-semibold text-foreground">
                                  <BudgetText min={job.budgetMin} max={job.budgetMax} />
                                </span>
                              </div>
                              <div className="text-xs text-foreground/50">Posted: {formatDate(job.createdAt)}</div>
                            </div>
                          </div>

                          <ChevronRight className="w-5 h-5 text-foreground/30 group-hover:text-primary transition flex-shrink-0" />
                        </div>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            )}

            {pagination ? (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <Button variant="outline" disabled={pagination.page <= 1} onClick={() => goToPage(pagination.page - 1)}>
                  Previous
                </Button>
                <Badge variant="outline" className="px-3 py-2">
                  Page {pagination.page} / {pagination.totalPages || 1}
                </Badge>
                <Button
                  variant="outline"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => goToPage(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
