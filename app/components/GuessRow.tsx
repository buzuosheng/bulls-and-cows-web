'use client'

import { CellState, GuessResult } from '../lib/game'
import DigitCell from './DigitCell'

const BULLS_COLORS: Record<number, string> = {
  0: '#9ca3af', // 灰色
  1: '#f59e0b', // 琥珀
  2: '#f97316', // 橙色
  3: '#6aaa64', // 浅绿
  4: '#538d4e', // 深绿（全中）
}

interface GuessRowProps {
  guess?: GuessResult
  currentInput?: string[]
  isRevealing?: boolean
  isShaking?: boolean
}

export default function GuessRow({
  guess,
  currentInput,
  isRevealing = false,
  isShaking = false,
}: GuessRowProps) {
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

      {/* 命中数：绝对定位到右侧，不占文档流空间 */}
      {guess && (
        <div
          className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1.5 whitespace-nowrap"
          style={{ left: 'calc(100% + 10px)' }}
        >
          <span className="text-sm font-medium" style={{ color: 'var(--bc-text-muted)' }}>
            命中数
          </span>
          <span className="text-xl font-bold" style={{ color: BULLS_COLORS[guess.bulls] }}>
            {guess.bulls}
          </span>
        </div>
      )}
    </div>
  )
}
