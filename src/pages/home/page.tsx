import { AppBar, MarketingFooter, Sizer, UserMenu } from '@/components'
import { useAuth } from '@/features/auth'
import React from 'react'
import { Link } from 'react-router'
import { FeaturedSongsPreview } from './FeaturedSongsPreview'

export default function Home() {
  const { isAuthenticated, user, isLoading } = useAuth()

  return (
    <>
      <div className="relative flex flex-col bg-background w-full min-h-screen text-white">
        <AppBar>
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <UserMenu displayName={user?.displayName} email={user?.email} />
              ) : (
                <Link
                  to="/auth"
                  className="bg-white hover:bg-violet-50 px-3 py-1.5 rounded-md font-medium text-violet-600 text-sm transition"
                >
                  Sign In
                </Link>
              )}
            </>
          )}
        </AppBar>
        <div className="bg-violet-600">
          <div className="mx-auto w-full max-w-(--breakpoint-lg) px-6 py-10">
            <div className="items-center gap-8 grid md:grid-cols-[1.1fr_0.9fr]">
              <div className="flex flex-col gap-4 md:text-left text-center">
                <h1 className="font-bold text-responsive-xxl">Your Piano Journey Begins Here</h1>
                <h3 className="text-responsive-xl text-white/85">
                  Plug in your keyboard and learn, right in your browser
                </h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <Link to={isAuthenticated ? '/songs' : '/auth?redirect=/songs'}>
                    <Button className="bg-white hover:bg-violet-100 active:bg-violet-200 shadow-sm active:shadow-inner text-gray-900">
                      {isAuthenticated ? 'My Songs' : 'Get Started'}
                    </Button>
                  </Link>
                  <Link to={isAuthenticated ? '/freeplay' : '/auth?redirect=/freeplay'}>
                    <Button className="hover:bg-white/10 border border-white/50 text-white">
                      Free play
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center md:justify-end">
                <div className="shadow-[0_18px_40px_rgba(17,24,39,0.35)] rounded-2xl w-full">
                  <FeaturedSongsPreview className="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-background">
          <div className="mx-auto w-full max-w-(--breakpoint-lg) px-6 py-16">
            <h3 className="font-semibold text-gray-900 text-lg">Why Sightread</h3>
            <p className="mt-2 text-gray-600 text-sm">A few reasons to give it a try.</p>
            <div className="gap-4 grid md:grid-cols-3 mt-6">
              <div
                className="bg-white shadow-sm p-4 border border-gray-200 rounded-lg glint-card"
                onMouseMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect()
                  const x = event.clientX - rect.left
                  const y = event.clientY - rect.top
                  event.currentTarget.style.setProperty('--glint-x', `${x}px`)
                  event.currentTarget.style.setProperty('--glint-y', `${y}px`)
                }}
              >
                <h3 className="font-semibold text-gray-900 text-base">Your Own Music</h3>
                <p className="mt-2 text-gray-600 text-sm">
                  Works with any MIDI file. Upload to your library and we'll automatically detect
                  which track is for which hand.
                </p>
              </div>
              <div
                className="bg-white shadow-sm p-4 border border-gray-200 rounded-lg glint-card"
                onMouseMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect()
                  const x = event.clientX - rect.left
                  const y = event.clientY - rect.top
                  event.currentTarget.style.setProperty('--glint-x', `${x}px`)
                  event.currentTarget.style.setProperty('--glint-y', `${y}px`)
                }}
              >
                <h3 className="font-semibold text-gray-900 text-base">Learn at Your Own Pace</h3>
                <p className="mt-2 text-gray-600 text-sm">
                  Tempo controls and Wait Mode let you slow down and focus on accuracy.
                </p>
              </div>
              <div
                className="bg-white shadow-sm p-4 border border-gray-200 rounded-lg glint-card"
                onMouseMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect()
                  const x = event.clientX - rect.left
                  const y = event.clientY - rect.top
                  event.currentTarget.style.setProperty('--glint-x', `${x}px`)
                  event.currentTarget.style.setProperty('--glint-y', `${y}px`)
                }}
              >
                <h3 className="font-semibold text-gray-900 text-base">Multiple Modes</h3>
                <p className="mt-2 text-gray-600 text-sm">
                  Falling Notes or Sheet Hero. Switch views to match how you learn.
                </p>
              </div>
              <div
                className="bg-white shadow-sm p-4 border border-gray-200 rounded-lg glint-card"
                onMouseMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect()
                  const x = event.clientX - rect.left
                  const y = event.clientY - rect.top
                  event.currentTarget.style.setProperty('--glint-x', `${x}px`)
                  event.currentTarget.style.setProperty('--glint-y', `${y}px`)
                }}
              >
                <h3 className="font-semibold text-gray-900 text-base">Scores & Attempts</h3>
                <p className="mt-2 text-gray-600 text-sm">
                  Track your best attempt and recent attempts per song to see progress over time.
                </p>
              </div>
              <div
                className="bg-white shadow-sm p-4 border border-gray-200 rounded-lg glint-card"
                onMouseMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect()
                  const x = event.clientX - rect.left
                  const y = event.clientY - rect.top
                  event.currentTarget.style.setProperty('--glint-x', `${x}px`)
                  event.currentTarget.style.setProperty('--glint-y', `${y}px`)
                }}
              >
                <h3 className="font-semibold text-gray-900 text-base">Record & Replay</h3>
                <p className="mt-2 text-gray-600 text-sm">
                  Save a practice attempt as MIDI and replay it right in the preview.
                </p>
              </div>
              <div
                className="bg-white shadow-sm p-4 border border-gray-200 rounded-lg glint-card"
                onMouseMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect()
                  const x = event.clientX - rect.left
                  const y = event.clientY - rect.top
                  event.currentTarget.style.setProperty('--glint-x', `${x}px`)
                  event.currentTarget.style.setProperty('--glint-y', `${y}px`)
                }}
              >
                <h3 className="font-semibold text-gray-900 text-base">Cloud Sync</h3>
                <p className="mt-2 text-gray-600 text-sm">
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
