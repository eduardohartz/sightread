import { useAuth } from '@/features/auth'
import { Loader } from '@/icons'
import { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router'

interface AuthRequiredProps extends PropsWithChildren {
  fallback?: React.ReactNode
}

/**
 * Wraps content that requires authentication.
 * Redirects to login page if not authenticated.
 */
export function AuthRequired({ children, fallback }: AuthRequiredProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      fallback ?? (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <Loader className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      )
    )
  }

  if (!isAuthenticated) {
    // Redirect to login, preserving the intended destination
    const redirectPath = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/auth?redirect=${redirectPath}`} replace />
  }

  return <>{children}</>
}
