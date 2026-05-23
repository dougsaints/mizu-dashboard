// Helpers puros de agregação de vendas — sem React, sem Supabase.

import type { Database } from '../types/database'

type SalesRow = Database['public']['Tables']['sales_daily']['Row']

export type MonthRange = { start: string; end: string }
export type UnitAgg = {
  total: number
  pdv: number
  ifood: number
  anotaai: number
  count: number
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`
}

function lastDayOfMonth(year: number, month: number): number {
  // month: 0-based (Jan=0)
  return new Date(year, month + 1, 0).getDate()
}

// Range do mês corrente. start = dia 1; end = hoje (não fim de mês).
// Se today está em outro mês, end = último dia do mês de today.
export function currentMonthRange(today: Date): MonthRange {
  const year = today.getFullYear()
  const month = today.getMonth()
  const day = today.getDate()
  return {
    start: isoDate(year, month, 1),
    end: isoDate(year, month, day),
  }
}

// Range do mês anterior completo.
export function prevMonthRange(today: Date): MonthRange {
  const d = new Date(today)
  d.setDate(1)
  d.setMonth(d.getMonth() - 1)
  const year = d.getFullYear()
  const month = d.getMonth()
  return {
    start: isoDate(year, month, 1),
    end: isoDate(year, month, lastDayOfMonth(year, month)),
  }
}

// Agrega rows filtrando por range (inclusive) — pode receber rows de uma
// unidade específica ou de todas (responsabilidade do chamador).
export function aggregateUnitMonth(rows: SalesRow[], range: MonthRange): UnitAgg {
  const out: UnitAgg = { total: 0, pdv: 0, ifood: 0, anotaai: 0, count: 0 }
  const dates = new Set<string>()
  for (const r of rows) {
    if (r.date < range.start || r.date > range.end) continue
    out.total += Number(r.total ?? 0)
    out.pdv += Number(r.pdv ?? 0)
    out.ifood += Number(r.ifood ?? 0)
    out.anotaai += Number(r.anotaai ?? 0)
    dates.add(r.date)
  }
  out.count = dates.size
  return out
}

export type DeltaResult = {
  pct: number | null
  direction: 'up' | 'down' | 'flat'
  isNew: boolean
}

export function computeDelta(curr: number, prev: number): DeltaResult {
  if (prev === 0) {
    if (curr === 0) return { pct: null, direction: 'flat', isNew: false }
    return { pct: null, direction: 'up', isNew: true }
  }
  const pct = ((curr - prev) / prev) * 100
  const abs = Math.abs(pct)
  if (abs < 0.5) return { pct, direction: 'flat', isNew: false }
  return { pct, direction: pct > 0 ? 'up' : 'down', isNew: false }
}

// Verifica se uma unidade tem dados em um canal específico nas linhas dadas.
// Usado pra identificar "canal inativo" (ex: Jatiúca não tem iFood/AnotaAi).
export function unitHasChannel(
  rows: SalesRow[],
  unitId: string,
  channel: 'pdv' | 'ifood' | 'anotaai',
): boolean {
  for (const r of rows) {
    if (r.unit_id !== unitId) continue
    if (Number(r[channel] ?? 0) > 0) return true
  }
  return false
}
