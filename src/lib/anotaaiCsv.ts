// Parser + commit do CSV de produtos do Anota AI.
// O arquivo "Produtos-consulta-gerada-em-*.csv" é uma FOTO agregada
// (sem coluna de data por linha) — totais de produtos vendidos no
// período que o usuário selecionou no Anota AI antes de exportar.
//
// Estratégia: ler arquivo (UTF-8 com fallback windows-1252), parsear,
// categorizar, gravar em `anotaai_imports` (audit) + substituir
// snapshot de (snapshot_date, unit_id) em `anotaai_products`.

import { supabase } from './supabase'
import { MIZU_TENANT_ID } from './tenant'
import { parseBR, parseDateISO } from './sheets'
import type { Database } from '../types/database'

type ProductInsert = Database['public']['Tables']['anotaai_products']['Insert']

// ─── Encoding: tenta UTF-8 estrito, cai pra windows-1252 ─────────
// CSVs do Anota AI vêm em Latin-1 historicamente (acentos quebram),
// mas exports mais novos vêm em UTF-8. TextDecoder com fatal:true
// joga se o buffer não for UTF-8 válido — aí caímos pra 1252.

export async function readAnotaaiText(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf)
  } catch {
    return new TextDecoder('windows-1252').decode(buf)
  }
}

// ─── CSV split + normalização de header ──────────────────────────

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

// Mapeia headers comuns no CSV do Anota AI → chaves internas
const H_MAP: Record<string, 'item' | 'total'> = {
  item: 'item',
  produto: 'item',
  nomedoproduto: 'item',
  total: 'total',
  quantidade: 'total',
  qtde: 'total',
  qtd: 'total',
  unidades: 'total',
}

// ─── Categorização de itens (portado do painel-diario.html) ──────

export function categorizeItem(name: string): string {
  const s = String(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
  if (/coca|sprite|fanta|suco|agua|heineken|long neck|refri|cerveja/.test(s)) return 'Bebidas'
  if (/teriaky|teriaki|tare|shoyu|sache|wasabi|gengibre/.test(s)) return 'Molhos & Extras'
  if (/sashimi/.test(s)) return 'Sashimi & Niguiri'
  if (/niguiri|nigiri/.test(s)) return 'Sashimi & Niguiri'
  if (/sushi no copo|sushi dog|poke/.test(s)) return 'Sushi no Copo / Dog'
  if (/harumaki|haruhot/.test(s)) return 'Harumaki'
  if (/combo|meu combo|mix\b/.test(s)) return 'Combos & Combinados'
  const mP = s.match(/(\d+)\s*pec/)
  if (mP && parseInt(mP[1], 10) >= 18) return 'Combos & Combinados'
  if (/porcao|carpaccio|ceviche|polvo|crocante|cheese|sunomono|skin/.test(s)) return 'Porções & Entradas'
  if (/temaki/.test(s)) return 'Temakis'
  if (/\bhot\b|hot roll/.test(s)) return 'Hot Rolls'
  if (/uramaki|futomaki|maki|dragon|trio roll/.test(s)) return 'Uramaki / Makis'
  return 'Outros'
}

// ─── Extrai data do nome do arquivo ──────────────────────────────
// "Produtos-consulta-gerada-em-15-05-2026.csv" → "2026-05-15"
// "Produtos-consulta-gerada-em-2026-05-15.csv" → "2026-05-15"

export function snapshotDateFromFilename(filename: string): string | null {
  const m1 = filename.match(/(\d{2})[-/](\d{2})[-/](\d{4})/)
  if (m1) return parseDateISO(`${m1[1]}/${m1[2]}/${m1[3]}`)
  const m2 = filename.match(/(\d{4})[-/](\d{2})[-/](\d{2})/)
  if (m2) return parseDateISO(`${m2[1]}-${m2[2]}-${m2[3]}`)
  return null
}

// ─── Estrutura parsed ────────────────────────────────────────────

export interface ParsedProductRow {
  productName: string
  category: string
  quantity: number
}

export interface ParseAnotaaiResult {
  rows: ParsedProductRow[]
  discarded: number
}

export function parseAnotaaiCSV(text: string): ParseAnotaaiResult {
  const sep = detectSep(text)
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) {
    throw new Error('CSV vazio ou só com cabeçalho')
  }

  const rawH = csvSplit(lines[0], sep).map((h) => h.replace(/^"|"$/g, '').trim())
  const idx: Partial<Record<'item' | 'total', number>> = {}
  rawH.forEach((h, i) => {
    const key = H_MAP[normH(h)]
    if (key && idx[key] === undefined) idx[key] = i
  })

  // Sem cabeçalhos nomeados? Assume 2 colunas: nome do produto + total
  if (idx.item === undefined) idx.item = 0
  if (idx.total === undefined) idx.total = rawH.length > 1 ? rawH.length - 1 : 1

  const rows: ParsedProductRow[] = []
  let discarded = 0

  for (let i = 1; i < lines.length; i++) {
    const vals = csvSplit(lines[i], sep).map((v) => v.replace(/^"|"$/g, '').trim())
    if (vals.every((v) => !v)) continue

    const name = (vals[idx.item!] ?? '').trim()
    const total = parseBR(vals[idx.total!])

    if (!name || total <= 0) {
      discarded++
      continue
    }

    // Linha-resumo do Anota AI ("Total,444") não é produto
    const norm = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    if (norm === 'total' || norm === 'totais' || norm === 'soma') {
      discarded++
      continue
    }

    rows.push({
      productName: name,
      category: categorizeItem(name),
      quantity: total,
    })
  }

  if (rows.length === 0) {
    throw new Error(`Nenhum produto válido encontrado (${discarded} descartadas)`)
  }

  return { rows, discarded }
}

