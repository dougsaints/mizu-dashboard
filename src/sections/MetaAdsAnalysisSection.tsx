// Seção "Análise Meta Ads" — Phase 8-02 + Phase 11-01 (8 KPIs Meta-only no topo).
// Distribuição de verba por categoria (Performance/Eng/Alcance) e por
// unidade (Jatiúca/Serraria/Geral) + card hero de Visibilidade Jatiúca.

import { useMemo } from 'react'
import { useAds } from '../api/useAds'
import { useSales } from '../api/useSales'
import { useFilters } from '../lib/period'
import AdsCategoryDonut from '../components/AdsCategoryDonut'
import AdsUnitDonut from '../components/AdsUnitDonut'
import AdsVsSalesChart from '../components/AdsVsSalesChart'
import JatiucaVisibilityCard from '../components/JatiucaVisibilityCard'
import SectionHeader from '../components/SectionHeader'
import {
  classifyCampaign,
  goalGroupOf,
  unitOfCampaign,
  ADS_GOAL_GROUPS,
  type AdsGoalKey,
  type AdsUnit,
} from '../lib/adsCategory'

const brl0 = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
const brl2 = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const num = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })

function fmtOrDash(v: number | null, fmt: (n: number) => string): string {
  return v == null ? '—' : fmt(v)
}

