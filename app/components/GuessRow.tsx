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
      // 全部命中时变绿，否则保持 active 样式不变色
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
    <div
      className={['flex items-center gap-2', isShaking ? 'animate-shake' : ''].filter(Boolean).join(' ')}
    >
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

      {/* 命中数区域：始终占位，防止偏移 */}
      <div className="w-10 flex flex-col items-center justify-center">
        {guess && (
          <>
            <span className="text-xs leading-none mb-0.5" style={{ color: 'var(--bc-text-muted)' }}>
              命中数
            </span>
            <span className="text-xl font-bold leading-none" style={{ color: BULLS_COLORS[guess.bulls] }}>
              {guess.bulls}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
