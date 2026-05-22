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

type FilterState = {
  start: string
  end: string
  presetKey: string
  unitId: string | null  // null = "Todas as unidades"
  channel: Channel       // 'all' = "Todos os canais"
}

type FilterContextValue = FilterState & {
  setRange: (start: string, end: string, presetKey: string) => void
  setUnit: (id: string | null) => void
  setChannel: (c: Channel) => void
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
    }
  })

  // Setters preservam os outros campos do estado.
  const setRange = (start: string, end: string, presetKey: string) =>
    setState((s) => ({ ...s, start, end, presetKey }))
  const setUnit = (id: string | null) =>
    setState((s) => ({ ...s, unitId: id }))
  const setChannel = (c: Channel) =>
    setState((s) => ({ ...s, channel: c }))

  return (
    <FilterContext.Provider value={{ ...state, setRange, setUnit, setChannel }}>
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
