import { useState } from 'react'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useDiary, useAddDiaryEntry } from '../api/useDiary'

const AUTORES = ['Mike', 'Gab', 'Tráfego', 'Operação', 'Outro']

const TAGS = [
  { id: 'ok', label: '✓ tudo certo', icon: '✓' },
  { id: 'warn', label: '⚠ atenção', icon: '⚠' },
  { id: 'fire', label: '🔥 oportunidade', icon: '🔥' },
  { id: 'opp', label: '❌ problema', icon: '❌' },
] as const

type TagId = (typeof TAGS)[number]['id']

export default function DiarioSection() {
  const { data: notas = [], isLoading, error } = useDiary()
  const addNote = useAddDiaryEntry()

  const [autor, setAutor] = useState<string>('Mike')
  const [tag, setTag] = useState<TagId>('ok')
  const [texto, setTexto] = useState('')

  const submit = () => {
    if (!texto.trim() || addNote.isPending) return
    addNote.mutate(
      { author_name: autor, tag, texto: texto.trim() },
      {
        onSuccess: () => setTexto(''),
      },
    )
  }

  const grupos = groupByDay(notas)
  const dias = Object.keys(grupos).sort().reverse()

  return (
    <section className="mizu-section" id="diarioSection">
      <div className="mizu-section-head">
        <div>
          <div className="mizu-section-title">
            <span className="kanji-deco">記</span> Diário do Time
          </div>
          <div className="mizu-section-sub">
            Espaço comum · sincronizado em tempo real entre todos os dispositivos
          </div>
        </div>
      </div>

      <div className="diario-input">
        <div className="diario-row">
          <select value={autor} onChange={(e) => setAutor(e.target.value)}>
            {AUTORES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <div className="tag-pick">
            {TAGS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={tag === t.id ? 'on' : ''}
                onClick={() => setTag(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="O que aconteceu hoje? Que ideia surgiu? Algum cliente comentou algo?"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit()
          }}
        />
        <div className="actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setTexto('')}>
            Limpar
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={submit}
            disabled={addNote.isPending || !texto.trim()}
          >
            {addNote.isPending ? 'Publicando…' : '💾 Publicar nota'}
          </button>
        </div>
        {addNote.error && (
          <div style={{ color: 'var(--alert-red)', fontSize: 12, marginTop: 8 }}>
            Erro ao publicar: {(addNote.error as Error).message}
          </div>
        )}
      </div>

      <div className="diario-feed">
        {isLoading && <div className="diario-empty">Carregando…</div>}
        {error && (
          <div className="diario-empty" style={{ color: 'var(--alert-red)' }}>
            Erro ao carregar: {(error as Error).message}
          </div>
        )}
        {!isLoading && !error && notas.length === 0 && (
          <div className="diario-empty">
            Nenhuma nota ainda. Seja o primeiro a registrar como foi o dia.
          </div>
        )}
        {dias.map((dia) => (
          <div key={dia} className="diario-day">
            <div className="diario-day-head">
              <span>{formatDiaLabel(dia)}</span>
              <span>
                {grupos[dia].length} {grupos[dia].length === 1 ? 'nota' : 'notas'}
              </span>
            </div>
            {grupos[dia].map((n) => (
              <div key={n.id} className="diario-note">
                <div className={`ntag ${n.tag}`}>{iconFor(n.tag)}</div>
                <div className="nbody">
                  <div className="nauthor">
                    {n.author_name} · {format(parseISO(n.ts), 'HH:mm')}
                  </div>
                  <div className="ntext">{n.texto}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

function groupByDay<T extends { ts: string }>(items: T[]): Record<string, T[]> {
  const out: Record<string, T[]> = {}
  for (const it of items) {
    const dia = it.ts.slice(0, 10)
    if (!out[dia]) out[dia] = []
    out[dia].push(it)
  }
  return out
}

function formatDiaLabel(dia: string): string {
  const d = parseISO(dia)
  if (isToday(d)) return 'Hoje'
  if (isYesterday(d)) return 'Ontem'
  return format(d, "EEEE, dd 'de' MMM", { locale: ptBR })
}

function iconFor(tag: string): string {
  return TAGS.find((t) => t.id === tag)?.icon ?? '·'
}
