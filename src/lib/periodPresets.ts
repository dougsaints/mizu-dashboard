// Atalhos de período — portados do date range picker do painel original
// (painel-diario_BKP_2026-05-16_v7-atual.html, DRP_PRESETS, ~linha 3007).
// Datas trabalhadas como ISO local yyyy-mm-dd, sem fuso (evita o pulo de
// dia que new Date(iso).toISOString() causa em fusos negativos).

export type PeriodPreset = { key: string; label: string }
export type DateRange = { start: string; end: string }

export const PERIOD_PRESETS: PeriodPreset[] = [
  { key: 'today', label: 'Hoje' },
  { key: 'yesterday', label: 'Ontem' },
  { key: 't_y', label: 'Hoje e ontem' },
  { key: '7d', label: 'Últimos 7 dias' },
  { key: '14d', label: 'Últimos 14 dias' },
  { key: '28d', label: 'Últimos 28 dias' },
  { key: '30d', label: 'Últimos 30 dias' },
  { key: 'thisWeek', label: 'Esta semana' },
  { key: 'lastWeek', label: 'Semana passada' },
  { key: 'thisMonth', label: 'Este mês' },
  { key: 'lastMonth', label: 'Mês passado' },
  { key: 'max', label: 'Máximo' },
  { key: 'custom', label: 'Personalizado' },
]

export function isoLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function today(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function ago(n: number, base?: Date): Date {
  const d = base ? new Date(base) : today()
  d.setDate(d.getDate() - n)
  return d
}

function startOfWeek(d: Date): Date {
  const r = new Date(d)
  r.setDate(r.getDate() - ((r.getDay() + 6) % 7)) // segunda-feira
  r.setHours(0, 0, 0, 0)
  return r
}

// Intervalo de cada atalho. 'custom' não tem intervalo fixo — devolve o
// fallback de 30 dias; o calendário é quem define o intervalo custom.
export function resolvePreset(key: string): DateRange {
  const t = today()
  switch (key) {
    case 'today':
      return { start: isoLocal(t), end: isoLocal(t) }
    case 'yesterday': {
      const y = ago(1)
      return { start: isoLocal(y), end: isoLocal(y) }
    }
    case 't_y':
      return { start: isoLocal(ago(1)), end: isoLocal(t) }
    case '7d':
      return { start: isoLocal(ago(6)), end: isoLocal(t) }
    case '14d':
      return { start: isoLocal(ago(13)), end: isoLocal(t) }
    case '28d':
      return { start: isoLocal(ago(27)), end: isoLocal(t) }
    case '30d':
      return { start: isoLocal(ago(29)), end: isoLocal(t) }
    case 'thisWeek':
      return { start: isoLocal(startOfWeek(t)), end: isoLocal(t) }
    case 'lastWeek': {
      const sw = startOfWeek(t)
      return { start: isoLocal(ago(7, sw)), end: isoLocal(ago(1, sw)) }
    }
    case 'thisMonth':
      return { start: isoLocal(new Date(t.getFullYear(), t.getMonth(), 1)), end: isoLocal(t) }
    case 'lastMonth':
      return {
        start: isoLocal(new Date(t.getFullYear(), t.getMonth() - 1, 1)),
        end: isoLocal(new Date(t.getFullYear(), t.getMonth(), 0)),
      }
    case 'max':
      return { start: isoLocal(ago(364)), end: isoLocal(t) }
    default:
      return { start: isoLocal(ago(29)), end: isoLocal(t) }
  }
}

// Intervalo de "n dias atrás até hoje" — para janelas fixas que não são
// presets (ex.: MarketingUnif, que tem janela própria de 90 dias).
export function daysBackRange(n: number): DateRange {
  return { start: isoLocal(ago(n)), end: isoLocal(today()) }
}

// Rótulo legível de um intervalo: nome do preset, ou "dd/mm/yyyy – dd/mm/yyyy".
export function rangeLabel(range: DateRange, presetKey: string): string {
  const preset = PERIOD_PRESETS.find((p) => p.key === presetKey)
  if (preset && preset.key !== 'custom') return preset.label
  const br = (iso: string) => {
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
  }
  if (range.start === range.end) return br(range.start)
  return `${br(range.start)} – ${br(range.end)}`
}
