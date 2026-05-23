// Painel de Alertas Operacionais — Phase 11-09.
// Renderiza no topo do Dashboard (depois do Header, antes de WeeklyRecap).
// Detecta automaticamente: queda crítica, WoW negativa, dias úteis sem registro,
// ROAS<1x. Mostra até 5 alertas priorizados.

import { useMemo } from 'react'
import { useSales } from '../api/useSales'
import { useAds } from '../api/useAds'
import { useUnits } from '../api/useUnits'
import { detectAllAlerts } from '../lib/anomalyDetection'

// Janela própria de 30 dias pra detectar anomalias — independente do filtro global,
// porque alertas precisam de histórico recente (não do período filtrado).
function buildLookbackRange(days: number): { start: string; end: string } {
  const end = new Date().toISOString().slice(0, 10)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  return { start: startDate.toISOString().slice(0, 10), end }
}

export default function OperationalAlerts() {
  const { start, end } = useMemo(() => buildLookbackRange(30), [])
  const { data: salesRows = [], isLoading: salesLoading } = useSales(start, end, { subscribeRealtime: false })
  const { data: adsRows = [], isLoading: adsLoading } = useAds(start, end, { subscribeRealtime: false })
  const { data: units = [] } = useUnits()

  const alerts = useMemo(
    () => detectAllAlerts({ salesRows, adsRows, units }),
    [salesRows, adsRows, units],
  )

  if (salesLoading || adsLoading) return null
  if (alerts.length === 0) return null

  return (
    <div className="ops-alerts" role="region" aria-label="Alertas operacionais">
      <div className="ops-alerts-head">
        <span className="ops-alerts-title">⚡ Alertas operacionais</span>
        <span className="ops-alerts-count">{alerts.length} sinal{alerts.length === 1 ? '' : 'is'} nos últimos 30 dias</span>
      </div>
      <div className="ops-alerts-list">
        {alerts.map((a) => (
          <div key={a.id} className={`ops-alert ops-alert--${a.level}`}>
            <div className="ops-alert-icon" aria-hidden>{a.icon}</div>
            <div className="ops-alert-body">
              <div className="ops-alert-title">{a.title}</div>
              <div className="ops-alert-detail">{a.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
