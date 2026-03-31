export interface GameStats {
  totalGames: number
  wins: number
  bestSteps: number
}

const EMPTY_STATS: GameStats = { totalGames: 0, wins: 0, bestSteps: 0 }

function key(mode: 'simple' | 'classic'): string {
  return `bc-stats-${mode}`
}

export function loadStats(mode: 'simple' | 'classic'): GameStats {
  try {
    const raw = localStorage.getItem(key(mode))
    if (!raw) return { ...EMPTY_STATS }
    return { ...EMPTY_STATS, ...JSON.parse(raw) }
  } catch {
    return { ...EMPTY_STATS }
  }
}

export function recordWin(mode: 'simple' | 'classic', steps: number): GameStats {
  const stats = loadStats(mode)
  stats.totalGames++
  stats.wins++
  stats.bestSteps = stats.bestSteps === 0 ? steps : Math.min(stats.bestSteps, steps)
  try { localStorage.setItem(key(mode), JSON.stringify(stats)) } catch { /* ignore */ }
  return stats
}

export function recordLoss(mode: 'simple' | 'classic'): void {
  const stats = loadStats(mode)
  stats.totalGames++
  try { localStorage.setItem(key(mode), JSON.stringify(stats)) } catch { /* ignore */ }
}

export function resetStats(mode: 'simple' | 'classic'): void {
  try { localStorage.removeItem(key(mode)) } catch { /* ignore */ }
}
