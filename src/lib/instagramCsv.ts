// Parser + commit dos CSVs de métricas do Instagram (Meta Business Suite).
//
// O Business Suite exporta UM ARQUIVO POR MÉTRICA. Doug exporta 6 de uma
// vez: Alcance, Visualizações, Interações, Visitas (ao perfil), Cliques
// no link e Seguidores. Cada arquivo tem o formato:
//
//   linha 1:  sep=,                          (ignorar)
//   linha 2:  "Alcance"                       (título → identifica a métrica)
//   linha 3:  "Data","Primary"                (cabeçalho)
//   linha 4+: "2026-05-01T00:00:00","60512"   (dado: data + valor do dia)
//
// Encoding: UTF-16 LE com BOM (FF FE). Detectamos o BOM e usamos
// TextDecoder('utf-16le'); se não houver BOM, caímos pra UTF-8.
//
// "Seguidores" = NOVOS seguidores por dia (não o total acumulado).
//
// Estratégia: parsear os N arquivos, juntar tudo POR DATA num só mapa,
// gravar em `organic_imports` (audit) + UPSERT em `organic_entries`
// (PK tenant+date — UPSERT é idempotente, subir 2x não duplica).

import { supabase } from './supabase'
import { MIZU_TENANT_ID } from './tenant'
import { parseBR, parseDateISO } from './sheets'
import type { Database } from '../types/database'

type OrganicInsert = Database['public']['Tables']['organic_entries']['Insert']

// ─── Métricas que conhecemos ──────────────────────────────────────
// chave interna = coluna da tabela organic_entries

export type OrganicMetric =
  | 'alcance'
  | 'visualizacoes'
  | 'interacoes'
  | 'seguidores_novos'
  | 'visitas_perfil'
  | 'cliques_link'

// Mapeia o título da linha 2 → métrica, por palavra-chave (sem acento).
// A ordem importa: "visualiz" antes de "visita" não é necessário porque
// são radicais distintos, mas mantemos explícito por clareza.
const METRIC_KEYWORDS: { kw: string; metric: OrganicMetric }[] = [
  { kw: 'alcance', metric: 'alcance' },
  { kw: 'visualiz', metric: 'visualizacoes' },
  { kw: 'intera', metric: 'interacoes' },
  { kw: 'seguidor', metric: 'seguidores_novos' },
  { kw: 'visita', metric: 'visitas_perfil' },
  { kw: 'clique', metric: 'cliques_link' },
]

function normText(s: string): string {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

function metricFromTitle(title: string): OrganicMetric | null {
  const t = normText(title)
  for (const { kw, metric } of METRIC_KEYWORDS) {
    if (t.includes(kw)) return metric
  }
  return null
}

// ─── Leitura do arquivo: detecta UTF-16 LE/BE pelo BOM ────────────

export async function readInstagramText(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const bytes = new Uint8Array(buf)
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(buf)
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(buf)
  }
  return new TextDecoder('utf-8').decode(buf)
}

// ─── CSV split (campos entre aspas) ───────────────────────────────

