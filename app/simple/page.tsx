import GameBoard from '../components/GameBoard'

export const metadata = {
  title: 'Bulls & Cows — 简化版',
  description: '简化版 Bulls and Cows：每次猜测只告诉你命中数（数字和位置都正确才算）',
}

export default function SimplePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bc-bg)' }}>
      <div className="mx-auto max-w-lg h-full">
        <GameBoard />
      </div>
    </div>
  )
}
