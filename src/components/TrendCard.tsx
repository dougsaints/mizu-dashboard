// Mini-KPI com badge ▲▼% — usado pela TrendsSection (Phase 6-02).
// "favorability" diz se subir é bom (positive), ruim (negative) ou
// neutro (neutral, ex: investimento subindo não é nem bom nem ruim).

export type Favorability = 'positive' | 'negative' | 'neutral'

export type TrendCardProps = {
  label: string
  formatted: string
  curr: number | null
  prev: number | null
  formattedPrev?: string
  favorability?: Favorability
  hint?: string
  hero?: boolean
}

type BadgeState = {
  show: boolean
  cls: string
  arrow: string
  text: string
  tooltip: string
}

function computeBadge(
  curr: number | null,
  prev: number | null,
  favorability: Favorability,
  formattedPrev: string | undefined,
): BadgeState {
  const hidden: BadgeState = { show: false, cls: '', arrow: '', text: '', tooltip: '' }
  if (prev === null || prev === undefined) return hidden
  if (curr === null || curr === undefined) return hidden

  const tooltip = formattedPrev ? `vs ${formattedPrev} no período comparado` : ''

  if (prev === 0) {
    if (curr === 0) return hidden
    return {
      show: true,
      cls: 'trend-delta--new',
      arrow: '',
      text: 'novo',
      tooltip,
    }
  }

  const delta = ((curr - prev) / prev) * 100
  const abs = Math.abs(delta)

  if (abs < 0.5) {
    return {
      show: true,
      cls: 'trend-delta--flat',
      arrow: '',
      text: 'estável',
      tooltip,
    }
  }

  const isUp = delta > 0
  const arrow = isUp ? '▲' : '▼'
  const formattedDelta = abs.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })

  let cls: string
  if (favorability === 'neutral') {
    cls = isUp ? 'trend-delta--up-neutral' : 'trend-delta--down-neutral'
  } else if (favorability === 'negative') {
    cls = isUp ? 'trend-delta--up-bad' : 'trend-delta--down-good'
  } else {
    cls = isUp ? 'trend-delta--up-good' : 'trend-delta--down-bad'
  }

  return {
    show: true,
    cls,
    arrow,
    text: `${formattedDelta}%`,
    tooltip,
  }
}

export default function TrendCard({
  label,
  formatted,
  curr,
  prev,
  formattedPrev,
  favorability = 'positive',
  hint,
  hero = false,
}: TrendCardProps) {
  const badge = computeBadge(curr, prev, favorability, formattedPrev)

  return (
    <div className={hero ? 'trend-card trend-card--hero' : 'trend-card'}>
      <div className="trend-card-label">{label}</div>
      <div className="trend-card-value-row">
        <div className="trend-card-value">{formatted}</div>
        {badge.show && (
          <span className={`trend-delta ${badge.cls}`} title={badge.tooltip}>
            {badge.arrow ? `${badge.arrow} ` : ''}
            {badge.text}
          </span>
        )}
      </div>
      {hint && <div className="trend-card-hint">{hint}</div>}
    </div>
  )
}
