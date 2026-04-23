import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 gap-6"
      style={{ background: 'var(--bc-bg)', color: 'var(--bc-text)' }}
    >
      <h1 className="text-6xl font-bold tracking-widest">404</h1>
      <p className="text-lg" style={{ color: 'var(--bc-text-muted)' }}>
        页面未找到
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-[#538d4e] hover:bg-[#6aaa64] text-white font-bold rounded-lg
          transition-colors duration-200 text-sm"
      >
        返回首页
      </Link>
    </div>
  )
}
