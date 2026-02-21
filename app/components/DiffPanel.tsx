'use client'

import { GuessResult } from '../lib/game'

interface DiffPanelProps {
  rowA: { index: number; guess: GuessResult }
  rowB: { index: number; guess: GuessResult }
  onClear: () => void
}

// 每个位置的对比结果
type PositionDiff =
  | { same: true; digit: string }
  | { same: false; from: string; to: string }

// 单次可推断出明确结论的情况（仅 1 个位置发生变化）
function getInference(
  diffs: PositionDiff[],
  deltaBulls: number,
  rowA: DiffPanelProps['rowA'],
  rowB: DiffPanelProps['rowB'],
): { text: string; type: 'confirm' | 'eliminate' | 'info' } | null {
  const changedIndices = diffs
    .map((d, i) => (!d.same ? i : -1))
    .filter((i) => i >= 0)

  if (changedIndices.length === 1) {
    const pos = changedIndices[0]
    const diff = diffs[pos] as { same: false; from: string; to: string }
    const posLabel = `第 ${pos + 1} 位`

    if (deltaBulls === 1) {
      return {
        text: `${posLabel} 由 ${diff.from} → ${diff.to}，命中 +1 → "${diff.to}" 在${posLabel}正确`,
        type: 'confirm',
      }
    }
    if (deltaBulls === -1) {
      return {
        text: `${posLabel} 由 ${diff.from} → ${diff.to}，命中 -1 → "${diff.from}" 在${posLabel}正确`,
        type: 'confirm',
      }
    }
    if (deltaBulls === 0) {
      return {
        text: `${posLabel} 由 ${diff.from} → ${diff.to}，命中不变 → "${diff.from}" 和 "${diff.to}" 在${posLabel}均不正确`,
        type: 'eliminate',
      }
    }
  }

  if (changedIndices.length === 2 && deltaBulls === 2) {
    const labels = changedIndices.map((i) => `第 ${i + 1} 位`).join('、')
    const digits = changedIndices
      .map((i) => {
        const d = diffs[i] as { same: false; from: string; to: string }
        return `"${d.to}"`
      })
      .join('、')
    return {
      text: `${labels}的新数字 ${digits} 均正确`,
      type: 'confirm',
    }
  }

  if (changedIndices.length === 2 && deltaBulls === -2) {
    const labels = changedIndices.map((i) => `第 ${i + 1} 位`).join('、')
    const digits = changedIndices
      .map((i) => {
        const d = diffs[i] as { same: false; from: string; to: string }
        return `"${d.from}"`
      })
      .join('、')
    return {
      text: `${labels}的旧数字 ${digits} 均正确`,
      type: 'confirm',
    }
  }

  // 稳定位置提示
  const stableIndices = diffs.map((d, i) => (d.same ? i : -1)).filter((i) => i >= 0)
  if (stableIndices.length > 0 && changedIndices.length > 0) {
    const stableLabels = stableIndices.map((i) => `第 ${i + 1} 位`).join('、')
    return {
      text: `${stableLabels}数字相同，命中数的变化完全来自其余位置`,
      type: 'info',
    }
  }

  return null
}

export default function DiffPanel({ rowA, rowB, onClear }: DiffPanelProps) {
  const deltaBulls = rowB.guess.bulls - rowA.guess.bulls

  const diffs: PositionDiff[] = rowA.guess.digits.map((d, i) =>
    d === rowB.guess.digits[i]
      ? { same: true, digit: d }
      : { same: false, from: d, to: rowB.guess.digits[i] },
  )

  const inference = getInference(diffs, deltaBulls, rowA, rowB)

  const deltaLabel =
    deltaBulls > 0 ? `+${deltaBulls}` : deltaBulls < 0 ? `${deltaBulls}` : '±0'

  const inferenceColors = {
    confirm: { bg: 'rgba(106,170,100,0.15)', border: '#6aaa64', text: '#538d4e' },
    eliminate: { bg: 'rgba(120,124,126,0.15)', border: '#787c7e', text: '#787c7e' },
    info: { bg: 'rgba(59,130,246,0.1)', border: '#60a5fa', text: '#3b82f6' },
  }

  return (
    <div
      className="w-full rounded-lg px-4 py-3 flex flex-col gap-3"
      style={{ background: 'var(--bc-card)', border: '1px solid var(--bc-border)' }}
    >
      {/* 标题行 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--bc-text)' }}>
          <span
            className="px-1.5 py-0.5 rounded text-xs font-bold"
            style={{ background: '#f97316', color: '#fff' }}
          >
            {rowA.index + 1}
          </span>
          <span style={{ color: 'var(--bc-text-muted)' }}>vs</span>
          <span
            className="px-1.5 py-0.5 rounded text-xs font-bold"
            style={{ background: '#818cf8', color: '#fff' }}
          >
            {rowB.index + 1}
          </span>
          <span style={{ color: 'var(--bc-text-muted)' }}>|</span>
          <span style={{ color: 'var(--bc-text-muted)' }}>命中数变化</span>
          <span
            className="font-bold"
            style={{
              color: deltaBulls > 0 ? '#6aaa64' : deltaBulls < 0 ? '#f97316' : 'var(--bc-text-muted)',
            }}
          >
            {deltaLabel}
          </span>
        </div>
        <button
          onClick={onClear}
          aria-label="清除对比"
          className="w-6 h-6 flex items-center justify-center rounded-full hover:opacity-70 cursor-pointer transition-opacity"
          style={{ color: 'var(--bc-text-muted)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* 对比格子行 */}
      <div className="flex gap-2">
        {diffs.map((diff, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            {/* 列标题 */}
            <span className="text-xs" style={{ color: 'var(--bc-text-muted)' }}>
              第{i + 1}位
            </span>

            {/* 对比格子 */}
            <div
              className="w-full aspect-square rounded-md flex flex-col items-center justify-center select-none"
              style={
                diff.same
                  ? { background: '#0891b2', border: '2px solid #0891b2', color: '#fff' }
                  : { background: 'var(--bc-key-default)', border: '2px solid var(--bc-border)', color: 'var(--bc-key-text)' }
              }
            >
              {diff.same ? (
                <span className="text-xl font-bold">{diff.digit}</span>
              ) : (
                <div className="flex flex-col items-center leading-none gap-0.5">
                  <span
                    className="text-sm font-bold px-1 rounded"
                    style={{ color: '#f97316' }}
                  >
                    {diff.from}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--bc-text-muted)' }}>↓</span>
                  <span
                    className="text-sm font-bold px-1 rounded"
                    style={{ color: '#818cf8' }}
                  >
                    {diff.to}
                  </span>
                </div>
              )}
            </div>

            {/* 同/异标记 */}
            <span
              className="text-xs font-medium"
              style={{ color: diff.same ? '#0891b2' : 'var(--bc-text-muted)' }}
            >
              {diff.same ? '相同' : '变化'}
            </span>
          </div>
        ))}
      </div>

      {/* 推理结论 */}
      {inference && (
        <div
          className="rounded-md px-3 py-2 text-sm"
          style={{
            background: inferenceColors[inference.type].bg,
            border: `1px solid ${inferenceColors[inference.type].border}`,
            color: inferenceColors[inference.type].text,
          }}
        >
          💡 {inference.text}
        </div>
      )}
    </div>
  )
}
