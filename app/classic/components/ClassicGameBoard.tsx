'use client'

import { useCallback, useEffect, useReducer, useState } from 'react'
import {
  checkGuessClassic,
  generateSecret,
  getScoreClassic,
  isValidGuess,
  type ClassicGuessResult,
} from '../../lib/game'
import { useEliminator } from '../../hooks/useEliminator'
import { useGameStats } from '../../hooks/useGameStats'
import { RotateCw } from 'lucide-react'
import EliminatorPanel from '../../components/EliminatorPanel'
import Fireworks from '../../components/Fireworks'
import GameShell from '../../components/GameShell'
import NumberPad from '../../components/NumberPad'
import OnboardingModal from '../../components/OnboardingModal'
import ResultModal from '../../components/ResultModal'
import ClassicDiffPanel from './ClassicDiffPanel'
import ClassicGuessRow from './ClassicGuessRow'
import ClassicHelpPanel from './ClassicHelpPanel'

interface GameState {
  secret: string[]
  guesses: ClassicGuessResult[]
  currentInput: string[]
  gameStatus: 'playing' | 'won'
  revealingRow: number | null
}

type Action =
  | { type: 'ADD_DIGIT'; digit: string }
  | { type: 'DELETE_DIGIT' }
  | { type: 'SUBMIT_GUESS'; result: ClassicGuessResult }
  | { type: 'SET_REVEALING'; row: number | null }
  | { type: 'RESTART' }

function createInitialState(): GameState {
  return {
    secret: generateSecret(),
    guesses: [],
    currentInput: [],
    gameStatus: 'playing',
    revealingRow: null,
  }
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'ADD_DIGIT': {
      if (state.gameStatus !== 'playing') return state
      if (state.currentInput.length >= 4) return state
      return { ...state, currentInput: [...state.currentInput, action.digit] }
    }
    case 'DELETE_DIGIT': {
      if (state.gameStatus !== 'playing') return state
      return { ...state, currentInput: state.currentInput.slice(0, -1) }
    }
    case 'SUBMIT_GUESS': {
      if (state.gameStatus !== 'playing') return state
      const result = action.result
      const newGuesses = [...state.guesses, result]
      const won = result.bulls === 4
      return {
        ...state,
        guesses: newGuesses,
        currentInput: [],
        gameStatus: won ? 'won' : 'playing',
        revealingRow: won ? state.guesses.length : null,
      }
    }
    case 'SET_REVEALING': {
      return { ...state, revealingRow: action.row }
    }
    case 'RESTART': {
      return createInitialState()
    }
    default:
      return state
  }
}

