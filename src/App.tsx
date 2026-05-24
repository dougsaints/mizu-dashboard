// App shell — Phase 14-01.
// FilterProvider acima de Routes pra persistir filtros entre páginas.
// Layout (sidebar + header + outlet) envolve todas as 8 pages.

import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './api/useAuth'
import { FilterProvider } from './lib/period'
import Login from './pages/Login'
import Layout from './components/Layout'

const HojePage = lazy(() => import('./pages/HojePage'))
const RecapSemanalPage = lazy(() => import('./pages/RecapSemanalPage'))
const VendasPage = lazy(() => import('./pages/VendasPage'))
const ProdutosPage = lazy(() => import('./pages/ProdutosPage'))
const MarketingPage = lazy(() => import('./pages/MarketingPage'))
const PadroesPage = lazy(() => import('./pages/PadroesPage'))
const DiarioPage = lazy(() => import('./pages/DiarioPage'))
const DadosPage = lazy(() => import('./pages/DadosPage'))

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
    <FilterProvider>
      <Suspense fallback={<AuthSplash />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/hoje" replace />} />
            <Route path="/hoje" element={<HojePage />} />
            <Route path="/recap-semanal" element={<RecapSemanalPage />} />
            <Route path="/vendas" element={<VendasPage />} />
            <Route path="/produtos" element={<ProdutosPage />} />
            <Route path="/marketing" element={<MarketingPage />} />
            <Route path="/padroes" element={<PadroesPage />} />
            <Route path="/diario" element={<DiarioPage />} />
            <Route path="/dados" element={<DadosPage />} />
            <Route path="*" element={<Navigate to="/hoje" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </FilterProvider>
  )
}
