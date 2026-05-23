// Gerador + download de CSV — string puro, sem deps externas.
// Default PT-BR: separador `;`, BOM UTF-8 (Excel BR lê acentos certo).

export type CsvCell = string | number
export type CsvRow = CsvCell[]

type BuildOpts = {
  separator?: string
}

function escapeCell(value: CsvCell, separator: string): string {
  const s = typeof value === 'number' ? String(value) : value
  if (s.includes(separator) || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function buildCsv(header: string[], rows: CsvRow[], opts: BuildOpts = {}): string {
  const separator = opts.separator ?? ';'
  const lines: string[] = []
  lines.push(header.map((h) => escapeCell(h, separator)).join(separator))
  for (const row of rows) {
    lines.push(row.map((c) => escapeCell(c, separator)).join(separator))
  }
  return lines.join('\r\n')
}

export function downloadCsv(content: string, filename: string): void {
  // BOM UTF-8: força Excel BR a interpretar acentos corretamente.
  const bom = '﻿'
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Formatador PT-BR para valores monetários dentro do CSV (vírgula decimal).
export function formatNumberBR(n: number, decimals = 2): string {
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
