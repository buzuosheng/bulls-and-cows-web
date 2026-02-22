'use client'

import Link from 'next/link'
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import {
  checkGuessClassic,
  generateSecret,
  getScoreClassic,
  isValidGuess,
  type ClassicGuessResult,
} from '../../lib/game'
import EliminatorPanel, { INIT_CELLS } from '../../components/EliminatorPanel'
import Fireworks from '../../components/Fireworks'
import NumberPad from '../../components/NumberPad'
import ResultModal from '../../components/ResultModal'
import ClassicDiffPanel from './ClassicDiffPanel'
import ClassicGuessRow from './ClassicGuessRow'
import ClassicHelpPanel from './ClassicHelpPanel'

type Theme = 'dark' | 'light'

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
        revealingRow: state.guesses.length,
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
  const [showHelp, setShowHelp] = useState(false)
  const [shakingRow, setShakingRow] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)
  const [theme, setTheme] = useState<Theme>('light')
  const [showEliminator, setShowEliminator] = useState(false)
  const [elimCells, setElimCells] = useState<number[][]>(INIT_CELLS)
  const [selectedRows, setSelectedRows] = useState<number[]>([])

  const { secret, guesses, currentInput, gameStatus, revealingRow } = state

  // 初始化时从 localStorage 读取主题
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bc-theme')
      if (saved === 'dark') setTheme('dark')
    } catch { /* ignore */ }
  }, [])

  // 同步主题到 html 类 + localStorage
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    try { localStorage.setItem('bc-theme', theme) } catch { /* ignore */ }
  }, [theme])

  useEffect(() => {
    if (revealingRow === null) return
    const timer = setTimeout(
      () => dispatch({ type: 'SET_REVEALING', row: null }),
      4 * 300 + 600,
    )
    return () => clearTimeout(timer)
  }, [revealingRow])

  // 胜利后放烟花 + 延迟弹出结果
  useEffect(() => {
    if (gameStatus === 'won' && revealingRow === null) {
      setShowFireworks(true)
      const fw = setTimeout(() => setShowFireworks(false), 3500)
      const res = setTimeout(() => setShowResult(true), 600)
      return () => { clearTimeout(fw); clearTimeout(res) }
    }
  }, [gameStatus, revealingRow])

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

    // 自动排除逻辑（经典版）：
    // bulls=0, cows=0 → 这4个数字均不在答案中，所有位置全部标为灰色
    // bulls=0, cows>0 → 数字在答案中但位置不对，仅排除当前猜测位置
    if (result.bulls === 0) {
      setElimCells((prev) => {
        const next = prev.map((r) => [...r])
        if (result.cows === 0) {
          // 4个数字全不在答案中，在所有位置标灰
          currentInput.forEach((digit) => {
            const row = parseInt(digit)
            for (let col = 0; col < 4; col++) {
              if (next[row][col] === 0) next[row][col] = 1
            }
          })
        } else {
          // 仅排除该数字在本次猜测的位置
          currentInput.forEach((digit, col) => {
            const row = parseInt(digit)
            if (next[row][col] === 0) next[row][col] = 1
          })
        }
        return next
      })
    }

    dispatch({ type: 'SUBMIT_GUESS', result })
  }, [currentInput, guesses.length, secret])

  const handleRestart = useCallback(() => {
    setShowResult(false)
    setElimCells(INIT_CELLS())
    setSelectedRows([])
    dispatch({ type: 'RESTART' })
  }, [])

  const handleRowSelect = useCallback((rowIndex: number) => {
    setSelectedRows((prev) => {
      if (prev.includes(rowIndex)) return prev.filter((i) => i !== rowIndex)
      if (prev.length >= 2) return [prev[1], rowIndex]
      return [...prev, rowIndex]
    })
  }, [])

  const handleElimCellClick = useCallback((row: number, col: number) => {
    setElimCells((prev) => {
      const next = prev.map((r) => [...r])
      next[row][col] = (next[row][col] + 1) % 3
      return next
    })
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  const hiddenInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    hiddenInputRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent | KeyboardEvent) => {
      if (showHelp || showResult) return
      if ('isComposing' in e && e.isComposing) return

      if (/^Digit[0-9]$/.test(e.code)) {
        e.preventDefault()
        handleDigit(e.code.slice(5))
      } else if (/^Numpad[0-9]$/.test(e.code)) {
        e.preventDefault()
        handleDigit(e.code.slice(6))
      } else if (/^[0-9]$/.test(e.key)) {
        e.preventDefault()
        handleDigit(e.key)
      } else if (e.code === 'Backspace' || e.key === 'Backspace') {
        e.preventDefault()
        handleDelete()
      } else if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.key === 'Enter') {
        e.preventDefault()
        handleEnter()
      }
    },
    [showHelp, showResult, handleDigit, handleDelete, handleEnter],
  )

  const isDisabled = gameStatus !== 'playing' || revealingRow !== null
  const currentRowIndex = guesses.length

  return (
    <div
      className="flex flex-col overflow-hidden relative"
      onClick={() => hiddenInputRef.current?.focus()}
    >
      <input
        ref={hiddenInputRef}
        onKeyDown={handleKeyDown}
        onInput={(e) => { (e.target as HTMLInputElement).value = '' }}
        style={{ position: 'fixed', opacity: 0, width: 0, height: 0, pointerEvents: 'none', top: 0, left: 0 }}
        aria-hidden="true"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        tabIndex={-1}
      />

      {/* ===== HEADER ===== */}
      <header
        className="relative z-10 flex items-center justify-between px-4 py-3 max-w-lg mx-auto w-full"
        style={{ borderBottom: '1px solid var(--bc-border)' }}
      >
        {/* 左：返回首页 + ? 帮助 */}
        <div className="flex items-center gap-1">
          <Link
            href="/"
            aria-label="返回首页"
            className="w-9 h-9 flex items-center justify-center rounded-full
              transition-all duration-200 cursor-pointer select-none hover:opacity-80"
            style={{ color: 'var(--bc-text-muted)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <button
            onClick={() => setShowHelp((v) => !v)}
            aria-label="游戏规则"
            aria-expanded={showHelp}
            className="w-9 h-9 flex items-center justify-center rounded-full
              transition-all duration-200 cursor-pointer select-none hover:opacity-80"
            style={{ color: showHelp ? '#538d4e' : 'var(--bc-text-muted)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
        </div>

        {/* 中：标题 */}
        <h1
          className="text-xl font-bold tracking-widest select-none"
          style={{ color: 'var(--bc-text)' }}
        >
          经典版
        </h1>

        {/* 右：主题切换 */}
        <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? '切换浅色模式' : '切换深色模式'}
            className="w-9 h-9 flex items-center justify-center rounded-full
              transition-all duration-200 cursor-pointer select-none hover:opacity-80"
            style={{ color: 'var(--bc-text-muted)' }}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
        </button>
      </header>

      {/* ===== 全屏帮助面板 ===== */}
      <ClassicHelpPanel isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* ===== 游戏区域 ===== */}
      <main className="flex flex-col items-center px-4 pt-6 pb-2 gap-2">
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
        className="relative flex justify-center px-4 pb-6 pt-4 mt-2"
        style={{ borderTop: '1px solid var(--bc-border)' }}
      >
        <NumberPad
          onDigit={handleDigit}
          onDelete={handleDelete}
          onEnter={handleEnter}
          inputFull={currentInput.length === 4}
          disabled={isDisabled}
        />

        {/* 右侧竖排按钮组：绝对定位，不影响 NumberPad 布局 */}
        <div className="absolute right-4 bottom-6 flex flex-col items-start gap-3">
          {/* 重新开始 */}
          <button
            onClick={handleRestart}
            aria-label="重新开始"
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200 hover:opacity-80 cursor-pointer select-none"
            style={{ color: 'var(--bc-text-muted)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.65" />
            </svg>
            <span className="text-sm font-medium">重新开始</span>
          </button>
          {/* 辅助计数器 */}
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
        onCellClick={handleElimCellClick}
        onReset={() => setElimCells(INIT_CELLS())}
      />

      {/* ===== 烟花庆祝 ===== */}
      <Fireworks active={showFireworks} duration={3500} />

      {/* ===== 结果弹窗 ===== */}
      {showResult && gameStatus === 'won' && (
        <ResultModal
          secret={secret}
          attempts={guesses.length}
          score={getScoreClassic(guesses.length)}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}
