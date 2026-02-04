import { useAuth } from '@/features/auth'
import { Loader } from '@/icons'
import clsx from 'clsx'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'

type AuthMode = 'login' | 'register'

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login'
  const redirectTo = searchParams.get('redirect') || '/songs'

  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login, register, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    try {
      let result: { error?: string }
      if (mode === 'login') {
        result = await login(email, password)
      } else {
        result = await register(email, password, displayName || undefined)
      }

      if (result.error) {
        setError(result.error)
      } else {
        navigate(redirectTo, { replace: true })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setError(null)
    setConfirmPassword('')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    )
  }

  return (
    <>
      <title>{mode === 'login' ? 'Sign In' : 'Create Account'} - Sightread</title>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo / Header */}
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <svg className="h-10 w-10 text-violet-600" viewBox="0 0 40 40" fill="currentColor">
                <path d="M20 5c-8.284 0-15 6.716-15 15s6.716 15 15 15 15-6.716 15-15-6.716-15-15-15zm0 27c-6.627 0-12-5.373-12-12s5.373-12 12-12 12 5.373 12 12-5.373 12-12 12zm-3-17v10l8-5-8-5z" />
              </svg>
              <span className="text-2xl font-bold text-gray-900">Sightread</span>
            </Link>
            <h1 className="mt-4 text-xl font-semibold text-gray-900">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {mode === 'login'
                ? 'Sign in to continue learning piano'
                : 'Start your piano learning journey'}
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full rounded-lg border border-gray-300 py-2.5 pr-4 pl-10 text-sm transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Display Name (Register only) */}
              {mode === 'register' && (
                <div>
                  <label
                    htmlFor="displayName"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Display name <span className="text-gray-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      autoComplete="name"
                      className="w-full rounded-lg border border-gray-300 py-2.5 pr-4 pl-10 text-sm transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                      placeholder="Your name"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    minLength={8}
                    className="w-full rounded-lg border border-gray-300 py-2.5 pr-10 pl-10 text-sm transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                    placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Register only) */}
              {mode === 'register' && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      minLength={8}
                      className="w-full rounded-lg border border-gray-300 py-2.5 pr-4 pl-10 text-sm transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={clsx(
                'mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition',
                'bg-violet-600 hover:bg-violet-700 active:bg-violet-800',
                'disabled:cursor-not-allowed disabled:opacity-60',
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : mode === 'login' ? (
                'Sign in'
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="mt-6 text-center text-sm text-gray-600">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={toggleMode}
                  className="font-medium text-violet-600 hover:text-violet-700"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={toggleMode}
                  className="font-medium text-violet-600 hover:text-violet-700"
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          {/* Back to home */}
          <p className="mt-4 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
