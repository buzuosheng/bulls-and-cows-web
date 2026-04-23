'use client'

import Link from 'next/link'
import { type ReactNode, useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { useKeyboard } from '../hooks/useKeyboard'

interface GameShellProps {
  title: string
  renderHelpPanel: (isOpen: boolean, onClose: () => void) => ReactNode
  onDigit: (digit: string) => void
  onDelete: () => void
  onEnter: () => void
  keyboardDisabled?: boolean
  children: ReactNode
}

export default function GameShell({
  title,
  renderHelpPanel,
  onDigit,
  onDelete,
  onEnter,
  keyboardDisabled = false,
  children,
}: GameShellProps) {
  const { theme, toggleTheme } = useTheme()
  const [showHelp, setShowHelp] = useState(false)

  const { hiddenInputRef, handleKeyDown, focusInput } = useKeyboard({
    onDigit,
    onDelete,
    onEnter,
    disabled: keyboardDisabled || showHelp,
  })

  return (
    <div
      className="flex flex-col overflow-hidden relative"
      onClick={focusInput}
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
        readOnly
        inputMode="none"
      />

      <header
        className="relative z-10 flex items-center justify-between px-3 sm:px-4 py-3 max-w-lg mx-auto w-full"
        style={{ borderBottom: '1px solid var(--bc-border)' }}
      >
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

        <h1
          className="text-xl font-bold tracking-widest select-none"
          style={{ color: 'var(--bc-text)' }}
        >
          {title}
        </h1>

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

      {renderHelpPanel(showHelp, () => setShowHelp(false))}

      {children}
    </div>
  )
}
