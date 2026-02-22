'use client'

// 三种状态：0=黄(可能) 1=灰(已排除) 2=绿(已确认)
const CELL_STYLES = [
  { bg: '#e6c619', border: '#e6c619', text: '#1a1a1b', label: '可能' },
  { bg: 'var(--bc-key-default)', border: 'var(--bc-key-default)', text: 'var(--bc-key-text)', label: '排除' },
  { bg: '#6aaa64', border: '#6aaa64', text: '#ffffff', label: '确认' },
]

const INIT_CELLS = (): number[][] =>
  Array.from({ length: 10 }, () => Array(4).fill(0))

interface EliminatorPanelProps {
  isOpen: boolean
  onClose: () => void
  cells: number[][]
  onCellClick: (row: number, col: number) => void
  onReset: () => void
}

export default function EliminatorPanel({
  isOpen,
  onClose,
  cells,
  onCellClick,
  onReset,
}: EliminatorPanelProps) {
  return (
    <>
      {/* 移动端/平板遮罩：仅 lg 以下显示，点击关闭侧边栏；桌面端不显示遮罩 */}
      {isOpen && (
        <div
          role="button"
          tabIndex={-1}
          aria-label="点击关闭辅助计数器"
          onClick={onClose}
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
          className="fixed inset-0 z-30 transition-opacity duration-300 lg:invisible lg:pointer-events-none"
          style={{ background: 'var(--bc-bg-overlay)' }}
        />
      )}

      {/* 侧边栏本体 */}
      <div
        className="fixed right-0 top-0 h-full z-40 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out w-[310px] max-w-[85vw] sm:max-w-none"
        style={{
          background: 'var(--bc-bg)',
          borderLeft: '1px solid var(--bc-border)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header：标题居中，关闭按钮绝对定位右侧 */}
        <div
          className="shrink-0 relative flex items-center justify-center px-4 py-3"
          style={{ borderBottom: '1px solid var(--bc-border)' }}
        >
          <span className="text-base font-bold tracking-wide select-none" style={{ color: 'var(--bc-text)' }}>
            辅助计数器
          </span>
          <button
            onClick={onClose}
            aria-label="关闭排除器"
            className="absolute right-3 w-8 h-8 flex items-center justify-center rounded-full transition-opacity duration-200 hover:opacity-70 cursor-pointer"
            style={{ color: 'var(--bc-text-muted)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 列标题 */}
        <div className="shrink-0 flex items-center px-4 pt-3 pb-1 gap-2">
          {['第1位', '第2位', '第3位', '第4位'].map((label) => (
            <div
              key={label}
              className="flex-1 text-center text-xs font-medium select-none"
              style={{ color: 'var(--bc-text-muted)' }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* 10×4 方格区域 */}
        <div className="flex-1 overflow-y-auto px-4 pb-2">
          {Array.from({ length: 10 }, (_, row) => (
            <div key={row} className="flex gap-2 mb-2">
              {Array.from({ length: 4 }, (_, col) => {
                const state = cells[row][col]
                const s = CELL_STYLES[state]
                return (
                  <button
                    key={col}
                    onClick={() => onCellClick(row, col)}
                    aria-label={`数字${row} 第${col + 1}位: ${s.label}`}
                    className="flex-1 aspect-square flex items-center justify-center rounded-md font-bold text-xl transition-all duration-150 active:scale-90 cursor-pointer select-none"
                    style={{
                      background: s.bg,
                      border: `2px solid ${s.border}`,
                      color: s.text,
                      minWidth: 0,
                    }}
                  >
                    {row}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* 图例 */}
        <div
          className="shrink-0 flex items-center justify-center gap-3 px-4 py-2"
          style={{ borderTop: '1px solid var(--bc-border)' }}
        >
          {CELL_STYLES.map((s) => (
            <div key={s.label} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}
              />
              <span className="text-xs select-none" style={{ color: 'var(--bc-text-muted)' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* 重置按钮 */}
        <div className="shrink-0 px-4 pb-4">
          <button
            onClick={onReset}
            className="w-full h-9 rounded-md text-sm font-medium transition-opacity duration-200 hover:opacity-80 cursor-pointer"
            style={{
              background: 'var(--bc-key-default)',
              color: 'var(--bc-key-text)',
              border: '1px solid var(--bc-border)',
            }}
          >
            重置
          </button>
        </div>
      </div>
    </>
  )
}

export { INIT_CELLS }
