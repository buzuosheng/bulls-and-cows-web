'use client'

import { CellState, ClassicGuessResult } from '../../lib/game'
import DigitCell from '../../components/DigitCell'

const BULLS_COLORS: Record<number, string> = {
  0: '#9ca3af',
  1: '#f59e0b',
  2: '#f97316',
  3: '#6aaa64',
  4: '#538d4e',
}

const COWS_COLOR = '#b59f3b'

interface ClassicGuessRowProps {
  guess?: ClassicGuessResult
  currentInput?: string[]
  isRevealing?: boolean
  isShaking?: boolean
}

export default function ClassicGuessRow({
  guess,
  currentInput,
  isRevealing = false,
  isShaking = false,
}: ClassicGuessRowProps) {
  const cells: { digit: string; state: CellState }[] = Array.from({ length: 4 }, (_, i) => {
    if (guess) {
      const digit = guess.digits[i] ?? ''
      const state: CellState = guess.bulls === 4 ? 'bull' : 'active'
      return { digit, state }
    }
    if (currentInput) {
      const digit = currentInput[i] ?? ''
      return { digit, state: digit ? 'active' : 'empty' }
    }
    return { digit: '', state: 'empty' }
  })

  return (
    <div className={['relative', isShaking ? 'animate-shake' : ''].filter(Boolean).join(' ')}>
      {/* 4个数字格子 */}
      <div className="flex gap-2">
        {cells.map((cell, i) => (
          <DigitCell
            key={i}
            digit={cell.digit}
            state={cell.state}
            flipDelay={i * 300}
            isRevealing={isRevealing}
          />
        ))}
      </div>

      {/* B / C 结果：绝对定位到右侧，不占文档流空间 */}
      {guess && (
        <div
          className="absolute top-1/2 -translate-y-1/2 flex flex-col gap-0.5 whitespace-nowrap"
          style={{ left: 'calc(100% + 10px)' }}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium" style={{ color: 'var(--bc-text-muted)' }}>B:</span>
            <span className="text-xl font-bold" style={{ color: BULLS_COLORS[guess.bulls] }}>
              {guess.bulls}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium" style={{ color: 'var(--bc-text-muted)' }}>C:</span>
            <span className="text-xl font-bold" style={{ color: COWS_COLOR }}>
              {guess.cows}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
