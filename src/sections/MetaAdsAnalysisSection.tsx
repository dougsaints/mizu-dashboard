// Seção "Análise Meta Ads" — Phase 8-02.
// Distribuição de verba por categoria (Performance/Eng/Alcance) e por
// unidade (Jatiúca/Serraria/Geral) + card hero de Visibilidade Jatiúca.

import { useAds } from '../api/useAds'
import { useFilters } from '../lib/period'
import AdsCategoryDonut from '../components/AdsCategoryDonut'
import AdsUnitDonut from '../components/AdsUnitDonut'
import JatiucaVisibilityCard from '../components/JatiucaVisibilityCard'

export default function MetaAdsAnalysisSection() {
  const { start, end } = useFilters()
  // subscribeRealtime: false — AdsUploadCard mantém o canal aberto
  const { data: rows = [], isLoading, error } = useAds(start, end, {
    subscribeRealtime: false,
  })

  return (
    <section className="mizu-section">
      <div className="mizu-section-head">
        <div>
          <div className="mizu-section-title">
            <span className="kanji-deco">広</span> Análise Meta Ads
          </div>
          <div className="mizu-section-sub">
            Como a verba está distribuída entre objetivos e unidades · destaque pra Jatiúca
          </div>
        </div>
      </div>

      {isLoading && <div className="data-table-loading">Carregando análise Meta Ads…</div>}
      {error && (
        <div className="data-table-loading" style={{ color: 'var(--alert-red)' }}>
          Erro ao carregar: {(error as Error).message}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="ads-analysis-grid">
            <div className="chart-card">
              <div className="chart-card-title">Distribuição por Objetivo</div>
              <div className="chart-card-sub">
                Onde a verba está indo: vendas, engajamento ou branding
              </div>
              <AdsCategoryDonut rows={rows} />
            </div>
            <div className="chart-card">
              <div className="chart-card-title">Distribuição por Unidade</div>
              <div className="chart-card-sub">
                Quanto cada loja recebeu de investimento no período
              </div>
              <AdsUnitDonut rows={rows} />
            </div>
          </div>
          <JatiucaVisibilityCard rows={rows} />
        </>
      )}
    </section>
  )
}
