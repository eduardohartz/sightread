import { AppBar, MarketingFooter, Modal, Sizer } from '@/components'
import { BestScoreInfo, getBestScores, getUserSongs, UserSong } from '@/features/api'
import { AuthRequired, useAuth } from '@/features/auth'
import { SongPreviewModal } from '@/features/SongPreview'
import { useEventListener } from '@/hooks'
import { Loader } from '@/icons'
import builtinSongManifest from '@/manifest.json'
import { SongMetadata, SongSource } from '@/types'
import clsx from 'clsx'
import { LogOut, Music, Plus, Upload, User } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Table } from './components'
import { SearchBox } from './components/Table/SearchBox'
import { TableSkeleton } from './components/Table/Table'
import UploadSongModal from './components/UploadSongModal'

// Convert builtin manifest to SongMetadata[]
const builtinSongs: SongMetadata[] = (builtinSongManifest as any[]).map((song) => ({
  id: song.id,
  file: song.file,
  title: song.title,
  difficulty: 0,
  duration: song.duration,
  source: 'builtin' as SongSource,
  url: song.url,
  license: song.license,
}))

// Convert UserSong to SongMetadata for display in the table
function userSongToMetadata(song: UserSong): SongMetadata {
  return {
    id: song.id,
    file: song.fileName,
    title: song.title,
    difficulty: 0,
    duration: song.duration,
    source: 'uploaded' as SongSource, // New source type for user songs
  }
}

function SelectSongPageContent() {
  const { user, logout } = useAuth()
  const [userSongs, setUserSongs] = useState<UserSong[]>([])
  const [isLoadingUserSongs, setIsLoadingUserSongs] = useState(true)
  const [isUploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'builtin' | 'uploaded'>('all')
  const [bestScores, setBestScores] = useState<Record<string, BestScoreInfo>>({})

  // Fetch user songs on mount
  const fetchUserSongs = useCallback(async () => {
    setIsLoadingUserSongs(true)
    try {
      const { data, error } = await getUserSongs()
      if (data?.songs && !error) {
        setUserSongs(data.songs)
      }
    } catch (err) {
      console.error('Failed to fetch user songs:', err)
    } finally {
      setIsLoadingUserSongs(false)
    }
  }, [])

  useEffect(() => {
    fetchUserSongs()
  }, [fetchUserSongs])

  // Combine songs based on active tab
  const songs = useMemo(() => {
    const userSongsMeta = userSongs.map(userSongToMetadata)

    switch (activeTab) {
      case 'builtin':
        return builtinSongs
      case 'uploaded':
        return userSongsMeta
      case 'all':
      default:
        return [...userSongsMeta, ...builtinSongs]
    }
  }, [activeTab, userSongs])

  // Fetch best scores for displayed songs
  useEffect(() => {
    const fetchBestScores = async () => {
      if (songs.length === 0) return

      const songIds = songs.map((s) => s.id)
      const { data, error } = await getBestScores(songIds)
      if (data && !error) {
        setBestScores(data.bestScores)
      }
    }

    fetchBestScores()
  }, [songs])

  // Find selected song metadata
  const selectedSongMeta = useMemo(() => {
    if (!selectedSongId) return undefined
    return songs.find((s) => s.id === selectedSongId)
  }, [selectedSongId, songs])

  useEventListener<KeyboardEvent>('keydown', (event) => {
    if (event.key === 'Escape') {
      setUploadModalOpen(false)
    }
  })

  const handleUploadSuccess = () => {
    setUploadModalOpen(false)
    fetchUserSongs()
  }

  const handleLogout = async () => {
    await logout()
  }

  const isLoading = isLoadingUserSongs

  return (
    <>
      <title>Select a song</title>
      <SongPreviewModal
        show={!!selectedSongId}
        songMeta={selectedSongMeta}
        onClose={() => setSelectedSongId(null)}
      />
      <UploadSongModal
        show={isUploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
      <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-50">
        <div className="shrink-0">
          <AppBar>
            <div className="mr-2 flex items-center rounded-md bg-violet-500/50 px-3 py-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-100">
                  <User className="h-4 w-4" />
                  <span>{user?.displayName || user?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-gray-100 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </AppBar>
        </div>
        <div className="mx-auto flex min-h-0 w-full max-w-(--breakpoint-lg) flex-1 flex-col p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Songs</h2>
              <Sizer height={4} />
              <h3 className="text-sm text-gray-600">
                Select a song, choose your settings, and begin learning
              </h3>
            </div>
          </div>
          <Sizer height={16} />

          {/* Tabs and Search Row */}
          <div className="flex items-center gap-4">
            {/* Tabs */}
            <div className="flex rounded-lg border border-gray-200 bg-gray-100 p-1">
              <button
                onClick={() => setActiveTab('all')}
                className={clsx(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition',
                  activeTab === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900',
                )}
              >
                All Songs
              </button>
              <button
                onClick={() => setActiveTab('builtin')}
                className={clsx(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition',
                  activeTab === 'builtin'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900',
                )}
              >
                <Music className="mr-1.5 inline h-4 w-4" />
                Built-in Songs ({builtinSongs.length})
              </button>
              <button
                onClick={() => setActiveTab('uploaded')}
                className={clsx(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition',
                  activeTab === 'uploaded'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900',
                )}
              >
                <Upload className="mr-1.5 inline h-4 w-4" />
                My Songs ({userSongs.length})
              </button>
            </div>

            <div className="flex-1">
              <SearchBox placeholder="Search Titles" onSearch={setSearch} autoFocus={true} />
            </div>

            <button
              onClick={() => setUploadModalOpen(true)}
              className={clsx(
                'cursor-pointer flex-nowrap whitespace-nowrap',
                'inline-flex items-center gap-2 rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white shadow-sm',
                'transition-colors hover:bg-violet-700',
              )}
            >
              <Plus className="h-4 w-4" />
              Upload Song
            </button>
          </div>
          <Sizer height={20} />

          {isLoading ? (
            <TableSkeleton />
          ) : (
            <Table
              rows={songs}
              search={search}
              onSelectRow={setSelectedSongId}
              bestScores={bestScores}
            />
          )}
        </div>
        <div className="shrink-0">
          <MarketingFooter />
        </div>
      </div>
    </>
  )
}

export default function SelectSongPage() {
  return (
    <AuthRequired>
      <SelectSongPageContent />
    </AuthRequired>
  )
}