function csvSplit(line: string): string[] {
  const res: string[] = []
  let cur = ''
  let inQ = false
  for (const ch of line) {
    if (ch === '"') {
      inQ = !inQ
      continue
    }
    if (ch === ',' && !inQ) {
      res.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  res.push(cur)
  return res
}

// ─── Parse de um arquivo (uma métrica) ────────────────────────────

export interface ParsedMetricFile {
  metric: OrganicMetric
  values: { date: string; value: number }[]
}

export function parseInstagramFile(text: string, filename: string): ParsedMetricFile {
  // Remove BOM textual residual e quebra em linhas não-vazias
  const lines = text
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  // Pula a linha "sep=," se existir
  let i = 0
  if (lines[i] && lines[i].toLowerCase().startsWith('sep=')) i++

  // Linha de título → identifica a métrica
  const titleLine = lines[i] ?? ''
  const title = csvSplit(titleLine)[0]?.trim() ?? ''
  const metric = metricFromTitle(title)
  if (!metric) {
    throw new Error(
      `"${filename}": não reconheci a métrica pelo título "${title}". ` +
        `Esperado um de: Alcance, Visualizações, Interações, Seguidores, Visitas, Cliques.`,
    )
  }
  i++

  // Linha de cabeçalho ("Data","Primary") → pula
  if (lines[i] && normText(csvSplit(lines[i])[0] ?? '').includes('data')) i++

  const values: { date: string; value: number }[] = []
  for (; i < lines.length; i++) {
    const cols = csvSplit(lines[i]).map((c) => c.trim())
    if (cols.every((c) => !c)) continue
    // Data vem como "2026-05-01T00:00:00" — só os 10 primeiros caracteres
    const date = parseDateISO((cols[0] ?? '').slice(0, 10))
    if (!date) continue
    const value = Math.round(parseBR(cols[1]))
    values.push({ date, value })
  }

  if (values.length === 0) {
    throw new Error(`"${filename}": nenhuma linha de dados válida encontrada.`)
  }

  return { metric, values }
}

// ─── Merge de vários arquivos → 1 linha por data ──────────────────

export interface ParsedOrganicResult {
  rows: OrganicInsert[]
  metricsFound: OrganicMetric[]
  dateRange: { start: string | null; end: string | null }
}

const EMPTY_ROW: Omit<OrganicInsert, 'tenant_id' | 'date'> = {
  alcance: 0,
  visualizacoes: 0,
  interacoes: 0,
  seguidores_novos: 0,
  visitas_perfil: 0,
  cliques_link: 0,
}

export async function parseInstagramFiles(files: File[]): Promise<ParsedOrganicResult> {
  if (files.length === 0) {
    throw new Error('Nenhum arquivo selecionado.')
  }

  const byDate = new Map<string, OrganicInsert>()
  const metricsFound = new Set<OrganicMetric>()

  for (const file of files) {
    const text = await readInstagramText(file)
    const parsed = parseInstagramFile(text, file.name)
    if (metricsFound.has(parsed.metric)) {
      throw new Error(
        `A métrica "${parsed.metric}" apareceu em mais de um arquivo. ` +
          `Selecione só um arquivo por métrica.`,
      )
    }
    metricsFound.add(parsed.metric)

    for (const { date, value } of parsed.values) {
      let row = byDate.get(date)
      if (!row) {
        row = { tenant_id: MIZU_TENANT_ID, date, ...EMPTY_ROW }
        byDate.set(date, row)
      }
      row[parsed.metric] = value
    }
  }

  const rows = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
  return {
    rows,
    metricsFound: [...metricsFound],
    dateRange: {
      start: rows.length > 0 ? rows[0].date : null,
      end: rows.length > 0 ? rows[rows.length - 1].date : null,
    },
  }
}

// ─── Commit: audit log + UPSERT em organic_entries ────────────────

export interface CommitOrganicResult {
  importId: string
  rowsUpserted: number
  metricsFound: OrganicMetric[]
  dateRange: { start: string | null; end: string | null }
}

export async function commitOrganicImport(
  parsed: ParsedOrganicResult,
  filenames: string[],
): Promise<CommitOrganicResult> {
  // 1) Audit log — guarda o payload bruto pra rollback futuro
  const { data: importRow, error: importErr } = await supabase
    .from('organic_imports')
    .insert({
      tenant_id: MIZU_TENANT_ID,
      filenames: filenames as unknown as Database['public']['Tables']['organic_imports']['Insert']['filenames'],
      rows: parsed.rows as unknown as Database['public']['Tables']['organic_imports']['Insert']['rows'],
      date_range_start: parsed.dateRange.start,
      date_range_end: parsed.dateRange.end,
    })
    .select('id')
    .single()

  if (importErr) throw importErr
  if (!importRow) throw new Error('insert em organic_imports não retornou id')

  // 2) UPSERT em organic_entries — PK (tenant_id, date) garante dedup
  const now = new Date().toISOString()
  const payload: OrganicInsert[] = parsed.rows.map((r) => ({ ...r, updated_at: now }))

  const { error: upsertErr } = await supabase
    .from('organic_entries')
    .upsert(payload, { onConflict: 'tenant_id,date' })
  if (upsertErr) throw upsertErr

  return {
    importId: importRow.id,
    rowsUpserted: payload.length,
    metricsFound: parsed.metricsFound,
    dateRange: parsed.dateRange,
  }
}
