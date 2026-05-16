import Header from '../components/Header'

export default function Dashboard() {
  return (
    <>
      <Header />
      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '24px 28px' }}>
        <div className="mizu-section" style={{ background: 'var(--card)' }}>
          <div className="mizu-section-head">
            <div>
              <div className="mizu-section-title">
                <span className="kanji-deco">水</span> Mizu Cloud — Fase 1
              </div>
              <div className="mizu-section-sub">
                Frontend Vite/React rodando. Próximos passos: conectar Supabase e portar as seções P0.
              </div>
            </div>
          </div>
          <p style={{ fontSize: 14, color: 'var(--txt-2)', lineHeight: 1.6 }}>
            Esta é a base do novo painel. As seções <strong>Resumo da Semana</strong>,{' '}
            <strong>ROI · Investimento vs Retorno</strong>, <strong>Movimento</strong>,{' '}
            <strong>Diário do Time</strong> e <strong>Marketing Unificado</strong> serão portadas em
            seguida, lendo dados do Supabase em vez de localStorage.
          </p>
        </div>
      </main>
    </>
  )
}
