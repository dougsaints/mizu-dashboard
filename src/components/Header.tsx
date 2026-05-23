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
      <div className="header-inner">
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

        <div className="header-spacer"></div>

        <DateRangePicker />

        <div className="filter-sep"></div>

        <div className="fg">
          <span className="fg-label">Comparar com</span>
          <select
            value={cmpMode}
            onChange={(e) => setCmpMode(e.target.value as CmpMode)}
          >
            {CMP_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
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
              <option key={u.id} value={u.id}>
                {u.display_name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-sep"></div>

        <div className="fg">
          <span className="fg-label">Canal de Venda</span>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as Channel)}
          >
            {CHANNELS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-sep"></div>

        <div className="fg fg-toggle">
          <span className="fg-label">Análise por</span>
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

        <SyncStatusBadge />

        {user && (
          <button
            type="button"
            className="header-logout"
            onClick={() => {
              void signOut()
            }}
            title={`Sair (${user.email})`}
            aria-label="Sair"
          >
            <span className="header-logout-email">{user.email}</span>
            <span className="header-logout-icon" aria-hidden="true">↩</span>
          </button>
        )}
      </div>
    </header>
  )
}
