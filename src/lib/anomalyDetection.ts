// Anomaly detection — Phase 11-09.
// Detecta padrões anormais nos dados pra alertar o Doug "tem algo errado?".
// Funções puras, sem deps externas.

import type { Database } from '../types/database'

type SalesRow = Database['public']['Tables']['sales_daily']['Row']
type AdsRow = Database['public']['Tables']['ads_daily']['Row']
type Unit = Database['public']['Tables']['units']['Row']

export type AlertLevel = 'critical' | 'warning' | 'positive' | 'info'

export type Alert = {
  id: string
  level: AlertLevel
  icon: string
  title: string
  detail: string
}

function brl(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function isWeekday(iso: string): boolean {
  const d = new Date(iso + 'T00:00:00')
  const day = d.getDay()
  return day >= 1 && day <= 6 // Seg-Sáb (restaurante opera)
}

function formatDateBR(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

/** Detecta dia atual <50% da média 14d ou >130% (pico positivo). */
function detectAnomalyVsMA(
  rows: SalesRow[],
  units: Unit[],
  today: string,
): Alert[] {
  const alerts: Alert[] = []

  for (const u of units) {
    const unitRows = rows.filter((r) => r.unit_id === u.id)
    if (unitRows.length === 0) continue

    // Pega o último dia com dado
    const dates = [...new Set(unitRows.map((r) => r.date))].sort()
    if (dates.length === 0) continue
    const lastDate = dates[dates.length - 1]
    if (lastDate > today) continue

    const lastRow = unitRows.find((r) => r.date === lastDate)
    if (!lastRow) continue
    const lastVal = Number(lastRow.total ?? 0)
    if (lastVal === 0) continue

    // Média móvel dos 14 dias anteriores (não inclui o último)
    const ma14Start = addDaysIso(lastDate, -14)
    const ma14Rows = unitRows.filter((r) => r.date >= ma14Start && r.date < lastDate)
    if (ma14Rows.length < 5) continue // sem base estatística suficiente
    const ma14Sum = ma14Rows.reduce((s, r) => s + Number(r.total ?? 0), 0)
    const ma14 = ma14Sum / ma14Rows.length
    if (ma14 === 0) continue

    const ratio = lastVal / ma14
    if (ratio < 0.5) {
      alerts.push({
        id: `low-${u.id}`,
        level: 'critical',
        icon: '🚨',
        title: `${u.display_name} caiu pra ${Math.round(ratio * 100)}% da média no dia ${formatDateBR(lastDate)}`,
        detail: `${brl(lastVal)} vs média 14d de ${brl(ma14)}`,
      })
    } else if (ratio > 1.3) {
      alerts.push({
        id: `peak-${u.id}`,
        level: 'positive',
        icon: '🎯',
        title: `${u.display_name} bombou no dia ${formatDateBR(lastDate)} — ${Math.round((ratio - 1) * 100)}% acima da média`,
        detail: `${brl(lastVal)} vs média 14d de ${brl(ma14)}`,
      })
    }
  }
  return alerts
}

/** Detecta queda WoW por unidade >15% comparando últimos 7d vs 7d anteriores. */
function detectWowDrop(
  rows: SalesRow[],
  units: Unit[],
): Alert[] {
  const alerts: Alert[] = []
  if (rows.length === 0) return alerts

  const allDates = [...new Set(rows.map((r) => r.date))].sort()
  if (allDates.length < 14) return alerts
  const last = allDates[allDates.length - 1]
  const startWk2 = addDaysIso(last, -6)
  const endWk1 = addDaysIso(startWk2, -1)
  const startWk1 = addDaysIso(endWk1, -6)

  for (const u of units) {
    const unitRows = rows.filter((r) => r.unit_id === u.id)
    const wk2 = unitRows
      .filter((r) => r.date >= startWk2 && r.date <= last)
      .reduce((s, r) => s + Number(r.total ?? 0), 0)
    const wk1 = unitRows
      .filter((r) => r.date >= startWk1 && r.date <= endWk1)
      .reduce((s, r) => s + Number(r.total ?? 0), 0)

    if (wk1 === 0) continue
    const change = ((wk2 - wk1) / wk1) * 100
    if (change <= -15) {
      alerts.push({
        id: `wow-drop-${u.id}`,
        level: 'warning',
        icon: '⚠️',
        title: `${u.display_name} caiu ${Math.abs(change).toFixed(0)}% semana sobre semana`,
        detail: `Última semana: ${brl(wk2)} · Anterior: ${brl(wk1)}`,
      })
    } else if (change >= 25) {
      alerts.push({
        id: `wow-up-${u.id}`,
        level: 'positive',
        icon: '🎯',
        title: `${u.display_name} cresceu ${change.toFixed(0)}% semana sobre semana`,
        detail: `Última semana: ${brl(wk2)} · Anterior: ${brl(wk1)}`,
      })
    }
  }
  return alerts
}

/** Detecta dias úteis sem registro nos últimos N dias. */
function detectMissingDays(
  rows: SalesRow[],
  units: Unit[],
  today: string,
  lookbackDays = 7,
): Alert[] {
  const alerts: Alert[] = []
  const cutoff = addDaysIso(today, -lookbackDays)

  for (const u of units) {
    const unitDates = new Set(
      rows.filter((r) => r.unit_id === u.id && r.date >= cutoff && r.date <= today).map((r) => r.date),
    )
    const missing: string[] = []
    let d = cutoff
    while (d <= today) {
      if (isWeekday(d) && !unitDates.has(d)) missing.push(d)
      d = addDaysIso(d, 1)
    }
    if (missing.length >= 2) {
      alerts.push({
        id: `missing-${u.id}`,
        level: 'warning',
        icon: '📋',
        title: `${u.display_name}: ${missing.length} dia(s) úteis sem registro nos últimos ${lookbackDays}d`,
        detail: `Dias faltando: ${missing.map(formatDateBR).join(', ')}`,
      })
    }
  }
  return alerts
}

/** Detecta ROAS<1x ou >3x do Meta Ads no período (perda de dinheiro / hit). */
function detectRoasAlert(
  salesRows: SalesRow[],
  adsRows: AdsRow[],
): Alert[] {
  const alerts: Alert[] = []
  const totalSales = salesRows.reduce((s, r) => s + Number(r.total ?? 0), 0)
  const totalAds = adsRows.reduce((s, r) => s + Number(r.cost ?? 0), 0)
  if (totalAds === 0 || totalSales === 0) return alerts

  const roas = totalSales / totalAds
  if (roas < 1) {
    alerts.push({
      id: 'roas-low',
      level: 'critical',
      icon: '🚨',
      title: `ROAS de marketing abaixo de 1x — Meta Ads tá custando mais do que retorna`,
      detail: `Faturamento ${brl(totalSales)} ÷ Invest. ${brl(totalAds)} = ${roas.toFixed(2)}x`,
    })
  } else if (roas > 3) {
    alerts.push({
      id: 'roas-high',
      level: 'positive',
      icon: '🎯',
      title: `ROAS de marketing acima de 3x — cada R$ 1 retorna R$ ${roas.toFixed(2)}`,
      detail: `Faturamento ${brl(totalSales)} ÷ Invest. ${brl(totalAds)}`,
    })
  }
  return alerts
}

/** Roda todas as detecções e retorna lista de alertas priorizada (críticos primeiro). */
export function detectAllAlerts(params: {
  salesRows: SalesRow[]
  adsRows: AdsRow[]
  units: Unit[]
}): Alert[] {
  const { salesRows, adsRows, units } = params
  if (salesRows.length === 0 && adsRows.length === 0) return []

  // Hoje = última data de venda (ou hoje real se vazio)
  const allDates = [...new Set(salesRows.map((r) => r.date))].sort()
  const today = allDates[allDates.length - 1] ?? new Date().toISOString().slice(0, 10)

  const collected = [
    ...detectAnomalyVsMA(salesRows, units, today),
    ...detectWowDrop(salesRows, units),
    ...detectMissingDays(salesRows, units, today),
    ...detectRoasAlert(salesRows, adsRows),
  ]

  // Ordena: critical > warning > positive > info
  const order: Record<AlertLevel, number> = { critical: 0, warning: 1, positive: 2, info: 3 }
  return collected.sort((a, b) => order[a.level] - order[b.level]).slice(0, 5)
}
