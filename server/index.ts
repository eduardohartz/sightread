import 'dotenv/config'
import path from 'path'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { authRouter, scoresRouter, songsRouter } from './routes'

const app = express()
const PORT = process.env.API_PORT || 3001

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true, // Required for cookies
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Serve uploaded files statically (for direct file access if needed)
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
app.use('/uploads', express.static(path.resolve(UPLOAD_DIR)))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRouter)
app.use('/api/songs', songsRouter)
app.use('/api/scores', scoresRouter)

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler for API routes
app.use('/api/{*splat}', (_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`)
  console.log(`📁 Upload directory: ${path.resolve(UPLOAD_DIR)}`)
})

export default app
