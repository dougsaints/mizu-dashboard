import { useWeeklyRecap } from '../api/useWeeklyRecap'

function brl(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function WeeklyRecap() {
  const { data, isLoading, error } = useWeeklyRecap()

  return (
    <section className="mizu-section wr-section">
      <div className="mizu-section-head">
        <div>
          <div className="mizu-section-title">
            <span className="kanji-deco">週</span> Resumo da Semana
          </div>
          <div className="mizu-section-sub">
            {isLoading ? 'Carregando período…' : (data?.periodLabel ?? '—')}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ color: 'var(--alert-red)', marginTop: 8, fontSize: 13 }}>
          Erro ao carregar resumo: {String(error)}
        </div>
      )}

      <div className="wr-grid">
        {/* Bloco 1: Faturamento por unidade */}
        <div className="wr-block">
          <div className="wr-block-label">Faturamento — semana atual vs anterior</div>
          <div className="wr-units">
            {isLoading ? (
              <>
                <div className="wr-unit"><div className="wr-unit-name">—</div><div className="wr-unit-val">—</div><div className="wr-unit-delta flat">aguardando dados</div></div>
                <div className="wr-unit"><div className="wr-unit-name">—</div><div className="wr-unit-val">—</div><div className="wr-unit-delta flat">aguardando dados</div></div>
              </>
            ) : (data?.units ?? []).map(u => {
              const delta = u.prev > 0 ? ((u.cur - u.prev) / u.prev) * 100 : (u.cur > 0 ? 100 : 0)
              const cls = delta > 2 ? 'up' : delta < -2 ? 'down' : 'flat'
              const arrow = delta > 2 ? '▲' : delta < -2 ? '▼' : '→'
              return (
                <div key={u.id} className="wr-unit">
                  <div className="wr-unit-name">{u.name}</div>
                  <div className="wr-unit-val">{u.cur > 0 ? brl(u.cur) : '—'}</div>
                  <div className={`wr-unit-delta ${cls}`}>
                    {arrow} {Math.abs(delta).toFixed(0)}% · prev: {brl(u.prev)}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Alerta de queda */}
          {!isLoading && data && (
            <div className={`wr-alert ${data.alertDown ? '' : 'empty'}`}>
              {data.alertDown ? (
                <>
                  <span className="ic">⚠</span>
                  <span>
                    <strong>{data.alertDown.unit}</strong> caiu{' '}
                    <strong>{Math.abs(data.alertDown.pct).toFixed(0)}%</strong> vs a semana anterior.
                    Vale entender o motivo na reunião.
                  </span>
                </>
              ) : data.noRevenue ? (
                <>
                  <span className="ic">📋</span>
                  <span>Sem faturamento registrado nesta semana — verifique se a planilha está atualizada.</span>
                </>
              ) : (
                <>
                  <span className="ic">✓</span>
                  <span>Sem alertas críticos detectados na semana.</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Bloco 2: ROAS */}
        <div className="wr-block">
          <div className="wr-block-label">ROAS de Marketing (semana)</div>
          <div className="wr-roas">
            <div className="wr-roas-val">
              {isLoading ? '—' : data?.roas != null ? data.roas.toFixed(2) + 'x' : '—'}
            </div>
            <div className="wr-roas-cap">faturamento ÷ ad spend</div>
          </div>
          <div className="wr-spent">
            {isLoading ? (
              'Carregando…'
            ) : data?.roas != null && data.adSpend > 0 ? (
              <>Investiu <strong>{brl(data.adSpend)}</strong> em Meta Ads · faturou <strong>{brl(data.totalCur)}</strong></>
            ) : (
              'Carregue o CSV do Meta Ads para calcular o ROAS.'
            )}
          </div>
        </div>

        {/* Bloco 3: Top 3 produtos */}
        <div className="wr-block">
          <div className="wr-block-label">Top 3 produtos (último snapshot)</div>
          {isLoading ? (
            <ul className="wr-top">
              <li className="mizu-empty" style={{ gridColumn: '1/-1' }}>Carregando…</li>
            </ul>
          ) : (data?.top3 ?? []).length > 0 ? (
            <ul className="wr-top">
              {data!.top3.map((p, i) => (
                <li key={p.name}>
                  <span className="rank">{i + 1}</span>
                  <span className="name" title={p.name}>{p.name}</span>
                  <span className="qty">{p.qty} un.</span>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="wr-top">
              <li className="mizu-empty" style={{ gridColumn: '1/-1' }}>
                Faça upload do CSV Anota AI para ver o ranking.
              </li>
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
