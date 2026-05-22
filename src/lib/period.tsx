// Contexto React do período selecionado — fonte única do filtro global.
// Guarda um intervalo de datas (ISO yyyy-mm-dd) + a chave do atalho ativo.

import { createContext, useContext, useState, type ReactNode } from 'react'
import { resolvePreset } from './periodPresets'

const DEFAULT_PRESET = '30d'

type PeriodState = {
  start: string
  end: string
  presetKey: string
}

type PeriodContextValue = PeriodState & {
  // presetKey 'custom' para intervalos escolhidos no calendário.
  setRange: (start: string, end: string, presetKey: string) => void
}

const PeriodContext = createContext<PeriodContextValue | null>(null)

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PeriodState>(() => {
    const r = resolvePreset(DEFAULT_PRESET)
    return { start: r.start, end: r.end, presetKey: DEFAULT_PRESET }
  })

  const setRange = (start: string, end: string, presetKey: string) =>
    setState({ start, end, presetKey })

  return (
    <PeriodContext.Provider value={{ ...state, setRange }}>
      {children}
    </PeriodContext.Provider>
  )
}

export function usePeriod(): PeriodContextValue {
  const ctx = useContext(PeriodContext)
  if (!ctx) {
    throw new Error('usePeriod precisa estar dentro de <PeriodProvider>')
  }
  return ctx
}