// ─── Commit no banco ─────────────────────────────────────────────

export interface CommitAnotaaiResult {
  importId: string
  rowsInserted: number
  discarded: number
  snapshotDate: string
}

export interface CommitAnotaaiArgs {
  parsed: ParseAnotaaiResult
  filename: string
  unitId: string | null
  snapshotDate: string // ISO yyyy-mm-dd
}

export async function commitAnotaaiImport(args: CommitAnotaaiArgs): Promise<CommitAnotaaiResult> {
  const { parsed, filename, unitId, snapshotDate } = args

  // 1) Audit log com payload bruto (pra rollback futuro)
  const { data: importRow, error: importErr } = await supabase
    .from('anotaai_imports')
    .insert({
      tenant_id: MIZU_TENANT_ID,
      unit_id: unitId,
      filename,
      snapshot_date: snapshotDate,
      rows: parsed.rows as unknown as Database['public']['Tables']['anotaai_imports']['Insert']['rows'],
    })
    .select('id')
    .single()

  if (importErr) throw importErr
  if (!importRow) throw new Error('insert em anotaai_imports não retornou id')

  // 2) Apaga snapshot anterior pra mesma (snapshot_date, unit_id)
  let delQ = supabase
    .from('anotaai_products')
    .delete()
    .eq('tenant_id', MIZU_TENANT_ID)
    .eq('snapshot_date', snapshotDate)
  delQ = unitId ? delQ.eq('unit_id', unitId) : delQ.is('unit_id', null)
  const { error: delErr } = await delQ
  if (delErr) throw delErr

  // 3) Insere produtos novos
  const payload: ProductInsert[] = parsed.rows.map((r) => ({
    tenant_id: MIZU_TENANT_ID,
    unit_id: unitId,
    import_id: importRow.id,
    snapshot_date: snapshotDate,
    product_name: r.productName,
    category: r.category,
    quantity: r.quantity,
  }))

  const { error: insertErr } = await supabase.from('anotaai_products').insert(payload)
  if (insertErr) throw insertErr

  return {
    importId: importRow.id,
    rowsInserted: payload.length,
    discarded: parsed.discarded,
    snapshotDate,
  }
}
