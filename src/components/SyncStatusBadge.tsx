// Badge no header: mostra estado de sync das planilhas Google Sheets.
// Phase 11-12: redesign sem emojis — bullet CSS coloured + SVG refresh.

import { useDataSources, useRefreshSales } from '../api/useSales'

function formatRelativeTime(iso: string | null): string {
  if (!iso) return 'nunca'
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffSec = Math.floor((now - then) / 1000)
  if (diffSec < 60) return 'agora'
  if (diffSec < 3600) return `há ${Math.floor(diffSec / 60)}min`
  if (diffSec < 86400) return `há ${Math.floor(diffSec / 3600)}h`
  return `há ${Math.floor(diffSec / 86400)}d`
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
      <path d="M21 12a9 9 0 0 0-15-6.7L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7" />
      <path d="M16 16h5v5" />
    </svg>
  )
}

export default function SyncStatusBadge() {
  const { data: sources = [], isLoading } = useDataSources()
  const refresh = useRefreshSales()

  const sheetSources = sources.filter((s) => s.kind === 'gsheet_csv' && s.enabled)

  const hasError = sheetSources.some((s) => s.last_error)
  const oldestSync = sheetSources
    .map((s) => (s.last_synced_at ? new Date(s.last_synced_at).getTime() : 0))
    .reduce((min, t) => (t && t < min ? t : min), Date.now())
  const ageMin = (Date.now() - oldestSync) / 60000
  const isStale = !hasError && ageMin > 60
  const allFresh = !hasError && !isStale && sheetSources.length > 0

  const statusClass = hasError
    ? 'sync-dot--error'
    : isStale
      ? 'sync-dot--stale'
      : allFresh
        ? 'sync-dot--fresh'
        : 'sync-dot--idle'

  const label = isLoading
    ? 'Carregando…'
    : sheetSources.length === 0
      ? 'Sem fontes'
      : hasError
        ? `Falha em ${sheetSources.filter((s) => s.last_error).length} fonte(s)`
        : sheetSources.length === 1
          ? formatRelativeTime(sheetSources[0].last_synced_at)
          : `${sheetSources.length} fontes · ${formatRelativeTime(new Date(oldestSync).toISOString())}`

  const tooltipParts = sheetSources.map((s) => {
    const when = formatRelativeTime(s.last_synced_at)
    const err = s.last_error ? ` · ERRO: ${s.last_error}` : ''
    return `${s.label ?? s.id}: ${when}${err}`
  })

  return (
    <div className="sync-status-badge" title={tooltipParts.join('\n')}>
      <span className={`sync-dot ${statusClass}`} aria-hidden />
      <span className="sync-status-label">{label}</span>
      <button
        type="button"
        className={`sync-status-refresh ${refresh.isPending ? 'is-pending' : ''}`}
        onClick={() => refresh.mutate()}
        disabled={refresh.isPending}
        title="Atualizar agora"
        aria-label="Atualizar agora"
      >
        <RefreshIcon />
      </button>
    </div>
  )
}
