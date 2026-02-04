import { AppBar, MarketingFooter, Sizer } from '@/components'
import { useAuth } from '@/features/auth'
import { LogOut, User } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router'
import { FeaturedSongsPreview } from './FeaturedSongsPreview'

export default function Home() {
  const { isAuthenticated, user, isLoading, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <>
      <div className="bg-background relative flex min-h-screen w-full flex-col text-white">
        <AppBar>
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <div className="mr-2 flex items-center rounded-md bg-violet-500/50 px-3 py-1">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-100">
                      <User className="h-4 w-4" />
                      <span>{user?.displayName || user?.email}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-gray-100 transition hover:bg-gray-100 hover:text-gray-900"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-violet-600 transition hover:bg-violet-50"
                >
                  Sign In
                </Link>
              )}
            </>
          )}
        </AppBar>
        <div className="bg-violet-600">
          <div className="mx-auto w-full max-w-(--breakpoint-lg) px-6 py-10">
            <div className="grid items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
              <div className="flex flex-col gap-4 text-center md:text-left">
                <h1 className="text-responsive-xxl font-bold">Your Piano Journey Begins Here</h1>
                <h3 className="text-responsive-xl text-white/85">
                  Plug in your keyboard and learn, right in your browser
                </h3>
                <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                  <Link to={isAuthenticated ? '/songs' : '/auth?redirect=/songs'}>
                    <Button className="bg-white text-gray-900 shadow-sm hover:bg-violet-100 active:bg-violet-200 active:shadow-inner">
                      {isAuthenticated ? 'My Songs' : 'Get Started'}
                    </Button>
                  </Link>
                  <Link to={isAuthenticated ? '/freeplay' : '/auth?redirect=/freeplay'}>
                    <Button className="border border-white/50 text-white hover:bg-white/10">
                      Free play
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center md:justify-end">
                <div className="w-full rounded-2xl shadow-[0_18px_40px_rgba(17,24,39,0.35)]">
                  <FeaturedSongsPreview className="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-background">
          <div className="mx-auto w-full max-w-(--breakpoint-lg) px-6 py-16">
            <h3 className="text-lg font-semibold text-gray-900">Why Sightread</h3>
            <p className="mt-2 text-sm text-gray-600">A few reasons to give it a try.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div
                className="glint-card rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                onMouseMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect()
                  const x = event.clientX - rect.left
                  const y = event.clientY - rect.top
                  event.currentTarget.style.setProperty('--glint-x', `${x}px`)
                  event.currentTarget.style.setProperty('--glint-y', `${y}px`)
                }}
              >
                <h3 className="text-base font-semibold text-gray-900">Your Own Music</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Works with any MIDI file. Upload to your library and we'll automatically detect
                  which track is for which hand.
                </p>
              </div>
              <div
                className="glint-card rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                onMouseMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect()
                  const x = event.clientX - rect.left
                  const y = event.clientY - rect.top
                  event.currentTarget.style.setProperty('--glint-x', `${x}px`)
                  event.currentTarget.style.setProperty('--glint-y', `${y}px`)
                }}
              >
                <h3 className="text-base font-semibold text-gray-900">Learn at Your Own Pace</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Tempo controls and Wait Mode let you slow down and focus on accuracy.
                </p>
              </div>
              <div
                className="glint-card rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                onMouseMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect()
                  const x = event.clientX - rect.left
                  const y = event.clientY - rect.top
                  event.currentTarget.style.setProperty('--glint-x', `${x}px`)
                  event.currentTarget.style.setProperty('--glint-y', `${y}px`)
                }}
              >
                <h3 className="text-base font-semibold text-gray-900">Multiple Modes</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Falling Notes or Sheet Hero. Switch views to match how you learn.
                </p>
              </div>
              <div
                className="glint-card rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                onMouseMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect()
                  const x = event.clientX - rect.left
                  const y = event.clientY - rect.top
                  event.currentTarget.style.setProperty('--glint-x', `${x}px`)
                  event.currentTarget.style.setProperty('--glint-y', `${y}px`)
                }}
              >
                <h3 className="text-base font-semibold text-gray-900">Scores & Attempts</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Track your best attempt and recent attempts per song to see progress over time.
                </p>
              </div>
              <div
                className="glint-card rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                onMouseMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect()
                  const x = event.clientX - rect.left
                  const y = event.clientY - rect.top
                  event.currentTarget.style.setProperty('--glint-x', `${x}px`)
                  event.currentTarget.style.setProperty('--glint-y', `${y}px`)
                }}
              >
                <h3 className="text-base font-semibold text-gray-900">Record & Replay</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Save a practice attempt as MIDI and replay it right in the preview.
                </p>
              </div>
              <div
                className="glint-card rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                onMouseMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect()
                  const x = event.clientX - rect.left
                  const y = event.clientY - rect.top
                  event.currentTarget.style.setProperty('--glint-x', `${x}px`)
                  event.currentTarget.style.setProperty('--glint-y', `${y}px`)
                }}
              >
                <h3 className="text-base font-semibold text-gray-900">Cloud Sync</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Sign in to sync your uploads, scores, and recordings between devices.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-auto">
          <MarketingFooter />
        </div>
      </div>
    </>
  )
}

function Button({
  children,
  style,
  className,
}: {
  children?: React.ReactNode
  style?: React.CSSProperties
  className?: string
}) {
  return (
    <button
      className={className}
      style={{
        transition: 'background-color 150ms',
        cursor: 'pointer',
        fontSize: 'clamp(0.875rem, 0.875rem + 0.35vw, 1.05rem)',
        padding: '8px 16px',
        borderRadius: 10,
        fontWeight: 500,
        minWidth: 'max-content',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
