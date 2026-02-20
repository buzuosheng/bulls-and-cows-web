'use client'

import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import {
  MAX_ATTEMPTS,
  checkGuess,
  generateSecret,
  getScore,
  isValidGuess,
  type GuessResult,
} from '../lib/game'
import Fireworks from './Fireworks'
import GuessRow from './GuessRow'
import HelpPanel from './HelpPanel'
import NumberPad from './NumberPad'
import ResultModal from './ResultModal'

type Theme = 'dark' | 'light'

interface GameState {
  secret: string[]
  guesses: GuessResult[]
  currentInput: string[]
  gameStatus: 'playing' | 'won' | 'lost'
  revealingRow: number | null
}

type Action =
  | { type: 'ADD_DIGIT'; digit: string }
  | { type: 'DELETE_DIGIT' }
  | { type: 'SUBMIT_GUESS' }
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
      if (!isValidGuess(state.currentInput)) return state
      const result = checkGuess(state.secret, state.currentInput)
      const newGuesses = [...state.guesses, result]
      const won = result.bulls === 4
      const lost = !won && newGuesses.length >= MAX_ATTEMPTS
      return {
        ...state,
        guesses: newGuesses,
        currentInput: [],
        gameStatus: won ? 'won' : lost ? 'lost' : 'playing',
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

export default function GameBoard() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)
  const [showHelp, setShowHelp] = useState(false)
  const [shakingRow, setShakingRow] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)
  const [theme, setTheme] = useState<Theme>('light')

  const { secret, guesses, currentInput, gameStatus, revealingRow } = state

  // 应用主题到 <html>（light 为默认，无需加类；dark 加 dark 类）
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // 翻转动画结束后清除 revealingRow
  useEffect(() => {
    if (revealingRow === null) return
    const timer = setTimeout(
      () => dispatch({ type: 'SET_REVEALING', row: null }),
      4 * 300 + 600,
    )
    return () => clearTimeout(timer)
  }, [revealingRow])

  // 游戏结束后延迟弹出结果 & 胜利时放烟花
  useEffect(() => {
    if (gameStatus !== 'playing' && revealingRow === null) {
      if (gameStatus === 'won') {
        setShowFireworks(true)
        const fw = setTimeout(() => setShowFireworks(false), 3500)
        const res = setTimeout(() => setShowResult(true), 600)
        return () => { clearTimeout(fw); clearTimeout(res) }
      }
      const timer = setTimeout(() => setShowResult(true), 400)
      return () => clearTimeout(timer)
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
    dispatch({ type: 'SUBMIT_GUESS' })
  }, [currentInput, guesses.length])

  const handleRestart = useCallback(() => {
    setShowResult(false)
    dispatch({ type: 'RESTART' })
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  // 隐藏的 input：让 Vimium 等浏览器插件认为页面有可编辑区域，自动进入 insert mode
  const hiddenInputRef = useRef<HTMLInputElement>(null)

  // 挂载后聚焦隐藏 input（而非 div），Vimium 遇到 input 会自动放行键盘事件
  useEffect(() => {
    hiddenInputRef.current?.focus()
  }, [])

  // 处理按键（绑在游戏容器的 onKeyDown 上）
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent | KeyboardEvent) => {
      if (showHelp || showResult) return
      if (e.isComposing) return // 忽略 IME 组合输入中的事件

      // 字母行数字键 Digit0–Digit9 / 小键盘 Numpad0–Numpad9
      if (/^Digit[0-9]$/.test(e.code)) {
        e.preventDefault()
        handleDigit(e.code.slice(5))
      } else if (/^Numpad[0-9]$/.test(e.code)) {
        e.preventDefault()
        handleDigit(e.code.slice(6))
      } else if (/^[0-9]$/.test(e.key)) {
        // 兜底：通过 e.key 识别（e.code 不符合时）
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
      {/*
        隐藏的 input：解决 Vimium 等浏览器插件拦截键盘的问题。
        Vimium 检测到 input 被聚焦时会自动进入 insert mode，放行所有按键给页面。
        样式上完全不可见，不影响布局。
      */}
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
        {/* 左：? 帮助按钮 */}
        <button
          onClick={() => setShowHelp((v) => !v)}
          aria-label="游戏规则"
          aria-expanded={showHelp}
          className="w-9 h-9 flex items-center justify-center rounded-full
            transition-all duration-200 cursor-pointer select-none hover:opacity-80"
          style={{ color: showHelp ? '#538d4e' : 'var(--bc-text-muted)' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>

        {/* 中：标题 */}
        <h1
          className="text-xl font-bold tracking-widest select-none"
          style={{ color: 'var(--bc-text)' }}
        >
          Bulls &amp; Cows
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
            /* 太阳图标 */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
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
            /* 月亮图标 */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </header>

      {/* ===== 全屏滑入式帮助面板 ===== */}
      <HelpPanel isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* ===== 游戏区域 ===== */}
      <main className="flex flex-col items-center px-4 pt-6 pb-2 gap-2">
        {/* 已完成的猜测行 */}
        {guesses.map((guess, rowIndex) => (
          <GuessRow
            key={rowIndex}
            guess={guess}
            isRevealing={revealingRow === rowIndex}
            isShaking={shakingRow === rowIndex}
          />
        ))}

        {/* 当前输入行（游戏进行中才显示） */}
        {gameStatus === 'playing' && (
          <GuessRow
            key="current"
            currentInput={currentInput}
            isShaking={shakingRow === currentRowIndex}
          />
        )}
      </main>

      {/* ===== 数字键盘 ===== */}
      <footer
        className="flex justify-center px-4 pb-6 pt-4 mt-2"
        style={{ borderTop: '1px solid var(--bc-border)' }}
      >
        <NumberPad
          onDigit={handleDigit}
          onDelete={handleDelete}
          onEnter={handleEnter}
          inputFull={currentInput.length === 4}
          disabled={isDisabled}
        />
      </footer>

      {/* ===== 烟花庆祝 ===== */}
      <Fireworks active={showFireworks} duration={3500} />

      {/* ===== 结果弹窗 ===== */}
      {showResult && gameStatus !== 'playing' && (
        <ResultModal
          won={gameStatus === 'won'}
          secret={secret}
          attempts={guesses.length}
          score={getScore(guesses.length)}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}
