import GameBoard from '../components/GameBoard'

export const metadata = {
  title: 'Bulls & Cows — 简化版',
  description: '仅显示命中数（Bulls），猜出四位不重复的数字答案',
  openGraph: {
    title: 'Bulls & Cows — 简化版',
    description: '仅显示命中数（Bulls），猜出四位不重复的数字答案',
  },
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
