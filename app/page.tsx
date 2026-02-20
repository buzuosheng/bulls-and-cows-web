import GameBoard from './components/GameBoard'

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bc-bg)' }}>
      <div className="mx-auto max-w-lg h-full">
        <GameBoard />
      </div>
    </div>
  )
}
