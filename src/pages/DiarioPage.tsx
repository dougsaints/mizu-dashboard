// DiarioPage — /diario (Phase 14-02).
// Form de lançamento + feed de anotações operacionais por autor/tag.

import { lazy, Suspense } from 'react'
import PageHeader from '../components/PageHeader'

const DiarioSection = lazy(() => import('../sections/DiarioSection'))

function LazyFallback({ label = 'Carregando…' }: { label?: string }) {
  return <div className="lazy-fallback">{label}</div>
}

export default function DiarioPage() {
  return (
    <>
      <PageHeader
        title="Diário"
        subtitle="Anotações operacionais e contexto do dia a dia (lançamentos, eventos, observações)"
      />
      <Suspense fallback={<LazyFallback label="Carregando diário…" />}>
        <DiarioSection />
      </Suspense>
    </>
  )
}
