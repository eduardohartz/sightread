import { useAuth } from '@/features/auth'
import { Loader } from '@/icons'
import { validatePassword, PASSWORD_REQUIREMENTS } from '@/utils/password-validation'
import clsx from 'clsx'
import { Check, Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react'
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

    if (mode === 'register') {
      // Validate password requirements
      const validation = validatePassword(password)
      if (!validation.isValid) {
        setError(validation.errors[0])
        return
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
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
      <div className="flex justify-center items-center bg-gray-50 min-h-screen">
        <Loader className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <title>{mode === 'login' ? 'Sign In' : 'Create Account'} - Sightread</title>
      <div className="flex flex-col justify-center items-center bg-gray-50 px-4 py-12 min-h-screen">
        <div className="w-full max-w-md">
          {/* Logo / Header */}
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-3">
              <svg width="30" height="30" className="relative" viewBox="0 0 34 32" fill="none">
                <g clip-path="url(#clip0)">
                  <path d="M33.2306 20.1791H0.0865479V20.619H33.2306V20.1791Z" fill="black"></path>
                  <path
                    d="M33.0749 18.3461H0.242254C0.15626 18.3461 0.0865479 18.4161 0.0865479 18.5025V18.6295C0.0865479 18.7159 0.15626 18.786 0.242254 18.786H33.0749C33.1609 18.786 33.2306 18.7159 33.2306 18.6295V18.5025C33.2306 18.4161 33.1609 18.3461 33.0749 18.3461Z"
                    fill="black"
                  ></path>
                  <path
                    d="M33.0317 16.5133H0.198919C0.112925 16.5133 0.0432129 16.5833 0.0432129 16.6697V16.7967C0.0432129 16.8831 0.112925 16.9532 0.198919 16.9532H33.0317C33.1177 16.9532 33.1874 16.8831 33.1874 16.7967V16.6697C33.1874 16.5833 33.1177 16.5133 33.0317 16.5133Z"
                    fill="black"
                  ></path>
                  <path
                    d="M33.0317 14.6803H0.198919C0.112925 14.6803 0.0432129 14.7503 0.0432129 14.8367V14.9637C0.0432129 15.0501 0.112925 15.1202 0.198919 15.1202H33.0317C33.1177 15.1202 33.1874 15.0501 33.1874 14.9637V14.8367C33.1874 14.7503 33.1177 14.6803 33.0317 14.6803Z"
                    fill="black"
                  ></path>
                  <path
                    d="M32.9883 12.8473H0.155706C0.0697119 12.8473 0 12.9174 0 13.0038V13.1308C0 13.2172 0.0697119 13.2873 0.155706 13.2873H32.9883C33.0743 13.2873 33.144 13.2172 33.144 13.1308V13.0038C33.144 12.9174 33.0743 12.8473 32.9883 12.8473Z"
                    fill="black"
                  ></path>
                  <path
                    d="M18.492 18.9602C17.3688 17.6911 16.236 16.4303 15.115 15.1589C13.6619 13.5113 12.2039 11.869 10.7721 10.2023C9.42626 8.63526 8.09911 7.05216 6.79066 5.45297C5.47342 3.84483 3.92889 2.18616 2.75315 0.468877C2.64567 0.311839 2.63427 0.205894 2.75408 0.055618C2.95297 -0.195907 6.71159 0.496303 8.51576 0.589098C10.5962 0.695982 13.078 0.74501 15.1588 0.844944C16.519 0.910126 17.8727 1.04876 19.1998 1.37504C20.4174 1.67447 21.5627 2.13469 22.5478 2.93848C22.9598 3.27335 23.3269 3.66053 23.6398 4.09034C23.6757 4.13975 23.7196 4.18314 23.76 4.22916L24.1712 4.90202C24.18 4.93396 24.1834 4.9689 24.1985 4.99764C24.6419 5.84707 24.9039 6.75624 25.0675 7.69603C25.3479 9.30756 25.0114 11.7037 25.0032 11.7332C24.8574 11.1466 24.1948 9.90678 23.5906 8.7861C23.0226 7.73266 22.2295 6.90408 21.1606 6.35576C19.9434 5.73136 18.6452 5.58334 17.3061 5.72798C15.3734 5.93686 11.2872 7.04083 14.8649 11.2549C16.3491 13.0032 17.9071 14.6869 19.4346 16.3968C20.7573 17.8774 22.088 19.3503 23.4114 20.83C24.2619 21.7807 25.1269 22.7007 25.7696 23.8083C26.0113 24.2247 26.2668 24.6481 26.4511 25.0944C26.8193 25.9858 26.9825 26.8446 26.7689 27.6277C26.3309 29.233 25.2569 30.4371 23.522 31.2054C21.8225 31.9581 19.8023 32.1702 17.4994 31.8689C15.9489 31.6658 14.4176 31.2302 12.9406 30.4401C11.6015 29.7231 10.5723 28.8273 9.97338 27.7029C9.84739 27.4664 9.74477 27.2278 9.63131 26.9902C9.5928 26.8717 9.55424 26.7532 9.51561 26.6348C9.60701 26.7574 9.70402 26.8808 9.80851 27.0046C12.0454 29.6533 15.5769 30.2089 18.1452 30.2089C20.5354 30.2089 22.0549 29.5843 22.6616 28.3526C23.7441 26.1548 21.5893 22.7396 20.8376 21.658C20.2991 21.0137 18.492 18.9602 18.492 18.9602Z"
                    fill="black"
                  ></path>
                  <path
                    d="M17.606 29.3809C19.6978 29.3809 21.0171 28.856 21.527 27.8206C22.5551 25.7355 20.0503 22.1725 19.6928 21.6818C17.8271 21.3084 16.0896 21.2975 14.4627 21.5629C12.9153 21.8156 11.5803 22.2978 10.608 23.1587C9.86347 23.8178 9.46028 24.6361 9.54252 25.6702C9.54383 25.6878 9.54682 25.7059 9.5485 25.7235C9.72455 26.0082 9.92155 26.2793 10.1379 26.5345C12.1333 28.887 15.3005 29.3809 17.606 29.3809Z"
                    fill="black"
                  ></path>
                </g>
                <defs>
                  <clipPath id="clip0">
                    <rect width="33.2308" height="32" fill="white"></rect>
                  </clipPath>
                </defs>
              </svg>
              <span className="font-extralight text-black text-3xl">SIGHTREAD</span>
            </Link>
            <h1 className="mt-4 font-semibold text-gray-900 text-xl">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-1 text-gray-600 text-sm">
              {mode === 'login'
                ? 'Sign in to continue learning piano'
                : 'Start your piano learning journey'}
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-sm p-6 border border-gray-200 rounded-xl"
          >
            {error && (
              <div className="bg-red-50 mb-4 px-4 py-3 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block mb-1.5 font-medium text-gray-700 text-sm">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="py-2.5 pr-4 pl-10 border border-gray-300 focus:border-violet-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 w-full text-sm transition"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Display Name (Register only) */}
              {mode === 'register' && (
                <div>
                  <label
                    htmlFor="displayName"
                    className="block mb-1.5 font-medium text-gray-700 text-sm"
                  >
                    Display name <span className="text-gray-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <User className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2" />
                    <input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      autoComplete="name"
                      className="py-2.5 pr-4 pl-10 border border-gray-300 focus:border-violet-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 w-full text-sm transition"
                      placeholder="Your name"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block mb-1.5 font-medium text-gray-700 text-sm"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    minLength={8}
                    className="py-2.5 pr-10 pl-10 border border-gray-300 focus:border-violet-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 w-full text-sm transition"
                    placeholder={mode === 'register' ? 'Create a strong password' : '••••••••'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="top-1/2 right-3 absolute text-gray-400 hover:text-gray-600 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Password requirements (Register only) */}
                {mode === 'register' && password.length > 0 && (
                  <PasswordRequirements password={password} />
                )}
              </div>

              {/* Confirm Password (Register only) */}
              {mode === 'register' && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block mb-1.5 font-medium text-gray-700 text-sm"
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2" />
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      minLength={8}
                      className="py-2.5 pr-4 pl-10 border border-gray-300 focus:border-violet-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 w-full text-sm transition"
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
                'flex justify-center items-center gap-2 mt-6 py-2.5 rounded-lg w-full font-semibold text-white text-sm transition',
                'bg-violet-600 hover:cursor-pointer hover:bg-violet-700 active:bg-violet-800',
                'disabled:cursor-not-allowed disabled:opacity-60',
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
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
          <p className="mt-6 text-gray-600 text-sm text-center">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={toggleMode}
                  className="font-medium text-violet-600 hover:text-violet-700 hover:cursor-pointer"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={toggleMode}
                  className="font-medium text-violet-600 hover:text-violet-700 hover:cursor-pointer"
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          {/* Back to home */}
          <p className="mt-4 text-center">
            <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

function PasswordRequirements({ password }: { password: string }) {
  const validation = validatePassword(password)

  const requirements = [
    { label: `At least ${PASSWORD_REQUIREMENTS.minLength} characters`, met: validation.checks.minLength },
    { label: 'One uppercase letter', met: validation.checks.hasUppercase },
    { label: 'One lowercase letter', met: validation.checks.hasLowercase },
    { label: 'One number', met: validation.checks.hasNumber },
    { label: 'One special character', met: validation.checks.hasSpecialChar },
  ]

  return (
    <div className="space-y-1 mt-2">
      {requirements.map((req, idx) => (
        <div
          key={idx}
          className={clsx('flex items-center gap-1.5 text-xs', req.met ? 'text-green-600' : 'text-gray-500')}
        >
          {req.met ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
          {req.label}
        </div>
      ))}
    </div>
  )
}
