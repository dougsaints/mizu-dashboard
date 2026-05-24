// PadroesPage — /padroes (Phase 14-02).
// Padrões de venda por dia da semana e horário (heatmap dia×semana).
// Phase 17 vai adicionar heatmap hora×dia + análise de horário de pico.

import { lazy, Suspense } from 'react'
import PageHeader from '../components/PageHeader'

const PatternsSection = lazy(() => import('../sections/PatternsSection'))

function LazyFallback({ label = 'Carregando…' }: { label?: string }) {
  return <div className="lazy-fallback">{label}</div>
}

export default function PadroesPage() {
  return (
    <>
      <PageHeader
        title="Padrões"
        subtitle="Padrões de venda por dia da semana e horário do dia"
      />
      <Suspense fallback={<LazyFallback label="Carregando padrões…" />}>
        <PatternsSection />
      </Suspense>
    </>
  )
}
