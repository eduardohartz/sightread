import { Modal } from '@/components'
import { uploadSong } from '@/features/api'
import { Loader } from '@/icons'
import clsx from 'clsx'
import { AlertCircle, FileMusic, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface UploadSongModalProps {
  show: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function UploadSongModal({ show, onClose, onSuccess }: UploadSongModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const midiFile = acceptedFiles[0]
      if (midiFile) {
        setFile(midiFile)
        // Auto-fill title from filename if empty
        if (!title) {
          const nameWithoutExt = midiFile.name.replace(/\.(mid|midi)$/i, '')
          setTitle(nameWithoutExt)
        }
        setError(null)
      }
    },
    [title],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/midi': ['.mid', '.midi'],
      'audio/x-midi': ['.mid', '.midi'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a MIDI file')
      return
    }
    if (!title.trim()) {
      setError('Please enter a title')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const { data, error: uploadError } = await uploadSong(file, title.trim())
      if (uploadError) {
        setError(uploadError)
        return
      }
      if (data) {
        // Reset form
        setFile(null)
        setTitle('')
        onSuccess()
      }
    } catch (err) {
      setError('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (!isUploading) {
      setFile(null)
      setTitle('')
      setError(null)
      onClose()
    }
  }

  const removeFile = () => {
    setFile(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Modal show={show} onClose={handleClose} className="w-[min(100vw,480px)]">
      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Upload a MIDI Song</h2>
          <p className="mt-1 text-sm text-gray-500">
            Upload a MIDI file to add it to your personal library
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Drop zone */}
        {!file ? (
          <div
            {...getRootProps()}
            className={clsx(
              'mb-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition',
              isDragActive
                ? 'border-violet-500 bg-violet-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
            )}
          >
            <input {...getInputProps()} />
            <Upload
              className={clsx('mb-3 h-10 w-10', isDragActive ? 'text-violet-500' : 'text-gray-400')}
            />
            <p className="text-sm font-medium text-gray-700">
              {isDragActive
                ? 'Drop your MIDI file here'
                : 'Drop a MIDI file here, or click to browse'}
            </p>
            <p className="mt-1 text-xs text-gray-500">Supports .mid and .midi files up to 10MB</p>
          </div>
        ) : (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
              <FileMusic className="h-5 w-5 text-violet-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Title input */}
        <div className="mb-6">
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-gray-700">
            Song Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for this song"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
            disabled={isUploading}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading || !file}
            className={clsx(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition',
              'bg-violet-600 hover:bg-violet-700 active:bg-violet-800',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {isUploading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}
