import { Modal } from '@/components'
import { Loader } from '@/icons'
import clsx from 'clsx'
import { Award, Star, TrendingUp, Trophy, X } from 'lucide-react'
import { Button } from 'react-aria-components'

interface ScoreResultModalProps {
  show: boolean
  onClose: () => void
  onPlayAgain: () => void
  isSubmitting: boolean
  isNewBest: boolean
  stats: {
    perfect: number
    good: number
    missed: number
    errors: number
    accuracy: number
    combined: number
    maxStreak: number
  }
  bestStats?: {
    accuracy: number
    combined: number
    maxStreak: number
  } | null
}

export function ScoreResultModal({
  show,
  onClose,
  onPlayAgain,
  isSubmitting,
  isNewBest,
  stats,
  bestStats,
}: ScoreResultModalProps) {
  const getGrade = (accuracy: number) => {
    if (accuracy >= 95) return { grade: 'S', color: 'text-yellow-400', bg: 'bg-yellow-400/10' }
    if (accuracy >= 90) return { grade: 'A', color: 'text-green-400', bg: 'bg-green-400/10' }
    if (accuracy >= 80) return { grade: 'B', color: 'text-blue-400', bg: 'bg-blue-400/10' }
    if (accuracy >= 70) return { grade: 'C', color: 'text-purple-400', bg: 'bg-purple-400/10' }
    if (accuracy >= 60) return { grade: 'D', color: 'text-orange-400', bg: 'bg-orange-400/10' }
    return { grade: 'F', color: 'text-red-400', bg: 'bg-red-400/10' }
  }

  const gradeInfo = getGrade(stats.accuracy)

  return (
    <Modal
      show={show}
      onClose={onClose}
      className="w-[min(100vw,440px)] overflow-hidden rounded-2xl bg-[#1a1a2e] p-0"
    >
      <div className="relative">
        {/* Header with grade */}
        <div className="relative overflow-hidden px-6 pt-6 pb-4">
          <div className="absolute inset-0 bg-linear-to-br from-violet-600/20 to-purple-600/10" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative flex items-center gap-4">
            <div
              className={clsx(
                'flex h-20 w-20 items-center justify-center rounded-2xl text-4xl font-black',
                gradeInfo.bg,
                gradeInfo.color,
              )}
            >
              {gradeInfo.grade}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isNewBest ? (
                  <span className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    New Personal Best!
                  </span>
                ) : (
                  'Session Complete'
                )}
              </h2>
              <p className="mt-1 text-sm text-white/60">
                {stats.accuracy}% accuracy • {stats.combined.toLocaleString()} points
              </p>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-px bg-white/5 px-6 py-4">
          <StatBox label="Perfect" value={stats.perfect} color="text-green-400" />
          <StatBox label="Good" value={stats.good} color="text-blue-400" />
          <StatBox label="Missed" value={stats.missed} color="text-red-400" />
          <StatBox label="Errors" value={stats.errors} color="text-yellow-400" />
        </div>

        {/* Streak and score details */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-violet-400" />
              <span className="text-sm text-white/70">Max Streak</span>
            </div>
            <span className="text-lg font-bold text-white">{stats.maxStreak}</span>
          </div>

          {bestStats && !isNewBest && (
            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="mb-2 flex items-center gap-2 text-xs text-white/50 uppercase">
                <Award className="h-4 w-4" />
                Personal Best
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-white">{bestStats.accuracy}%</div>
                  <div className="text-xs text-white/50">Accuracy</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {bestStats.combined.toLocaleString()}
                  </div>
                  <div className="text-xs text-white/50">Score</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{bestStats.maxStreak}</div>
                  <div className="text-xs text-white/50">Streak</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-white/10 px-6 py-4">
          <Button
            onPress={onClose}
            className="flex-1 rounded-lg border border-white/20 bg-transparent py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Back to Songs
          </Button>
          <Button
            onPress={onPlayAgain}
            isDisabled={isSubmitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Star className="h-4 w-4" />
                Play Again
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center py-2">
      <span className={clsx('text-2xl font-bold', color)}>{value}</span>
      <span className="mt-0.5 text-xs text-white/50">{label}</span>
    </div>
  )
}
