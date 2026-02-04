import { z } from 'zod'

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1, 'Display name is required').max(100).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Song validation schemas
export const songUploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
})

export const songUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255).optional(),
})

// Score validation schemas
export const scoreSubmitSchema = z
  .object({
    // Session ID for updating existing scores within the same play session
    sessionId: z.string().uuid().optional(),

    // Song identification - either songId (user uploaded) or builtinSongId (builtin)
    songId: z.string().uuid().optional(),
    builtinSongId: z.string().optional(),

    // Score metrics
    perfect: z.number().int().min(0),
    good: z.number().int().min(0),
    missed: z.number().int().min(0),
    errors: z.number().int().min(0),
    accuracy: z.number().int().min(0).max(100),
    combined: z.number().int(),
    maxStreak: z.number().int().min(0),

    // Play metadata
    playedDuration: z.number().int().min(0),
    totalDuration: z.number().int().min(0),
    bpmModifier: z.number().min(0.1).max(10).default(1.0),
    hand: z.enum(['left', 'right', 'both']).default('both'),

    // Optional recording
    base64Recording: z.string().optional(),
  })
  .refine((data) => data.songId || data.builtinSongId, {
    message: 'Either songId or builtinSongId must be provided',
  })

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type SongUploadInput = z.infer<typeof songUploadSchema>
export type SongUpdateInput = z.infer<typeof songUpdateSchema>
export type ScoreSubmitInput = z.infer<typeof scoreSubmitSchema>
