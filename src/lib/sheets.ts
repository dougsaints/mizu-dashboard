// Fetch + parse de planilhas Google Sheets (CSV publicado) +
// upsert normalizado em `sales_daily`. Portado da lógica monolítica
// do painel-diario.html original.

import { supabase } from './supabase'
import { MIZU_TENANT_ID } from './tenant'
import type { Database } from '../types/database'

type DataSource = Database['public']['Tables']['data_sources']['Row']
type SalesInsert = Database['public']['Tables']['sales_daily']['Insert']

// ─── Utilitários de parsing ───────────────────────────────────────

function detectSep(text: string): ',' | ';' {
  const line = text.split('\n')[0] ?? ''
  const semi = (line.match(/;/g) ?? []).length
  const comma = (line.match(/,/g) ?? []).length
  return semi > comma ? ';' : ','
}

function normH(h: string): string {
  return String(h)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

const H_MAP: Record<string, 'data' | 'pdv' | 'anotaai' | 'ifood' | 'dinheiro'> = {
  datadeentrada: 'data',
  data: 'data',
  pdvlojafisica: 'pdv',
  pdv: 'pdv',
  lojafisica: 'pdv',
  anotaai: 'anotaai',
  anotai: 'anotaai',
  ifood: 'ifood',
  dinheiro: 'dinheiro',
}

export function parseBR(v: string | undefined | null): number {
  if (!v) return 0
  let s = String(v).trim().replace(/R\$\s*/g, '').replace(/\s/g, '')
  if (!s || s === '-') return 0
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
  const n = parseFloat(s)
  return Number.isNaN(n) ? 0 : n
}

// "dd/mm/yyyy", "dd-mm-yyyy", "yyyy-mm-dd" → ISO "yyyy-mm-dd"
export function parseDateISO(v: string | undefined | null): string | null {
  if (!v) return null
  const s = String(v).trim()
  let d: string, m: string, y: string
  if (/^\d{2}[/-]\d{2}[/-]\d{4}$/.test(s)) {
    ;[d, m, y] = s.split(/[/-]/)
  } else if (/^\d{4}[/-]\d{2}[/-]\d{2}$/.test(s)) {
    ;[y, m, d] = s.split(/[/-]/)
  } else {
    return null
  }
  const dt = new Date(+y, +m - 1, +d)
  if (Number.isNaN(dt.getTime())) return null
  // Formato ISO date-only (YYYY-MM-DD) pra coluna `date` do Postgres
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

function csvSplit(line: string, sep: string): string[] {
  const res: string[] = []
  let cur = ''
  let inQ = false
  for (const ch of line) {
    if (ch === '"') {
      inQ = !inQ
      continue
    }
    if (ch === sep && !inQ) {
      res.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  res.push(cur)
  return res
}

export interface ParsedSalesRow {
  date: string // ISO yyyy-mm-dd
  pdv: number
  anotaai: number
  ifood: number
}

export function parseSalesCSV(text: string): ParsedSalesRow[] {
  const sep = detectSep(text)
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) return []

  const rawH = csvSplit(lines[0], sep).map((h) => h.replace(/^"|"$/g, '').trim())
  const keys = rawH.map((h) => H_MAP[normH(h)] ?? normH(h))

  const rows: ParsedSalesRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const vals = csvSplit(lines[i], sep).map((v) => v.replace(/^"|"$/g, '').trim())
    if (vals.every((v) => !v)) continue

    const obj: Record<string, string> = {}
    keys.forEach((k, idx) => {
      obj[k] = vals[idx] ?? ''
    })

    const date = parseDateISO(obj.data)
    if (!date) continue

    rows.push({
      date,
      pdv: parseBR(obj.pdv),
      anotaai: parseBR(obj.anotaai),
      ifood: parseBR(obj.ifood),
    })
  }
  return rows
}

// ─── Fetch com fallback (2 estratégias) ──────────────────────────
// Painel original tinha 3 (incluindo gviz JSONP). Aqui simplifico pra
// fetch direto + proxy allorigins. Em produção HTTPS, o direto sempre
// funciona — fallback só é necessário em file:// local.

export async function fetchSheetCSV(url: string): Promise<string> {
  const bust = `&_t=${Date.now()}`

  try {
    const res = await fetch(url + bust)
    if (res.ok) {
      const text = await res.text()
      if (text && text.trim().length > 10) return text
    }
  } catch {
    /* segue pro fallback */
  }

  try {
    const proxy = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url + bust)
    const res = await fetch(proxy)
    if (res.ok) {
      const text = await res.text()
      if (text && text.trim().length > 10) return text
    }
  } catch {
    /* falha total */
  }

  throw new Error('Não consegui buscar a planilha. Está publicada como CSV?')
}

// ─── Sync: fetch + parse + upsert + atualizar last_synced_at ─────

export interface SyncResult {
  rowsUpserted: number
  source: string
}

export async function syncSheetToSupabase(source: DataSource): Promise<SyncResult> {
  if (!source.url) {
    throw new Error(`data_source "${source.label}" sem URL`)
  }
  if (!source.unit_id) {
    throw new Error(`data_source "${source.label}" sem unit_id (necessário pra sales_daily)`)
  }

  try {
    const csv = await fetchSheetCSV(source.url)
    const parsed = parseSalesCSV(csv)

    if (parsed.length === 0) {
      // Não é erro fatal — planilha pode estar vazia. Atualiza sync, não erro.
      await supabase
        .from('data_sources')
        .update({ last_synced_at: new Date().toISOString(), last_error: null })
        .eq('id', source.id)
      return { rowsUpserted: 0, source: source.label ?? source.id }
    }

    const payload: SalesInsert[] = parsed.map((r) => ({
      tenant_id: MIZU_TENANT_ID,
      unit_id: source.unit_id!,
      date: r.date,
      pdv: r.pdv,
      anotaai: r.anotaai,
      ifood: r.ifood,
      source_id: source.id,
      synced_at: new Date().toISOString(),
    }))

    const { error: upsertErr } = await supabase
      .from('sales_daily')
      .upsert(payload, { onConflict: 'tenant_id,unit_id,date' })

    if (upsertErr) throw upsertErr

    await supabase
      .from('data_sources')
      .update({ last_synced_at: new Date().toISOString(), last_error: null })
      .eq('id', source.id)

    return { rowsUpserted: parsed.length, source: source.label ?? source.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await supabase
      .from('data_sources')
      .update({ last_error: msg })
      .eq('id', source.id)
    throw err
  }
}

// Roda sync de todos os data_sources do tipo "gsheet_csv" que estiverem
// habilitados. Retorna resultado por fonte. Não para na primeira falha.
export async function syncAllSheets(): Promise<
  Array<{ source: string; ok: boolean; rowsUpserted?: number; error?: string }>
> {
  const { data: sources, error } = await supabase
    .from('data_sources')
    .select('*')
    .eq('tenant_id', MIZU_TENANT_ID)
    .eq('kind', 'gsheet_csv')
    .eq('enabled', true)

  if (error) throw error
  if (!sources || sources.length === 0) return []

  const results = await Promise.all(
    sources.map(async (s) => {
      try {
        const r = await syncSheetToSupabase(s)
        return { source: r.source, ok: true, rowsUpserted: r.rowsUpserted }
      } catch (err) {
        return {
          source: s.label ?? s.id,
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        }
      }
    }),
  )
  return results
}
