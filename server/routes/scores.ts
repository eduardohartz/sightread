import { Response, Router } from 'express'
import { ZodError } from 'zod'
import { AuthenticatedRequest, requireAuth } from '../lib/auth'
import prisma from '../lib/prisma'
import { scoreSubmitSchema } from '../lib/validation'

// Type for SongScore from Prisma
interface ScoreRecord {
  id: string
  accuracy: number
  combined: number
  maxStreak: number
  playedAt: Date
  perfect: number
  good: number
  missed: number
  errors: number
}

const router = Router()

// All routes require authentication
router.use(requireAuth)

/**
 * GET /api/scores
 * Get all scores for the current user
 * Query params:
 *   - songId: Filter by user-uploaded song
 *   - builtinSongId: Filter by builtin song
 *   - limit: Number of results (default 50)
 *   - offset: Pagination offset
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { songId, builtinSongId, limit = '50', offset = '0' } = req.query

    const where: any = { userId: req.user!.userId }
    if (songId) where.songId = songId
    if (builtinSongId) where.builtinSongId = builtinSongId

    const [scores, total] = await Promise.all([
      prisma.songScore.findMany({
        where,
        orderBy: { playedAt: 'desc' },
        take: Math.min(parseInt(limit as string) || 50, 100),
        skip: parseInt(offset as string) || 0,
        include: {
          song: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.songScore.count({ where }),
    ])

    res.json({ scores, total })
  } catch (error) {
    console.error('Get scores error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * GET /api/scores/stats
 * Get aggregated stats for the current user
 * Query params:
 *   - songId: Stats for specific user-uploaded song
 *   - builtinSongId: Stats for specific builtin song
 */
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { songId, builtinSongId } = req.query

    const where: any = { userId: req.user!.userId }
    if (songId) where.songId = songId
    if (builtinSongId) where.builtinSongId = builtinSongId

    // Get all relevant scores
    const scores = await prisma.songScore.findMany({
      where,
      orderBy: { playedAt: 'desc' },
    })

    if (scores.length === 0) {
      res.json({
        totalPlays: 0,
        current: null,
        best: null,
        averageAccuracy: 0,
        averageScore: 0,
        bestStreak: 0,
      })
      return
    }

    // Calculate stats
    const current = scores[0] // Most recent
    const best = scores.reduce(
      (bestScore: ScoreRecord, score: ScoreRecord) =>
        score.combined > bestScore.combined ? score : bestScore,
      scores[0],
    )
    const averageAccuracy = Math.round(
      scores.reduce((sum: number, s: ScoreRecord) => sum + s.accuracy, 0) / scores.length,
    )
    const averageScore = Math.round(
      scores.reduce((sum: number, s: ScoreRecord) => sum + s.combined, 0) / scores.length,
    )
    const bestStreak = Math.max(...scores.map((s: ScoreRecord) => s.maxStreak))

    res.json({
      totalPlays: scores.length,
      current: {
        id: current.id,
        accuracy: current.accuracy,
        combined: current.combined,
        maxStreak: current.maxStreak,
        playedAt: current.playedAt,
      },
      best: {
        id: best.id,
        accuracy: best.accuracy,
        combined: best.combined,
        maxStreak: best.maxStreak,
        playedAt: best.playedAt,
      },
      averageAccuracy,
      averageScore,
      bestStreak,
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * POST /api/scores/best-scores
 * Get best scores for multiple songs at once (for song list display)
 * Body: { songIds: string[] } - array of song identifiers (UUIDs for uploaded, strings for builtin)
 */
router.post('/best-scores', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { songIds } = req.body as { songIds: string[] }

    if (!songIds || !Array.isArray(songIds) || songIds.length === 0) {
      res.json({ bestScores: {} })
      return
    }

    // Limit to prevent abuse
    const limitedIds = songIds.slice(0, 100)

    // Separate UUIDs (user-uploaded) from builtin song IDs
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const uploadedIds = limitedIds.filter((id) => uuidPattern.test(id))
    const builtinIds = limitedIds.filter((id) => !uuidPattern.test(id))

    // Get all scores for these songs
    const scores = await prisma.songScore.findMany({
      where: {
        userId: req.user!.userId,
        OR: [
          { songId: { in: uploadedIds.length > 0 ? uploadedIds : [''] } },
          { builtinSongId: { in: builtinIds.length > 0 ? builtinIds : [''] } },
        ],
      },
      orderBy: { combined: 'desc' },
    })

    // Group by song and get best score for each
    const bestScores: Record<
      string,
      {
        accuracy: number
        combined: number
        maxStreak: number
        totalPlays: number
      }
    > = {}

    // Count plays per song
    const playCounts: Record<string, number> = {}
    for (const score of scores) {
      const songIdentifier = score.songId || score.builtinSongId
      if (!songIdentifier) continue

      playCounts[songIdentifier] = (playCounts[songIdentifier] || 0) + 1

      if (!bestScores[songIdentifier]) {
        bestScores[songIdentifier] = {
          accuracy: score.accuracy,
          combined: score.combined,
          maxStreak: score.maxStreak,
          totalPlays: 0, // Will be filled after counting
        }
      }
    }

    // Fill in play counts
    for (const songId of Object.keys(bestScores)) {
      bestScores[songId].totalPlays = playCounts[songId] || 0
    }

    res.json({ bestScores })
  } catch (error) {
    console.error('Get best scores error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * GET /api/scores/song/:identifier
 * Get scores for a specific song (user-uploaded or builtin)
 * The identifier is either a UUID (user-uploaded) or builtin song ID
 */
router.get('/song/:identifier', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const identifier = req.params.identifier as string
    const limit = (req.query.limit as string) || '20'

    // Determine if this is a UUID (user-uploaded) or builtin song ID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier,
    )

    const where: any = { userId: req.user!.userId }
    if (isUuid) {
      where.songId = identifier
    } else {
      where.builtinSongId = identifier
    }

    const scores = await prisma.songScore.findMany({
      where,
      orderBy: { playedAt: 'desc' },
      take: Math.min(parseInt(limit) || 20, 100),
    })

    // Also get best score
    const best =
      scores.length > 0
        ? scores.reduce(
            (bestScore: ScoreRecord, score: ScoreRecord) =>
              score.combined > bestScore.combined ? score : bestScore,
            scores[0],
          )
        : null

    res.json({
      scores,
      best,
      totalPlays: scores.length,
    })
  } catch (error) {
    console.error('Get song scores error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * POST /api/scores
 * Submit a new score or update existing session score
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = scoreSubmitSchema.parse(req.body)

    // If songId is provided, verify it belongs to the user
    if (data.songId) {
      const song = await prisma.song.findFirst({
        where: {
          id: data.songId,
          userId: req.user!.userId,
        },
      })

      if (!song) {
        res.status(404).json({ error: 'Song not found' })
        return
      }
    }

    let score
    let sessionId = data.sessionId

    // If sessionId is provided, try to update existing score
    if (sessionId) {
      const existing = await prisma.songScore.findFirst({
        where: {
          sessionId,
          userId: req.user!.userId,
        },
      })

      if (existing) {
        // Update existing score
        score = await prisma.songScore.update({
          where: { id: existing.id },
          data: {
            perfect: data.perfect,
            good: data.good,
            missed: data.missed,
            errors: data.errors,
            accuracy: data.accuracy,
            combined: data.combined,
            maxStreak: data.maxStreak,
            playedDuration: data.playedDuration,
            totalDuration: data.totalDuration,
            bpmModifier: data.bpmModifier,
            hand: data.hand,
            base64Recording: data.base64Recording,
          },
        })
      }
    }

    // If no existing score found (or no sessionId provided), create new one
    if (!score) {
      sessionId = sessionId || crypto.randomUUID()
      score = await prisma.songScore.create({
        data: {
          sessionId,
          userId: req.user!.userId,
          songId: data.songId,
          builtinSongId: data.builtinSongId,
          perfect: data.perfect,
          good: data.good,
          missed: data.missed,
          errors: data.errors,
          accuracy: data.accuracy,
          combined: data.combined,
          maxStreak: data.maxStreak,
          playedDuration: data.playedDuration,
          totalDuration: data.totalDuration,
          bpmModifier: data.bpmModifier,
          hand: data.hand,
          base64Recording: data.base64Recording,
        },
      })
    }

    // Get updated stats for this song
    const songFilter = data.songId ? { songId: data.songId } : { builtinSongId: data.builtinSongId }

    const allScores = await prisma.songScore.findMany({
      where: {
        userId: req.user!.userId,
        ...songFilter,
      },
      orderBy: { combined: 'desc' },
    })

    const isNewBest = allScores[0]?.id === score.id
    const bestScore = allScores[0]

    res.status(201).json({
      message: 'Score submitted successfully',
      score,
      sessionId: score.sessionId,
      isNewBest,
      bestScore: bestScore
        ? {
            id: bestScore.id,
            accuracy: bestScore.accuracy,
            combined: bestScore.combined,
            maxStreak: bestScore.maxStreak,
          }
        : null,
      totalPlays: allScores.length,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.issues[0]?.message || 'Validation error' })
      return
    }
    console.error('Submit score error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * DELETE /api/scores/:id
 * Delete a specific score (useful for data cleanup)
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const score = await prisma.songScore.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    })

    if (!score) {
      res.status(404).json({ error: 'Score not found' })
      return
    }

    await prisma.songScore.delete({
      where: { id: score.id },
    })

    res.json({ message: 'Score deleted successfully' })
  } catch (error) {
    console.error('Delete score error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * GET /api/scores/leaderboard/:songId
 * Get leaderboard for a specific song (public scores)
 * Note: This shows all users' best scores for a song
 */
router.get('/leaderboard/:songId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const songId = req.params.songId as string
    const limit = (req.query.limit as string) || '10'

    // Determine if this is a UUID (user-uploaded) or builtin song ID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(songId)

    // For user-uploaded songs, only show scores from the owner
    // For builtin songs, show all users' scores
    if (isUuid) {
      res.json({ leaderboard: [], message: 'Leaderboards only available for builtin songs' })
      return
    }

    // Get best score per user for this builtin song
    const allScores = await prisma.songScore.findMany({
      where: { builtinSongId: songId },
      orderBy: { combined: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    })

    // Get best score per user
    const bestByUser = new Map<string, (typeof allScores)[0]>()
    for (const score of allScores) {
      if (
        !bestByUser.has(score.userId) ||
        score.combined > bestByUser.get(score.userId)!.combined
      ) {
        bestByUser.set(score.userId, score)
      }
    }

    const leaderboard = Array.from(bestByUser.values())
      .sort((a, b) => b.combined - a.combined)
      .slice(0, parseInt(limit) || 10)
      .map((score, index) => ({
        rank: index + 1,
        userId: score.userId,
        displayName: score.user.displayName,
        accuracy: score.accuracy,
        combined: score.combined,
        maxStreak: score.maxStreak,
        playedAt: score.playedAt,
        isCurrentUser: score.userId === req.user!.userId,
      }))

    res.json({ leaderboard })
  } catch (error) {
    console.error('Get leaderboard error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
