import { useRef, useState, type ReactNode } from 'react'

export type SectionSource =
  | 'meta'
  | 'anotaai'
  | 'instagram'
  | 'vendas'
  | 'diario'
  | 'neutro'

const SOURCE_LABEL: Record<SectionSource, string> = {
  meta: 'META ADS',
  anotaai: 'ANOTA AI · DELIVERY',
  instagram: 'INSTAGRAM · ORGÂNICO',
  vendas: 'VENDAS',
  diario: 'DIÁRIO',
  neutro: 'PANORAMA',
}

type Props = {
  source: SectionSource
  title: string
  subtitle?: string
  kanji?: string
  icon?: ReactNode
  period?: { start: string; end: string } | null
  actions?: ReactNode
  sourceLabel?: string
  showSourceBadge?: boolean
  exportable?: boolean
}

function formatBR(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

export default function SectionHeader({
  source,
  title,
  subtitle,
  kanji,
  icon,
  period,
  actions,
  sourceLabel,
  showSourceBadge = true,
  exportable = true,
}: Props) {
  const headerRef = useRef<HTMLDivElement | null>(null)
  const [busy, setBusy] = useState(false)
  const badgeText = sourceLabel ?? SOURCE_LABEL[source]

  async function handleExport() {
    if (busy) return
    setBusy(true)
    try {
      const section = headerRef.current?.closest('.mizu-section') as HTMLElement | null
      if (!section) return
      const { exportSectionAsPng, safeFilename } = await import('../lib/exportPng')
      await exportSectionAsPng(section, safeFilename(title))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div ref={headerRef} className={`section-header section-header--${source}`}>
      <div className="section-header-main">
        <div className="section-header-title">
          {icon ? (
            <span className="section-header-icon" aria-hidden>
              {icon}
            </span>
          ) : kanji ? (
            <span className="section-header-icon" aria-hidden>
              {kanji}
            </span>
          ) : null}
          <span>{title}</span>
        </div>
        {subtitle && <div className="section-header-sub">{subtitle}</div>}
        {period && (
          <div className="section-header-period">
            {formatBR(period.start)} → {formatBR(period.end)}
          </div>
        )}
      </div>
      <div className="section-header-actions">
        {showSourceBadge && (
          <span className="section-source-badge">{badgeText}</span>
        )}
        {actions}
        {exportable && (
          <button
            type="button"
            className="section-export-btn"
            onClick={handleExport}
            disabled={busy}
            title="Exportar esta seção como PNG"
            aria-label="Exportar PNG"
          >
            {busy ? '…' : '📷'}
          </button>
        )}
      </div>
    </div>
  )
}
