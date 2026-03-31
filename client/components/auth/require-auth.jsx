import { Navigate, useLocation } from 'react-router-dom'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/context/auth-context'

function FullPageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Spinner className="size-6" />
    </div>
  )
}

export function RequireAuth({ children, allowedRoles }) {
  const { isLoading, isAuthenticated, role } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <FullPageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const hasRoleRestriction = Array.isArray(allowedRoles) && allowedRoles.length > 0
  if (hasRoleRestriction && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export function GuestOnly({ children }) {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return <FullPageLoader />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
