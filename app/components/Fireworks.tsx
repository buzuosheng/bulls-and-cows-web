'use client'

import { useEffect, useRef } from 'react'

// 彩色纸屑片（矩形，带旋转）
interface Confetti {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  color: string
  w: number       // 宽
  h: number       // 高
  rotation: number
  rotSpeed: number
  gravity: number
  drag: number
}

const COLORS = [
  '#ff4d4d', '#ff9933', '#ffdd00', '#4caf50',
  '#33bbff', '#9966ff', '#ff66cc', '#ffffff',
  '#ff6633', '#66ffcc', '#f472b6', '#a3e635',
]

function rand(a: number, b: number) {
  return a + Math.random() * (b - a)
}

/** 从指定位置向扇形方向发射一批纸屑 */
function burst(
  particles: Confetti[],
  x: number,
  y: number,
  angleMin: number, // 弧度，发射扇区最小角
  angleMax: number, // 弧度，发射扇区最大角
  count: number,
) {
  for (let i = 0; i < count; i++) {
    const angle = rand(angleMin, angleMax)
    const speed = rand(6, 16)
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      w: rand(10, 18),
      h: rand(5, 10),
      rotation: rand(0, Math.PI * 2),
      rotSpeed: rand(-0.08, 0.08),
      gravity: rand(0.08, 0.15),
      drag: rand(0.985, 0.995),
    })
  }
}

interface FireworksProps {
  active: boolean
  duration?: number
}

export default function Fireworks({ active, duration = 3500 }: FireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<{
    particles: Confetti[]
    frameId: number
    startTime: number
    timers: ReturnType<typeof setTimeout>[]
  }>({ particles: [], frameId: 0, startTime: 0, timers: [] })

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const st = stateRef.current
    st.particles = []
    st.timers = []
    st.startTime = performance.now()

    const W = () => canvas.width
    const H = () => canvas.height

    // 左炮：从左边缘，向右上方宽扇形喷射
    // 右炮：从右边缘，向左上方宽扇形喷射
    const fireLeft = () => burst(st.particles, 0, H() * 0.7, -1.4, -0.15, 60)
    const fireRight = () => burst(st.particles, W(), H() * 0.7, -Math.PI + 0.15, -Math.PI + 1.4, 60)

    const fireBoth = () => { fireLeft(); fireRight() }

    // 只发射一次，粒子数量更多、速度更快
    fireBoth()

    const draw = (now: number) => {
      const elapsed = now - st.startTime
      const fadeOut = Math.max(0, Math.min(1, (duration - elapsed) / 800))

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = st.particles.length - 1; i >= 0; i--) {
        const p = st.particles[i]
        if (p.alpha < 0.02) {
          st.particles.splice(i, 1)
          continue
        }

        // 更新物理
        p.vx *= p.drag
        p.vy += p.gravity
        p.vy *= p.drag
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotSpeed
        p.alpha *= 0.988

        // 绘制旋转矩形
        ctx.save()
        ctx.globalAlpha = p.alpha * fadeOut
        ctx.fillStyle = p.color
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }

      ctx.globalAlpha = 1

      if (elapsed < duration || st.particles.length > 0) {
        st.frameId = requestAnimationFrame(draw)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    st.frameId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(st.frameId)
      st.timers.forEach(clearTimeout)
      window.removeEventListener('resize', resize)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [active, duration])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 100 }}
    />
  )
}
