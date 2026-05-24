// Dashboard.tsx — conteúdo da landing /hoje (Phase 14-01).
// Header + FilterProvider + useAutoPollSales subiram pro Layout/App.
// Esse componente agora só renderiza as sections; é wrapped por HojePage.

import { lazy, Suspense } from 'react'
import OperationalAlerts from '../components/OperationalAlerts'
import WeeklyRecap from '../sections/WeeklyRecap'

const TrendsSection = lazy(() => import('../sections/TrendsSection'))
const SalesSection = lazy(() => import('../sections/SalesSection'))
const AnalysisSection = lazy(() => import('../sections/AnalysisSection'))
const MetaAdsAnalysisSection = lazy(() => import('../sections/MetaAdsAnalysisSection'))
const RoiSection = lazy(() => import('../sections/RoiSection'))
const ProductsAnalysisSection = lazy(() => import('../sections/ProductsAnalysisSection'))
const MarketingUnif = lazy(() => import('../sections/MarketingUnif'))
const PatternsSection = lazy(() => import('../sections/PatternsSection'))
const CorrelationSection = lazy(() => import('../sections/CorrelationSection'))
const DataTableSection = lazy(() => import('../sections/DataTableSection'))
const DiarioSection = lazy(() => import('../sections/DiarioSection'))
const AdsUploadCard = lazy(() => import('../components/AdsUploadCard'))
const AnotaaiUploadCard = lazy(() => import('../components/AnotaaiUploadCard'))
const InstagramUploadCard = lazy(() => import('../components/InstagramUploadCard'))

function LazyFallback({ label = 'Carregando…' }: { label?: string }) {
  return <div className="lazy-fallback">{label}</div>
}

export default function Dashboard() {
  return (
    <>
      <OperationalAlerts />
      <WeeklyRecap />
      <Suspense fallback={<LazyFallback label="Carregando tendências…" />}>
        <TrendsSection />
      </Suspense>
      <Suspense fallback={<LazyFallback label="Carregando vendas…" />}>
        <SalesSection />
      </Suspense>
      <Suspense fallback={<LazyFallback label="Carregando análise…" />}>
        <AnalysisSection />
      </Suspense>
      <Suspense fallback={<LazyFallback label="Carregando análise Meta Ads…" />}>
        <MetaAdsAnalysisSection />
      </Suspense>
      <Suspense fallback={<LazyFallback label="Carregando ROI…" />}>
        <RoiSection />
      </Suspense>
      <Suspense fallback={<LazyFallback label="Carregando análise de produtos…" />}>
        <ProductsAnalysisSection />
      </Suspense>
      <Suspense fallback={<LazyFallback label="Carregando marketing…" />}>
        <MarketingUnif />
      </Suspense>
      <Suspense fallback={<LazyFallback label="Carregando padrões…" />}>
        <PatternsSection />
      </Suspense>
      <Suspense fallback={<LazyFallback label="Carregando correlação…" />}>
        <CorrelationSection />
      </Suspense>
      <Suspense fallback={<LazyFallback label="Carregando tabela…" />}>
        <DataTableSection />
      </Suspense>
      <Suspense fallback={<LazyFallback label="Carregando diário…" />}>
        <DiarioSection />
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
