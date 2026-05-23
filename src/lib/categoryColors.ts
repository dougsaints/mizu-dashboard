// Mapeamento heurístico de categoria de produto Anota AI → cor.
// Sem deps. Heurísticas + fallback determinístico por hash.

const HEURISTIC: Array<[RegExp, string]> = [
  [/sushi|sashimi|nigiri|temaki|niguiri|maki/i, '#E74C3C'],
  [/hot[\s_-]*roll|empanad|frit/i, '#E67E22'],
  [/combinado|combo|cmb|festival/i, '#8E44AD'],
  [/bebida|drink|suco|refri|cerveja|chopp|\bagua\b/i, '#3498DB'],
  [/sobremes|dessert|doce|mochi/i, '#F39C12'],
  [/entrada|aperitivo|petisc|porc/i, '#16A085'],
  [/yakisoba|robata|skewer|grelh/i, '#C0392B'],
]

const FALLBACK = [
  '#95A5A6',
  '#7F8C8D',
  '#34495E',
  '#BDC3C7',
  '#1ABC9C',
  '#9B59B6',
  '#27AE60',
  '#D35400',
]

function hashCategory(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function categoryColor(category: string | null | undefined): string {
  if (!category || !category.trim()) return '#A89E89'
  for (const [re, color] of HEURISTIC) {
    if (re.test(category)) return color
  }
  return FALLBACK[hashCategory(category.toLowerCase()) % FALLBACK.length]
}

export function withAlpha(hex: string, alpha: string): string {
  return hex + alpha
}
