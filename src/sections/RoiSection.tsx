import { useEffect, useState } from 'react'
import { useRoi, useSaveRoiConfig, type RoiMode } from '../api/useRoi'

function brl(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function RoiSection() {
  const { data, isLoading, error } = useRoi()
  const save = useSaveRoiConfig()

  // Estado local dos 3 campos — permite digitar sem que cada tecla vá ao
  // banco. Salva ao sair do campo (onBlur).
  const [trafego, setTrafego] = useState('')
  const [maoDeObra, setMaoDeObra] = useState('')
  const [mktGeral, setMktGeral] = useState('')

  // Reseeda os inputs quando o config muda (carga inicial ou outro
  // dispositivo editou via Realtime).
  useEffect(() => {
    if (!data) return
    setTrafego(String(data.config.trafego))
    setMaoDeObra(String(data.config.mao_de_obra))
    setMktGeral(String(data.config.mkt_geral))
  }, [data?.config.trafego, data?.config.mao_de_obra, data?.config.mkt_geral])

  const mode: RoiMode = data?.config.mode ?? 'mes'
  const isSem = mode === 'sem'

  const nTrafego = Number(trafego) || 0
  const nMaoDeObra = Number(maoDeObra) || 0
  const nMktGeral = Number(mktGeral) || 0
  const mensal = nTrafego + nMaoDeObra + nMktGeral
  // Semana = mês ÷ 4,33 (média de semanas por mês).
  const invest = isSem ? mensal / 4.33 : mensal

  const fat = data ? (isSem ? data.weekFat : data.monthFat) : 0
  const days = data ? (isSem ? data.weekDays : data.monthDays) : 0
  const margem = fat - invest
  const roas = invest > 0 && fat > 0 ? fat / invest : 0

  const periodLbl = isSem ? '/ semana' : '/ mês'
  const periodLbl2 = isSem ? 'da semana' : 'do mês'

  function saveField(field: 'trafego' | 'mao_de_obra' | 'mkt_geral', value: string) {
    save.mutate({ [field]: Number(value) || 0 })
  }

  function setMode(next: RoiMode) {
    if (next === mode) return
    save.mutate({ mode: next })
  }

  const margemCls = fat > 0 ? (margem > 0 ? 'good' : margem < 0 ? 'bad' : '') : ''

  return (
    <section className="mizu-section" id="roiSection">
      <div className="mizu-section-head">
        <div>
          <div className="mizu-section-title">
            <span className="kanji-deco">投</span> ROI · Investimento vs Retorno
          </div>
          <div className="mizu-section-sub">
            Valores editáveis (salvos na nuvem, sincronizam entre dispositivos).
          </div>
        </div>
        <div className="mizu-section-actions">
          <div className="roi-toggle">
            <button className={isSem ? '' : 'on'} onClick={() => setMode('mes')}>Mensal</button>
            <button className={isSem ? 'on' : ''} onClick={() => setMode('sem')}>Semanal</button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ color: 'var(--alert-red)', marginTop: 8, fontSize: 13 }}>
          Erro ao carregar ROI: {String(error)}
        </div>
      )}

      <div className="roi-grid">
        <div className="roi-input-card">
          <h4>Investimento marketing</h4>
          <div className="roi-input-row">
            <label>Tráfego (Meta Ads)</label>
            <input
              type="number" min="0" step="100" value={trafego}
              onChange={e => setTrafego(e.target.value)}
              onBlur={e => saveField('trafego', e.target.value)}
            />
          </div>
          <div className="roi-input-row">
            <label>Mão de obra mkt</label>
            <input
              type="number" min="0" step="100" value={maoDeObra}
              onChange={e => setMaoDeObra(e.target.value)}
              onBlur={e => saveField('mao_de_obra', e.target.value)}
            />
          </div>
          <div className="roi-input-row">
            <label>Marketing geral</label>
            <input
              type="number" min="0" step="100" value={mktGeral}
              onChange={e => setMktGeral(e.target.value)}
              onBlur={e => saveField('mkt_geral', e.target.value)}
            />
          </div>
          <div className="roi-input-total">
            <span>Total {periodLbl}</span>
            <span className="v">{brl(invest)}</span>
          </div>
        </div>

        <div className="roi-metric gold">
          <div className="lbl">Faturamento {periodLbl2}</div>
          <div className="val">{isLoading ? '…' : fat > 0 ? brl(fat) : '—'}</div>
          <div className="sub">
            {isLoading
              ? 'carregando…'
              : fat > 0
                ? `${isSem ? 'esta semana' : 'mês corrente'} (${days} ${days === 1 ? 'dia' : 'dias'})`
                : 'aguardando dados'}
          </div>
        </div>

        <div className={`roi-metric ${margemCls}`}>
          <div className="lbl">Margem disponível</div>
          <div className="val">{fat > 0 ? brl(margem) : '—'}</div>
          <div className="sub">faturamento − invest. mkt</div>
        </div>

        <div className="roi-metric">
          <div className="lbl">ROAS de marketing</div>
          <div className="val">{roas > 0 ? roas.toFixed(2) + 'x' : '—'}</div>
          <div className="sub">cada R$ 1 investido retorna…</div>
        </div>
      </div>
    </section>
  )
}
