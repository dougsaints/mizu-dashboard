// RecapSemanalPage — /recap-semanal (Phase 14-02).
// Resumo da semana fechada: faturamento, ROAS, top 3 produtos, alerta semanal.

import PageHeader from '../components/PageHeader'
import WeeklyRecap from '../sections/WeeklyRecap'

export default function RecapSemanalPage() {
  return (
    <>
      <PageHeader
        title="Recap Semanal"
        subtitle="Resumo da semana anterior: faturamento, ROAS, top produtos e alertas"
      />
      <WeeklyRecap />
    </>
  )
}
