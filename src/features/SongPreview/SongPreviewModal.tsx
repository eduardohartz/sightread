import { Modal } from '@/components'
import { getSongScores, SongScore } from '@/features/api'
import { useEventListener, usePlayerState } from '@/hooks'
import { SongMetadata } from '@/types'
import clsx from 'clsx'
import { useAtomValue } from 'jotai'
import { Clock, Eye, Pause, Play, ScanEyeIcon, Trophy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button, Heading, Text } from 'react-aria-components'
import { createSearchParams, useNavigate } from 'react-router'
import { SongScrubBar, useSongScrubTimes } from '../controls'
import { usePlayer } from '../player'
import PreviewIcon from './PreviewIcon'
import { SongPreview } from './SongPreview'

// Get score color based on accuracy
function getScoreColor(accuracy: number): string {
  if (accuracy >= 95) return 'text-emerald-600'
  if (accuracy >= 85) return 'text-green-600'
  if (accuracy >= 70) return 'text-yellow-600'
  if (accuracy >= 50) return 'text-orange-600'
  return 'text-red-600'
}

function getScoreBgColor(accuracy: number): string {
  if (accuracy >= 95) return 'bg-emerald-50 border-emerald-200'
  if (accuracy >= 85) return 'bg-green-50 border-green-200'
  if (accuracy >= 70) return 'bg-yellow-50 border-yellow-200'
  if (accuracy >= 50) return 'bg-orange-50 border-orange-200'
  return 'bg-red-50 border-red-200'
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

type ModalProps = {
  show: boolean
  onClose: () => void
  songMeta?: SongMetadata
}
export default function SongPreviewModal({
  show = true,
  onClose = () => {},
  songMeta = undefined,
}: ModalProps) {
  const { title, id, source } = songMeta ?? {}
  const player = usePlayer()
  const playerState = usePlayerState()
  const navigate = useNavigate()
  const song = useAtomValue(player.song)
  const trackCount = song ? Object.keys(song.tracks).length : undefined
  const noteCount = song?.notes.length
  const playSongSearch = id && source ? createSearchParams({ id, source }).toString() : ''
  const { currentTime, duration } = useSongScrubTimes()

  const [scores, setScores] = useState<SongScore[]>([])
  const [scoresLoading, setScoresLoading] = useState(false)
  const [previewRecording, setPreviewRecording] = useState<string | null>(null)
  const pendingAutoPlayRef = useRef(false)

  // Fetch scores when modal opens
  useEffect(() => {
    if (show && id) {
      setScoresLoading(true)
      getSongScores(id)
        .then((response) => {
          if (response.data?.scores) {
            setScores(response.data.scores)
          } else {
            setScores([])
          }
        })
        .catch(() => setScores([]))
        .finally(() => setScoresLoading(false))
    } else {
      setScores([])
    }
  }, [show, id])

  const bestScore =
    scores.length > 0
      ? scores.reduce((best, s) => (s.accuracy > best.accuracy ? s : best), scores[0])
      : null
  const recentScores = scores.slice(0, 5)

  useEventListener<KeyboardEvent>('keydown', (event) => {
    if (!show) return

    if (event.key === ' ') {
      event.preventDefault()
      player.toggle()
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (playSongSearch) {
        navigate({ pathname: '/play', search: `?${playSongSearch}` })
      }
    }
  })

  function handleClose() {
    player.stop()
    setPreviewRecording(null)
    return onClose()
  }

  function handlePlayRecording(base64Recording: string) {
    player.stop()
    setPreviewRecording(base64Recording)
    pendingAutoPlayRef.current = true
  }

  function handleBackToOriginal() {
    player.stop()
    setPreviewRecording(null)
  }

  // Auto-play when a new recording is loaded
  useEffect(() => {
    if (pendingAutoPlayRef.current && playerState.canPlay) {
      player.play()
      pendingAutoPlayRef.current = false
    }
  }, [playerState.canPlay, player])

  if (!show || !id || !source) {
    return null
  }

  const trackCountLabel = trackCount === undefined ? '--' : String(trackCount).padStart(2, '0')
  const noteCountLabel = noteCount === undefined ? '--' : noteCount.toLocaleString()

  return (
    <Modal
      show={show && !!id}
      onClose={handleClose}
      className="bg-transparent p-0 rounded-2xl overflow-hidden"
      modalClassName="max-w-[1100px] w-[min(96vw,1100px)]"
    >
      <div className="flex bg-white w-full h-[min(90vh,700px)] text-left">
        <div
          className="relative flex-1 bg-[#21242b] overflow-hidden"
          onClick={() => player.toggle()}
        >
          {!playerState.canPlay && (
            <PreviewIcon
              isLoading={!playerState.canPlay}
              isPlaying={playerState.playing}
              onPlay={(e) => {
                e.stopPropagation()
                player.play()
              }}
            />
          )}
          {id && source && (
            <SongPreview
              songId={previewRecording ?? id}
              source={previewRecording ? 'base64' : source}
            />
          )}
          {previewRecording && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleBackToOriginal()
              }}
              className="top-3 left-3 absolute flex items-center gap-1.5 bg-gray-50/20 hover:bg-gray-50/60 px-3 py-1.5 border border-gray-200 rounded-md font-medium text-white hover:text-black text-xs transition cursor-pointer"
            >
              ← Back to original
            </button>
          )}
        </div>
        <div className="flex flex-col bg-white border-gray-200 border-l w-105">
          <div className="px-6 pt-6 pb-3">
            <Heading
              className="font-semibold text-gray-900 text-xl truncate leading-tight"
              title={title}
            >
              {title}
            </Heading>
            <Text className="mt-2 font-medium text-gray-500 text-sm">
              {previewRecording ? 'Your Attempt' : 'Original'}
            </Text>
          </div>
          <div className="px-6 pb-6">
            <div className="bg-gray-50 p-3 border border-gray-200 rounded-lg">
              <div className="items-center gap-x-3 grid grid-cols-[auto_1fr_1fr] grid-rows-[8px_auto_auto]">
                <div className="col-span-3 row-start-1" />
                <Button
                  className="flex justify-center items-center col-start-1 row-start-2 hover:bg-gray-200/60 rounded-full w-8 h-8 text-gray-600 hover:text-violet-600 transition"
                  onPress={() => player.toggle()}
                  aria-label={playerState.playing ? 'Pause preview' : 'Play preview'}
                >
                  {playerState.playing ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                <div className="flex items-center col-span-2 col-start-2 row-start-2 h-8">
                  <SongScrubBar height={8} className="w-full" trackClassName="bg-gray-200" />
                </div>
                <div className="flex justify-between items-center col-span-2 col-start-2 row-start-3 font-mono text-[10px] text-gray-500">
                  <span>{currentTime}</span>
                  <span>{duration}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 px-6 overflow-y-auto">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-gray-50 shadow-sm px-3 py-1.5 border border-gray-200 rounded-md">
                <Text className="font-semibold text-[10px] text-gray-400 uppercase tracking-wider">
                  Tracks
                </Text>
                <Text className="font-semibold text-gray-900 text-sm">{trackCountLabel}</Text>
              </div>
              <div className="inline-flex items-center gap-2 bg-gray-50 shadow-sm px-3 py-1.5 border border-gray-200 rounded-md">
                <Text className="font-semibold text-[10px] text-gray-400 uppercase tracking-wider">
                  Total Notes
                </Text>
                <Text className="font-semibold text-gray-900 text-sm">{noteCountLabel}</Text>
              </div>
            </div>

            {/* Best Score Section */}
            {scoresLoading ? (
              <div className="mt-6 animate-pulse">
                <div className="bg-gray-200 rounded w-24 h-4" />
                <div className="bg-gray-100 mt-2 rounded-lg h-20" />
              </div>
            ) : bestScore ? (
              <div className="mt-6">
                <div className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Best Attempt
                </div>
                <div
                  className={clsx(
                    'relative mt-2 p-4 border rounded-lg',
                    getScoreBgColor(bestScore.accuracy),
                  )}
                >
                  {bestScore.base64Recording && (
                    <Button
                      className="top-2 right-2 absolute flex justify-center items-center hover:bg-violet-100 rounded-full w-7 h-7 text-violet-600 hover:text-violet-700 transition hover:cursor-pointer"
                      onPress={() => handlePlayRecording(bestScore.base64Recording!)}
                      aria-label="Play best recording"
                    >
                      <Eye className="w-5 h-5" />
                    </Button>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className={clsx('font-bold text-3xl', getScoreColor(bestScore.accuracy))}>
                      {bestScore.accuracy.toFixed(1)}%
                    </span>
                    <span className="text-gray-500 text-sm">accuracy</span>
                  </div>
                  <div className="gap-3 grid grid-cols-2 mt-3 text-sm">
                    <div>
                      <span className="text-gray-500">Score:</span>{' '}
                      <span className="font-semibold text-gray-700">
                        {bestScore.combined.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Max Streak:</span>{' '}
                      <span className="font-semibold text-gray-700">{bestScore.maxStreak}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-gray-500 text-xs">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(bestScore.playedAt)}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Recent Attempts Section */}
            {!scoresLoading && recentScores.length > 0 && (
              <div className="mt-6 pb-4">
                <div className="font-semibold text-gray-700 text-sm">Recent Attempts</div>
                <div className="space-y-2 mt-2">
                  {recentScores.map((score) => {
                    const isSelected = previewRecording === score.base64Recording
                    return (
                      <div
                        key={score.id}
                        className={clsx(
                          'flex justify-between items-center px-3 py-2 border rounded-md transition',
                          isSelected
                            ? 'border-violet-300 bg-violet-50 ring-1 ring-violet-300'
                            : 'border-gray-200 bg-gray-50',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {score.base64Recording && (
                            <Button
                              className={clsx(
                                'flex justify-center items-center rounded-full w-7 h-7 transition hover:cursor-pointer',
                                isSelected
                                  ? 'bg-violet-200 text-violet-700'
                                  : 'text-violet-600 hover:bg-violet-100 hover:text-violet-700',
                              )}
                              onPress={() => handlePlayRecording(score.base64Recording!)}
                              aria-label="Play recording"
                            >
                              <Eye className="w-5 h-5" />
                            </Button>
                          )}
                          <span className={clsx('font-semibold', getScoreColor(score.accuracy))}>
                            {score.accuracy.toFixed(1)}%
                          </span>
                          <span className="text-gray-500 text-sm">
                            {score.combined.toLocaleString()} pts
                          </span>
                        </div>
                        <span className="text-gray-400 text-xs">
                          {formatRelativeTime(score.playedAt)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* No scores yet message */}
            {!scoresLoading && scores.length === 0 && (
              <div className="bg-gray-50 mt-6 p-4 border border-gray-300 border-dashed rounded-lg text-center">
                <Text className="text-gray-500 text-sm">
                  No scores yet. Play this song to record your first attempt!
                </Text>
              </div>
            )}
          </div>
          <div className="mt-auto px-6 py-6 border-gray-100 border-t">
            <Button
              className="flex justify-center items-center gap-2 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 shadow-lg py-4 rounded-xl w-full font-semibold text-white text-lg transition"
              onPress={() => navigate({ pathname: '/play', search: `?${playSongSearch}` })}
            >
              Play Now
            </Button>
            <div className="mt-3 text-gray-400 text-xs text-center">
              Press{' '}
              <kbd className="bg-gray-100 px-1.5 py-0.5 border border-gray-200 rounded font-mono text-gray-500">
                Enter
              </kbd>{' '}
              to start
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
