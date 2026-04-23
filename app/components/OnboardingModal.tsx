'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'bc-onboarding-done'

const STEPS = [
  {
    title: '猜出四位数字',
    body: '答案是 4 位不重复的数字（首位可为 0），你需要用尽可能少的步数猜出它。',
  },
  {
    title: '看反馈，缩小范围',
    body: '每次猜测后会显示命中数（简化版）或 Bulls + Cows（经典版），用反馈来推理答案。',
  },
  {
    title: '善用辅助工具',
    body: '点击「辅助计数器」排除或确认数字；选中两行可对比分析，推理更高效。',
  },
]

interface OnboardingModalProps {
  mode: 'simple' | 'classic'
}

export default function OnboardingModal({ mode }: OnboardingModalProps) {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const key = `${STORAGE_KEY}-${mode}`
      if (!localStorage.getItem(key)) {
        setVisible(true)
      }
    } catch { /* ignore */ }
  }, [mode])

  useEffect(() => {
    if (visible) dialogRef.current?.focus()
  }, [visible])

  const finish = useCallback(() => {
    setVisible(false)
    try {
      localStorage.setItem(`${STORAGE_KEY}-${mode}`, '1')
    } catch { /* ignore */ }
  }, [mode])

  const next = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      finish()
    }
  }, [step, finish])

  if (!visible) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ background: 'var(--bc-bg-overlay)' }}
      role="dialog"
      aria-modal="true"
      aria-label="新手引导"
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
        {/* Step indicator */}
        <div className="flex justify-center gap-1.5 mb-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-colors duration-200"
              style={{
                background: i === step ? '#538d4e' : 'var(--bc-border)',
              }}
            />
          ))}
        </div>

        <h2 className="text-xl font-bold mb-3">{current.title}</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--bc-text-muted)' }}>
          {current.body}
        </p>

        <div className="flex gap-3">
          <button
            onClick={finish}
            className="flex-1 h-11 rounded-lg font-bold text-sm transition-colors duration-200 cursor-pointer"
            style={{
              background: 'var(--bc-key-default)',
              color: 'var(--bc-key-text)',
            }}
          >
            跳过
          </button>
          <button
            onClick={next}
            className="flex-1 h-11 bg-[#538d4e] hover:bg-[#6aaa64] text-white font-bold rounded-lg
              transition-colors duration-200 cursor-pointer text-sm"
          >
            {isLast ? '开始游戏' : '下一步'}
          </button>
        </div>
      </div>
    </div>
  )
}
