import ClassicGameBoard from './components/ClassicGameBoard'

export const metadata = {
  title: 'Bulls & Cows — 经典版',
  description: '同时显示 Bulls 和 Cows，经典数字推理玩法',
  openGraph: {
    title: 'Bulls & Cows — 经典版',
    description: '同时显示 Bulls 和 Cows，经典数字推理玩法',
  },
}

export default function ClassicPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bc-bg)' }}>
      <div className="mx-auto max-w-lg h-full">
        <ClassicGameBoard />
      </div>
    </div>
  )
}
