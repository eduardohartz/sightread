import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface JwtPayload {
  userId: string
  email: string
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: JwtPayload): string {
  // @ts-expect-error - expiresIn accepts string like '7d' at runtime
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/**
 * Verify a JWT token and return the payload
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

/**
 * Cookie options for auth token
 */
export function getAuthCookieOptions(): {
  httpOnly: boolean
  secure: boolean
  sameSite: 'lax' | 'strict' | 'none'
  maxAge: number
  path: string
} {
  const isProduction = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: isProduction, // Only use secure in production (HTTPS)
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  }
}

/**
 * Set auth cookie on response
 */
export function setAuthCookie(res: Response, token: string): void {
  res.cookie('auth_token', token, getAuthCookieOptions())
}

/**
 * Clear auth cookie on response
 */
export function clearAuthCookie(res: Response): void {
  res.clearCookie('auth_token', { path: '/' })
}

/**
 * Middleware to require authentication
 * Extracts user from cookie and attaches to request
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.auth_token

  if (!token) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }

  const payload = verifyToken(token)
  if (!payload) {
    clearAuthCookie(res)
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }

  req.user = payload
  next()
}

/**
 * Optional auth middleware - attaches user if token is valid, but doesn't require it
 */
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.auth_token

  if (token) {
    const payload = verifyToken(token)
    if (payload) {
      req.user = payload
    }
  }

  next()
}
