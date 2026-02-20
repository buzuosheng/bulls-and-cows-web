'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  color: string
  size: number
  gravity: number
}

interface Rocket {
  x: number
  y: number
  vy: number
  targetY: number
  color: string
  exploded: boolean
  trail: { x: number; y: number; alpha: number }[]
  particles: Particle[]
}

const COLORS = [
  '#ff4d4d', '#ff9933', '#ffdd00', '#33cc33',
  '#33bbff', '#9966ff', '#ff66cc', '#ffffff',
  '#ff6633', '#66ffcc',
]

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a)
}

function createRocket(canvasWidth: number, canvasHeight: number): Rocket {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)]
  return {
    x: randomBetween(canvasWidth * 0.2, canvasWidth * 0.8),
    y: canvasHeight,
    vy: randomBetween(-18, -12),
    targetY: randomBetween(canvasHeight * 0.1, canvasHeight * 0.45),
    color,
    exploded: false,
    trail: [],
    particles: [],
  }
}

function explode(rocket: Rocket) {
  rocket.exploded = true
  const count = Math.floor(randomBetween(80, 130))
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + randomBetween(-0.1, 0.1)
    const speed = randomBetween(1.5, 7)
    rocket.particles.push({
      x: rocket.x,
      y: rocket.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      color: rocket.color,
      size: randomBetween(2, 4),
      gravity: randomBetween(0.06, 0.12),
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
    rockets: Rocket[]
    frameId: number
    startTime: number
    launchInterval: ReturnType<typeof setInterval> | null
  }>({ rockets: [], frameId: 0, startTime: 0, launchInterval: null })

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

    const state = stateRef.current
    state.rockets = []
    state.startTime = performance.now()

    // 每隔一段时间发射一枚火箭
    let launchCount = 0
    const launch = () => {
      if (performance.now() - state.startTime > duration - 800) return
      state.rockets.push(createRocket(canvas.width, canvas.height))
      launchCount++
    }
    // 立即发射第一批
    for (let i = 0; i < 3; i++) {
      setTimeout(() => launch(), i * 180)
    }
    state.launchInterval = setInterval(() => {
      launch()
      if (Math.random() > 0.5) launch() // 偶尔同时发两枚
    }, 380)

    const draw = (now: number) => {
      const elapsed = now - state.startTime
      const fadeOut = Math.max(0, Math.min(1, (duration - elapsed) / 600))

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let ri = state.rockets.length - 1; ri >= 0; ri--) {
        const rocket = state.rockets[ri]

        if (!rocket.exploded) {
          // 轨迹
          rocket.trail.push({ x: rocket.x, y: rocket.y, alpha: 1 })
          if (rocket.trail.length > 12) rocket.trail.shift()
          for (let ti = 0; ti < rocket.trail.length; ti++) {
            const t = rocket.trail[ti]
            t.alpha *= 0.82
            ctx.globalAlpha = t.alpha * fadeOut
            ctx.fillStyle = rocket.color
            ctx.beginPath()
            ctx.arc(t.x, t.y, 2, 0, Math.PI * 2)
            ctx.fill()
          }

          // 火箭主体
          ctx.globalAlpha = fadeOut
          ctx.fillStyle = rocket.color
          ctx.beginPath()
          ctx.arc(rocket.x, rocket.y, 3, 0, Math.PI * 2)
          ctx.fill()

          rocket.y += rocket.vy
          rocket.vy += 0.3 // 重力减速

          if (rocket.y <= rocket.targetY) {
            explode(rocket)
          }
        } else {
          // 粒子
          let alive = false
          for (const p of rocket.particles) {
            if (p.alpha < 0.02) continue
            alive = true
            ctx.globalAlpha = p.alpha * fadeOut
            ctx.fillStyle = p.color
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
            ctx.fill()

            p.x += p.vx
            p.y += p.vy
            p.vy += p.gravity
            p.vx *= 0.97
            p.alpha *= 0.94
            p.size *= 0.98
          }
          if (!alive) {
            state.rockets.splice(ri, 1)
          }
        }
      }

      ctx.globalAlpha = 1

      if (elapsed < duration) {
        state.frameId = requestAnimationFrame(draw)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    state.frameId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(state.frameId)
      if (state.launchInterval) clearInterval(state.launchInterval)
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
