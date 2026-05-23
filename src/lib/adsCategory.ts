// Classificação de campanhas Meta Ads por nome.
// Portado das funções `classifyCampaign` e `unitOfCampaign` do painel HTML
// original (linhas 2466-2489) — mesmas regras de prefixo no nome.

function normalize(s: string): string {
  return s.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export type AdsCategory = 'rmk' | 'ven' | 'eng' | 'alc' | 'out'

// "Delivery" e "Vendas" são tratadas como a MESMA categoria — todo pedido
// Meta Ads sai pelo AnotaAi (delivery), então a separação é artificial.
export function classifyCampaign(name: string | null | undefined): AdsCategory {
  if (!name) return 'out'
  const u = normalize(name)
  if (u.includes('[RMK]') || u.includes('REMARKET')) return 'rmk'
  if (u.includes('DELIVERY')) return 'ven'
  if (u.includes('[VEN]') || u.includes('[V2]') || u.includes('[VENDAS]')) return 'ven'
  if (u.includes('[ENG]') || u.includes('[ENGAJ')) return 'eng'
  if (u.includes('[ALC]') || u.includes('[ALCANCE]') || u.includes('BRANDING')) return 'alc'
  return 'out'
}

export type AdsUnit = 'jatiuca' | 'serraria' | 'geral'

export function unitOfCampaign(name: string | null | undefined): AdsUnit {
  if (!name) return 'geral'
  const u = normalize(name)
  if (u.includes('JATIUCA')) return 'jatiuca'
  if (u.includes('SERRARIA')) return 'serraria'
  return 'geral'
}

// Grupos de objetivo agregados: junta categorias relacionadas em 3 "intenções"
// que fazem sentido pra comparação de CTR/ROI (vendas+remkt = performance;
// engajamento isolado; alcance+outros = branding).
export type AdsGoalKey = 'perf' | 'eng' | 'alc'
export type AdsGoalGroup = {
  key: AdsGoalKey
  label: string
  cats: AdsCategory[]
  color: string
}

export const ADS_GOAL_GROUPS: AdsGoalGroup[] = [
  { key: 'perf', label: 'Performance',        cats: ['ven', 'rmk'], color: '#27AE60' },
  { key: 'eng',  label: 'Engajamento',        cats: ['eng'],         color: '#2980B9' },
  { key: 'alc',  label: 'Alcance / Branding', cats: ['alc', 'out'],  color: '#C9A961' },
]

export function goalGroupOf(cat: AdsCategory): AdsGoalGroup {
  for (const g of ADS_GOAL_GROUPS) {
    if (g.cats.includes(cat)) return g
  }
  return ADS_GOAL_GROUPS[2]
}
