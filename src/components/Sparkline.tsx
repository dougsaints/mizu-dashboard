type Props = {
  values: number[]
  width?: number
  height?: number
  color?: string
  fill?: string
  strokeWidth?: number
}

export default function Sparkline({
  values,
  width = 120,
  height = 34,
  color = 'currentColor',
  fill,
  strokeWidth = 1.6,
}: Props) {
  if (values.length === 0) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const stepX = values.length > 1 ? width / (values.length - 1) : 0
  const padY = 3

  const points = values.map((v, i) => {
    const x = i * stepX
    const y = height - padY - ((v - min) / range) * (height - padY * 2)
    return [x, y] as const
  })

  const linePath = points
    .map(([x, y], i) => (i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `L ${x.toFixed(1)} ${y.toFixed(1)}`))
    .join(' ')

  const fillPath = fill
    ? `${linePath} L ${(points.at(-1)?.[0] ?? 0).toFixed(1)} ${height} L 0 ${height} Z`
    : null

  return (
    <svg
      className="sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      {fillPath && <path d={fillPath} fill={fill} opacity={0.18} />}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
