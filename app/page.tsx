'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

function SunIcon() {
  return (
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
  )
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export default function HomePage() {
  const [theme, setTheme] = useState<Theme>('light')

  // 初始化时从 localStorage 读取
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bc-theme')
      if (saved === 'dark') setTheme('dark')
    } catch { /* ignore */ }
  }, [])

  // 同步到 html 类 + localStorage
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    try { localStorage.setItem('bc-theme', theme) } catch { /* ignore */ }
  }, [theme])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bc-bg)' }}>

      {/* ===== HEADER ===== */}
      <header
        className="relative flex items-center justify-center px-6 py-4 max-w-2xl mx-auto w-full"
        style={{ borderBottom: '1px solid var(--bc-border)' }}
      >
        <span
          className="text-xl font-bold tracking-widest select-none"
          style={{ color: 'var(--bc-text)' }}
        >
          Bulls &amp; Cows
        </span>
        <button
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? '切换浅色模式' : '切换深色模式'}
          className="absolute right-6 w-9 h-9 flex items-center justify-center rounded-full
            transition-all duration-200 cursor-pointer hover:opacity-80"
          style={{ color: 'var(--bc-text-muted)' }}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      {/* ===== HERO ===== */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1
            className="text-4xl font-bold tracking-widest"
            style={{ color: 'var(--bc-text)' }}
          >
            Bulls &amp; Cows
          </h1>
          <p className="text-lg" style={{ color: 'var(--bc-text-muted)' }}>
            猜出四位不重复的数字答案
          </p>
        </div>

        {/* ===== 游戏模式卡片 ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl">

          {/* 简化版 */}
          <Link
            href="/simple"
            className="group flex flex-col gap-4 rounded-2xl px-6 py-7 transition-all duration-200
              hover:scale-[1.02] hover:shadow-lg cursor-pointer"
            style={{
              background: 'var(--bc-card)',
              border: '1px solid var(--bc-border)',
            }}
          >
            {/* 图标 */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold"
              style={{ background: 'rgba(83,141,78,0.12)', color: '#538d4e' }}
            >
              B
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="text-lg font-bold" style={{ color: 'var(--bc-text)' }}>
                简化版
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--bc-text-muted)' }}>
                每次猜测后只告诉你<strong style={{ color: 'var(--bc-text)' }}>命中数（B）</strong>：
                数字和位置都正确才算
              </p>
            </div>

            {/* 示例徽章 */}
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-lg text-sm font-bold"
                style={{ background: 'rgba(83,141,78,0.15)', color: '#538d4e' }}
              >
                B: 2
              </span>
              <span className="text-xs" style={{ color: 'var(--bc-text-muted)' }}>
                仅显示命中数
              </span>
            </div>

            <span
              className="text-sm font-semibold group-hover:underline"
              style={{ color: '#538d4e' }}
            >
              开始游戏 →
            </span>
          </Link>

          {/* 经典版 */}
          <Link
            href="/classic"
            className="group flex flex-col gap-4 rounded-2xl px-6 py-7 transition-all duration-200
              hover:scale-[1.02] hover:shadow-lg cursor-pointer"
            style={{
              background: 'var(--bc-card)',
              border: '1px solid var(--bc-border)',
            }}
          >
            {/* 图标 */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ background: 'rgba(181,159,59,0.12)', color: '#b59f3b' }}
            >
              B+C
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="text-lg font-bold" style={{ color: 'var(--bc-text)' }}>
                经典版
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--bc-text-muted)' }}>
                同时告诉你 <strong style={{ color: '#538d4e' }}>Bulls（B）</strong>
                {' '}和{' '}
                <strong style={{ color: '#b59f3b' }}>Cows（C）</strong>：
                数字在但位置错也会提示
              </p>
            </div>

            {/* 示例徽章 */}
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-lg text-sm font-bold"
                style={{ background: 'rgba(83,141,78,0.15)', color: '#538d4e' }}
              >
                B: 1
              </span>
              <span
                className="px-2.5 py-1 rounded-lg text-sm font-bold"
                style={{ background: 'rgba(181,159,59,0.15)', color: '#b59f3b' }}
              >
                C: 2
              </span>
            </div>

            <span
              className="text-sm font-semibold group-hover:underline"
              style={{ color: '#b59f3b' }}
            >
              开始游戏 →
            </span>
          </Link>

        </div>

        {/* ===== 规则速览 ===== */}
        <div
          className="w-full max-w-xl rounded-xl px-6 py-5 flex flex-col gap-2"
          style={{ background: 'var(--bc-card)', border: '1px solid var(--bc-border)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--bc-text)' }}>规则速览</p>
          <ul className="text-sm space-y-1" style={{ color: 'var(--bc-text-muted)' }}>
            <li>• 答案是 4 位<strong style={{ color: 'var(--bc-text)' }}>不重复</strong>的数字，首位可为 0</li>
            <li>• 猜测时数字可以重复，步数越少评级越高</li>
            <li>• 支持键盘输入：数字键 · Backspace · Enter</li>
          </ul>
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="py-4 text-center" style={{ color: 'var(--bc-text-muted)' }}>
        <p className="text-xs">Bulls &amp; Cows — 数字猜谜</p>
      </footer>
    </div>
  )
}
