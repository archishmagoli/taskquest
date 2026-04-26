import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import AvatarsPage from './pages/AvatarsPage'
import TaskDetailPage from './pages/TaskDetailPage'

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  const refresh = () => setRefreshKey(k => k + 1)

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar refreshKey={refreshKey} />
        <Routes>
          <Route path="/" element={<HomePage onTaskUpdate={refresh} />} />
          <Route path="/avatars" element={<AvatarsPage onAvatarUpdate={refresh} />} />
          <Route path="/tasks/:id" element={<TaskDetailPage onTaskUpdate={refresh} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
