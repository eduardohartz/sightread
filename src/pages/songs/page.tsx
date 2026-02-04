import { AppBar, MarketingFooter, Modal, Sizer, UserMenu } from '@/components'
import { BestScoreInfo, getBestScores, getUserSongs, UserSong } from '@/features/api'
import { AuthRequired, useAuth } from '@/features/auth'
import { SongPreviewModal } from '@/features/SongPreview'
import { useEventListener } from '@/hooks'
import { Loader } from '@/icons'
import builtinSongManifest from '@/manifest.json'
import { SongMetadata, SongSource } from '@/types'
import clsx from 'clsx'
import { Music, Plus, Upload } from 'lucide-react'
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
  const { user } = useAuth()
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
      <div className="flex flex-col bg-gray-50 w-full h-screen overflow-hidden">
        <div className="shrink-0">
          <AppBar>
            <UserMenu displayName={user?.displayName} email={user?.email} />
          </AppBar>
        </div>
        <div className="mx-auto flex min-h-0 w-full max-w-(--breakpoint-lg) flex-1 flex-col p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-gray-900 text-2xl">Songs</h2>
              <Sizer height={4} />
              <h3 className="text-gray-600 text-sm">
                Select a song, choose your settings, and begin learning
              </h3>
            </div>
          </div>
          <Sizer height={16} />

          {/* Tabs and Search Row */}
          <div className="flex items-center gap-4">
            {/* Tabs */}
            <div className="flex bg-gray-100 p-1 border border-gray-200 rounded-lg">
              <button
                onClick={() => setActiveTab('all')}
                className={clsx(
                  'px-3 py-1.5 rounded-md font-medium text-sm transition',
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
                  'px-3 py-1.5 rounded-md font-medium text-sm transition',
                  activeTab === 'builtin'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900',
                )}
              >
                <Music className="inline mr-1.5 w-4 h-4" />
                Built-in Songs ({builtinSongs.length})
              </button>
              <button
                onClick={() => setActiveTab('uploaded')}
                className={clsx(
                  'px-3 py-1.5 rounded-md font-medium text-sm transition',
                  activeTab === 'uploaded'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900',
                )}
              >
                <Upload className="inline mr-1.5 w-4 h-4" />
                My Songs ({userSongs.length})
              </button>
            </div>

            <div className="flex-1">
              <SearchBox placeholder="Search Titles" onSearch={setSearch} autoFocus={true} />
            </div>

            <button
              onClick={() => setUploadModalOpen(true)}
              className={clsx(
                'flex-nowrap whitespace-nowrap cursor-pointer',
                'inline-flex items-center gap-2 rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white shadow-sm',
                'transition-colors hover:bg-violet-700',
              )}
            >
              <Plus className="w-4 h-4" />
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
