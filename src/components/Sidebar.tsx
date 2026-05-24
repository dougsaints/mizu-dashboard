// Sidebar lateral esquerda — Phase 14-01.
// 7 NavLinks agrupados em 3 categorias (Visão Geral / Análises / Operação).
// Toggle expandida (240px) / colapsada (64px) com persistência em localStorage.
// Mobile: oculta abaixo de 1024px (drawer entra em 14-03).

import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth, signOut } from '../api/useAuth'

const STORAGE_KEY = 'mizu-sidebar-collapsed'

type NavItem = {
  to: string
  label: string
  icon: ReactNode
}

type NavGroup = {
  header: string
  items: NavItem[]
}

const icon = (children: React.ReactNode) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {children}
  </svg>
)

const NAV_GROUPS: NavGroup[] = [
  {
    header: 'Visão Geral',
    items: [
      { to: '/hoje', label: 'Hoje', icon: icon(<><path d="M3 12 L12 3 L21 12" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>) },
      { to: '/recap-semanal', label: 'Recap Semanal', icon: icon(<><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M9 16l2 2 4-4" /></>) },
    ],
  },
  {
    header: 'Análises',
    items: [
      { to: '/vendas', label: 'Vendas', icon: icon(<><polyline points="3 17 9 11 13 15 21 7" /><polyline points="14 7 21 7 21 14" /></>) },
      { to: '/produtos', label: 'Produtos', icon: icon(<><path d="M12 2 L20 7 V17 L12 22 L4 17 V7 Z" /><polyline points="4 7 12 12 20 7" /><line x1="12" y1="12" x2="12" y2="22" /></>) },
      { to: '/marketing', label: 'Marketing', icon: icon(<><path d="M3 11 L21 5 V19 L3 13 Z" /><line x1="8" y1="13" x2="8" y2="20" /><path d="M21 9a3 3 0 0 1 0 6" /></>) },
      { to: '/padroes', label: 'Padrões', icon: icon(<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></>) },
    ],
  },
  {
    header: 'Operação',
    items: [
      { to: '/diario', label: 'Diário', icon: icon(<><path d="M2 6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14H4a2 2 0 0 1-2-2Z" /><path d="M22 6a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v14h8a2 2 0 0 0 2-2Z" /></>) },
      { to: '/dados', label: 'Dados', icon: icon(<><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5" /><path d="M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6" /></>) },
    ],
  },
]

function getInitials(email: string | undefined): string {
  if (!email) return '?'
  const [local] = email.split('@')
  if (!local) return '?'
  return local.slice(0, 2).toUpperCase()
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  })
  const { user } = useAuth()

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev
      window.localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }

  return (
    <aside className={`sidebar${collapsed ? ' sidebar-collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="sidebar-logo-kanji">水</span>
          <span className="sidebar-logo-label">Sushi Mizú</span>
        </div>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={toggle}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_GROUPS.map((group) => (
          <div key={group.header} className="sidebar-group">
            <div className="sidebar-group-header">{group.header}</div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {user && (
        <div className="sidebar-footer">
          <div className="sidebar-avatar" title={user.email ?? ''}>{getInitials(user.email)}</div>
          <span className="sidebar-user-email">{user.email}</span>
          <button
            type="button"
            className="sidebar-logout"
            onClick={() => { void signOut() }}
            title={`Sair (${user.email})`}
            aria-label="Sair"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      )}
    </aside>
  )
}
