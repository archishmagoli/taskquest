import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import AvatarsPage from './pages/AvatarsPage'
import TaskDetailPage from './pages/TaskDetailPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'

function ProtectedRoute({ element }: { element: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex-1 flex items-center justify-center text-purple-600 font-semibold">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{element}</>
}

function AppRoutes() {
  const [refreshKey, setRefreshKey] = useState(0)
  const refresh = () => setRefreshKey(k => k + 1)
  const { user } = useAuth()

  return (
    <div className="flex flex-col min-h-screen">
      {user && <Navbar refreshKey={refreshKey} />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute element={<HomePage onTaskUpdate={refresh} />} />} />
        <Route path="/avatars" element={<ProtectedRoute element={<AvatarsPage onAvatarUpdate={refresh} />} />} />
        <Route path="/tasks/:id" element={<ProtectedRoute element={<TaskDetailPage onTaskUpdate={refresh} />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<ProfilePage onReset={refresh} />} />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
