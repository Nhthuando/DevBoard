import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { ChevronLeft, DollarSign, FileText, Star } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { getApiErrorMessage } from '@/lib/api-error'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/formatters'
import { applyJob, getJobDetail, getJobProposals, closeJob } from '@/services/jobsService'
import { createContractFromProposal } from '@/services/contractsService'
import { getProposalAttachments, updateProposalStatus } from '@/services/proposalsService'
import { getDevReviews } from '@/services/reviewsService'

function BudgetRange({ min, max }) {
  return (
    <span>
      {formatCurrency(min)} - {formatCurrency(max)}
    </span>
  )
}

export default function JobDetailPage() {
  const { id: jobId } = useParams()
  const navigate = useNavigate()
  const { user, role, isAuthenticated } = useAuth()

  const [job, setJob] = useState(null)
  const [isLoadingJob, setIsLoadingJob] = useState(true)
  const [jobError, setJobError] = useState('')

  const [coverLetter, setCoverLetter] = useState('')
  const [bidAmount, setBidAmount] = useState('')
  const [applyError, setApplyError] = useState('')
  const [applySuccess, setApplySuccess] = useState('')
  const [isApplying, setIsApplying] = useState(false)

  const [proposals, setProposals] = useState([])
  const [proposalsError, setProposalsError] = useState('')
  const [isLoadingProposals, setIsLoadingProposals] = useState(false)
  const [proposalActionId, setProposalActionId] = useState('')

  const [attachmentsByProposal, setAttachmentsByProposal] = useState({})
  const [loadingAttachmentFor, setLoadingAttachmentFor] = useState('')

  const [reviewSummaryByDev, setReviewSummaryByDev] = useState({})
  const [reviewLoadingFor, setReviewLoadingFor] = useState('')

  const [createContractFor, setCreateContractFor] = useState('')
  const [isClosingJob, setIsClosingJob] = useState(false)

  const isOwnerClient = useMemo(() => {
    if (!job || !user) return false
    return role === 'CLIENT' && user.id === job.clientId
  }, [job, role, user])

  const fetchJob = useCallback(async () => {
    if (!jobId) return

    setIsLoadingJob(true)
    setJobError('')

    try {
      const response = await getJobDetail(jobId)
      setJob(response)
    } catch (error) {
      setJob(null)
      setJobError(getApiErrorMessage(error, 'Could not load job detail.'))
    } finally {
      setIsLoadingJob(false)
    }
  }, [jobId])

  const fetchProposals = useCallback(async () => {
    if (!jobId) return

    setIsLoadingProposals(true)
    setProposalsError('')

    try {
      const response = await getJobProposals(jobId)
      setProposals(response?.proposals || [])
    } catch (error) {
      const message = getApiErrorMessage(error, 'Could not load proposals for this job.')
      if (error?.status === 404) {
        setProposals([])
        setProposalsError('No proposals yet.')
      } else {
        setProposalsError(message)
      }
    } finally {
      setIsLoadingProposals(false)
    }
  }, [jobId])

  useEffect(() => {
    fetchJob()
  }, [fetchJob])

  useEffect(() => {
    if (isOwnerClient) {
      fetchProposals()
    }
  }, [fetchProposals, isOwnerClient])

  async function handleApply(event) {
    event.preventDefault()
    setApplyError('')
    setApplySuccess('')

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/jobs/${jobId}` } })
      return
    }

    setIsApplying(true)

    try {
      await applyJob(jobId, {
        coverLetter,
        bidAmount: Number(bidAmount),
      })
      setApplySuccess('Proposal sent successfully.')
      setCoverLetter('')
      setBidAmount('')
    } catch (error) {
      setApplyError(getApiErrorMessage(error, 'Could not send proposal.'))
    } finally {
      setIsApplying(false)
    }
  }

  async function handleUpdateProposalStatus(proposalId, status) {
    setProposalsError('')
    setProposalActionId(`${proposalId}-${status}`)

    try {
      await updateProposalStatus(proposalId, status)
      await fetchProposals()
    } catch (error) {
      setProposalsError(getApiErrorMessage(error, 'Could not update proposal status.'))
    } finally {
      setProposalActionId('')
    }
  }

  async function handleCreateContract(proposalId) {
    setProposalsError('')
    setCreateContractFor(proposalId)

    try {
      await createContractFromProposal(proposalId)
      await fetchProposals()
    } catch (error) {
      setProposalsError(getApiErrorMessage(error, 'Could not create contract.'))
    } finally {
      setCreateContractFor('')
    }
  }

  async function handleCloseJob() {
    if (!jobId) return

    setProposalsError('')
    setIsClosingJob(true)

    try {
      await closeJob(jobId)
      navigate('/dashboard')
    } catch (error) {
      setProposalsError(getApiErrorMessage(error, 'Could not move job to IN_PROGRESS.'))
    } finally {
      setIsClosingJob(false)
    }
  }

  async function handleLoadAttachments(proposalId) {
    setLoadingAttachmentFor(proposalId)

    try {
      const response = await getProposalAttachments(proposalId, {
        page: 1,
        limit: 10,
        sortOrder: 'desc',
      })

      setAttachmentsByProposal((prev) => ({
        ...prev,
        [proposalId]: response?.items || [],
      }))
    } catch (error) {
      setAttachmentsByProposal((prev) => ({
        ...prev,
        [proposalId]: [{ id: 'error', fileName: getApiErrorMessage(error, 'Could not load attachments.') }],
      }))
    } finally {
      setLoadingAttachmentFor('')
    }
  }

  async function handleLoadDevReviews(devId) {
    setReviewLoadingFor(devId)

    try {
      const response = await getDevReviews(devId, {
        page: 1,
        limit: 5,
        sortOrder: 'desc',
      })

      setReviewSummaryByDev((prev) => ({
        ...prev,
        [devId]: {
          summary: response?.summary || null,
          items: response?.items || [],
        },
      }))
    } catch (error) {
      setReviewSummaryByDev((prev) => ({
        ...prev,
        [devId]: { error: getApiErrorMessage(error, 'Could not load developer reviews.') },
      }))
    } finally {
      setReviewLoadingFor('')
    }
  }

  if (isLoadingJob) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="page-enter min-h-screen bg-background p-4">
        <div className="max-w-3xl mx-auto pt-10">
          <Alert variant="destructive">
            <AlertTitle>Job unavailable</AlertTitle>
            <AlertDescription>{jobError || 'Job not found or no longer OPEN.'}</AlertDescription>
          </Alert>
          <Button className="mt-4" asChild>
            <Link to="/jobs">Back to Jobs</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter min-h-screen bg-background">
      <div className="border-b border-border/40 bg-card/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary hover:text-primary/80 transition mb-4">
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <h1 className="text-3xl font-bold text-foreground">{job.title}</h1>
          <p className="text-foreground/70 mt-2">Posted {formatDate(job.createdAt)}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-border/50 bg-card">
            <h2 className="font-semibold text-lg text-foreground mb-4">Job Details</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-foreground/70 mb-1">Budget</p>
                <p className="text-xl font-bold text-foreground flex items-center gap-1">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <BudgetRange min={job.budgetMin} max={job.budgetMax} />
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/70 mb-1">Deadline</p>
                <p className="text-xl font-bold text-foreground">{formatDate(job.deadline)}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/70 mb-1">Status</p>
                <Badge>{job.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-foreground/70 mb-1">Client</p>
                <p className="font-medium text-foreground">{job.users?.name || job.clientId}</p>
              </div>
            </div>

            <p className="text-foreground/70 leading-relaxed mb-4">{job.description}</p>

            <div className="flex flex-wrap gap-2">
              {(job.skillsArray || []).map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>

          {role === 'DEV' ? (
            <Card className="p-6 border-border/50 bg-card">
              <h2 className="font-semibold text-lg text-foreground mb-4">Submit Proposal</h2>

              <form onSubmit={handleApply} className="space-y-4">
                {applyError ? (
                  <Alert variant="destructive">
                    <AlertTitle>Apply failed</AlertTitle>
                    <AlertDescription>{applyError}</AlertDescription>
                  </Alert>
                ) : null}

                {applySuccess ? (
                  <Alert>
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{applySuccess}</AlertDescription>
                  </Alert>
                ) : null}

                <div>
                  <Label htmlFor="coverLetter">Cover Letter</Label>
                  <Textarea
                    id="coverLetter"
                    className="mt-2 min-h-32"
                    value={coverLetter}
                    onChange={(event) => setCoverLetter(event.target.value)}
                    placeholder="At least 50 characters"
                  />
                </div>

                <div>
                  <Label htmlFor="bidAmount">Bid Amount (USD)</Label>
                  <Input
                    id="bidAmount"
                    type="number"
                    min="1"
                    className="mt-2"
                    value={bidAmount}
                    onChange={(event) => setBidAmount(event.target.value)}
                  />
                </div>

                <Button type="submit" disabled={isApplying} className="bg-primary hover:bg-primary/90 text-white">
                  {isApplying ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner /> Sending...
                    </span>
                  ) : (
                    'Submit Proposal'
                  )}
                </Button>
              </form>
            </Card>
          ) : null}

          {isOwnerClient ? (
            <Card className="p-6 border-border/50 bg-card">
              <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
                <h2 className="font-semibold text-lg text-foreground">Proposals ({proposals.length})</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={fetchProposals} disabled={isLoadingProposals}>
                    {isLoadingProposals ? <Spinner /> : 'Refresh'}
                  </Button>
                  <Button onClick={handleCloseJob} disabled={isClosingJob}>
                    {isClosingJob ? <Spinner /> : 'Move Job To IN_PROGRESS'}
                  </Button>
                </div>
              </div>

              {proposalsError ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Proposal operation</AlertTitle>
                  <AlertDescription>{proposalsError}</AlertDescription>
                </Alert>
              ) : null}

              {isLoadingProposals ? (
                <div className="flex items-center gap-2 text-foreground/70">
                  <Spinner /> Loading proposals...
                </div>
              ) : null}

              <div className="space-y-4">
                {proposals.map((proposal) => {
                  const devId = proposal.users?.id
                  const reviewData = devId ? reviewSummaryByDev[devId] : null
                  const attachmentItems = attachmentsByProposal[proposal.id] || null

                  return (
                    <Card key={proposal.id} className="p-4 border-border/50 bg-background/30">
                      <div className="flex flex-wrap gap-2 items-center justify-between mb-2">
                        <p className="font-semibold text-foreground">{proposal.users?.name || proposal.users?.id}</p>
                        <Badge>{proposal.status}</Badge>
                      </div>

                      <p className="text-sm text-foreground/70 mb-2">
                        Bid: {formatCurrency(proposal.bidAmount)} | Submitted: {formatDate(proposal.createdAt)}
                      </p>

                      <p className="text-sm text-foreground/70 mb-3 whitespace-pre-wrap">{proposal.coverLetter}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Button
                          size="sm"
                          disabled={proposalActionId === `${proposal.id}-ACCEPTED`}
                          onClick={() => handleUpdateProposalStatus(proposal.id, 'ACCEPTED')}
                        >
                          {proposalActionId === `${proposal.id}-ACCEPTED` ? <Spinner /> : 'Accept'}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={proposalActionId === `${proposal.id}-REJECTED`}
                          onClick={() => handleUpdateProposalStatus(proposal.id, 'REJECTED')}
                        >
                          {proposalActionId === `${proposal.id}-REJECTED` ? <Spinner /> : 'Reject'}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={createContractFor === proposal.id}
                          onClick={() => handleCreateContract(proposal.id)}
                        >
                          {createContractFor === proposal.id ? <Spinner /> : 'Create Contract'}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={loadingAttachmentFor === proposal.id}
                          onClick={() => handleLoadAttachments(proposal.id)}
                        >
                          {loadingAttachmentFor === proposal.id ? <Spinner /> : 'Load Attachments'}
                        </Button>

                        {devId ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={reviewLoadingFor === devId}
                            onClick={() => handleLoadDevReviews(devId)}
                          >
                            {reviewLoadingFor === devId ? <Spinner /> : 'Load Dev Reviews'}
                          </Button>
                        ) : null}
                      </div>

                      {attachmentItems ? (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-foreground/70 mb-1">Attachments</p>
                          {attachmentItems.length === 0 ? (
                            <p className="text-xs text-foreground/60">No attachments.</p>
                          ) : (
                            <div className="space-y-1">
                              {attachmentItems.map((item) => (
                                <div key={item.id} className="text-xs text-foreground/70 flex flex-wrap items-center gap-2">
                                  <FileText className="w-3.5 h-3.5" />
                                  {item.fileUrl ? (
                                    <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                      {item.fileName || item.id}
                                    </a>
                                  ) : (
                                    <span>{item.fileName || item.id}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : null}

                      {reviewData ? (
                        <div>
                          {reviewData.error ? (
                            <p className="text-xs text-destructive">{reviewData.error}</p>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-xs text-foreground/70 inline-flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-yellow-500" />
                                Avg rating: {reviewData.summary?.avgRating ?? 0} ({reviewData.summary?.totalReviews ?? 0} reviews)
                              </p>
                              {(reviewData.items || []).slice(0, 3).map((item) => (
                                <p key={item.id} className="text-xs text-foreground/60">
                                  {formatDateTime(item.createdAt)} - {item.rating}/5 {item.comment ? `- ${item.comment}` : ''}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </Card>
                  )
                })}

                {!isLoadingProposals && proposals.length === 0 ? (
                  <p className="text-sm text-foreground/70">No proposals yet.</p>
                ) : null}
              </div>
            </Card>
          ) : null}
        </div>

        <div className="lg:col-span-1 space-y-4">
          <Card className="p-5 border-border/50 bg-card">
            <h3 className="font-semibold text-foreground mb-3">Quick Actions</h3>
            <div className="grid gap-2">
              <Button asChild variant="outline">
                <Link to="/jobs">Browse More Jobs</Link>
              </Button>
              {role === 'CLIENT' ? (
                <Button asChild>
                  <Link to="/jobs/new">Post A New Job</Link>
                </Button>
              ) : null}
              {isAuthenticated ? (
                <Button asChild variant="outline">
                  <Link to="/dashboard">Open Dashboard</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/login">Login To Continue</Link>
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-5 border-border/50 bg-card">
            <h3 className="font-semibold text-foreground mb-3">Meta</h3>
            <p className="text-sm text-foreground/70">Job ID: {job.id}</p>
            <p className="text-sm text-foreground/70">Client ID: {job.clientId}</p>
            <p className="text-sm text-foreground/70">Created: {formatDateTime(job.createdAt)}</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
