import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Code } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { getApiErrorMessage } from '@/lib/api-error'

export default function SignUpPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (password !== confirmPassword) {
      setErrorMessage('Password confirmation does not match.')
      return
    }

    setIsSubmitting(true)

    try {
      await register({ name, email, password })
      setSuccessMessage('Account created. Redirecting to login...')
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 900)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Could not create account.'))
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
          <h1 className="text-2xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-foreground/70 mb-2">Create a developer account.</p>
          <p className="text-xs text-foreground/60 mb-6">
            Backend currently creates new accounts with DEV role only.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {errorMessage ? (
              <Alert variant="destructive">
                <AlertTitle>Sign up failed</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            {successMessage ? (
              <Alert>
                <AlertTitle>Done</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            ) : null}

            <div>
              <Label htmlFor="name" className="text-sm text-foreground/70">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="John Doe"
                className="mt-1.5 bg-background/50 border-border/50"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm text-foreground/70">
                Email
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
              <p className="text-xs text-foreground/50 mt-1.5">At least 8 chars, with uppercase, lowercase, and special char.</p>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm text-foreground/70">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="********"
                className="mt-1.5 bg-background/50 border-border/50"
                required
              />
            </div>

            <Button disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-white mt-6" type="submit">
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner /> Creating...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-foreground/70 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
