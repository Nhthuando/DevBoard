import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'

export default function PaymentSuccessPage() {
  return (
    <div className="page-enter min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-xl p-8 border-border/50 bg-card text-center">
        <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-2">Payment Received</h1>
        <p className="text-foreground/70 mb-6">
          Stripe checkout completed. Escrow status will be updated by webhook shortly.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/dashboard">Open Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/jobs">Browse Jobs</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
