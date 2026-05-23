// Funções puras pro heatmap semanal (Phase 6-05).
// CSS Grid puro (sem canvas), tooltip via state local no componente.

export type HeatmapDay = { date: Date; ds: string; val: number | null }
export type HeatmapBucket = { weekStart: Date; days: HeatmapDay[] }

export function startOfWeekSun(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  x.setDate(x.getDate() - x.getDay())
  return x
}

export function toIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Constrói buckets de N semanas terminando na semana de anchor.
// Cada bucket = { weekStart, days: 7 dias Dom-Sáb com val (ou null) }.
// Ordem: índice 0 = semana mais antiga, último = mais recente.
export function buildWeekBuckets(
  daily: Array<{ ds: string; val: number }>,
  anchor: Date,
  weeks: number = 12,
): HeatmapBucket[] {
  const byDate = new Map<string, number>()
  for (const d of daily) byDate.set(d.ds, d.val)

  const lastSun = startOfWeekSun(anchor)
  const out: HeatmapBucket[] = []
  for (let w = weeks - 1; w >= 0; w--) {
    const ws = new Date(lastSun)
    ws.setDate(ws.getDate() - w * 7)
    const days: HeatmapDay[] = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(ws)
      day.setDate(day.getDate() + i)
      const ds = toIso(day)
      const v = byDate.get(ds)
      days.push({ date: day, ds, val: v == null ? null : v })
    }
    out.push({ weekStart: ws, days })
  }
  return out
}

// Interpola cor entre verde-claro (#EAF6EE) e verde-escuro (#27AE60).
// Null/0 → cinza claro (#F2F2F4) pra indicar "sem dado".
export function colorScale(val: number | null, min: number, max: number): string {
  if (val == null || val <= 0) return '#F2F2F4'
  if (max <= min) return '#27AE60'
  const t = Math.min(1, Math.max(0, (val - min) / (max - min)))
  const c0 = [0xea, 0xf6, 0xee]
  const c1 = [0x27, 0xae, 0x60]
  const r = Math.round(c0[0] + (c1[0] - c0[0]) * t)
  const g = Math.round(c0[1] + (c1[1] - c0[1]) * t)
  const b = Math.round(c0[2] + (c1[2] - c0[2]) * t)
  return `rgb(${r}, ${g}, ${b})`
}

export function daysBetween(startIso: string, endIso: string): number {
  const s = new Date(startIso + 'T00:00:00')
  const e = new Date(endIso + 'T00:00:00')
  return Math.round((e.getTime() - s.getTime()) / 86400000) + 1
}
