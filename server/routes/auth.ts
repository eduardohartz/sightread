import bcrypt from 'bcryptjs'
import { Request, Response, Router } from 'express'
import { ZodError } from 'zod'
import {
  AuthenticatedRequest,
  clearAuthCookie,
  generateToken,
  requireAuth,
  setAuthCookie,
} from '../lib/auth'
import prisma from '../lib/prisma'
import { loginSchema, registerSchema } from '../lib/validation'

const router = Router()

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    })

    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' })
      return
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        displayName: data.displayName || data.email.split('@')[0],
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        createdAt: true,
      },
    })

    // Generate token and set cookie
    const token = generateToken({ userId: user.id, email: user.email })
    setAuthCookie(res, token)

    res.status(201).json({
      message: 'Registration successful',
      user,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.issues[0]?.message || 'Validation error' })
      return
    }
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    })

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash)
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    // Generate token and set cookie
    const token = generateToken({ userId: user.id, email: user.email })
    setAuthCookie(res, token)

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
    })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.issues[0]?.message || 'Validation error' })
      return
    }
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * POST /api/auth/logout
 * Logout current user (clears cookie)
 */
router.post('/logout', (_req: Request, res: Response) => {
  clearAuthCookie(res)
  res.json({ message: 'Logged out successfully' })
})

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        createdAt: true,
      },
    })

    if (!user) {
      clearAuthCookie(res)
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * PUT /api/auth/me
 * Update current user profile
 */
router.put('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { displayName } = req.body

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        displayName: displayName || undefined,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        createdAt: true,
      },
    })

    res.json({ user })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * PUT /api/auth/password
 * Change password
 */
router.put('/password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required' })
      return
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters' })
      return
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    })

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValidPassword) {
      res.status(401).json({ error: 'Current password is incorrect' })
      return
    }

    // Hash and update new password
    const passwordHash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    })

    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Password update error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
