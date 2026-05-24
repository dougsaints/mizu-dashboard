// Layout shell multi-página — Phase 14-01.
// Sidebar fixa esquerda + Header no topo do main + Outlet renderiza a página corrente.
// useAutoPollSales mora aqui pra que o polling rode globalmente (não morre quando navega).

import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { useAutoPollSales } from '../api/useSales'

export default function Layout() {
  useAutoPollSales(300)

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell-main">
        <Header />
        <main className="app-shell-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
