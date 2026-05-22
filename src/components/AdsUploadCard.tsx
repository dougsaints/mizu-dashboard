// Upload de CSV Meta Ads + lista dos últimos imports (audit log).

import { useRef, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useUploadAdsCSV, useAdsImports, useAds } from '../api/useAds'
import { useFilters } from '../lib/period'
import AdsCharts from './AdsCharts'

export default function AdsUploadCard() {
  const fileRef = useRef<HTMLInputElement>(null)
  const upload = useUploadAdsCSV()
  const { data: imports = [] } = useAdsImports(5)
  const [feedback, setFeedback] = useState<string | null>(null)
  const { start, end } = useFilters()
  const { data: adsRows = [] } = useAds(start, end)

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFeedback(null)
    upload.mutate(file, {
      onSuccess: (r) => {
        setFeedback(
          `✓ ${file.name}: ${r.rowsUpserted} linha(s) processada(s)` +
            (r.splitExpansions > 0 ? ` · ${r.splitExpansions} split(s)` : '') +
            (r.discarded > 0 ? ` · ${r.discarded} descartada(s)` : ''),
        )
        if (fileRef.current) fileRef.current.value = ''
      },
      onError: (err) => {
        setFeedback(`✗ Erro: ${(err as Error).message}`)
      },
    })
  }

  return (
    <section className="mizu-section">
      <div className="mizu-section-head">
        <div>
          <div className="mizu-section-title">
            <span className="kanji-deco">広</span> Tráfego Pago (Meta Ads)
          </div>
          <div className="mizu-section-sub">
            Exporta CSV no Gerenciador de Anúncios e arrasta aqui · histórico
            acumulado, dedup automático por dia/campanha
          </div>
        </div>
      </div>

      <div className="ads-upload-box">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt"
          onChange={onPick}
          disabled={upload.isPending}
        />
        {upload.isPending && (
          <span className="ads-upload-spinner">Processando…</span>
        )}
        {feedback && (
          <div
            className="ads-upload-feedback"
            style={{
              color: feedback.startsWith('✗') ? 'var(--alert-red)' : 'var(--mizu-gold)',
            }}
          >
            {feedback}
          </div>
        )}
      </div>

      {imports.length > 0 && (
        <div className="ads-imports-list">
          <div className="ads-imports-head">Últimos uploads</div>
          {imports.map((imp) => (
            <div key={imp.id} className="ads-import-row">
              <span className="ads-import-file">{imp.filename ?? 'sem nome'}</span>
              <span className="ads-import-range">
                {imp.date_range_start && imp.date_range_end
                  ? `${imp.date_range_start} → ${imp.date_range_end}`
                  : '—'}
              </span>
              <span className="ads-import-when">
                {format(parseISO(imp.imported_at), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </span>
            </div>
          ))}
        </div>
      )}

      <AdsCharts rows={adsRows} />
    </section>
  )
}
