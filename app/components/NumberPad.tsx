'use client'

interface NumberPadProps {
  onDigit: (digit: string) => void
  onDelete: () => void
  onEnter: () => void
  inputFull?: boolean
  disabled?: boolean
}

const DIGIT_ROWS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
]

const BTN = 'w-16 h-16 rounded-md font-bold transition-all duration-200 cursor-pointer active:scale-95 select-none disabled:opacity-50 disabled:cursor-not-allowed'

// 阻止按钮点击时抢走焦点，使游戏容器保持焦点以继续接受键盘输入
const noFocusSteal = (e: React.MouseEvent) => e.preventDefault()

export default function NumberPad({
  onDigit,
  onDelete,
  onEnter,
  inputFull = false,
  disabled = false,
}: NumberPadProps) {
  const defaultStyle: React.CSSProperties = {
    background: 'var(--bc-key-default)',
    color: 'var(--bc-key-text)',
  }

  const confirmStyle: React.CSSProperties = inputFull
    ? { background: '#538d4e', color: '#ffffff' }
    : defaultStyle

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 数字行 7-9, 4-6, 1-3 */}
      {DIGIT_ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-2">
          {row.map((digit) => (
            <button
              key={digit}
              onMouseDown={noFocusSteal}
              onClick={() => onDigit(digit)}
              disabled={disabled}
              aria-label={`数字 ${digit}`}
              style={defaultStyle}
              className={`${BTN} text-xl`}
            >
              {digit}
            </button>
          ))}
        </div>
      ))}

      {/* 底行：删除 | 0 | 确认 */}
      <div className="flex gap-2">
        {/* 删除键 */}
        <button
          onMouseDown={noFocusSteal}
          onClick={onDelete}
          disabled={disabled}
          aria-label="删除"
          style={defaultStyle}
          className={`${BTN} flex items-center justify-center`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <line x1="18" y1="9" x2="12" y2="15" />
            <line x1="12" y1="9" x2="18" y2="15" />
          </svg>
        </button>

        {/* 0 键 */}
        <button
          onMouseDown={noFocusSteal}
          onClick={() => onDigit('0')}
          disabled={disabled}
          aria-label="数字 0"
          style={defaultStyle}
          className={`${BTN} text-xl`}
        >
          0
        </button>

        {/* 确认键 */}
        <button
          onMouseDown={noFocusSteal}
          onClick={onEnter}
          disabled={disabled}
          aria-label="确认"
          style={confirmStyle}
          className={`${BTN} flex items-center justify-center transition-colors duration-300`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
