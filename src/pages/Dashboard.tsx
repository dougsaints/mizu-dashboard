import { lazy, Suspense } from 'react'
import Header from '../components/Header'
import WeeklyRecap from '../sections/WeeklyRecap'
import { useAutoPollSales } from '../api/useSales'
import { FilterProvider } from '../lib/period'

const TrendsSection = lazy(() => import('../sections/TrendsSection'))
const AnalysisSection = lazy(() => import('../sections/AnalysisSection'))
const SalesSection = lazy(() => import('../sections/SalesSection'))
const CorrelationSection = lazy(() => import('../sections/CorrelationSection'))
const RoiSection = lazy(() => import('../sections/RoiSection'))
const MarketingUnif = lazy(() => import('../sections/MarketingUnif'))
const AdsUploadCard = lazy(() => import('../components/AdsUploadCard'))
const AnotaaiUploadCard = lazy(() => import('../components/AnotaaiUploadCard'))
const InstagramUploadCard = lazy(() => import('../components/InstagramUploadCard'))
const DiarioSection = lazy(() => import('../sections/DiarioSection'))

function LazyFallback({ label = 'Carregando…' }: { label?: string }) {
  return <div className="lazy-fallback">{label}</div>
}

export default function Dashboard() {
  useAutoPollSales(300)

  return (
    <FilterProvider>
      <Header />
      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '24px 28px' }}>
        <WeeklyRecap />
        <Suspense fallback={<LazyFallback label="Carregando tendências…" />}>
          <TrendsSection />
        </Suspense>
        <Suspense fallback={<LazyFallback label="Carregando análise…" />}>
          <AnalysisSection />
        </Suspense>
        <Suspense fallback={<LazyFallback label="Carregando vendas…" />}>
          <SalesSection />
        </Suspense>
        <Suspense fallback={<LazyFallback label="Carregando correlação…" />}>
          <CorrelationSection />
        </Suspense>
        <Suspense fallback={<LazyFallback label="Carregando ROI…" />}>
          <RoiSection />
        </Suspense>
        <Suspense fallback={<LazyFallback label="Carregando marketing…" />}>
          <MarketingUnif />
        </Suspense>
        <Suspense fallback={<LazyFallback label="Carregando Meta Ads…" />}>
          <AdsUploadCard />
        </Suspense>
        <Suspense fallback={<LazyFallback label="Carregando Anota AI…" />}>
          <AnotaaiUploadCard />
        </Suspense>
        <Suspense fallback={<LazyFallback label="Carregando Instagram…" />}>
          <InstagramUploadCard />
        </Suspense>
        <Suspense fallback={<LazyFallback label="Carregando diário…" />}>
          <DiarioSection />
        </Suspense>
      </main>
    </FilterProvider>
  )
}