export default function ClassicGameBoard() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)
  const [shakingRow, setShakingRow] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])

  const { elimCells, showEliminator, setShowEliminator, handleCellClick, applyAutoElimination, resetEliminator } = useEliminator()
  const { stats, isNewBest, recordWinResult, recordLossResult, resetGameStats } = useGameStats('classic')

  const { secret, guesses, currentInput, gameStatus, revealingRow } = state

  useEffect(() => {
    if (revealingRow === null) return
    const timer = setTimeout(
      () => dispatch({ type: 'SET_REVEALING', row: null }),
      4 * 300 + 600,
    )
    return () => clearTimeout(timer)
  }, [revealingRow])

  // 胜利后记录统计 + 放烟花 + 延迟弹出结果
  useEffect(() => {
    if (gameStatus === 'won' && revealingRow === null) {
      recordWinResult(guesses.length)

      setShowFireworks(true)
      const fw = setTimeout(() => setShowFireworks(false), 3500)
      const res = setTimeout(() => setShowResult(true), 600)
      return () => { clearTimeout(fw); clearTimeout(res) }
    }
  }, [gameStatus, revealingRow, guesses.length, recordWinResult])

  const handleDigit = useCallback(
    (digit: string) => {
      if (currentInput.length < 4) dispatch({ type: 'ADD_DIGIT', digit })
    },
    [currentInput.length],
  )

  const handleDelete = useCallback(() => dispatch({ type: 'DELETE_DIGIT' }), [])

  const handleEnter = useCallback(() => {
    if (!isValidGuess(currentInput)) {
      setShakingRow(guesses.length)
      setTimeout(() => setShakingRow(null), 600)
      return
    }
    const result = checkGuessClassic(secret, currentInput)
    applyAutoElimination({ digits: currentInput, bulls: result.bulls, cows: result.cows }, 'classic')
    dispatch({ type: 'SUBMIT_GUESS', result })
  }, [currentInput, guesses.length, secret, applyAutoElimination])

  const handleRestart = useCallback(() => {
    if (gameStatus === 'playing' && guesses.length > 0) {
      recordLossResult()
    }
    setShowResult(false)
    resetEliminator()
    setSelectedRows([])
    resetGameStats()
    dispatch({ type: 'RESTART' })
  }, [gameStatus, guesses.length, recordLossResult, resetEliminator, resetGameStats])

  const handleRowSelect = useCallback((rowIndex: number) => {
    setSelectedRows((prev) => {
      if (prev.includes(rowIndex)) return prev.filter((i) => i !== rowIndex)
      if (prev.length >= 2) return [prev[1], rowIndex]
      return [...prev, rowIndex]
    })
  }, [])

  const isDisabled = gameStatus !== 'playing' || revealingRow !== null
  const currentRowIndex = guesses.length

  return (
    <GameShell
      title="经典版"
      renderHelpPanel={(isOpen, onClose) => <ClassicHelpPanel isOpen={isOpen} onClose={onClose} />}
      onDigit={handleDigit}
      onDelete={handleDelete}
      onEnter={handleEnter}
      keyboardDisabled={showResult}
    >
      {/* ===== 游戏区域 ===== */}
      <main className="flex flex-col items-center px-3 sm:px-4 pt-4 sm:pt-6 pb-2 gap-2" role="list" aria-label="猜测历史">
        {guesses.map((guess, rowIndex) => {
          const selOrder = selectedRows.indexOf(rowIndex)
          const borderColor = selOrder === 0 ? '#f97316' : selOrder === 1 ? '#818cf8' : 'transparent'
          return (
            <div
              key={rowIndex}
              onClick={() => handleRowSelect(rowIndex)}
              className="cursor-pointer rounded-sm transition-all duration-150"
              style={{
                outline: selOrder >= 0 ? `2px solid ${borderColor}` : '2px solid transparent',
                outlineOffset: '3px',
              }}
            >
              <ClassicGuessRow
                guess={guess}
                isRevealing={revealingRow === rowIndex}
                isShaking={shakingRow === rowIndex}
              />
            </div>
          )
        })}

        {gameStatus === 'playing' && (
          <ClassicGuessRow
            key="current"
            currentInput={currentInput}
            isShaking={shakingRow === currentRowIndex}
          />
        )}

        {selectedRows.length === 2 && (
          <div className="w-full max-w-sm mt-2">
            <ClassicDiffPanel
              rowA={{ index: selectedRows[0], guess: guesses[selectedRows[0]] }}
              rowB={{ index: selectedRows[1], guess: guesses[selectedRows[1]] }}
              onClear={() => setSelectedRows([])}
            />
          </div>
        )}
      </main>

      {/* ===== 数字键盘 ===== */}
      <footer
        className="flex flex-col items-center px-3 sm:px-4 pt-4 mt-2 gap-4 max-w-lg mx-auto w-full"
        style={{
          borderTop: '1px solid var(--bc-border)',
          paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
        }}
      >
        <NumberPad
          onDigit={handleDigit}
          onDelete={handleDelete}
          onEnter={handleEnter}
          inputFull={currentInput.length === 4}
          disabled={isDisabled}
        />

        <div className="flex flex-row items-center justify-center gap-4">
          <button
            onClick={handleRestart}
            aria-label="重新开始"
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200 hover:opacity-80 cursor-pointer select-none"
            style={{ color: 'var(--bc-text-muted)' }}
          >
            <RotateCw size={20} strokeWidth={2} aria-hidden />
            <span className="text-sm font-medium">重新开始</span>
          </button>
          <button
            onClick={() => setShowEliminator((v) => !v)}
            aria-label={showEliminator ? '收起辅助计数器' : '打开辅助计数器'}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200 hover:opacity-80 cursor-pointer select-none"
            style={{ color: showEliminator ? '#538d4e' : 'var(--bc-text-muted)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <span className="text-sm font-medium">辅助计数器</span>
          </button>
        </div>
      </footer>

      {/* ===== 排除器侧边栏 ===== */}
      <EliminatorPanel
        isOpen={showEliminator}
        onClose={() => setShowEliminator(false)}
        cells={elimCells}
        onCellClick={handleCellClick}
        onReset={resetEliminator}
      />

      {/* ===== 烟花庆祝 ===== */}
      <Fireworks active={showFireworks} duration={3500} />

      {/* ===== 结果弹窗 ===== */}
      {showResult && gameStatus === 'won' && (
        <ResultModal
          secret={secret}
          attempts={guesses.length}
          score={getScoreClassic(guesses.length)}
          stats={stats ?? undefined}
          isNewBest={isNewBest}
          onRestart={handleRestart}
        />
      )}

      {/* ===== 新手引导 ===== */}
      <OnboardingModal mode="classic" />
    </GameShell>
  )
}
