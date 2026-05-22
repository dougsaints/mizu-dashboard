// Upload dos CSVs de métricas do Instagram (Meta Business Suite).
// Aceita vários arquivos de uma vez — Doug exporta 6 (um por métrica).

import { useRef, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useUploadInstagramCSV, useOrganicImports } from '../api/useOrganic'

export default function InstagramUploadCard() {
  const fileRef = useRef<HTMLInputElement>(null)
  const upload = useUploadInstagramCSV()
  const { data: imports = [] } = useOrganicImports(5)
  const [feedback, setFeedback] = useState<string | null>(null)

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setFeedback(null)
    upload.mutate(files, {
      onSuccess: (r) => {
        setFeedback(
          `✓ ${r.metricsFound.length} métrica(s) · ${r.rowsUpserted} dia(s)` +
            (r.dateRange.start && r.dateRange.end
              ? ` · ${r.dateRange.start} → ${r.dateRange.end}`
              : ''),
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
            <span className="kanji-deco">繋</span> Métricas do Instagram
          </div>
          <div className="mizu-section-sub">
            No Meta Business Suite, exporta cada métrica em CSV (Alcance,
            Visualizações, Interações, Seguidores, Visitas, Cliques) e seleciona
            todas aqui de uma vez · UPSERT por dia, subir de novo não duplica
          </div>
        </div>
      </div>

      <div className="ads-upload-box">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt"
          multiple
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
          {imports.map((imp) => {
            const files = Array.isArray(imp.filenames) ? imp.filenames : []
            return (
              <div key={imp.id} className="ads-import-row">
                <span className="ads-import-file">
                  {files.length} arquivo(s)
                </span>
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
            )
          })}
        </div>
      )}
    </section>
  )
}
