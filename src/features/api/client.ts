// API configuration
// In development, use relative paths (proxied by Vite)
// In production, use the configured API URL or default to same-origin
export const API_BASE_URL = import.meta.env.PROD ? import.meta.env.VITE_PUBLIC_API_URL || '' : ''

// Common fetch options with credentials
const defaultOptions: RequestInit = {
  credentials: 'include', // Required for cookies
  headers: {
    'Content-Type': 'application/json',
  },
}

// Generic API response type
interface ApiResponse<T> {
  data?: T
  error?: string
}

// Helper to make API requests
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || `HTTP ${response.status}` }
    }

    return { data }
  } catch (error) {
    console.error('API fetch error:', error)
    return { error: 'Network error. Please check your connection.' }
  }
}

// User types
export interface User {
  id: string
  email: string
  displayName: string | null
  createdAt?: string
}

// Song types
export interface UserSong {
  id: string
  title: string
  fileName: string
  fileSize: number
  duration: number
  noteCount: number | null
  uploadedAt: string
}

// Score types
export interface SongScore {
  id: string
  sessionId: string
  perfect: number
  good: number
  missed: number
  errors: number
  accuracy: number
  combined: number
  maxStreak: number
  playedDuration: number
  totalDuration: number
  bpmModifier: number
  hand: string
  playedAt: string
  songId: string | null
  builtinSongId: string | null
  song?: { id: string; title: string } | null
  base64Recording?: string | null
}

export interface ScoreStats {
  totalPlays: number
  current: {
    id: string
    accuracy: number
    combined: number
    maxStreak: number
    playedAt: string
  } | null
  best: {
    id: string
    accuracy: number
    combined: number
    maxStreak: number
    playedAt: string
  } | null
  averageAccuracy: number
  averageScore: number
  bestStreak: number
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  displayName: string | null
  accuracy: number
  combined: number
  maxStreak: number
  playedAt: string
  isCurrentUser: boolean
}

// ============================================
// AUTH API
// ============================================

export async function register(
  email: string,
  password: string,
  displayName?: string,
): Promise<ApiResponse<{ message: string; user: User }>> {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName }),
  })
}

export async function login(
  email: string,
  password: string,
): Promise<ApiResponse<{ message: string; user: User }>> {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function logout(): Promise<ApiResponse<{ message: string }>> {
  return apiFetch('/api/auth/logout', {
    method: 'POST',
  })
}

export async function getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
  return apiFetch('/api/auth/me')
}

export async function updateProfile(displayName: string): Promise<ApiResponse<{ user: User }>> {
  return apiFetch('/api/auth/me', {
    method: 'PUT',
    body: JSON.stringify({ displayName }),
  })
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<ApiResponse<{ message: string }>> {
  return apiFetch('/api/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export async function deleteAccount(password: string): Promise<ApiResponse<{ message: string }>> {
  return apiFetch('/api/auth/account', {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  })
}

// ============================================
// SONGS API
// ============================================

export async function getUserSongs(): Promise<ApiResponse<{ songs: UserSong[] }>> {
  return apiFetch('/api/songs')
}

export async function getUserSong(id: string): Promise<ApiResponse<{ song: UserSong }>> {
  return apiFetch(`/api/songs/${id}`)
}

export async function uploadSong(
  file: File,
  title: string,
): Promise<ApiResponse<{ message: string; song: UserSong }>> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', title)

  try {
    const response = await fetch(`${API_BASE_URL}/api/songs`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || `HTTP ${response.status}` }
    }

    return { data }
  } catch (error) {
    console.error('Upload error:', error)
    return { error: 'Upload failed. Please try again.' }
  }
}

export async function updateSong(
  id: string,
  title: string,
): Promise<ApiResponse<{ song: UserSong }>> {
  return apiFetch(`/api/songs/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title }),
  })
}

export async function deleteSong(id: string): Promise<ApiResponse<{ message: string }>> {
  return apiFetch(`/api/songs/${id}`, {
    method: 'DELETE',
  })
}

export function getSongFileUrl(id: string): string {
  return `${API_BASE_URL}/api/songs/${id}/file`
}

// ============================================
// SCORES API
// ============================================

export async function getScores(params?: {
  songId?: string
  builtinSongId?: string
  limit?: number
  offset?: number
}): Promise<ApiResponse<{ scores: SongScore[]; total: number }>> {
  const searchParams = new URLSearchParams()
  if (params?.songId) searchParams.set('songId', params.songId)
  if (params?.builtinSongId) searchParams.set('builtinSongId', params.builtinSongId)
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.offset) searchParams.set('offset', params.offset.toString())

  const query = searchParams.toString()
  return apiFetch(`/api/scores${query ? `?${query}` : ''}`)
}

export async function getScoreStats(params?: {
  songId?: string
  builtinSongId?: string
}): Promise<ApiResponse<ScoreStats>> {
  const searchParams = new URLSearchParams()
  if (params?.songId) searchParams.set('songId', params.songId)
  if (params?.builtinSongId) searchParams.set('builtinSongId', params.builtinSongId)

  const query = searchParams.toString()
  return apiFetch(`/api/scores/stats${query ? `?${query}` : ''}`)
}

export async function getSongScores(
  identifier: string,
  limit?: number,
): Promise<ApiResponse<{ scores: SongScore[]; best: SongScore | null; totalPlays: number }>> {
  const searchParams = new URLSearchParams()
  if (limit) searchParams.set('limit', limit.toString())

  const query = searchParams.toString()
  return apiFetch(`/api/scores/song/${identifier}${query ? `?${query}` : ''}`)
}

export interface SubmitScoreInput {
  sessionId?: string
  songId?: string
  builtinSongId?: string
  perfect: number
  good: number
  missed: number
  errors: number
  accuracy: number
  combined: number
  maxStreak: number
  playedDuration: number
  totalDuration: number
  bpmModifier?: number
  hand?: 'left' | 'right' | 'both'
  base64Recording?: string
}

export async function submitScore(input: SubmitScoreInput): Promise<
  ApiResponse<{
    message: string
    score: SongScore
    sessionId: string
    isNewBest: boolean
    bestScore: { id: string; accuracy: number; combined: number; maxStreak: number } | null
    totalPlays: number
  }>
> {
  return apiFetch('/api/scores', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export interface BestScoreInfo {
  accuracy: number
  combined: number
  maxStreak: number
  totalPlays: number
}

export async function getBestScores(
  songIds: string[],
): Promise<ApiResponse<{ bestScores: Record<string, BestScoreInfo> }>> {
  return apiFetch('/api/scores/best-scores', {
    method: 'POST',
    body: JSON.stringify({ songIds }),
  })
}

export async function deleteScore(id: string): Promise<ApiResponse<{ message: string }>> {
  return apiFetch(`/api/scores/${id}`, {
    method: 'DELETE',
  })
}

export async function getLeaderboard(
  songId: string,
  limit?: number,
): Promise<ApiResponse<{ leaderboard: LeaderboardEntry[] }>> {
  const searchParams = new URLSearchParams()
  if (limit) searchParams.set('limit', limit.toString())

  const query = searchParams.toString()
  return apiFetch(`/api/scores/leaderboard/${songId}${query ? `?${query}` : ''}`)
}
