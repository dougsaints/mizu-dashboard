// Funções puras de estatística — sem dependências externas.

export type CorrelationStrength =
  | 'none'
  | 'weak'
  | 'moderate'
  | 'strong'
  | 'very-strong'
  | 'insufficient'

export type Interpretation = {
  label: string
  color: string
  strength: CorrelationStrength
  direction: 'positiva' | 'negativa' | null
}

// Coeficiente de Pearson de duas séries de mesmo tamanho.
// Retorna null se há menos de 2 pares válidos ou se uma série é constante.
export function pearson(xs: number[], ys: number[]): number | null {
  if (xs.length !== ys.length) {
    throw new Error('pearson: arrays devem ter o mesmo tamanho')
  }

  const pairs: Array<[number, number]> = []
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i]
    const y = ys[i]
    if (
      x === null ||
      y === null ||
      x === undefined ||
      y === undefined ||
      Number.isNaN(x) ||
      Number.isNaN(y)
    )
      continue
    pairs.push([x, y])
  }

  if (pairs.length < 2) return null

  let sumX = 0
  let sumY = 0
  for (const [x, y] of pairs) {
    sumX += x
    sumY += y
  }
  const meanX = sumX / pairs.length
  const meanY = sumY / pairs.length

  let num = 0
  let denX = 0
  let denY = 0
  for (const [x, y] of pairs) {
    const dx = x - meanX
    const dy = y - meanY
    num += dx * dy
    denX += dx * dx
    denY += dy * dy
  }

  const den = Math.sqrt(denX * denY)
  if (den === 0) return null

  const r = num / den
  if (r > 1) return 1
  if (r < -1) return -1
  return r
}

export function interpretCorrelation(r: number | null): Interpretation {
  if (r === null) {
    return {
      label: 'Dados insuficientes',
      color: 'var(--txt-3)',
      strength: 'insufficient',
      direction: null,
    }
  }

  const abs = Math.abs(r)
  const direction: 'positiva' | 'negativa' = r >= 0 ? 'positiva' : 'negativa'

  if (abs < 0.1) {
    return {
      label: 'Sem correlação aparente',
      color: 'var(--txt-3)',
      strength: 'none',
      direction,
    }
  }
  if (abs < 0.3) {
    return {
      label: 'Correlação fraca',
      color: 'var(--blue)',
      strength: 'weak',
      direction,
    }
  }
  if (abs < 0.5) {
    return {
      label: 'Correlação moderada',
      color: 'var(--blue)',
      strength: 'moderate',
      direction,
    }
  }
  if (abs < 0.7) {
    return {
      label: 'Correlação forte',
      color: 'var(--green)',
      strength: 'strong',
      direction,
    }
  }
  return {
    label: 'Correlação muito forte',
    color: 'var(--green)',
    strength: 'very-strong',
    direction,
  }
}

// Formata um coeficiente para exibição PT-BR ("0,73" / "-0,12" / "—").
export function formatR(r: number | null): string {
  if (r === null) return '—'
  return r.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
