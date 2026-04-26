import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getUser } from '../services/users'
import type { User } from '../types'

interface NavbarProps {
  refreshKey?: number
}

export default function Navbar({ refreshKey }: NavbarProps) {
  const [user, setUser] = useState<User | null>(null)
  const location = useLocation()

  useEffect(() => {
    getUser(1).then(setUser).catch(console.error)
  }, [refreshKey])

  const active = 'bg-purple-500 text-white border-purple-600'
  const inactive = 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b-2 border-purple-300 bg-white">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center rounded">
            <span className="text-white font-bold text-lg">TQ</span>
          </div>
          <span className="text-xl font-bold text-purple-800">TaskQuest</span>
        </div>
        <nav className="flex gap-2">
          <Link to="/" className={`px-4 py-2 rounded border-2 font-semibold transition-colors ${location.pathname === '/' ? active : inactive}`}>
            Home
          </Link>
          <Link to="/avatars" className={`px-4 py-2 rounded border-2 font-semibold transition-colors ${location.pathname === '/avatars' ? active : inactive}`}>
            Avatars
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-bold text-purple-700">{user?.points ?? 0} pts</span>
        <Link to="/profile" className="hover:opacity-80 transition-opacity">
          {user?.avatar_image
            ? <img src={user.avatar_image} alt="avatar" className="w-10 h-10 rounded-full border-2 border-purple-600" />
            : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 border-2 border-purple-600" />
          }
        </Link>
      </div>
    </header>
  )
}
