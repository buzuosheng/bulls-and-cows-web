'use client'
import { useCallback, useState } from 'react'
import { INIT_CELLS } from '../components/EliminatorPanel'

type GameMode = 'simple' | 'classic'

interface AutoElimParams {
  digits: string[]
  bulls: number
  cows?: number
}

export function useEliminator() {
  const [elimCells, setElimCells] = useState<number[][]>(INIT_CELLS)
  const [showEliminator, setShowEliminator] = useState(false)

  const handleCellClick = useCallback((row: number, col: number) => {
    setElimCells((prev) => {
      const next = prev.map((r) => [...r])
      next[row][col] = (next[row][col] + 1) % 3
      return next
    })
  }, [])

  const applyAutoElimination = useCallback((params: AutoElimParams, mode: GameMode) => {
    if (mode === 'simple') {
      // simple: bulls=0 → digit[i] excluded at position[i]
      if (params.bulls === 0) {
        setElimCells((prev) => {
          const next = prev.map((r) => [...r])
          params.digits.forEach((digit, col) => {
            const row = parseInt(digit)
            if (next[row][col] === 0) next[row][col] = 1
          })
          return next
        })
      }
    } else {
      // classic: bulls=0 && cows=0 → all 4 digits excluded from ALL positions
      if (params.bulls === 0 && (params.cows ?? 0) === 0) {
        setElimCells((prev) => {
          const next = prev.map((r) => [...r])
          params.digits.forEach((digit) => {
            const row = parseInt(digit)
            for (let col = 0; col < 4; col++) {
              if (next[row][col] === 0) next[row][col] = 1
            }
          })
          return next
        })
      }
    }
  }, [])

  const resetEliminator = useCallback(() => {
    setElimCells(INIT_CELLS())
  }, [])

  return {
    elimCells,
    showEliminator,
    setShowEliminator,
    handleCellClick,
    applyAutoElimination,
    resetEliminator,
  }
}
