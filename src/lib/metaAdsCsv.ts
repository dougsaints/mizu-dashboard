// Parser + commit do CSV de Meta Ads. Portado de painel-diario.html.
// Estratégia: ler arquivo, parsear, classificar por unidade, gravar em
// `ads_imports` (audit log) e UPSERT em `ads_daily` (1 linha por
// dia/campanha/conjunto/unidade — UNIQUE garante dedup automático).

import { supabase } from './supabase'
import { MIZU_TENANT_ID } from './tenant'
import { parseBR, parseDateISO } from './sheets'
import type { Database } from '../types/database'

type Unit = Database['public']['Tables']['units']['Row']
type AdsDailyInsert = Database['public']['Tables']['ads_daily']['Insert']

// ─── Utilitários internos ─────────────────────────────────────────

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

function normNome(s: string | null | undefined): string {
  return String(s ?? '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

// ─── Mapeamento de headers Meta Ads → chaves internas ─────────────

type AdsField =
  | 'inicio'
  | 'fim'
  | 'campaignName'
  | 'adSetName'
  | 'spend'
  | 'reach'
  | 'impressions'
  | 'clicks'
  | 'results'
  | 'resultValue'

const H_MAP_ADS: Record<string, AdsField> = {
  iniciodosrelatorios: 'inicio',
  encerramentodosrelatorios: 'fim',
  nomedacampanha: 'campaignName',
  nomedoconjuntodeanuncios: 'adSetName',
  valorusadobrl: 'spend',
  valorusado: 'spend',
  alcance: 'reach',
  impressoes: 'impressions',
  cliquesnolink: 'clicks',
  resultados: 'results',
  valordosresultados: 'resultValue',
}

// ─── Overrides de classificação por unidade ───────────────────────
// Portado integralmente do painel atual. Edite quando uma campanha
// for classificada errada pelo nome.

type UnitSlug = 'jatiuca' | 'serraria' | 'geral'

interface UnitOverride {
  match: string
  unit?: UnitSlug
  split?: Partial<Record<UnitSlug, number>>
}

const ADS_UNIT_OVERRIDES: UnitOverride[] = [
  { match: 'Casa Nova', unit: 'jatiuca' },
  { match: 'Rodizio Promocional', split: { jatiuca: 0.5, serraria: 0.5 } },
  { match: 'Rodizio FDS', split: { jatiuca: 0.5, serraria: 0.5 } },
]

function unitOfCampaign(nome: string): UnitSlug {
  const u = normNome(nome)
  if (u.includes('JATIUCA')) return 'jatiuca'
  if (u.includes('SERRARIA')) return 'serraria'
  return 'geral'
}

function findUnitOverride(nome: string): UnitOverride | null {
  const u = normNome(nome)
  for (const rule of ADS_UNIT_OVERRIDES) {
    if (u.includes(normNome(rule.match))) return rule
  }
  return null
}

// ─── Estrutura parsed ─────────────────────────────────────────────

export interface ParsedAdsRow {
  date: string // ISO yyyy-mm-dd
  campaignName: string
  adSetName: string
  unitSlug: UnitSlug
  cost: number
  reach: number
  impressions: number
  clicks: number
  results: number
  resultValue: number
}

export interface ParseAdsResult {
  rows: ParsedAdsRow[]
  discarded: number
  splitExpansions: number
  hasAdSetLevel: boolean
  dateRange: { start: string | null; end: string | null }
}

// Aplica overrides — pode expandir 1 row em N (split proporcional)
function applyUnitOverrides(base: Omit<ParsedAdsRow, 'unitSlug'>, nome: string): ParsedAdsRow[] {
  const rule = findUnitOverride(nome)
  if (!rule) {
    return [{ ...base, unitSlug: unitOfCampaign(nome) }]
  }
  if (rule.unit) {
    return [{ ...base, unitSlug: rule.unit }]
  }
  if (rule.split) {
    const out: ParsedAdsRow[] = []
    for (const [unitSlug, frac] of Object.entries(rule.split)) {
      if (!frac) continue
      out.push({
        ...base,
        unitSlug: unitSlug as UnitSlug,
        cost: base.cost * frac,
        reach: base.reach * frac,
        impressions: base.impressions * frac,
        clicks: base.clicks * frac,
        results: base.results * frac,
        resultValue: base.resultValue * frac,
      })
    }
    return out
  }
  return [{ ...base, unitSlug: unitOfCampaign(nome) }]
}

// ─── Parse de texto CSV ──────────────────────────────────────────

export function parseMetaAdsCSV(text: string): ParseAdsResult {
  const sep = detectSep(text)
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) {
    throw new Error('CSV vazio ou só com cabeçalho')
  }

  const rawH = csvSplit(lines[0], sep).map((h) => h.replace(/^"|"$/g, '').trim())
  const idx: Partial<Record<AdsField, number>> = {}
  rawH.forEach((h, i) => {
    const key = H_MAP_ADS[normH(h)]
    if (key && idx[key] === undefined) idx[key] = i
  })

  if (idx.campaignName === undefined && idx.adSetName === undefined) {
    throw new Error('Coluna de nome não encontrada (esperado "Nome da campanha" ou "Nome do conjunto de anúncios")')
  }
  if (idx.inicio === undefined && idx.fim === undefined) {
    throw new Error('Coluna de data não encontrada (esperado "Início dos relatórios")')
  }

  const hasAdSet = idx.adSetName !== undefined
  const rows: ParsedAdsRow[] = []
  let discarded = 0
  let splitExpansions = 0
  let dateMin: string | null = null
  let dateMax: string | null = null

  for (let i = 1; i < lines.length; i++) {
    const vals = csvSplit(lines[i], sep).map((v) => v.replace(/^"|"$/g, '').trim())
    if (vals.every((v) => !v)) continue

    const campaignName = idx.campaignName !== undefined ? (vals[idx.campaignName] ?? '') : ''
    const adSetName = hasAdSet ? (vals[idx.adSetName!] ?? '') : ''
    const nome = adSetName || campaignName
    if (!nome) {
      discarded++
      continue
    }

    const rawDate = (idx.inicio !== undefined ? vals[idx.inicio] : null) ?? (idx.fim !== undefined ? vals[idx.fim] : null)
    const date = parseDateISO(rawDate ?? '')
    if (!date) {
      discarded++
      continue
    }
    if (!dateMin || date < dateMin) dateMin = date
    if (!dateMax || date > dateMax) dateMax = date

    const base = {
      date,
      campaignName: campaignName || nome,
      adSetName,
      cost: idx.spend !== undefined ? parseBR(vals[idx.spend]) : 0,
      reach: idx.reach !== undefined ? parseBR(vals[idx.reach]) : 0,
      impressions: idx.impressions !== undefined ? parseBR(vals[idx.impressions]) : 0,
      clicks: idx.clicks !== undefined ? parseBR(vals[idx.clicks]) : 0,
      results: idx.results !== undefined ? parseBR(vals[idx.results]) : 0,
      resultValue: idx.resultValue !== undefined ? parseBR(vals[idx.resultValue]) : 0,
    }

    const expanded = applyUnitOverrides(base, nome)
    if (expanded.length > 1) splitExpansions++
    for (const r of expanded) rows.push(r)
  }

  if (rows.length === 0) {
    throw new Error(`Nenhuma linha válida encontrada (${discarded} descartadas)`)
  }

  return {
    rows,
    discarded,
    splitExpansions,
    hasAdSetLevel: hasAdSet,
    dateRange: { start: dateMin, end: dateMax },
  }
}

// ─── Leitura de File → texto (FileReader UTF-8) ──────────────────

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error ?? new Error('Falha ao ler arquivo'))
    reader.readAsText(file, 'UTF-8')
  })
}

