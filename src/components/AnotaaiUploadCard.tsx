// Upload de CSV do Anota AI + lista dos últimos imports.
// Diferente do AdsUploadCard: pede unidade e data do snapshot porque
// o CSV é uma foto agregada sem coluna de data por linha.

import { useRef, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  useUploadAnotaaiCSV,
  useAnotaaiImports,
  snapshotDateFromFilename,
} from '../api/useAnotaai'
import { useUnits } from '../api/useUnits'

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function AnotaaiUploadCard() {
  const fileRef = useRef<HTMLInputElement>(null)
  const upload = useUploadAnotaaiCSV()
  const { data: imports = [] } = useAnotaaiImports(5)
  const { data: units = [] } = useUnits()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [unitId, setUnitId] = useState<string>('all')
  const [snapshotDate, setSnapshotDate] = useState<string>(todayISO())
  const [pickedFile, setPickedFile] = useState<File | null>(null)

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setPickedFile(null)
      return
    }
    setPickedFile(file)
    const guessed = snapshotDateFromFilename(file.name)
    if (guessed) setSnapshotDate(guessed)
    setFeedback(null)
  }

  const onSubmit = () => {
    if (!pickedFile) {
      setFeedback('✗ Escolha um arquivo CSV primeiro')
      return
    }
    setFeedback(null)
    upload.mutate(
      {
        file: pickedFile,
        unitId: unitId === 'all' ? null : unitId,
        snapshotDate,
      },
      {
        onSuccess: (r) => {
          setFeedback(
            `✓ ${pickedFile.name}: ${r.rowsInserted} produto(s) importado(s)` +
              (r.discarded > 0 ? ` · ${r.discarded} descartado(s)` : ''),
          )
          if (fileRef.current) fileRef.current.value = ''
          setPickedFile(null)
        },
        onError: (err) => {
          setFeedback(`✗ Erro: ${(err as Error).message}`)
        },
      },
    )
  }

  return (
    <section className="mizu-section">
      <div className="mizu-section-head">
        <div>
          <div className="mizu-section-title">
            <span className="kanji-deco">品</span> Produtos do Delivery (Anota AI)
          </div>
          <div className="mizu-section-sub">
            Exporta o CSV "Produtos-consulta-gerada-em-…" no Anota AI e
            sobe aqui · substitui a foto anterior pra mesma data e unidade
          </div>
        </div>
      </div>

      <div className="anotaai-upload-box">
        <div className="anotaai-upload-row">
          <label className="anotaai-upload-label">Unidade</label>
          <select
            className="anotaai-upload-input"
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            disabled={upload.isPending}
          >
            <option value="all">Todas (consolidado)</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.display_name}
              </option>
            ))}
          </select>
        </div>

        <div className="anotaai-upload-row">
          <label className="anotaai-upload-label">Data do snapshot</label>
          <input
            className="anotaai-upload-input"
            type="date"
            value={snapshotDate}
            onChange={(e) => setSnapshotDate(e.target.value)}
            disabled={upload.isPending}
          />
        </div>

        <div className="anotaai-upload-row">
          <label className="anotaai-upload-label">Arquivo CSV</label>
          <input
            ref={fileRef}
            className="anotaai-upload-input"
            type="file"
            accept=".csv,.txt"
            onChange={onPick}
            disabled={upload.isPending}
          />
        </div>

        <div className="anotaai-upload-actions">
          <button
            className="anotaai-upload-btn"
            onClick={onSubmit}
            disabled={upload.isPending || !pickedFile}
          >
            {upload.isPending ? 'Processando…' : 'Importar produtos'}
          </button>
        </div>

        {feedback && (
          <div
            className="anotaai-upload-feedback"
            style={{
              color: feedback.startsWith('✗') ? 'var(--alert-red)' : 'var(--mizu-gold)',
            }}
          >
            {feedback}
          </div>
        )}
      </div>

      {imports.length > 0 && (
        <div className="anotaai-imports-list">
          <div className="anotaai-imports-head">Últimos uploads</div>
          {imports.map((imp) => {
            const unit = units.find((u) => u.id === imp.unit_id)
            return (
              <div key={imp.id} className="anotaai-import-row">
                <span className="anotaai-import-file">{imp.filename ?? 'sem nome'}</span>
                <span className="anotaai-import-unit">{unit?.display_name ?? 'Todas'}</span>
                <span className="anotaai-import-range">
                  {imp.snapshot_date
                    ? format(parseISO(imp.snapshot_date), 'dd/MM/yyyy', { locale: ptBR })
                    : '—'}
                </span>
                <span className="anotaai-import-when">
                  {format(parseISO(imp.imported_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
