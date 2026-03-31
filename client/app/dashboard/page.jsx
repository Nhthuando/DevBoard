import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Spinner } from '@/components/ui/spinner'
import { Bell, Code, DollarSign, FileText, LogOut, Star } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { getApiErrorMessage } from '@/lib/api-error'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/formatters'
import { getMyDevProposals, withdrawProposal, getProposalAttachments, uploadProposalAttachment, deleteProposalAttachment } from '@/services/proposalsService'
import { getMyContracts, getContractDetail, submitDelivery, reviewDelivery } from '@/services/contractsService'
import { createPayment, checkoutPayment, getPaymentLogs, releasePayment } from '@/services/paymentsService'
import { createReview, getContractReview, getDevReviews, getMyReviews } from '@/services/reviewsService'
import { getMyNotifications, markNotificationAsRead } from '@/services/notificationsService'

function SectionError({ message }) {
  if (!message) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle>Action failed</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

export default function DashboardPage() {
  const { user, role, logout } = useAuth()

  const [contracts, setContracts] = useState([])
  const [contractsLoading, setContractsLoading] = useState(true)
  const [contractsError, setContractsError] = useState('')

  const [selectedContractId, setSelectedContractId] = useState('')
  const [contractDetail, setContractDetail] = useState(null)
  const [contractDetailLoading, setContractDetailLoading] = useState(false)
  const [contractDetailError, setContractDetailError] = useState('')

  const [deliveryNote, setDeliveryNote] = useState('')
  const [deliveryUrl, setDeliveryUrl] = useState('')
  const [submitDeliveryLoading, setSubmitDeliveryLoading] = useState(false)

  const [reviewAction, setReviewAction] = useState('ACCEPT')
  const [reviewReason, setReviewReason] = useState('')
  const [reviewDeliveryLoading, setReviewDeliveryLoading] = useState(false)

  const [contractReview, setContractReview] = useState(null)
  const [contractReviewLoading, setContractReviewLoading] = useState(false)

  const [paymentContractId, setPaymentContractId] = useState('')
  const [paymentId, setPaymentId] = useState('')
  const [paymentActionLoading, setPaymentActionLoading] = useState('')
  const [paymentLogs, setPaymentLogs] = useState([])
  const [paymentLogsLoading, setPaymentLogsLoading] = useState(false)
  const [paymentMessage, setPaymentMessage] = useState('')

  const [devProposals, setDevProposals] = useState([])
  const [devProposalsLoading, setDevProposalsLoading] = useState(false)
  const [devProposalStatus, setDevProposalStatus] = useState('')
  const [proposalActionId, setProposalActionId] = useState('')

  const [attachmentProposalId, setAttachmentProposalId] = useState('')
  const [attachments, setAttachments] = useState([])
  const [attachmentsLoading, setAttachmentsLoading] = useState(false)
  const [uploadingAttachment, setUploadingAttachment] = useState(false)
  const [deletingAttachmentId, setDeletingAttachmentId] = useState('')
  const [selectedAttachmentFile, setSelectedAttachmentFile] = useState(null)

  const [myReviews, setMyReviews] = useState([])
  const [myReviewsLoading, setMyReviewsLoading] = useState(false)
  const [createReviewContractId, setCreateReviewContractId] = useState('')
  const [createReviewRating, setCreateReviewRating] = useState('5')
  const [createReviewComment, setCreateReviewComment] = useState('')
  const [createReviewLoading, setCreateReviewLoading] = useState(false)

  const [devReviewTargetId, setDevReviewTargetId] = useState('')
  const [devReviewsData, setDevReviewsData] = useState(null)
  const [devReviewsLoading, setDevReviewsLoading] = useState(false)

  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [markingNotificationId, setMarkingNotificationId] = useState('')

  const [sectionError, setSectionError] = useState('')
  const [sectionSuccess, setSectionSuccess] = useState('')

  const isClient = role === 'CLIENT'
  const isDev = role === 'DEV'

  const activeContractsCount = useMemo(
    () => contracts.filter((item) => item.status === 'ACTIVE').length,
    [contracts],
  )

  function handleResetMessage() {
    setSectionError('')
    setSectionSuccess('')
  }

  async function fetchContracts() {
    setContractsLoading(true)
    setContractsError('')

    try {
      const response = await getMyContracts({ page: 1, limit: 20, sortOrder: 'desc' })
      const items = response?.items || []
      setContracts(items)

      if (items.length > 0) {
        setSelectedContractId((prev) => prev || items[0].id)
      }
    } catch (error) {
      setContracts([])
      setContractsError(getApiErrorMessage(error, 'Could not load contracts.'))
    } finally {
      setContractsLoading(false)
    }
  }

  async function fetchContractDetail(contractId) {
    if (!contractId) return

    setContractDetailLoading(true)
    setContractDetailError('')

    try {
      const response = await getContractDetail(contractId)
      setContractDetail(response?.safeContract || null)
    } catch (error) {
      setContractDetail(null)
      setContractDetailError(getApiErrorMessage(error, 'Could not load contract detail.'))
    } finally {
      setContractDetailLoading(false)
    }
  }

  async function fetchDevProposals() {
    if (!isDev) return

    setDevProposalsLoading(true)

    try {
      const response = await getMyDevProposals({
        page: 1,
        limit: 20,
        sortOrder: 'desc',
        status: devProposalStatus || undefined,
      })
      const items = response?.items || []
      setDevProposals(items)
      setAttachmentProposalId((prev) => prev || items[0]?.id || '')
    } catch (error) {
      setDevProposals([])
      setSectionError(getApiErrorMessage(error, 'Could not load your proposals.'))
    } finally {
      setDevProposalsLoading(false)
    }
  }

  async function fetchAttachments(proposalId) {
    if (!proposalId) return

    setAttachmentsLoading(true)

    try {
      const response = await getProposalAttachments(proposalId, { page: 1, limit: 20, sortOrder: 'desc' })
      setAttachments(response?.items || [])
    } catch (error) {
      setAttachments([])
      setSectionError(getApiErrorMessage(error, 'Could not load attachments.'))
    } finally {
      setAttachmentsLoading(false)
    }
  }

  async function fetchNotifications() {
    setNotificationsLoading(true)

    try {
      const response = await getMyNotifications({ page: 1, limit: 50, sortOrder: 'desc' })
      setNotifications(response?.items || [])
    } catch (error) {
      setNotifications([])
      setSectionError(getApiErrorMessage(error, 'Could not load notifications.'))
    } finally {
      setNotificationsLoading(false)
    }
  }

  async function fetchMyReviews() {
    setMyReviewsLoading(true)

    try {
      const response = await getMyReviews({ page: 1, limit: 20, sortOrder: 'desc' })
      setMyReviews(response?.items || [])
    } catch (error) {
      setMyReviews([])
      setSectionError(getApiErrorMessage(error, 'Could not load reviews.'))
    } finally {
      setMyReviewsLoading(false)
    }
  }

  useEffect(() => {
    fetchContracts()
    fetchNotifications()
    fetchMyReviews()
  }, [])

  useEffect(() => {
    if (isDev) {
      fetchDevProposals()
    }
  }, [devProposalStatus, isDev])

  useEffect(() => {
    if (isClient && contracts.length > 0) {
      setPaymentContractId((prev) => prev || contracts[0].id)
      setCreateReviewContractId((prev) => prev || contracts[0].id)
    }

    if (isDev && user?.id) {
      setDevReviewTargetId((prev) => prev || user.id)
    }
  }, [contracts, isClient, isDev, user])

  async function handleWithdrawProposal(proposalId) {
    handleResetMessage()
    setProposalActionId(proposalId)

    try {
      await withdrawProposal(proposalId)
      setSectionSuccess('Proposal has been withdrawn.')
      await fetchDevProposals()
    } catch (error) {
      setSectionError(getApiErrorMessage(error, 'Could not withdraw proposal.'))
    } finally {
      setProposalActionId('')
    }
  }

  async function handleUploadAttachment() {
    handleResetMessage()

    if (!attachmentProposalId || !selectedAttachmentFile) {
      setSectionError('Please choose proposal and file before uploading.')
      return
    }

    setUploadingAttachment(true)

    try {
      await uploadProposalAttachment(attachmentProposalId, selectedAttachmentFile)
      setSectionSuccess('Attachment uploaded.')
      setSelectedAttachmentFile(null)
      await fetchAttachments(attachmentProposalId)
    } catch (error) {
      setSectionError(getApiErrorMessage(error, 'Could not upload attachment.'))
    } finally {
      setUploadingAttachment(false)
    }
  }

  async function handleDeleteAttachment(attachmentId) {
    handleResetMessage()
    setDeletingAttachmentId(attachmentId)

    try {
      await deleteProposalAttachment(attachmentId)
      setSectionSuccess('Attachment deleted.')
      await fetchAttachments(attachmentProposalId)
    } catch (error) {
      setSectionError(getApiErrorMessage(error, 'Could not delete attachment.'))
    } finally {
      setDeletingAttachmentId('')
    }
  }

  async function handleSubmitDelivery(event) {
    event.preventDefault()
    handleResetMessage()

    if (!selectedContractId) {
      setSectionError('Please select a contract first.')
      return
    }

    setSubmitDeliveryLoading(true)

    try {
      await submitDelivery(selectedContractId, {
        deliveryNote,
        deliveryUrl: deliveryUrl || undefined,
      })
      setSectionSuccess('Delivery submitted successfully.')
      setDeliveryNote('')
      setDeliveryUrl('')
      await fetchContractDetail(selectedContractId)
    } catch (error) {
      setSectionError(getApiErrorMessage(error, 'Could not submit delivery.'))
    } finally {
      setSubmitDeliveryLoading(false)
    }
  }

  async function handleReviewDelivery(event) {
    event.preventDefault()
    handleResetMessage()

    if (!selectedContractId) {
      setSectionError('Please select a contract first.')
      return
    }

    setReviewDeliveryLoading(true)

    try {
      await reviewDelivery(selectedContractId, {
        action: reviewAction,
        reason: reviewAction === 'DISPUTE' ? reviewReason : undefined,
      })
      setSectionSuccess('Delivery reviewed.')
      setReviewReason('')
      await fetchContractDetail(selectedContractId)
    } catch (error) {
      setSectionError(getApiErrorMessage(error, 'Could not review delivery.'))
    } finally {
      setReviewDeliveryLoading(false)
    }
  }

  async function handleLoadContractReview() {
    handleResetMessage()

    if (!selectedContractId) {
      setSectionError('Please select a contract first.')
      return
    }

    setContractReviewLoading(true)

    try {
      const response = await getContractReview(selectedContractId)
      setContractReview(response?.review || null)
    } catch (error) {
      setContractReview(null)
      setSectionError(getApiErrorMessage(error, 'Could not load contract review.'))
    } finally {
      setContractReviewLoading(false)
    }
  }

  async function handleCreatePayment() {
    handleResetMessage()

    if (!paymentContractId) {
      setSectionError('Please choose a contract to create payment.')
      return
    }

    setPaymentActionLoading('create')

    try {
      const response = await createPayment(paymentContractId)
      const createdId = response?.payment?.id || ''
      setPaymentId(createdId)
      setPaymentMessage(`Payment created: ${createdId}`)
      setSectionSuccess('Payment created.')
    } catch (error) {
      setSectionError(getApiErrorMessage(error, 'Could not create payment.'))
    } finally {
      setPaymentActionLoading('')
    }
  }

  async function handleCheckoutPayment() {
    handleResetMessage()

    if (!paymentId) {
      setSectionError('Please provide payment ID before checkout.')
      return
    }

    setPaymentActionLoading('checkout')

    try {
      const response = await checkoutPayment(paymentId)
      setPaymentMessage(response?.message || 'Checkout created.')

      if (response?.checkoutUrl) {
        window.location.href = response.checkoutUrl
      }
    } catch (error) {
      setSectionError(getApiErrorMessage(error, 'Could not start checkout.'))
    } finally {
      setPaymentActionLoading('')
    }
  }

  async function handleReleasePayment() {
    handleResetMessage()

    if (!paymentId) {
      setSectionError('Please provide payment ID before release.')
      return
    }

    setPaymentActionLoading('release')

    try {
      await releasePayment(paymentId)
      setSectionSuccess('Payment released to developer.')
    } catch (error) {
      setSectionError(getApiErrorMessage(error, 'Could not release payment.'))
    } finally {
      setPaymentActionLoading('')
    }
  }

  async function handleLoadPaymentLogs() {
    handleResetMessage()

    if (!paymentId) {
      setSectionError('Please provide payment ID to load logs.')
      return
    }

    setPaymentLogsLoading(true)

    try {
      const response = await getPaymentLogs(paymentId, { page: 1, limit: 50, sortOrder: 'desc' })
      setPaymentLogs(response?.items || [])
    } catch (error) {
      setPaymentLogs([])
      setSectionError(getApiErrorMessage(error, 'Could not load payment logs.'))
    } finally {
      setPaymentLogsLoading(false)
    }
  }

  async function handleCreateReview(event) {
    event.preventDefault()
    handleResetMessage()

    if (!createReviewContractId) {
      setSectionError('Please select a contract ID.')
      return
    }

    setCreateReviewLoading(true)

    try {
      await createReview(createReviewContractId, {
        rating: Number(createReviewRating),
        comment: createReviewComment || undefined,
      })
      setSectionSuccess('Review created.')
      setCreateReviewComment('')
      await fetchMyReviews()
    } catch (error) {
      setSectionError(getApiErrorMessage(error, 'Could not create review.'))
    } finally {
      setCreateReviewLoading(false)
    }
  }

  async function handleLookupDevReviews() {
    handleResetMessage()

    if (!devReviewTargetId) {
      setSectionError('Please provide developer ID.')
      return
    }

    setDevReviewsLoading(true)

    try {
      const response = await getDevReviews(devReviewTargetId, {
        page: 1,
        limit: 10,
        sortOrder: 'desc',
      })
      setDevReviewsData(response)
    } catch (error) {
      setDevReviewsData(null)
      setSectionError(getApiErrorMessage(error, 'Could not load developer reviews.'))
    } finally {
      setDevReviewsLoading(false)
    }
  }

  async function handleMarkNotification(notificationId) {
    handleResetMessage()
    setMarkingNotificationId(notificationId)

    try {
      await markNotificationAsRead(notificationId)
      await fetchNotifications()
    } catch (error) {
      setSectionError(getApiErrorMessage(error, 'Could not mark notification as read.'))
    } finally {
      setMarkingNotificationId('')
    }
  }

  function handleLogout() {
    logout()
  }

  return (
    <div className="page-enter min-h-screen bg-background">
      <div className="border-b border-border/40 bg-card/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="nav-logo flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">DevBoard</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" asChild>
              <Link to="/jobs">Browse Jobs</Link>
            </Button>
            {isClient ? (
              <Button variant="outline" asChild>
                <Link to="/jobs/new">Post Job</Link>
              </Button>
            ) : null}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome, {user?.name || 'User'}</h1>
          <div className="flex flex-wrap items-center gap-2 text-foreground/70">
            <span>{user?.email}</span>
            <Badge>{role}</Badge>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 border-border/50 bg-card">
            <p className="text-sm text-foreground/70">Contracts</p>
            <p className="text-2xl font-bold text-foreground">{contracts.length}</p>
          </Card>

          <Card className="p-4 border-border/50 bg-card">
            <p className="text-sm text-foreground/70">Active Contracts</p>
            <p className="text-2xl font-bold text-foreground">{activeContractsCount}</p>
          </Card>

          <Card className="p-4 border-border/50 bg-card">
            <p className="text-sm text-foreground/70">My Reviews</p>
            <p className="text-2xl font-bold text-foreground">{myReviews.length}</p>
          </Card>

          <Card className="p-4 border-border/50 bg-card">
            <p className="text-sm text-foreground/70">Unread Notifications</p>
            <p className="text-2xl font-bold text-foreground">{notifications.filter((item) => !item.isRead).length}</p>
          </Card>
        </div>

        <SectionError message={sectionError || contractsError || contractDetailError} />

        {sectionSuccess ? (
          <Alert className="mb-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{sectionSuccess}</AlertDescription>
          </Alert>
        ) : null}

        <Tabs defaultValue="contracts" className="space-y-6">
          <TabsList className="bg-card border border-border/50 flex-wrap h-auto p-2">
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            {isClient ? <TabsTrigger value="payments">Payments</TabsTrigger> : null}
            {isDev ? <TabsTrigger value="proposals">My Proposals</TabsTrigger> : null}
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="contracts" className="space-y-4">
            <Card className="p-6 border-border/50 bg-card">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Button variant="outline" onClick={fetchContracts} disabled={contractsLoading}>
                  {contractsLoading ? <Spinner /> : 'Refresh Contracts'}
                </Button>

                <select
                  className="h-10 rounded-md border border-border/50 bg-background/50 px-3 text-sm min-w-[280px]"
                  value={selectedContractId}
                  onChange={(event) => setSelectedContractId(event.target.value)}
                >
                  <option value="">Select contract</option>
                  {contracts.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id} | {item.status} | {formatCurrency(item.agreedAmount)}
                    </option>
                  ))}
                </select>

                <Button onClick={() => fetchContractDetail(selectedContractId)} disabled={!selectedContractId || contractDetailLoading}>
                  {contractDetailLoading ? <Spinner /> : 'Load Detail'}
                </Button>

                <Button variant="outline" onClick={handleLoadContractReview} disabled={!selectedContractId || contractReviewLoading}>
                  {contractReviewLoading ? <Spinner /> : 'Load Contract Review'}
                </Button>
              </div>

              {contractsLoading ? (
                <p className="text-foreground/70 inline-flex items-center gap-2">
                  <Spinner /> Loading contracts...
                </p>
              ) : null}

              <div className="space-y-3">
                {contracts.map((item) => (
                  <Card key={item.id} className="p-3 border-border/50 bg-background/40">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground">{item.jobs?.title || 'Job'}</p>
                        <p className="text-xs text-foreground/60">{item.id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{item.status}</Badge>
                        <Badge variant="secondary">{formatCurrency(item.agreedAmount)}</Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {contractDetail ? (
              <Card className="p-6 border-border/50 bg-card space-y-4">
                <h3 className="font-semibold text-lg text-foreground">Selected Contract Detail</h3>
                <p className="text-sm text-foreground/70">Contract: {contractDetail.id}</p>
                <p className="text-sm text-foreground/70">Status: {contractDetail.status}</p>
                <p className="text-sm text-foreground/70">Agreed Amount: {formatCurrency(contractDetail.agreedAmount)}</p>
                <p className="text-sm text-foreground/70">Job: {contractDetail.jobs?.title}</p>

                {isDev ? (
                  <form onSubmit={handleSubmitDelivery} className="space-y-3 border-t border-border/40 pt-4">
                    <h4 className="font-medium text-foreground">Submit Delivery</h4>
                    <div>
                      <Label htmlFor="deliveryNote">Delivery Note</Label>
                      <Textarea
                        id="deliveryNote"
                        className="mt-2"
                        value={deliveryNote}
                        onChange={(event) => setDeliveryNote(event.target.value)}
                        placeholder="Describe what has been delivered"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deliveryUrl">Delivery URL (optional)</Label>
                      <Input
                        id="deliveryUrl"
                        className="mt-2"
                        value={deliveryUrl}
                        onChange={(event) => setDeliveryUrl(event.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <Button type="submit" disabled={submitDeliveryLoading}>
                      {submitDeliveryLoading ? <Spinner /> : 'Submit Delivery'}
                    </Button>
                  </form>
                ) : null}

                {isClient ? (
                  <form onSubmit={handleReviewDelivery} className="space-y-3 border-t border-border/40 pt-4">
                    <h4 className="font-medium text-foreground">Review Delivery</h4>
                    <div>
                      <Label htmlFor="reviewAction">Action</Label>
                      <select
                        id="reviewAction"
                        className="h-10 rounded-md border border-border/50 bg-background/50 px-3 text-sm mt-2"
                        value={reviewAction}
                        onChange={(event) => setReviewAction(event.target.value)}
                      >
                        <option value="ACCEPT">ACCEPT</option>
                        <option value="DISPUTE">DISPUTE</option>
                      </select>
                    </div>

                    {reviewAction === 'DISPUTE' ? (
                      <div>
                        <Label htmlFor="reviewReason">Reason</Label>
                        <Textarea
                          id="reviewReason"
                          className="mt-2"
                          value={reviewReason}
                          onChange={(event) => setReviewReason(event.target.value)}
                          placeholder="Reason must be at least 10 chars"
                        />
                      </div>
                    ) : null}

                    <Button type="submit" disabled={reviewDeliveryLoading}>
                      {reviewDeliveryLoading ? <Spinner /> : 'Submit Delivery Review'}
                    </Button>
                  </form>
                ) : null}
              </Card>
            ) : null}

            {contractReview ? (
              <Card className="p-6 border-border/50 bg-card">
                <h4 className="font-semibold text-foreground mb-2">Contract Review</h4>
                <p className="text-sm text-foreground/70">Rating: {contractReview.rating}/5</p>
                <p className="text-sm text-foreground/70">Comment: {contractReview.comment || '-'}</p>
                <p className="text-xs text-foreground/60">Created: {formatDateTime(contractReview.createdAt)}</p>
              </Card>
            ) : null}
          </TabsContent>

          {isClient ? (
            <TabsContent value="payments" className="space-y-4">
              <Card className="p-6 border-border/50 bg-card space-y-4">
                <h3 className="font-semibold text-lg text-foreground">Payments</h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentContract">Contract ID</Label>
                    <select
                      id="paymentContract"
                      className="h-10 rounded-md border border-border/50 bg-background/50 px-3 text-sm mt-2 w-full"
                      value={paymentContractId}
                      onChange={(event) => setPaymentContractId(event.target.value)}
                    >
                      <option value="">Select contract</option>
                      {contracts.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.id}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="paymentId">Payment ID</Label>
                    <Input
                      id="paymentId"
                      className="mt-2"
                      value={paymentId}
                      onChange={(event) => setPaymentId(event.target.value)}
                      placeholder="Payment UUID"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleCreatePayment} disabled={paymentActionLoading === 'create'}>
                    {paymentActionLoading === 'create' ? <Spinner /> : 'Create Payment'}
                  </Button>

                  <Button variant="outline" onClick={handleCheckoutPayment} disabled={paymentActionLoading === 'checkout'}>
                    {paymentActionLoading === 'checkout' ? <Spinner /> : 'Checkout Stripe'}
                  </Button>

                  <Button variant="outline" onClick={handleReleasePayment} disabled={paymentActionLoading === 'release'}>
                    {paymentActionLoading === 'release' ? <Spinner /> : 'Release Payment'}
                  </Button>

                  <Button variant="outline" onClick={handleLoadPaymentLogs} disabled={paymentLogsLoading}>
                    {paymentLogsLoading ? <Spinner /> : 'Load Payment Logs'}
                  </Button>
                </div>

                {paymentMessage ? <p className="text-sm text-foreground/70">{paymentMessage}</p> : null}

                <div className="space-y-2">
                  {paymentLogs.map((log) => (
                    <Card key={log.id} className="p-3 border-border/50 bg-background/40">
                      <p className="text-sm text-foreground">{log.action}</p>
                      <p className="text-xs text-foreground/60">
                        {log.fromStatus || '-'} {'->'} {log.toStatus || '-'} | {formatDateTime(log.createdAt)}
                      </p>
                      <p className="text-xs text-foreground/60">{log.note || '-'}</p>
                    </Card>
                  ))}

                  {paymentLogs.length === 0 ? <p className="text-sm text-foreground/60">No logs loaded.</p> : null}
                </div>
              </Card>
            </TabsContent>
          ) : null}

          {isDev ? (
            <TabsContent value="proposals" className="space-y-4">
              <Card className="p-6 border-border/50 bg-card space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="h-10 rounded-md border border-border/50 bg-background/50 px-3 text-sm"
                    value={devProposalStatus}
                    onChange={(event) => setDevProposalStatus(event.target.value)}
                  >
                    <option value="">All statuses</option>
                    <option value="PENDING">PENDING</option>
                    <option value="ACCEPTED">ACCEPTED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="WITHDRAWN">WITHDRAWN</option>
                  </select>

                  <Button variant="outline" onClick={fetchDevProposals} disabled={devProposalsLoading}>
                    {devProposalsLoading ? <Spinner /> : 'Refresh Proposals'}
                  </Button>
                </div>

                <div className="space-y-3">
                  {devProposals.map((proposal) => (
                    <Card key={proposal.id} className="p-4 border-border/50 bg-background/40 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-foreground">{proposal.jobs?.title}</p>
                        <Badge>{proposal.status}</Badge>
                      </div>

                      <p className="text-sm text-foreground/70">Bid: {formatCurrency(proposal.bidAmount)}</p>
                      <p className="text-xs text-foreground/60">Created: {formatDateTime(proposal.createdAt)}</p>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={proposalActionId === proposal.id}
                        onClick={() => handleWithdrawProposal(proposal.id)}
                      >
                        {proposalActionId === proposal.id ? <Spinner /> : 'Withdraw Proposal'}
                      </Button>
                    </Card>
                  ))}

                  {devProposals.length === 0 ? <p className="text-sm text-foreground/60">No proposals found.</p> : null}
                </div>
              </Card>

              <Card className="p-6 border-border/50 bg-card space-y-4">
                <h4 className="font-semibold text-foreground">Proposal Attachments</h4>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="attachmentProposalId">Proposal ID</Label>
                    <select
                      id="attachmentProposalId"
                      className="h-10 rounded-md border border-border/50 bg-background/50 px-3 text-sm mt-2 w-full"
                      value={attachmentProposalId}
                      onChange={(event) => setAttachmentProposalId(event.target.value)}
                    >
                      <option value="">Select proposal</option>
                      {devProposals.map((proposal) => (
                        <option key={proposal.id} value={proposal.id}>
                          {proposal.id}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="attachmentFile">Attachment file</Label>
                    <Input
                      id="attachmentFile"
                      className="mt-2"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(event) => setSelectedAttachmentFile(event.target.files?.[0] || null)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => fetchAttachments(attachmentProposalId)} disabled={attachmentsLoading}>
                    {attachmentsLoading ? <Spinner /> : 'Load Attachments'}
                  </Button>

                  <Button onClick={handleUploadAttachment} disabled={uploadingAttachment}>
                    {uploadingAttachment ? <Spinner /> : 'Upload Attachment'}
                  </Button>
                </div>

                <div className="space-y-2">
                  {attachments.map((item) => (
                    <Card key={item.id} className="p-3 border-border/50 bg-background/40 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-foreground">{item.fileName}</p>
                        <p className="text-xs text-foreground/60">{item.id}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <a href={item.fileUrl} target="_blank" rel="noreferrer">
                            Open
                          </a>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={deletingAttachmentId === item.id}
                          onClick={() => handleDeleteAttachment(item.id)}
                        >
                          {deletingAttachmentId === item.id ? <Spinner /> : 'Delete'}
                        </Button>
                      </div>
                    </Card>
                  ))}

                  {attachments.length === 0 ? <p className="text-sm text-foreground/60">No attachments loaded.</p> : null}
                </div>
              </Card>
            </TabsContent>
          ) : null}

          <TabsContent value="reviews" className="space-y-4">
            {isClient ? (
              <Card className="p-6 border-border/50 bg-card">
                <h4 className="font-semibold text-foreground mb-4">Create Review</h4>

                <form onSubmit={handleCreateReview} className="space-y-3">
                  <div>
                    <Label htmlFor="reviewContract">Contract ID</Label>
                    <select
                      id="reviewContract"
                      className="h-10 rounded-md border border-border/50 bg-background/50 px-3 text-sm mt-2 w-full"
                      value={createReviewContractId}
                      onChange={(event) => setCreateReviewContractId(event.target.value)}
                    >
                      <option value="">Select contract</option>
                      {contracts.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.id}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="reviewRating">Rating</Label>
                    <select
                      id="reviewRating"
                      className="h-10 rounded-md border border-border/50 bg-background/50 px-3 text-sm mt-2"
                      value={createReviewRating}
                      onChange={(event) => setCreateReviewRating(event.target.value)}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="reviewComment">Comment</Label>
                    <Textarea
                      id="reviewComment"
                      className="mt-2"
                      value={createReviewComment}
                      onChange={(event) => setCreateReviewComment(event.target.value)}
                    />
                  </div>

                  <Button type="submit" disabled={createReviewLoading}>
                    {createReviewLoading ? <Spinner /> : 'Create Review'}
                  </Button>
                </form>
              </Card>
            ) : null}

            <Card className="p-6 border-border/50 bg-card">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <h4 className="font-semibold text-foreground mr-2">Developer Reviews Lookup</h4>
                <Input
                  className="max-w-sm"
                  value={devReviewTargetId}
                  onChange={(event) => setDevReviewTargetId(event.target.value)}
                  placeholder="Developer UUID"
                />
                <Button variant="outline" onClick={handleLookupDevReviews} disabled={devReviewsLoading}>
                  {devReviewsLoading ? <Spinner /> : 'Load Dev Reviews'}
                </Button>
              </div>

              {devReviewsData?.summary ? (
                <div className="mb-4 text-sm text-foreground/70 inline-flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Avg: {devReviewsData.summary.avgRating} | Total: {devReviewsData.summary.totalReviews}
                </div>
              ) : null}

              <div className="space-y-2">
                {(devReviewsData?.items || []).map((item) => (
                  <Card key={item.id} className="p-3 border-border/50 bg-background/40">
                    <p className="text-sm text-foreground">{item.rating}/5</p>
                    <p className="text-xs text-foreground/60">{item.comment || '-'}</p>
                    <p className="text-xs text-foreground/60">{formatDateTime(item.createdAt)}</p>
                  </Card>
                ))}
              </div>
            </Card>

            <Card className="p-6 border-border/50 bg-card">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-foreground">My Reviews</h4>
                <Button variant="outline" onClick={fetchMyReviews} disabled={myReviewsLoading}>
                  {myReviewsLoading ? <Spinner /> : 'Refresh'}
                </Button>
              </div>

              <div className="space-y-2">
                {myReviews.map((item) => (
                  <Card key={item.id} className="p-3 border-border/50 bg-background/40">
                    <p className="text-sm text-foreground">Contract: {item.contractId}</p>
                    <p className="text-xs text-foreground/60">Rating: {item.rating}/5</p>
                    <p className="text-xs text-foreground/60">{item.comment || '-'}</p>
                    <p className="text-xs text-foreground/60">{formatDateTime(item.createdAt)}</p>
                  </Card>
                ))}

                {myReviews.length === 0 ? <p className="text-sm text-foreground/60">No reviews found.</p> : null}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="p-6 border-border/50 bg-card">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-foreground inline-flex items-center gap-2">
                  <Bell className="w-4 h-4" /> Notifications
                </h4>
                <Button variant="outline" onClick={fetchNotifications} disabled={notificationsLoading}>
                  {notificationsLoading ? <Spinner /> : 'Refresh'}
                </Button>
              </div>

              <div className="space-y-2">
                {notifications.map((item) => (
                  <Card key={item.id} className="p-3 border-border/50 bg-background/40 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-foreground font-medium">{item.title}</p>
                      <p className="text-xs text-foreground/60">{item.body}</p>
                      <p className="text-xs text-foreground/60">{formatDateTime(item.createdAt)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={item.isRead ? 'secondary' : 'default'}>{item.isRead ? 'Read' : 'Unread'}</Badge>
                      {!item.isRead ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={markingNotificationId === item.id}
                          onClick={() => handleMarkNotification(item.id)}
                        >
                          {markingNotificationId === item.id ? <Spinner /> : 'Mark Read'}
                        </Button>
                      ) : null}
                    </div>
                  </Card>
                ))}

                {notifications.length === 0 ? <p className="text-sm text-foreground/60">No notifications.</p> : null}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
