// Seletor de período — portado do date range picker do painel original
// (painel-diario_BKP_2026-05-16_v7-atual.html, lógica DRP ~linha 3036).
// Trigger + painel com 12 atalhos + calendário para intervalo custom.
// Atalho aplica na hora; intervalo do calendário só vale ao "Aplicar".

import { useEffect, useRef, useState } from 'react'
import { useFilters } from '../lib/period'
import { PERIOD_PRESETS, resolvePreset, rangeLabel, isoLocal } from '../lib/periodPresets'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

const p2 = (n: number) => String(n).padStart(2, '0')

function fmtDay(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

export default function DateRangePicker() {
  const { start, end, presetKey, setRange } = useFilters()

  const [open, setOpen] = useState(false)
  const [calY, setCalY] = useState(() => Number(end.slice(0, 4)))
  const [calM, setCalM] = useState(() => Number(end.slice(5, 7)) - 1)
  const [draftStart, setDraftStart] = useState<string | null>(start)
  const [draftEnd, setDraftEnd] = useState<string | null>(end)
  const [step, setStep] = useState<'start' | 'end'>('start')
  const [hover, setHover] = useState<string | null>(null)
  const [draftPreset, setDraftPreset] = useState(presetKey)
  const rootRef = useRef<HTMLDivElement>(null)

  // Fecha ao clicar fora do componente.
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  function openPanel() {
    setDraftStart(start)
    setDraftEnd(end)
    setDraftPreset(presetKey)
    setStep('start')
    setHover(null)
    setCalY(Number(end.slice(0, 4)))
    setCalM(Number(end.slice(5, 7)) - 1)
    setOpen(true)
  }

  function onPreset(key: string) {
    if (key === 'custom') {
      // Personalizado: mantém aberto pro usuário usar o calendário.
      setDraftPreset('custom')
      setStep('start')
      return
    }
    const r = resolvePreset(key)
    setRange(r.start, r.end, key) // aplica na hora
    setOpen(false)
  }

  function onDay(ds: string) {
    if (step === 'start') {
      setDraftStart(ds)
      setDraftEnd(null)
      setStep('end')
      setDraftPreset('custom')
      setHover(null)
    } else {
      if (draftStart && ds < draftStart) {
        setDraftEnd(draftStart)
        setDraftStart(ds)
      } else {
        setDraftEnd(ds)
      }
      setStep('start')
      setHover(null)
    }
  }

  function navMonth(delta: number) {
    let m = calM + delta
    let y = calY
    if (m > 11) { m = 0; y++ }
    if (m < 0) { m = 11; y-- }
    setCalM(m)
    setCalY(y)
  }

  function onApply() {
    if (!draftStart || !draftEnd) return
    setRange(draftStart, draftEnd, draftPreset)
    setOpen(false)
  }

  // ── Range efetivo para destacar no calendário (hover = preview) ──
  const sStr = draftStart
  const eStr = draftEnd
  let effS = sStr
  let effE = eStr
  if (!eStr && step === 'end' && hover && draftStart) {
    effS = hover < draftStart ? hover : draftStart
    effE = hover > draftStart ? hover : draftStart
  }

  const todayStr = isoLocal(new Date())

  function dayClass(ds: string): string {
    let cls = 'drp-day'
    if (ds === todayStr) cls += ' drp-day-today'

    const isSingle = !!effS && !!effE && ds === effS && ds === effE
    const isStart = !!effS && !!effE && ds === effS && effS !== effE
    const isEnd = !!effS && !!effE && ds === effE && effS !== effE
    const inRange = !!effS && !!effE && ds > effS && ds < effE
    const isPrev = !eStr && !!hover && ds === hover && step === 'end'

    if (isSingle || (ds === sStr && !effE)) cls += ' drp-day-sel-start drp-day-sel-end'
    else if (isStart) cls += ' drp-day-sel-start drp-day-in-range drp-day-has-range'
    else if (isEnd) cls += ' drp-day-sel-end drp-day-in-range drp-day-has-range'
    else if (inRange) cls += ' drp-day-in-range'
    else if (isPrev) cls += ' drp-day-preview-end'
    return cls
  }

  // ── Monta as células do calendário ──
  const firstDow = (new Date(calY, calM, 1).getDay() + 6) % 7 // Segunda = 0
  const daysInMonth = new Date(calY, calM + 1, 0).getDate()
  const cells: React.ReactNode[] = []
  for (let i = 0; i < firstDow; i++) {
    cells.push(<div key={`e${i}`} className="drp-day drp-day-empty" />)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${calY}-${p2(calM + 1)}-${p2(d)}`
    cells.push(
      <div
        key={ds}
        className={dayClass(ds)}
        onClick={() => onDay(ds)}
        onMouseOver={() => step === 'end' && setHover(ds)}
      >
        {d}
      </div>,
    )
  }

  // ── Rótulos ──
  const triggerLabel = rangeLabel({ start, end }, presetKey)
  let footerLabel = ''
  if (draftStart && draftEnd) {
    footerLabel = `${fmtDay(draftStart)} – ${fmtDay(draftEnd)}`
  } else if (draftStart && step === 'end') {
    footerLabel = `${fmtDay(draftStart)} → clique na data final`
  }

  return (
    <div className="fg drp" ref={rootRef}>
      <span className="fg-label">Período</span>

      <button
        type="button"
        className={open ? 'drp-trigger open' : 'drp-trigger'}
        onClick={() => (open ? setOpen(false) : openPanel())}
      >
        <svg
          className="drp-t-ico"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="drp-t-lbl">{triggerLabel}</span>
        <svg
          className="drp-t-caret"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div className={open ? 'drp-panel open' : 'drp-panel'}>
        <div className="drp-body">
          <div className="drp-presets">
            {PERIOD_PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                className={draftPreset === p.key ? 'drp-preset-btn active' : 'drp-preset-btn'}
                onClick={() => onPreset(p.key)}
              >
                <span className="drp-radio" />
                {p.label}
              </button>
            ))}
          </div>

          <div className="drp-cal">
            <div className="drp-cal-head">
              <button className="drp-cal-nav" type="button" onClick={() => navMonth(-1)}>
                ‹
              </button>
              <span className="drp-cal-title">
                {MESES[calM]} {calY}
              </span>
              <button className="drp-cal-nav" type="button" onClick={() => navMonth(1)}>
                ›
              </button>
            </div>
            <div className="drp-weekdays">
              {WEEKDAYS.map((w) => (
                <div key={w} className="drp-wd">
                  {w}
                </div>
              ))}
            </div>
            <div className="drp-days" onMouseLeave={() => setHover(null)}>
              {cells}
            </div>
          </div>
        </div>

        <div className="drp-footer">
          <span className="drp-range-lbl">{footerLabel}</span>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => setOpen(false)}>
            Cancelar
          </button>
          <button
            className="btn btn-primary btn-sm"
            type="button"
            disabled={!draftStart || !draftEnd}
            onClick={onApply}
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}
