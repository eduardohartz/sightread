import { AppBar, Sizer, UserMenu } from '@/components'
import { useAuth } from '@/features/auth/AuthContext'
import { Link } from 'react-router'

export default function TrainingPage() {
  const links = [
    { label: 'Speed', url: '/training/speed' },
    { label: 'Infinite', url: '/training/phrases' },
  ]

  const { user } = useAuth()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar>
        <UserMenu displayName={user?.displayName} email={user?.email} />
      </AppBar>
      <Sizer height={48} />
      <div className="flex justify-center content-center gap-5 py-6 h-full grow">
        {links.map(({ label, url }) => (
          <Link to={url} key={url} className="text-white no-underline">
            <div className="flex justify-center items-center bg-gray-500 w-50 h-50">{label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
