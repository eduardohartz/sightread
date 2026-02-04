import { SongScore, submitScore, SubmitScoreInput } from '@/features/api'
import { useCallback, useRef, useState } from 'react'

interface UseScoreSubmissionResult {
  submit: (input: SubmitScoreInput) => Promise<{
    success: boolean
    isNewBest: boolean
    sessionId?: string
    score?: SongScore
    error?: string
  }>
  isSubmitting: boolean
  sessionId: string | null
  resetSession: () => void
  lastSubmission: {
    score: SongScore
    isNewBest: boolean
  } | null
}

export function useScoreSubmission(): UseScoreSubmissionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [lastSubmission, setLastSubmission] = useState<{
    score: SongScore
    isNewBest: boolean
  } | null>(null)

  const submit = useCallback(
    async (input: SubmitScoreInput) => {
      setIsSubmitting(true)
      try {
        // Include sessionId if we have one (for updating existing session score)
        const inputWithSession = sessionId ? { ...input, sessionId } : input

        const { data, error } = await submitScore(inputWithSession)
        if (error || !data) {
          return { success: false, isNewBest: false, error: error || 'Unknown error' }
        }

        // Store the session ID for future updates
        setSessionId(data.sessionId)

        setLastSubmission({
          score: data.score,
          isNewBest: data.isNewBest,
        })

        return {
          success: true,
          isNewBest: data.isNewBest,
          sessionId: data.sessionId,
          score: data.score,
        }
      } catch (err) {
        console.error('Score submission error:', err)
        return { success: false, isNewBest: false, error: 'Failed to submit score' }
      } finally {
        setIsSubmitting(false)
      }
    },
    [sessionId],
  )

  const resetSession = useCallback(() => {
    setSessionId(null)
    setLastSubmission(null)
  }, [])

  return { submit, isSubmitting, sessionId, resetSession, lastSubmission }
}
