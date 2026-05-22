import { useCurrentTenant } from '../lib/tenant'
import { useUnits } from '../api/useUnits'
import { useFilters, type Channel } from '../lib/period'
import DateRangePicker from './DateRangePicker'
import SyncStatusBadge from './SyncStatusBadge'

const CHANNELS: Array<{ value: Channel; label: string }> = [
  { value: 'all', label: 'Todos os canais' },
  { value: 'pdv', label: 'PDV' },
  { value: 'ifood', label: 'iFood' },
  { value: 'anotaai', label: 'AnotaAi' },
]

export default function Header() {
  const tenant = useCurrentTenant()
  const { data: units = [] } = useUnits()
  const { unitId, channel, setUnit, setChannel } = useFilters()

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

        <SyncStatusBadge />
      </div>
    </header>
  )
}
