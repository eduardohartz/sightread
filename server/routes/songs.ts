import { existsSync } from 'fs'
import fs from 'fs/promises'
import path from 'path'
import * as toneJsMidi from '@tonejs/midi'
import { Response, Router } from 'express'
import multer from 'multer'
import { ZodError } from 'zod'
import { AuthenticatedRequest, requireAuth } from '../lib/auth'
import prisma from '../lib/prisma'
import { songUpdateSchema, songUploadSchema } from '../lib/validation'

// Handle both ESM and CJS module formats
const Midi = (toneJsMidi as any).Midi || (toneJsMidi as any).default?.Midi || toneJsMidi

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'

// Ensure upload directory exists
async function ensureUploadDir(userId: string): Promise<string> {
  const userDir = path.join(UPLOAD_DIR, 'songs', userId)
  await fs.mkdir(userDir, { recursive: true })
  return userDir
}

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept MIDI files only
    const allowedMimes = ['audio/midi', 'audio/x-midi', 'application/x-midi']
    const allowedExts = ['.mid', '.midi']

    const ext = path.extname(file.originalname).toLowerCase()
    if (allowedExts.includes(ext) || allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only MIDI files are allowed'))
    }
  },
})

const router = Router()

// All routes require authentication
router.use(requireAuth)

/**
 * GET /api/songs
 * Get all songs for the current user
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const songs = await prisma.song.findMany({
      where: { userId: req.user!.userId },
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        title: true,
        fileName: true,
        fileSize: true,
        duration: true,
        noteCount: true,
        uploadedAt: true,
      },
    })

    res.json({ songs })
  } catch (error) {
    console.error('Get songs error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * GET /api/songs/:id
 * Get a specific song's metadata
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const song = await prisma.song.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
      select: {
        id: true,
        title: true,
        fileName: true,
        fileSize: true,
        duration: true,
        noteCount: true,
        uploadedAt: true,
      },
    })

    if (!song) {
      res.status(404).json({ error: 'Song not found' })
      return
    }

    res.json({ song })
  } catch (error) {
    console.error('Get song error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * GET /api/songs/:id/file
 * Download a song file
 */
router.get('/:id/file', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const song = await prisma.song.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
    })

    if (!song) {
      res.status(404).json({ error: 'Song not found' })
      return
    }

    // Check if file exists
    if (!existsSync(song.filePath)) {
      res.status(404).json({ error: 'Song file not found on server' })
      return
    }

    res.download(song.filePath, song.fileName)
  } catch (error) {
    console.error('Download song error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * POST /api/songs
 * Upload a new song
 */
router.post('/', upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }

    // Validate request body
    const data = songUploadSchema.parse(req.body)

    // Parse MIDI to extract metadata
    let duration = 0
    let noteCount = 0
    try {
      const midi = new Midi(req.file.buffer)
      duration = Math.round(midi.duration)
      noteCount = midi.tracks.reduce(
        (sum: number, track: { notes: unknown[] }) => sum + track.notes.length,
        0,
      )
    } catch (parseError) {
      console.error('MIDI parse error:', parseError)
      res.status(400).json({ error: 'Invalid MIDI file' })
      return
    }

    // Ensure user's upload directory exists
    const userDir = await ensureUploadDir(req.user!.userId)

    // Generate unique filename
    const fileId = crypto.randomUUID()
    const ext = path.extname(req.file.originalname) || '.mid'
    const storedFileName = `${fileId}${ext}`
    const filePath = path.join(userDir, storedFileName)

    // Save file
    await fs.writeFile(filePath, req.file.buffer)

    // Create database record
    const song = await prisma.song.create({
      data: {
        title: data.title,
        fileName: req.file.originalname,
        filePath,
        fileSize: req.file.size,
        duration,
        noteCount,
        userId: req.user!.userId,
      },
      select: {
        id: true,
        title: true,
        fileName: true,
        fileSize: true,
        duration: true,
        noteCount: true,
        uploadedAt: true,
      },
    })

    res.status(201).json({
      message: 'Song uploaded successfully',
      song,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.issues[0]?.message || 'Validation error' })
      return
    }
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ error: 'File too large. Maximum size is 10MB.' })
        return
      }
      res.status(400).json({ error: error.message })
      return
    }
    console.error('Upload song error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * PUT /api/songs/:id
 * Update a song's metadata
 */
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = songUpdateSchema.parse(req.body)

    // Check if song exists and belongs to user
    const id = req.params.id as string
    const existing = await prisma.song.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
    })

    if (!existing) {
      res.status(404).json({ error: 'Song not found' })
      return
    }

    const song = await prisma.song.update({
      where: { id },
      data: {
        title: data.title,
      },
      select: {
        id: true,
        title: true,
        fileName: true,
        fileSize: true,
        duration: true,
        noteCount: true,
        uploadedAt: true,
      },
    })

    res.json({ song })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.issues[0]?.message || 'Validation error' })
      return
    }
    console.error('Update song error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * DELETE /api/songs/:id
 * Delete a song
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if song exists and belongs to user
    const id = req.params.id as string
    const song = await prisma.song.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
    })

    if (!song) {
      res.status(404).json({ error: 'Song not found' })
      return
    }

    // Delete file from filesystem
    try {
      await fs.unlink(song.filePath)
    } catch (unlinkError) {
      console.warn('Could not delete song file:', unlinkError)
      // Continue with database deletion even if file deletion fails
    }

    // Delete database record
    await prisma.song.delete({
      where: { id: song.id },
    })

    res.json({ message: 'Song deleted successfully' })
  } catch (error) {
    console.error('Delete song error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
