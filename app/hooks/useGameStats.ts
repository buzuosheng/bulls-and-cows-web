'use client'
import { useCallback, useRef, useState } from 'react'
import { type GameStats, loadStats, recordLoss, recordWin } from '../lib/stats'

export function useGameStats(mode: 'simple' | 'classic') {
  const [stats, setStats] = useState<GameStats | null>(null)
  const [isNewBest, setIsNewBest] = useState(false)
  const hasRecordedWin = useRef(false)

  const recordWinResult = useCallback((steps: number) => {
    if (hasRecordedWin.current) return
    hasRecordedWin.current = true
    const prevBest = loadStats(mode).bestSteps
    const updated = recordWin(mode, steps)
    setStats(updated)
    setIsNewBest(prevBest === 0 || steps < prevBest)
  }, [mode])

  const recordLossResult = useCallback(() => {
    recordLoss(mode)
  }, [mode])

  const resetGameStats = useCallback(() => {
    setStats(null)
    setIsNewBest(false)
    hasRecordedWin.current = false
  }, [])

  return { stats, isNewBest, recordWinResult, recordLossResult, resetGameStats }
}
