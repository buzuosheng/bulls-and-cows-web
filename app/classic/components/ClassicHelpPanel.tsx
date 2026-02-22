'use client'

const BULLS_COLORS: Record<number, string> = {
  0: '#9ca3af',
  1: '#f59e0b',
  2: '#f97316',
  3: '#6aaa64',
  4: '#538d4e',
}

const COWS_COLOR = '#b59f3b'

/** 复刻真实的 ClassicGuessRow 外观，用于规则说明 */
function ExampleGuessRow({
  digits,
  bulls,
  cows,
  allCorrect = false,
  description,
}: {
  digits: string[]
  bulls: number
  cows: number
  allCorrect?: boolean
  description: string
}) {
  const cellStyle = allCorrect
    ? 'border-2 border-[#538d4e] bg-[#538d4e] text-white'
    : 'border-2 border-[var(--bc-border-active)] bg-transparent text-[var(--bc-text)]'

  return (
    <div className="flex flex-col items-center gap-2 my-5">
      <div className="flex items-center gap-2">
        <div className="flex gap-2">
          {digits.map((d, i) => (
            <div
              key={i}
              className={`w-16 h-16 flex items-center justify-center text-3xl font-bold rounded-sm select-none ${cellStyle}`}
            >
              {d}
            </div>
          ))}
        </div>
        {/* B / C 结果区域 */}
        <div className="flex flex-col gap-0.5 ml-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium" style={{ color: 'var(--bc-text-muted)' }}>B:</span>
            <span className="text-xl font-bold" style={{ color: BULLS_COLORS[bulls] }}>{bulls}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium" style={{ color: 'var(--bc-text-muted)' }}>C:</span>
            <span className="text-xl font-bold" style={{ color: COWS_COLOR }}>{cows}</span>
          </div>
        </div>
      </div>
      <p className="text-base text-center" style={{ color: 'var(--bc-text-muted)' }}>
        {description}
      </p>
    </div>
  )
}

interface ClassicHelpPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function ClassicHelpPanel({ isOpen, onClose }: ClassicHelpPanelProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col transition-transform duration-500 ease-in-out"
      style={{
        background: 'var(--bc-bg)',
        transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
      }}
      aria-hidden={!isOpen}
    >
      {/* 面板 Header */}
      <div
        className="shrink-0 relative flex items-center justify-center px-5 py-4 max-w-lg mx-auto w-full"
        style={{ borderBottom: '1px solid var(--bc-border)' }}
      >
        <h2 className="text-2xl font-bold tracking-widest select-none" style={{ color: 'var(--bc-text)' }}>
          Bulls &amp; Cows
        </h2>
        <button
          onClick={onClose}
          aria-label="关闭规则"
          className="absolute right-5 w-9 h-9 flex items-center justify-center rounded-full
            transition-colors duration-200 cursor-pointer"
          style={{ color: 'var(--bc-text-muted)' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* 面板内容 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 py-6 flex flex-col items-center text-center">

          <p className="text-lg mb-1" style={{ color: 'var(--bc-text)' }}>
            在 <strong>10</strong> 次以内，猜出四位数字答案
          </p>
          <p className="text-base mb-6" style={{ color: 'var(--bc-text-muted)' }}>
            答案四位<strong>不重复</strong>，首位可为 0；猜测时数字可以重复
          </p>

          <div className="w-full border-t pt-6" style={{ borderColor: 'var(--bc-border)' }}>
            <p className="text-base mb-2" style={{ color: 'var(--bc-text)' }}>
              每次猜测后，右侧显示 <strong>B</strong>（Bulls）和 <strong>C</strong>（Cows）
            </p>
            <div className="flex flex-col gap-1 mb-4">
              <p className="text-sm" style={{ color: 'var(--bc-text-muted)' }}>
                <strong style={{ color: '#538d4e' }}>B (Bull)</strong> = 数字正确 且 位置正确
              </p>
              <p className="text-sm" style={{ color: 'var(--bc-text-muted)' }}>
                <strong style={{ color: COWS_COLOR }}>C (Cow)</strong> = 数字在答案中，但位置错误
              </p>
            </div>
            <p className="text-sm mb-1" style={{ color: 'var(--bc-text-muted)' }}>
              格子本身不会变色
            </p>
            <p className="text-sm mb-4 font-medium" style={{ color: 'var(--bc-text)' }}>
              以{' '}
              <span className="font-bold" style={{ color: '#538d4e' }}>9375</span>
              {' '}为答案举例：
            </p>

            <ExampleGuessRow
              digits={['3', '8', '1', '5']}
              bulls={1}
              cows={1}
              description="5 位置正确（B=1），3 在答案中但位置错（C=1）"
            />

            <ExampleGuessRow
              digits={['2', '0', '7', '4']}
              bulls={1}
              cows={0}
              description="7 位置正确（B=1），其余数字均不在答案中（C=0）"
            />

            <ExampleGuessRow
              digits={['6', '1', '9', '3']}
              bulls={0}
              cows={2}
              description="无位置正确（B=0），9 和 3 在答案中但位置错（C=2）"
            />
          </div>

          <div
            className="w-full border-t mt-2 pt-6 mb-8"
            style={{ borderColor: 'var(--bc-border)' }}
          >
            <p className="text-base mb-4" style={{ color: 'var(--bc-text)' }}>
              B = <strong style={{ color: '#538d4e' }}>4</strong> 时，四位全中，格子全部变绿
            </p>

            <ExampleGuessRow
              digits={['9', '3', '7', '5']}
              bulls={4}
              cows={0}
              allCorrect
              description="四位全中 — 游戏胜利！🎉"
            />

            <p className="text-sm mt-2" style={{ color: 'var(--bc-text-muted)' }}>
              支持键盘输入：数字键 · Backspace · Enter
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full h-12 bg-[#538d4e] hover:bg-[#6aaa64] text-white font-bold rounded-lg
              transition-colors duration-200 cursor-pointer text-lg"
          >
            开始游戏
          </button>
        </div>
      </div>
    </div>
  )
}