// ─── Commit: audit log em ads_imports + UPSERT em ads_daily ──────

export interface CommitResult {
  importId: string
  rowsUpserted: number
  splitExpansions: number
  discarded: number
}

function unitSlugToId(slug: UnitSlug, units: Unit[]): string | null {
  if (slug === 'geral') return null
  const u = units.find((x) => x.slug === slug)
  return u ? u.id : null
}

export async function commitAdsImport(
  parsed: ParseAdsResult,
  filename: string,
  units: Unit[],
): Promise<CommitResult> {
  // 1) Audit log — guarda o payload bruto pra rollback futuro
  const { data: importRow, error: importErr } = await supabase
    .from('ads_imports')
    .insert({
      tenant_id: MIZU_TENANT_ID,
      filename,
      rows: parsed.rows as unknown as Database['public']['Tables']['ads_imports']['Insert']['rows'],
      date_range_start: parsed.dateRange.start,
      date_range_end: parsed.dateRange.end,
    })
    .select('id')
    .single()

  if (importErr) throw importErr
  if (!importRow) throw new Error('insert em ads_imports não retornou id')

  // 2) UPSERT linha-a-linha em ads_daily (chave: tenant+date+campaign+adset+unit)
  const payload: AdsDailyInsert[] = parsed.rows.map((r) => ({
    tenant_id: MIZU_TENANT_ID,
    unit_id: unitSlugToId(r.unitSlug, units),
    date: r.date,
    campaign_name: r.campaignName,
    ad_set_name: r.adSetName,
    cost: r.cost,
    impressions: Math.round(r.impressions),
    clicks: Math.round(r.clicks),
    reach: Math.round(r.reach),
    results: Math.round(r.results),
    result_value: r.resultValue,
    import_id: importRow.id,
    updated_at: new Date().toISOString(),
  }))

  // Nota: onConflict precisa bater com o índice único. Como o índice
  // usa uma expressão (coalesce em unit_id), o cliente JS do Supabase
  // não consegue resolver via `onConflict: '...'`. Estratégia: deletar
  // linhas com as mesmas chaves de import_id atual antes de inserir
  // não funciona — precisamos UPSERT real. Solução: fazer UPSERT em
  // batch usando RPC ou ignorar duplicatas via ON CONFLICT no Postgres.
  //
  // Aqui usamos uma estratégia de "delete + insert" por linhas dessa
  // janela de datas/campanhas — simples e idempotente. Performance
  // suficiente para uploads típicos (centenas de linhas).

  // Apaga linhas pré-existentes nas mesmas chaves naturais
  for (const row of payload) {
    let q = supabase
      .from('ads_daily')
      .delete()
      .eq('tenant_id', row.tenant_id)
      .eq('date', row.date)
      .eq('campaign_name', row.campaign_name)
      .eq('ad_set_name', row.ad_set_name ?? '')
    q = row.unit_id ? q.eq('unit_id', row.unit_id) : q.is('unit_id', null)
    const { error } = await q
    if (error) throw error
  }

  // Insere novas
  const { error: insertErr } = await supabase.from('ads_daily').insert(payload)
  if (insertErr) throw insertErr

  return {
    importId: importRow.id,
    rowsUpserted: payload.length,
    splitExpansions: parsed.splitExpansions,
    discarded: parsed.discarded,
  }
}
