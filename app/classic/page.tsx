import ClassicGameBoard from './components/ClassicGameBoard'

export const metadata = {
  title: 'Bulls & Cows — 经典版',
  description: '经典 Bulls and Cows 数字猜谜，同时显示 Bulls 和 Cows',
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
