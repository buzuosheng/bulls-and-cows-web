export type CellState = 'empty' | 'active' | 'bull' | 'miss'

export interface GuessResult {
  digits: string[]
  bulls: number
}

export interface ScoreInfo {
  stars: number
  label: string
  maxAttempts: number
}

/** 生成4位不重复数字（首位可为0） */
export function generateSecret(): string[] {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  const shuffled = [...digits].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 4)
}

/** 验证猜测数字是否合法（4位，允许重复） */
export function isValidGuess(digits: string[]): boolean {
  if (digits.length !== 4) return false
  return digits.every((d) => d !== '')
}

/** 计算命中数：数字和位置均正确才算 bull */
export function checkGuess(secret: string[], guess: string[]): GuessResult {
  const bulls = guess.filter((digit, i) => digit === secret[i]).length
  return { digits: guess, bulls }
}

/** 根据猜测次数返回评分信息 */
export function getScore(attempts: number): ScoreInfo {
  if (attempts <= 4) return { stars: 5, label: '神乎其技', maxAttempts: attempts }
  if (attempts <= 6) return { stars: 4, label: '优秀', maxAttempts: attempts }
  if (attempts <= 8) return { stars: 3, label: '良好', maxAttempts: attempts }
  return { stars: 2, label: '继续加油', maxAttempts: attempts }
}

export const MAX_ATTEMPTS = 10

// ===== 经典版（Bulls + Cows）=====

export interface ClassicGuessResult {
  digits: string[]
  bulls: number
  cows: number
}

/** 计算 bulls（位置+数字均对）和 cows（数字对但位置错） */
export function checkGuessClassic(secret: string[], guess: string[]): ClassicGuessResult {
  const bulls = guess.filter((d, i) => d === secret[i]).length
  const secretRem = secret.filter((_, i) => guess[i] !== secret[i])
  const guessRem = guess.filter((_, i) => guess[i] !== secret[i])
  const cnt: Record<string, number> = {}
  for (const d of secretRem) cnt[d] = (cnt[d] || 0) + 1
  let cows = 0
  for (const d of guessRem) if ((cnt[d] ?? 0) > 0) { cows++; cnt[d]-- }
  return { digits: guess, bulls, cows }
}
