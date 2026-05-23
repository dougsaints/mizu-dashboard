// Card hero "Visibilidade Jatiúca (Praia)" — destaca métricas Meta Ads
// das campanhas específicas dessa unidade. Visual gradient azul claro
// (paleta praia). Fiel ao painel HTML original linhas 1989-1996 + 919-925.

import { useMemo } from 'react'
import { unitOfCampaign } from '../lib/adsCategory'
import type { Database } from '../types/database'

type AdsRow = Database['public']['Tables']['ads_daily']['Row']

type Props = { rows: AdsRow[] }

function brl(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function num(n: number): string {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}

function pctFmt(n: number): string {
  return n.toFixed(1).replace('.', ',') + '%'
}

export default function JatiucaVisibilityCard({ rows }: Props) {
  const stats = useMemo(() => {
    let invJat = 0, alcJat = 0, impJat = 0, clkJat = 0
    let invTot = 0, alcTot = 0, impTot = 0, clkTot = 0
    for (const r of rows) {
      const cost = Number(r.cost ?? 0)
      const reach = Number(r.reach ?? 0)
      const imp = Number(r.impressions ?? 0)
      const clk = Number(r.clicks ?? 0)
      invTot += cost
      alcTot += reach
      impTot += imp
      clkTot += clk
      if (unitOfCampaign(r.campaign_name) === 'jatiuca') {
        invJat += cost
        alcJat += reach
        impJat += imp
        clkJat += clk
      }
    }
    const safePct = (a: number, b: number) => (b > 0 ? (a / b) * 100 : 0)
    return {
      hasJat: invJat > 0 || alcJat > 0 || impJat > 0 || clkJat > 0,
      invJat, alcJat, impJat, clkJat,
      pctInv: safePct(invJat, invTot),
      pctAlc: safePct(alcJat, alcTot),
      pctImp: safePct(impJat, impTot),
      pctClk: safePct(clkJat, clkTot),
    }
  }, [rows])

  return (
    <div className="jat-hero">
      <div className="jat-hero-head">
        <div>
          <div className="jat-hero-title">📍 Visibilidade Jatiúca (Praia)</div>
          <div className="jat-hero-sub">
            Quanto a unidade está sendo mostrada em campanhas específicas dela
          </div>
        </div>
      </div>

      {!stats.hasJat ? (
        <div className="jat-hero-empty">
          Sem campanhas direcionadas pra Jatiúca no período selecionado.
          <br />
          <small>
            (Nomes de campanha precisam conter "Jatiúca" pra serem detectados.)
          </small>
        </div>
      ) : (
        <div className="jat-kpis">
          <div className="jat-kpi">
            <div className="jat-kpi-label">Investimento</div>
            <div className="jat-kpi-value">{brl(stats.invJat)}</div>
            <div className="jat-kpi-sub">{pctFmt(stats.pctInv)} do total</div>
          </div>
          <div className="jat-kpi">
            <div className="jat-kpi-label">Alcance</div>
            <div className="jat-kpi-value">{num(stats.alcJat)}</div>
            <div className="jat-kpi-sub">{pctFmt(stats.pctAlc)} do total</div>
          </div>
          <div className="jat-kpi">
            <div className="jat-kpi-label">Impressões</div>
            <div className="jat-kpi-value">{num(stats.impJat)}</div>
            <div className="jat-kpi-sub">{pctFmt(stats.pctImp)} do total</div>
          </div>
          <div className="jat-kpi">
            <div className="jat-kpi-label">Cliques</div>
            <div className="jat-kpi-value">{num(stats.clkJat)}</div>
            <div className="jat-kpi-sub">{pctFmt(stats.pctClk)} do total</div>
          </div>
        </div>
      )}
    </div>
  )
}
