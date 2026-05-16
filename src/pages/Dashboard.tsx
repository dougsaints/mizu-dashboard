import Header from '../components/Header'
import DiarioSection from '../sections/DiarioSection'
import SalesSection from '../sections/SalesSection'
import AdsUploadCard from '../components/AdsUploadCard'
import { useAutoPollSales } from '../api/useSales'

export default function Dashboard() {
  // Polling automático das planilhas Google Sheets a cada 5 min.
  // Atualiza sales_daily em background; Realtime propaga pros outros
  // dispositivos abertos sem precisar de refresh manual.
  useAutoPollSales(300)

  return (
    <>
      <Header />
      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '24px 28px' }}>
        <SalesSection />
        <AdsUploadCard />
        <DiarioSection />
      </main>
    </>
  )
}