export default function MetaAdsAnalysisSection() {
  const { start, end } = useFilters()
  const { data: rows = [], isLoading, error } = useAds(start, end, {
    subscribeRealtime: false,
  })
  // Para o gráfico temporal Invest × Faturamento (Phase 11-11)
  const { data: salesRows = [] } = useSales(start, end, { subscribeRealtime: false })

  const totals = useMemo(() => {
    let cost = 0, impressions = 0, clicks = 0, reach = 0
    for (const r of rows) {
      cost += Number(r.cost ?? 0)
      impressions += Number(r.impressions ?? 0)
      clicks += Number(r.clicks ?? 0)
      reach += Number(r.reach ?? 0)
    }
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : null
    const cpm = impressions > 0 ? (cost / impressions) * 1000 : null
    const cpc = clicks > 0 ? cost / clicks : null
    const freq = reach > 0 ? impressions / reach : null
    return { cost, impressions, clicks, reach, ctr, cpm, cpc, freq }
  }, [rows])

  // Phase 11-08: agregação completa por categoria (cost + impressions + reach + clicks)
  const byGoalFull = useMemo(() => {
    const out: Record<AdsGoalKey, { cost: number; impressions: number; reach: number; clicks: number }> = {
      perf: { cost: 0, impressions: 0, reach: 0, clicks: 0 },
      eng:  { cost: 0, impressions: 0, reach: 0, clicks: 0 },
      alc:  { cost: 0, impressions: 0, reach: 0, clicks: 0 },
    }
    for (const r of rows) {
      const cat = classifyCampaign(r.campaign_name)
      const g = goalGroupOf(cat)
      out[g.key].cost += Number(r.cost ?? 0)
      out[g.key].impressions += Number(r.impressions ?? 0)
      out[g.key].reach += Number(r.reach ?? 0)
      out[g.key].clicks += Number(r.clicks ?? 0)
    }
    return out
  }, [rows])

  const byUnit = useMemo(() => {
    const out: Record<AdsUnit, number> = { jatiuca: 0, serraria: 0, geral: 0 }
    for (const r of rows) {
      const u = unitOfCampaign(r.campaign_name)
      out[u] += Number(r.cost ?? 0)
    }
    return out
  }, [rows])

  return (
    <section className="mizu-section is-source-meta">
      <SectionHeader
        source="meta"
        kanji="広"
        title="Análise Meta Ads"
        subtitle="Como a verba está distribuída entre objetivos e unidades · destaque pra Jatiúca"
        period={{ start, end }}
      />

      {isLoading && <div className="data-table-loading">Carregando análise Meta Ads…</div>}
      {error && (
        <div className="data-table-loading" style={{ color: 'var(--alert-red)' }}>
          Erro ao carregar: {(error as Error).message}
        </div>
      )}

      {!isLoading && !error && rows.length > 0 && (
        <div className="meta-kpis-grid">
          <div className="meta-kpi"><div className="meta-kpi-lbl">Investimento</div><div className="meta-kpi-val">{brl0(totals.cost)}</div></div>
          <div className="meta-kpi"><div className="meta-kpi-lbl">Alcance</div><div className="meta-kpi-val">{num(totals.reach)}</div><div className="meta-kpi-sub">pessoas</div></div>
          <div className="meta-kpi"><div className="meta-kpi-lbl">Impressões</div><div className="meta-kpi-val">{num(totals.impressions)}</div></div>
          <div className="meta-kpi"><div className="meta-kpi-lbl">Cliques</div><div className="meta-kpi-val">{num(totals.clicks)}</div></div>
          <div className="meta-kpi"><div className="meta-kpi-lbl">CTR</div><div className="meta-kpi-val">{fmtOrDash(totals.ctr, n => n.toFixed(2).replace('.', ',') + '%')}</div><div className="meta-kpi-sub">taxa de clique</div></div>
          <div className="meta-kpi"><div className="meta-kpi-lbl">CPM</div><div className="meta-kpi-val">{fmtOrDash(totals.cpm, brl2)}</div><div className="meta-kpi-sub">por mil impressões</div></div>
          <div className="meta-kpi"><div className="meta-kpi-lbl">CPC</div><div className="meta-kpi-val">{fmtOrDash(totals.cpc, brl2)}</div><div className="meta-kpi-sub">por clique</div></div>
          <div className="meta-kpi"><div className="meta-kpi-lbl">Frequência</div><div className="meta-kpi-val">{fmtOrDash(totals.freq, n => n.toFixed(2).replace('.', ',') + 'x')}</div><div className="meta-kpi-sub">por pessoa</div></div>
        </div>
      )}

      {!isLoading && !error && rows.length > 0 && (
        <div className="chart-card ads-vs-sales-card">
          <div className="chart-card-title">Investimento Meta × Faturamento (diário)</div>
          <div className="chart-card-sub">
            Veja se o gasto Meta Ads tá puxando vendas — eixo esquerdo: invest. azul · eixo direito: faturamento dourado
          </div>
          <AdsVsSalesChart salesRows={salesRows} adsRows={rows} />
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
              <table className="cat-breakdown-table cat-breakdown-table--wide">
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th className="r">Investimento</th>
                    <th className="r">Impressões</th>
                    <th className="r">Alcance</th>
                    <th className="r">CTR</th>
                    <th className="r">% Invest.</th>
                  </tr>
                </thead>
                <tbody>
                  {ADS_GOAL_GROUPS.map(g => {
                    const v = byGoalFull[g.key]
                    const pct = totals.cost > 0 ? (v.cost / totals.cost) * 100 : 0
                    const ctr = v.impressions > 0 ? (v.clicks / v.impressions) * 100 : null
                    return (
                      <tr key={g.key}>
                        <td><span className="cat-dot" style={{ background: g.color }}></span>{g.label}</td>
                        <td className="r">{brl0(v.cost)}</td>
                        <td className="r">{num(v.impressions)}</td>
                        <td className="r">{num(v.reach)}</td>
                        <td className="r">{ctr == null ? '—' : ctr.toFixed(2).replace('.', ',') + '%'}</td>
                        <td className="r">{pct.toFixed(1).replace('.', ',')}%</td>
                      </tr>
                    )
                  })}
                  <tr className="cat-breakdown-total">
                    <td><strong>Total</strong></td>
                    <td className="r"><strong>{brl0(totals.cost)}</strong></td>
                    <td className="r"><strong>{num(totals.impressions)}</strong></td>
                    <td className="r"><strong>{num(totals.reach)}</strong></td>
                    <td className="r"><strong>{totals.ctr == null ? '—' : totals.ctr.toFixed(2).replace('.', ',') + '%'}</strong></td>
                    <td className="r"><strong>100%</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="chart-card">
              <div className="chart-card-title">Distribuição por Unidade</div>
              <div className="chart-card-sub">
                Quanto cada loja recebeu de investimento no período
              </div>
              <AdsUnitDonut rows={rows} />
              <div className="unit-breakdown-cards">
                {(['jatiuca','serraria','geral'] as const).map(u => {
                  const v = byUnit[u] ?? 0
                  const pct = totals.cost > 0 ? (v / totals.cost) * 100 : 0
                  const label = u === 'jatiuca' ? 'Jatiúca' : u === 'serraria' ? 'Serraria' : 'Geral'
                  return (
                    <div key={u} className={`unit-breakdown-card unit-breakdown-card--${u}`}>
                      <div className="unit-breakdown-lbl">{label}</div>
                      <div className="unit-breakdown-val">{brl0(v)}</div>
                      <div className="unit-breakdown-pct">{pct.toFixed(1).replace('.', ',')}%</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <JatiucaVisibilityCard rows={rows} />
        </>
      )}
    </section>
  )
}
