# 对局结果统计 — 设计文档

## 概述

为 Bulls & Cows 游戏增加客户端对局统计功能，统计数据按游戏模式（简化版 / 经典版）分开存储在 localStorage 中。

## 需求

- 游戏总对局数（胜 + 败）
- 胜率（wins / totalGames）
- 最少步数（历史最佳）

## 决策记录

| 决策项 | 结论 |
|--------|------|
| 统计作用域 | 按模式分开（简化版 / 经典版各自独立） |
| 展示入口 | 首页模式卡片 + 胜利弹窗 ResultModal |
| 败局定义 | 点击"重新开始"且已有猜测记录（guesses.length > 0） |
| 离开页面 | 不计入统计 |
| 重置功能 | 提供，一次性清除两个模式 |
| 数据结构 | 聚合 KV，非逐局日志 |

## 数据层设计

### localStorage 结构

两个独立 key：`bc-stats-simple`、`bc-stats-classic`

```ts
interface GameStats {
  totalGames: number  // 总对局数（胜+败）
  wins: number        // 胜利局数
  bestSteps: number   // 最少步数（无胜局时为 0）
}
```

### 写入时机

- **胜利**：`gameStatus` 变为 `won` 时 → `totalGames++`、`wins++`、`bestSteps = Math.min(bestSteps || Infinity, steps)`
- **败（放弃）**：点击"重新开始"且 `gameStatus === 'playing'` 且 `guesses.length > 0` → 仅 `totalGames++`
- **未猜测就重开**：不计入统计
- **离开页面**：不计入统计

### 工具函数（`app/lib/stats.ts`，新建）

```ts
loadStats(mode: 'simple' | 'classic'): GameStats
recordWin(mode: 'simple' | 'classic', steps: number): void
recordLoss(mode: 'simple' | 'classic'): void
resetStats(mode: 'simple' | 'classic'): void
```

## UI 设计

### 1. 首页模式卡片（`app/page.tsx`）

在每个卡片"开始游戏 →"上方追加一行：

```
📊 12局 · 胜率83% · 最佳5步
```

- 无数据时：`📊 暂无记录`
- 样式：`text-xs`，颜色 `var(--bc-text-muted)`

### 2. ResultModal 胜利弹窗（`app/components/ResultModal.tsx`）

现有"猜测次数 / 星级评分"两列扩展为三列布局：

```
  12        83%        5
总对局      胜率      最佳步数
```

- 复用现有样式（`text-2xl font-bold` + `text-xs muted`）
- 本局刷新最佳记录时，数字旁加 🎉 标记
- 新增 props：`stats: GameStats`、`isNewBest: boolean`

### 3. 重置按钮（`app/page.tsx`）

在首页"规则速览"区块下方，加文字按钮：

```
清除统计数据
```

- 样式：`text-xs`，`var(--bc-text-muted)`
- 点击弹 `confirm()` 确认后清除两个模式的统计

## 修改文件清单

| 文件 | 操作 | 改动 |
|------|------|------|
| `app/lib/stats.ts` | 新建 | GameStats 接口 + loadStats / recordWin / recordLoss / resetStats |
| `app/components/GameBoard.tsx` | 修改 | 胜利时调 `recordWin('simple', steps)`，放弃时调 `recordLoss('simple')` |
| `app/classic/components/ClassicGameBoard.tsx` | 修改 | 胜利时调 `recordWin('classic', steps)`，放弃时调 `recordLoss('classic')` |
| `app/components/ResultModal.tsx` | 修改 | 新增 `stats` + `isNewBest` props，统计区扩展为三列 |
| `app/page.tsx` | 修改 | 卡片读取 stats 展示 + 底部重置按钮 |

## 三端适配

现有项目已通过 `max-w-lg` + `sm:` 断点 + `env(safe-area-inset-bottom)` 实现响应式。新增内容均为文本/数字，天然适配三端，无需额外工作。
