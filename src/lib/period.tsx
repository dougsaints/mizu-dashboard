// Contexto React dos filtros globais — fonte única do filtro do topo.
// Guarda: intervalo de datas, unidade selecionada e canal de venda.
//
// Nota: o arquivo segue chamado period.tsx por inércia (período é o
// estado central). A API exposta passou a se chamar useFilters/
// FilterProvider porque o contexto cobre mais que só período.

import { createContext, useContext, useState, type ReactNode } from 'react'
import { resolvePreset } from './periodPresets'

const DEFAULT_PRESET = '30d'

export type Channel = 'all' | 'pdv' | 'ifood' | 'anotaai'
export type CmpMode = 'prev' | 'prevMonth' | 'none'
export type AnalysisMode = 'monthly' | 'weekly'

type FilterState = {
  start: string
  end: string
  presetKey: string
  unitId: string | null  // null = "Todas as unidades"
  channel: Channel       // 'all' = "Todos os canais"
  cmpMode: CmpMode       // 'prev' = período anterior | 'prevMonth' = mês passado | 'none' = sem comparação
  analysisMode: AnalysisMode  // 'monthly' = mês a mês | 'weekly' = semana a semana
}

type FilterContextValue = FilterState & {
  setRange: (start: string, end: string, presetKey: string) => void
  setUnit: (id: string | null) => void
  setChannel: (c: Channel) => void
  setCmpMode: (m: CmpMode) => void
  setAnalysisMode: (m: AnalysisMode) => void
}

const FilterContext = createContext<FilterContextValue | null>(null)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FilterState>(() => {
    const r = resolvePreset(DEFAULT_PRESET)
    return {
      start: r.start,
      end: r.end,
      presetKey: DEFAULT_PRESET,
      unitId: null,
      channel: 'all',
      cmpMode: 'prev',
      analysisMode: 'monthly',
    }
  })

  // Setters preservam os outros campos do estado.
  const setRange = (start: string, end: string, presetKey: string) =>
    setState((s) => ({ ...s, start, end, presetKey }))
  const setUnit = (id: string | null) =>
    setState((s) => ({ ...s, unitId: id }))
  const setChannel = (c: Channel) =>
    setState((s) => ({ ...s, channel: c }))
  const setCmpMode = (m: CmpMode) =>
    setState((s) => ({ ...s, cmpMode: m }))
  const setAnalysisMode = (m: AnalysisMode) =>
    setState((s) => ({ ...s, analysisMode: m }))

  return (
    <FilterContext.Provider value={{ ...state, setRange, setUnit, setChannel, setCmpMode, setAnalysisMode }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters(): FilterContextValue {
  const ctx = useContext(FilterContext)
  if (!ctx) {
    throw new Error('useFilters precisa estar dentro de <FilterProvider>')
  }
  return ctx
}
