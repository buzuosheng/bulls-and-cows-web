'use client'

import { useEffect, useRef } from 'react'
import { ScoreInfo } from '../lib/game'
import { GameStats } from '../lib/stats'

interface ResultModalProps {
  secret: string[]
  attempts: number
  score: ScoreInfo
  stats?: GameStats
  isNewBest?: boolean
  onRestart: () => void
}

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-1 justify-center my-2" aria-label={`${stars}星`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill={i < stars ? '#b59f3b' : 'none'}
          stroke={i < stars ? '#b59f3b' : 'var(--bc-border)'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

export default function ResultModal({
  secret,
  attempts,
  score,
  stats,
  isNewBest,
  onRestart,
}: ResultModalProps) {
  const winRate = stats && stats.totalGames > 0
    ? Math.round((stats.wins / stats.totalGames) * 100)
    : 0
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dialogRef.current?.focus()
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ background: 'var(--bc-bg-overlay)' }}
      role="dialog"
      aria-modal="true"
      aria-label="游戏结果"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="rounded-xl p-6 mx-4 w-full max-w-sm text-center animate-bounce-in border outline-none"
        style={{
          background: 'var(--bc-card)',
          borderColor: 'var(--bc-border)',
          color: 'var(--bc-text)',
        }}
      >
        {/* 胜利标题 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#538d4e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto mb-2"
          aria-hidden="true"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <h2 className="text-2xl font-bold">猜对了！</h2>
        <StarRating stars={score.stars} />
        <p className="text-sm mt-1" style={{ color: 'var(--bc-text-muted)' }}>
          {score.label}
        </p>

        {/* 答案 */}
        <div className="mt-5 mb-4">
          <p
            className="text-xs mb-2 uppercase tracking-widest"
            style={{ color: 'var(--bc-text-muted)' }}
          >
            答案
          </p>
          <div className="flex gap-2 justify-center">
            {secret.map((digit, i) => (
              <div
                key={i}
                className="w-12 h-12 flex items-center justify-center text-xl font-bold
                  bg-[#538d4e] border-2 border-[#538d4e] rounded-sm text-white"
              >
                {digit}
              </div>
            ))}
          </div>
        </div>

        {/* 统计 */}
        <div
          className="border-t pt-4 mb-5"
          style={{ borderColor: 'var(--bc-border)' }}
        >
          <div className="flex justify-center gap-8">
            <div>
              <p className="text-2xl font-bold">{attempts}</p>
              <p className="text-xs" style={{ color: 'var(--bc-text-muted)' }}>
                猜测次数
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold">{score.stars}</p>
              <p className="text-xs" style={{ color: 'var(--bc-text-muted)' }}>
                星级评分
              </p>
            </div>
          </div>
          {stats && (
            <div className="flex justify-center gap-8 mt-4 pt-4 border-t" style={{ borderColor: 'var(--bc-border)' }}>
              <div>
                <p className="text-2xl font-bold">{stats.totalGames}</p>
                <p className="text-xs" style={{ color: 'var(--bc-text-muted)' }}>总对局</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{winRate}%</p>
                <p className="text-xs" style={{ color: 'var(--bc-text-muted)' }}>胜率</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.bestSteps || '-'}
                  {isNewBest && ' 🎉'}
                </p>
                <p className="text-xs" style={{ color: 'var(--bc-text-muted)' }}>最佳步数</p>
              </div>
            </div>
          )}
          {attempts > 5 && (
            <p
              className="text-xs mt-4 pt-3 border-t"
              style={{ color: 'var(--bc-text-muted)', borderColor: 'var(--bc-border)' }}
            >
              试试辅助计数器和行对比，下次更快猜中 💡
            </p>
          )}
        </div>

        {/* 再来一局 */}
        <button
          onClick={onRestart}
          className="w-full h-11 bg-[#538d4e] hover:bg-[#6aaa64] text-white font-bold rounded-lg
            transition-colors duration-200 cursor-pointer text-sm"
        >
          再来一局
        </button>
      </div>
    </div>
  )
}
