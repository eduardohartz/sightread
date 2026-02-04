import { changePassword, deleteAccount } from '@/features/api'
import { useAuth } from '@/features/auth'
import { useEventListener, useWhenClickedOutside } from '@/hooks'
import { LogOut, Settings, Trash2, User } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { Modal } from '.'

interface UserMenuProps {
  displayName: string | null | undefined
  email: string | undefined
}

export function UserMenu({ displayName, email }: UserMenuProps) {
  const { logout } = useAuth()
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [isSettingsOpen, setSettingsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useWhenClickedOutside(() => setMenuOpen(false), menuRef)
  useEventListener<KeyboardEvent>('keydown', (event) => {
    if (isMenuOpen && event.key === 'Escape') {
      setMenuOpen(false)
    }
  })

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
  }

  const handleSettingsClick = () => {
    setMenuOpen(false)
    setSettingsOpen(true)
  }

  return (
    <>
      <div className="flex items-center bg-violet-500/50 mr-2 px-3 py-1 rounded-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-gray-100 text-sm">
            <User className="w-4 h-4" />
            <span>{displayName || email}</span>
          </div>
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(!isMenuOpen)}
              className="flex justify-center items-center hover:bg-gray-100 p-1.5 rounded-md text-gray-100 hover:text-gray-900 transition"
              aria-label="User menu"
            >
              <Settings className="w-4 h-4" />
            </button>
            {isMenuOpen && (
              <div className="top-full right-0 z-50 absolute bg-white shadow-xl mt-1 py-1 rounded-lg min-w-35 overflow-hidden">
                <button
                  onClick={handleSettingsClick}
                  className="flex items-center gap-2 hover:bg-gray-100 px-4 py-2 w-full text-gray-700 text-sm transition"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 hover:bg-gray-100 px-4 py-2 w-full text-gray-700 text-sm transition"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <SettingsModal
        show={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        email={email}
        displayName={displayName}
      />
    </>
  )
}

interface SettingsModalProps {
  show: boolean
  onClose: () => void
  email: string | undefined
  displayName: string | null | undefined
}

function SettingsModal({ show, onClose, email, displayName }: SettingsModalProps) {
  const { logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'password' | 'delete'>('password')

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isChangingPassword, setChangingPassword] = useState(false)

  // Delete account state
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setDeleting] = useState(false)

  const resetState = useCallback(() => {
    setActiveTab('password')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
    setPasswordSuccess('')
    setDeletePassword('')
    setDeleteConfirmText('')
    setDeleteError('')
  }, [])

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }

    setChangingPassword(true)
    try {
      const { error } = await changePassword(currentPassword, newPassword)
      if (error) {
        setPasswordError(error)
      } else {
        setPasswordSuccess('Password changed successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      setPasswordError('An error occurred. Please try again.')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setDeleteError('')

    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm')
      return
    }

    setDeleting(true)
    try {
      const { error } = await deleteAccount(deletePassword)
      if (error) {
        setDeleteError(error)
      } else {
        handleClose()
        await logout()
      }
    } catch {
      setDeleteError('An error occurred. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal show={show} onClose={handleClose} className="p-0" modalClassName="max-w-lg">
      <div className="p-6">
        <h2 className="font-semibold text-gray-900 text-xl">Settings</h2>
        <p className="mt-1 text-gray-500 text-sm">{displayName || email}</p>
      </div>

      {/* Tabs */}
      <div className="border-gray-200 border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab('password')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'password'
                ? 'border-b-2 border-violet-500 text-violet-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Change Password
          </button>
          <button
            onClick={() => setActiveTab('delete')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'delete'
                ? 'border-b-2 border-red-500 text-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Delete Account
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block font-medium text-gray-700 text-sm">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="block shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-violet-500 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 w-full text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block font-medium text-gray-700 text-sm">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-violet-500 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 w-full text-sm"
                required
                minLength={8}
              />
              <p className="mt-1 text-gray-500 text-xs">Minimum 8 characters</p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block font-medium text-gray-700 text-sm">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-violet-500 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 w-full text-sm"
                required
              />
            </div>

            {passwordError && (
              <div className="bg-red-50 p-3 rounded-md text-red-600 text-sm">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="bg-green-50 p-3 rounded-md text-green-600 text-sm">
                {passwordSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={isChangingPassword}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 w-full font-medium text-white text-sm transition disabled:cursor-not-allowed"
            >
              {isChangingPassword ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        )}

        {activeTab === 'delete' && (
          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div className="bg-red-50 p-4 rounded-md">
              <div className="flex">
                <Trash2 className="w-5 h-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="font-medium text-red-800 text-sm">Warning</h3>
                  <p className="mt-1 text-red-700 text-sm">
                    This action cannot be undone. All your data including songs, scores, and
                    settings will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="deletePassword" className="block font-medium text-gray-700 text-sm">
                Enter your password to confirm
              </label>
              <input
                type="password"
                id="deletePassword"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="block shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-red-500 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 w-full text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="deleteConfirmText"
                className="block font-medium text-gray-700 text-sm"
              >
                Type <span className="font-bold text-red-600">DELETE</span> to confirm
              </label>
              <input
                type="text"
                id="deleteConfirmText"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="block shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-red-500 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 w-full text-sm"
                required
              />
            </div>

            {deleteError && (
              <div className="bg-red-50 p-3 rounded-md text-red-600 text-sm">{deleteError}</div>
            )}

            <button
              type="submit"
              disabled={isDeleting || deleteConfirmText !== 'DELETE'}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 w-full font-medium text-white text-sm transition disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting Account...' : 'Delete Account'}
            </button>
          </form>
        )}
      </div>
    </Modal>
  )
}
