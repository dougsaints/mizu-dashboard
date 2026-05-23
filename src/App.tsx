import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './api/useAuth'
import Login from './pages/Login'

const Dashboard = lazy(() => import('./pages/Dashboard'))

function AuthSplash() {
  return (
    <div className="auth-splash">
      <span className="kanji-mizu auth-splash-kanji">水</span>
    </div>
  )
}

export default function App() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <AuthSplash />
  if (!user) return <Login />

  return (
    <Suspense fallback={<AuthSplash />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
