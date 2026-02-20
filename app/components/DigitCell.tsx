'use client'

import { CellState } from '../lib/game'

interface DigitCellProps {
  digit: string
  state: CellState
  flipDelay?: number
  isRevealing?: boolean
}

const stateStyles: Record<CellState, string> = {
  empty: 'border-2 border-[var(--bc-border)] bg-transparent text-[var(--bc-text)]',
  active: 'border-2 border-[var(--bc-border-active)] bg-transparent text-[var(--bc-text)]',
  bull: 'border-2 border-[#538d4e] bg-[#538d4e] text-white',
  miss: 'border-2 border-[var(--bc-miss)] bg-[var(--bc-miss)] text-white',
}

export default function DigitCell({
  digit,
  state,
  flipDelay = 0,
  isRevealing = false,
}: DigitCellProps) {
  const shouldFlip = isRevealing && state === 'bull'

  return (
    <div
      className={[
        'w-16 h-16 flex items-center justify-center',
        'text-3xl font-bold rounded-sm select-none',
        stateStyles[state],
        shouldFlip ? 'animate-flip' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={shouldFlip ? { animationDelay: `${flipDelay}ms`, animationFillMode: 'both' } : {}}
    >
      {digit}
    </div>
  )
}
