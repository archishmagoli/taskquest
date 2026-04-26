import { createContext, useContext, useEffect, useState } from 'react'
import { apiFetch, setToken, clearToken, getToken } from '../services/api'
import type { User } from '../types'

// Grab token from URL on page load (after OAuth redirect)
const params = new URLSearchParams(window.location.search)
const tokenFromUrl = params.get('token')
if (tokenFromUrl) {
  setToken(tokenFromUrl)
  window.history.replaceState({}, '', window.location.pathname)
}

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, logout: () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    apiFetch('/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const logout = () => {
    clearToken()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
