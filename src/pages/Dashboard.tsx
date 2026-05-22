import Header from '../components/Header'
import DiarioSection from '../sections/DiarioSection'
import SalesSection from '../sections/SalesSection'
import WeeklyRecap from '../sections/WeeklyRecap'
import RoiSection from '../sections/RoiSection'
import MarketingUnif from '../sections/MarketingUnif'
import AdsUploadCard from '../components/AdsUploadCard'
import AnotaaiUploadCard from '../components/AnotaaiUploadCard'
import InstagramUploadCard from '../components/InstagramUploadCard'
import { useAutoPollSales } from '../api/useSales'
import { FilterProvider } from '../lib/period'

export default function Dashboard() {
  // Polling automático das planilhas Google Sheets a cada 5 min.
  // Atualiza sales_daily em background; Realtime propaga pros outros
  // dispositivos abertos sem precisar de refresh manual.
  useAutoPollSales(300)

  return (
    <FilterProvider>
      <Header />
      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '24px 28px' }}>
        <WeeklyRecap />
        <RoiSection />
        <MarketingUnif />
        <SalesSection />
        <AdsUploadCard />
        <AnotaaiUploadCard />
        <InstagramUploadCard />
        <DiarioSection />
      </main>
    </FilterProvider>
  )
}
