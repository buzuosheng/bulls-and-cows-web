'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseKeyboardOptions {
  onDigit: (digit: string) => void
  onDelete: () => void
  onEnter: () => void
  disabled?: boolean
}

export function useKeyboard({ onDigit, onDelete, onEnter, disabled = false }: UseKeyboardOptions) {
  const hiddenInputRef = useRef<HTMLInputElement>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    const touch =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || window.matchMedia('(pointer: coarse)').matches)
    setIsTouchDevice(!!touch)
  }, [])

  useEffect(() => {
    if (!isTouchDevice) hiddenInputRef.current?.focus()
  }, [isTouchDevice])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent | KeyboardEvent) => {
      if (disabled) return
      if ('isComposing' in e && e.isComposing) return

      if (/^Digit[0-9]$/.test(e.code)) {
        e.preventDefault()
        onDigit(e.code.slice(5))
      } else if (/^Numpad[0-9]$/.test(e.code)) {
        e.preventDefault()
        onDigit(e.code.slice(6))
      } else if (/^[0-9]$/.test(e.key)) {
        e.preventDefault()
        onDigit(e.key)
      } else if (e.code === 'Backspace' || e.key === 'Backspace') {
        e.preventDefault()
        onDelete()
      } else if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.key === 'Enter') {
        e.preventDefault()
        onEnter()
      }
    },
    [disabled, onDigit, onDelete, onEnter],
  )

  const focusInput = useCallback(() => {
    if (!isTouchDevice) hiddenInputRef.current?.focus()
  }, [isTouchDevice])

  return { hiddenInputRef, isTouchDevice, handleKeyDown, focusInput }
}
