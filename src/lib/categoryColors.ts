// Mapeamento heurístico de categoria de produto Anota AI → cor.
// Sem deps. Heurísticas + fallback determinístico por hash.

// Paleta puxada pro vermelho/quente (Phase 11-06) — vibe sushi/cozinha asiática.
// Doug pediu "mais quente, mais puxado pro vermelho" comparado ao painel antigo.
const HEURISTIC: Array<[RegExp, string]> = [
  [/sushi|sashimi|nigiri|temaki|niguiri|maki/i, '#C0392B'],            // vermelho-bordô (sushi = destaque principal)
  [/hot[\s_-]*roll|empanad|frit/i, '#E67E22'],                          // laranja queimado
  [/combinado|combo|cmb|festival/i, '#D35400'],                         // vermelho-laranja escuro (combo = flagship)
  [/bebida|drink|suco|refri|cerveja|chopp|\bagua\b/i, '#5D6D7E'],       // azul-ardósia (bebida fica fria, mas não destoa)
  [/sobremes|dessert|doce|mochi/i, '#E74C3C'],                          // vermelho-cereja (doce vibrante)
  [/entrada|aperitivo|petisc|porc/i, '#A04000'],                        // marrom-terracota
  [/yakisoba|robata|skewer|grelh/i, '#922B21'],                         // bordô-escuro (grelhado)
  [/molho|extra|salsa/i, '#B9770E'],                                    // mostarda-queimada
]

const FALLBACK = [
  '#B03A2E',  // vermelho-tijolo
  '#CA6F1E',  // ocre-quente
  '#E59866',  // pêssego
  '#A93226',  // bordô
  '#D68910',  // amarelo-mostarda
  '#7E5109',  // marrom-tabaco
  '#7B241C',  // castanho-vinho
  '#AF601A',  // âmbar
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
