// Header em 2 faixas — Phase 11-05.
// Faixa superior: marca + sync + PDF + logout (compacta).
// Faixa inferior (sticky): filtros globais (período, comparar, unidade, canal, mensal/semanal).

import { useCurrentTenant } from '../lib/tenant'
import { useUnits } from '../api/useUnits'
import { useFilters, type Channel, type CmpMode, type AnalysisMode } from '../lib/period'
import { useAuth, signOut } from '../api/useAuth'
import DateRangePicker from './DateRangePicker'
import SyncStatusBadge from './SyncStatusBadge'

const CHANNELS: Array<{ value: Channel; label: string }> = [
  { value: 'all', label: 'Todos os canais' },
  { value: 'pdv', label: 'PDV' },
  { value: 'ifood', label: 'iFood' },
  { value: 'anotaai', label: 'AnotaAi' },
]

const CMP_OPTIONS: Array<{ value: CmpMode; label: string }> = [
  { value: 'prev', label: 'Período anterior' },
  { value: 'prevMonth', label: 'Mês passado' },
  { value: 'none', label: 'Não comparar' },
]

export default function Header() {
  const tenant = useCurrentTenant()
  const { data: units = [] } = useUnits()
  const { unitId, channel, cmpMode, analysisMode, setUnit, setChannel, setCmpMode, setAnalysisMode } = useFilters()
  const { user } = useAuth()

  return (
    <header className="header">
      {/* Faixa superior: marca + identidade + ações de conta */}
      <div className="header-top">
        <div className="header-top-inner">
          <div className="logo">
            <div className="logo-mark">
              <img src={tenant.brand.logoUrl} alt={tenant.displayName} />
            </div>
            <div>
              <div className="logo-name">
                Sushi <span className="gold">Mizú</span>
              </div>
              <div className="logo-sub">
                <span className="kanji-mark">{tenant.brand.kanji}</span> Painel
              </div>
            </div>
          </div>

          <div className="header-top-spacer"></div>

          <SyncStatusBadge />

          <button
            type="button"
            className="header-print-btn"
            onClick={() => window.print()}
            title="Imprimir / Exportar como PDF (Ctrl+P)"
            aria-label="Imprimir ou exportar como PDF"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M6 9V2h12v7" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" rx="1" />
            </svg>
            <span>PDF</span>
          </button>

          {user && (
            <button
              type="button"
              className="header-logout"
              onClick={() => { void signOut() }}
              title={`Sair (${user.email})`}
              aria-label="Sair"
            >
              <span className="header-logout-email">{user.email}</span>
              <svg
                className="header-logout-icon"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Faixa inferior (sticky): filtros globais */}
      <div className="header-filters">
        <div className="header-filters-inner">
          <DateRangePicker />

          <div className="filter-sep"></div>

          <div className="fg">
            <span className="fg-label">Comparar com</span>
            <select value={cmpMode} onChange={(e) => setCmpMode(e.target.value as CmpMode)}>
              {CMP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-sep"></div>

          <div className="fg">
            <span className="fg-label">Unidade</span>
            <select
              value={unitId ?? ''}
              onChange={(e) => setUnit(e.target.value === '' ? null : e.target.value)}
            >
              <option value="">Todas as unidades</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.display_name}</option>
              ))}
            </select>
          </div>

          <div className="filter-sep"></div>

          <div className="fg">
            <span className="fg-label">Canal</span>
            <select value={channel} onChange={(e) => setChannel(e.target.value as Channel)}>
              {CHANNELS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-sep"></div>

          <div className="fg fg-toggle">
            <span className="fg-label">Análise</span>
            <div className="fg-toggle-btns">
              <button
                className={analysisMode === 'monthly' ? 'active' : ''}
                onClick={() => setAnalysisMode('monthly' as AnalysisMode)}
              >
                Mensal
              </button>
              <button
                className={analysisMode === 'weekly' ? 'active' : ''}
                onClick={() => setAnalysisMode('weekly' as AnalysisMode)}
              >
                Semanal
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
