import { AppBar, Sizer } from '@/components'
import { useAuth } from '@/features/auth/AuthContext'
import { LogOut, User } from '@/icons'
import { Link } from 'react-router'

export default function TrainingPage() {
  const links = [
    { label: 'Speed', url: '/training/speed' },
    { label: 'Infinite', url: '/training/phrases' },
  ]

  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
      <Sizer height={48} />
      <div className="flex h-full grow content-center justify-center gap-5 py-6">
        {links.map(({ label, url }) => (
          <Link to={url} key={url} className="text-white no-underline">
            <div className="flex h-50 w-50 items-center justify-center bg-gray-500">{label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
