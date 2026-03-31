import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Code } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { getApiErrorMessage } from '@/lib/api-error'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const redirectPath = location.state?.from || '/dashboard'

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await login({ email, password })
      navigate(redirectPath, { replace: true })
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Login failed.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-enter min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="nav-logo flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Code className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl text-foreground">DevBoard</span>
        </div>

        <Card className="p-8 border-border/50 bg-card">
          <h1 className="text-2xl font-bold text-foreground mb-2">Sign In</h1>
          <p className="text-foreground/70 mb-6">Login with your existing account.</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {errorMessage ? (
              <Alert variant="destructive">
                <AlertTitle>Sign in failed</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            <div>
              <Label htmlFor="email" className="text-sm text-foreground/70">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="john@example.com"
                className="mt-1.5 bg-background/50 border-border/50"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm text-foreground/70">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                className="mt-1.5 bg-background/50 border-border/50"
                required
              />
            </div>

            <Button disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-white mt-6" type="submit">
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner /> Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-foreground/70 mt-6">
            Do not have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Create one
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
