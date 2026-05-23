// Marketing Unificado — cruza o alcance TOTAL do Instagram (orgânico +
// pago juntos, como o Business Suite reporta) com a fatia que veio de
// anúncios pagos (Meta Ads). Não estima "orgânico = total − pago": o
// Business Suite não separa, então mostramos o total real + quanto do
// alcance foi impulsionado por anúncio.

import { useOrganic } from '../api/useOrganic'
import { useAds } from '../api/useAds'
import { daysBackRange } from '../lib/periodPresets'
import SectionHeader from '../components/SectionHeader'

// MarketingUnif tem janela própria de 90 dias — não segue o filtro global.
const ADS_WINDOW = daysBackRange(90)

function int(n: number): string {
  return Math.round(n).toLocaleString('pt-BR')
}

function brl(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function ddmm(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

const METRIC_TILES: { key: string; label: string }[] = [
  { key: 'alcance', label: 'Alcance' },
  { key: 'visualizacoes', label: 'Visualizações' },
  { key: 'interacoes', label: 'Interações' },
  { key: 'seguidores_novos', label: 'Novos seguidores' },
  { key: 'visitas_perfil', label: 'Visitas ao perfil' },
  { key: 'cliques_link', label: 'Cliques no link' },
]

export default function MarketingUnif() {
  const organicQ = useOrganic(60)
  const adsQ = useAds(ADS_WINDOW.start, ADS_WINDOW.end)

  const isLoading = organicQ.isLoading || adsQ.isLoading
  const error = organicQ.error ?? adsQ.error
  const organic = organicQ.data ?? []
  const ads = adsQ.data ?? []

  // Período = janela coberta pelos dados do Instagram
  const dates = organic.map((r) => r.date)
  const start = dates.length > 0 ? dates.reduce((a, b) => (a < b ? a : b)) : null
  const end = dates.length > 0 ? dates.reduce((a, b) => (a > b ? a : b)) : null

  // Totais do Instagram no período
  const totals: Record<string, number> = {
    alcance: 0,
    visualizacoes: 0,
    interacoes: 0,
    seguidores_novos: 0,
    visitas_perfil: 0,
    cliques_link: 0,
  }
  for (const r of organic) {
    for (const k of Object.keys(totals)) {
      totals[k] += (r as unknown as Record<string, number>)[k] ?? 0
    }
  }

  // Fatia paga: anúncios dentro da mesma janela de datas
  const adsInRange =
    start && end ? ads.filter((a) => a.date >= start && a.date <= end) : []
  const adSpend = adsInRange.reduce((s, a) => s + (a.cost ?? 0), 0)
  const paidReach = adsInRange.reduce((s, a) => s + (a.reach ?? 0), 0)
  const paidPct =
    totals.alcance > 0 ? (paidReach / totals.alcance) * 100 : null

  const hasData = organic.length > 0
  const periodLabel = isLoading
    ? 'Carregando período…'
    : start && end
      ? `${ddmm(start)} a ${ddmm(end)} · ${organic.length} dia(s) de dados`
      : 'Sem dados do Instagram ainda'

  return (
    <section className="mizu-section is-source-instagram">
      <SectionHeader
        source="instagram"
        kanji="繋"
        title="Marketing Unificado"
        subtitle={periodLabel}
      />

      {!isLoading && hasData && (
        <div className="hero-summary">
          Em <strong>{organic.length} dia(s)</strong>, o Instagram do Sushi Mizú alcançou <strong>{int(totals.alcance)}</strong> pessoas com <strong>{int(totals.visualizacoes)}</strong> visualizações totais.
          {paidPct != null && paidPct > 0 && (
            <> Cerca de <strong>{paidPct.toFixed(0)}%</strong> desse alcance veio de campanhas pagas ({brl(adSpend)} investidos).</>
          )}
          {paidPct === null && adSpend > 0 && (
            <> Houve {brl(adSpend)} investidos em Meta Ads no período (alcance pago não calculável sem dado do Instagram).</>
          )}
        </div>
      )}

      {error && (
        <div style={{ color: 'var(--alert-red)', marginTop: 8, fontSize: 13 }}>
          Erro ao carregar: {String(error)}
        </div>
      )}

      {!isLoading && !hasData ? (
        <div className="mizu-empty" style={{ marginTop: 12 }}>
          Faça upload dos CSVs de métricas do Instagram para ver este resumo.
        </div>
      ) : (
        <>
          <div className="mkt-block-label">Instagram — total no período</div>
          <div className="mkt-metrics">
            {METRIC_TILES.map((t) => (
              <div key={t.key} className="mkt-tile">
                <div className="mkt-tile-val">
                  {isLoading ? '—' : int(totals[t.key])}
                </div>
                <div className="mkt-tile-lbl">{t.label}</div>
              </div>
            ))}
          </div>

          <div className="mkt-block-label" style={{ marginTop: 16 }}>
            Fatia impulsionada por anúncio (Meta Ads)
          </div>
          <div className="mkt-paid">
            <div className="mkt-paid-metric">
              <div className="lbl">Investimento</div>
              <div className="val">{isLoading ? '—' : brl(adSpend)}</div>
            </div>
            <div className="mkt-paid-metric">
              <div className="lbl">Alcance pago</div>
              <div className="val">{isLoading ? '—' : int(paidReach)}</div>
            </div>
            <div className="mkt-paid-metric gold">
              <div className="lbl">% do alcance impulsionado</div>
              <div className="val">
                {isLoading || paidPct == null
                  ? '—'
                  : `${paidPct.toFixed(0)}%`}
              </div>
            </div>
          </div>
          <div className="mkt-paid-note">
            {adSpend > 0
              ? `De cada 100 pessoas alcançadas no Instagram, cerca de ${paidPct?.toFixed(0) ?? '—'} vieram de anúncio pago. Valor aproximado — o alcance pago é somado por dia/campanha e pode contar a mesma pessoa mais de uma vez.`
              : 'Sem investimento em Meta Ads no período. Faça upload do CSV do Gerenciador de Anúncios para calcular a fatia paga.'}
          </div>
        </>
      )}
    </section>
  )
}
