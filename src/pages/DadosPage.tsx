// DadosPage — /dados (Phase 14-02).
// Tabela bruta consolidada (export CSV) + configuração de fontes (uploads Meta/Anota/Instagram).

import { lazy, Suspense } from 'react'
import PageHeader from '../components/PageHeader'

const DataTableSection = lazy(() => import('../sections/DataTableSection'))
const AdsUploadCard = lazy(() => import('../components/AdsUploadCard'))
const AnotaaiUploadCard = lazy(() => import('../components/AnotaaiUploadCard'))
const InstagramUploadCard = lazy(() => import('../components/InstagramUploadCard'))

function LazyFallback({ label = 'Carregando…' }: { label?: string }) {
  return <div className="lazy-fallback">{label}</div>
}

export default function DadosPage() {
  return (
    <>
      <PageHeader
        title="Dados"
        subtitle="Tabela bruta consolidada com export CSV e configuração de fontes de dados"
      />
      <Suspense fallback={<LazyFallback label="Carregando tabela…" />}>
        <DataTableSection />
      </Suspense>

      <details className="uploads-area">
        <summary>⚙ Configurações & Uploads</summary>
        <div className="uploads-area-inner">
          <Suspense fallback={<LazyFallback label="Carregando Meta Ads…" />}>
            <AdsUploadCard />
          </Suspense>
          <Suspense fallback={<LazyFallback label="Carregando Anota AI…" />}>
            <AnotaaiUploadCard />
          </Suspense>
          <Suspense fallback={<LazyFallback label="Carregando Instagram…" />}>
            <InstagramUploadCard />
          </Suspense>
        </div>
      </details>
    </>
  )
}
