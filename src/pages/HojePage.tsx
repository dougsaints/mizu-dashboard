// HojePage — landing /hoje (Phase 14-02).
// Foco do dia: alertas operacionais + tendências cross-source com delta.
// WeeklyRecap migrou pra /recap-semanal; demais sections migraram pras 6 páginas.

import { lazy, Suspense } from 'react'
import OperationalAlerts from '../components/OperationalAlerts'
import PageHeader from '../components/PageHeader'

const TrendsSection = lazy(() => import('../sections/TrendsSection'))

function LazyFallback({ label = 'Carregando…' }: { label?: string }) {
  return <div className="lazy-fallback">{label}</div>
}

export default function HojePage() {
  return (
    <>
      <PageHeader
        title="Hoje"
        subtitle="Alertas operacionais e tendências cross-source do período selecionado"
      />
      <OperationalAlerts />
      <Suspense fallback={<LazyFallback label="Carregando tendências…" />}>
        <TrendsSection />
      </Suspense>
    </>
  )
}
