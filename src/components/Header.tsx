import { useCurrentTenant } from '../lib/tenant'
import SyncStatusBadge from './SyncStatusBadge'

export default function Header() {
  const tenant = useCurrentTenant()

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

        <SyncStatusBadge />
      </div>
    </header>
  )
}
