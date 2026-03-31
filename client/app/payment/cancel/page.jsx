import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function PaymentCancelPage() {
  return (
    <div className="page-enter min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-xl p-8 border-border/50 bg-card text-center">
        <AlertTriangle className="w-14 h-14 text-amber-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-2">Checkout Cancelled</h1>
        <p className="text-foreground/70 mb-6">
          You cancelled the payment flow. You can return and retry checkout any time.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/dashboard">Back To Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/jobs">Back To Jobs</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
