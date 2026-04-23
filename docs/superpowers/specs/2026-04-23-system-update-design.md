# Bulls & Cows Web 系统更新规划

> 日期：2026-04-23
> 状态：已批准

## 背景

当前 Web 版（Next.js 16 + React 19 + Tailwind CSS 4）已实现简化版和经典版两种玩法，但存在以下问题：

1. **代码重复**：`GameBoard`（简化版）和 `ClassicGameBoard`（经典版）各自维护 header、主题切换、键盘处理、辅助计数器、统计记录等大量相同逻辑
2. **基础体验缺失**：无 404 页、SEO 元数据不完整、结果弹窗信息单薄、README 说明不足
3. **无障碍不足**：弹窗/面板无焦点管理、缺少 aria 标签、动效未尊重用户偏好

## 设计约束

- **保留 NumberPad + 辅助计数器面板**，不做 ScrollPicker 滚轮选择器
- **不做分享功能**（Web 端无微信分享能力，暂搁置）
- **不做**：音效、对局恢复、每日挑战、日历面板、结果页、多语言、PWA

## 技术栈

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- lucide-react（图标）
- Playwright（E2E 测试，已在 devDependencies）

---

## 阶段一：架构重构

### 目标

将 `GameBoard` 和 `ClassicGameBoard` 中重复的部分抽成共用模块，后续新功能只写一次。

### 抽出的模块

#### 1. `useTheme` hook

- **文件**：`app/hooks/useTheme.ts`
- **职责**：读写 `localStorage` 中的 `bc-theme`，同步 `<html>` class
- **接口**：`{ theme, toggleTheme }` = `useTheme()`
- **当前重复**：`GameBoard.tsx` 和 `ClassicGameBoard.tsx` 各有 ~15 行相同的主题初始化 + 同步逻辑，`page.tsx`（首页）也有一份

#### 2. `useKeyboard` hook

- **文件**：`app/hooks/useKeyboard.ts`
- **职责**：处理数字键 / Backspace / Enter 按键事件，兼容 Vimium 隐藏 input
- **接口**：`{ hiddenInputRef, handleKeyDown }` = `useKeyboard({ onDigit, onDelete, onEnter, disabled })`
- **当前重复**：两个 Board 各有 ~30 行 `handleKeyDown` + 隐藏 input 逻辑

#### 3. `useEliminator` hook

- **文件**：`app/hooks/useEliminator.ts`
- **职责**：管理 `elimCells` 状态、自动排除逻辑、手动点击切换、重置
- **接口**：`{ elimCells, showEliminator, setShowEliminator, handleCellClick, applyAutoElimination, resetEliminator }` = `useEliminator()`
- **说明**：`applyAutoElimination(guess, result, mode)` 根据 simple/classic 模式执行不同的排除规则（参考微信版 system-architecture.md §7.0）

#### 4. `useGameStats` hook

- **文件**：`app/hooks/useGameStats.ts`
- **职责**：加载统计、记录胜负、判断是否新纪录
- **接口**：`{ stats, isNewBest, recordWinResult, recordLossResult }` = `useGameStats(mode)`
- **当前重复**：两个 Board 各自调用 `loadStats`/`recordWin`/`recordLoss` + `isNewBest` 判断

#### 5. `GameShell` 组件

- **文件**：`app/components/GameShell.tsx`
- **职责**：游戏页的统一壳——header（返回首页、帮助按钮、标题、主题切换）、隐藏 input、键盘事件容器
- **Props**：`{ title, mode, helpPanel, children }`
- **内部使用**：`useTheme`、`useKeyboard`
- **说明**：不包含游戏状态逻辑，仅提供 UI 壳和键盘/主题基础设施

### 重构后的组件关系

```
/simple/page.tsx
  └── GameShell (title="简化版", mode="simple")
        └── SimpleGame (游戏状态 + reducer + NumberPad + 猜测行 + 辅助计数器 + 结果弹窗)

/classic/page.tsx
  └── GameShell (title="经典版", mode="classic")
        └── ClassicGame (游戏状态 + reducer + NumberPad + 猜测行 + 辅助计数器 + 结果弹窗)
```

### 保持不变的组件

以下组件已经是共用的或各自独立，不需要改动：

- `NumberPad`、`DigitCell`、`Fireworks`、`CreditFooter`
- `DiffPanel` / `ClassicDiffPanel`（展示格式不同，保持各自版本）
- `GuessRow` / `ClassicGuessRow`（展示格式不同，保持各自版本）
- `HelpPanel` / `ClassicHelpPanel`（规则内容不同，保持各自版本）
- `EliminatorPanel`（已共用）
- `ResultModal`（已共用）

### 首页主题逻辑

`page.tsx`（首页）也有主题逻辑，重构后改为使用 `useTheme` hook，消除第三处重复。

### 验收标准

- 两种模式功能行为与重构前完全一致
- `GameBoard.tsx` 和 `ClassicGameBoard.tsx` 行数各减少 30% 以上
- `npm run build` 通过，无类型错误

---

## 阶段二：基础体验补全

### 1. 自定义 404 页

- **文件**：`app/not-found.tsx`
- **内容**：居中提示「页面未找到」+ 返回首页按钮
- **样式**：使用 `--bc-*` CSS 变量，跟随主题

### 2. SEO / Open Graph

为以下页面配置完整的 `metadata` 导出：

| 路由 | title | description |
|---|---|---|
| `/` | Bulls & Cows — 数字猜谜 | 4 位数字猜谜游戏，简化版与经典版两种玩法 |
| `/simple` | Bulls & Cows — 简化版 | 仅显示命中数（Bulls），猜出四位不重复的数字答案 |
| `/classic` | Bulls & Cows — 经典版 | 同时显示 Bulls 和 Cows，经典数字推理玩法 |

每个页面补充 `openGraph` 字段（og:title、og:description）。

### 3. 结果弹窗优化

在现有 `ResultModal` 中增加：

- **统计摘要行**：总局数、胜率、平均步数（数据来自 `useGameStats`）
- **轻量引导文案**：如「试试辅助计数器和行对比，下次更快猜中 💡」（仅在步数 > 5 时显示）

### 4. README 补全

在 README.md 中补充：

- 两种模式简要说明
- 在线地址（若有部署）
- 本地运行方式（`npm install` → `npm run dev`）
- 技术栈列表

### 验收标准

- `/abc` 等无效路由显示 404 页面
- 各页面 `<head>` 中包含正确的 title、description、og 标签
- 结果弹窗展示统计摘要
- README 包含完整的项目说明

---

## 阶段三：无障碍与可选增强

### A. 无障碍改进

#### 1. 焦点管理

- 弹窗（`ResultModal`）和面板（`HelpPanel`、`EliminatorPanel`）打开时，焦点移入容器
- 关闭时焦点还原到触发元素
- 支持 Esc 关闭所有弹窗/面板

#### 2. 减少动效

在 CSS 中添加：

```css
@media (prefers-reduced-motion: reduce) {
  /* 关闭 flip 翻转动画 */
  /* 关闭烟花动画 */
  /* 关闭 shaking 抖动动画 */
}
```

#### 3. 语义标签

- 猜测历史区域：`role="list"` + `aria-label="猜测历史"`
- 数字键盘：`role="group"` + `aria-label="数字键盘"`
- 辅助计数器：`aria-label="辅助计数器面板"`
- 每个数字格子：`aria-label` 描述当前状态

### B. 新手引导弹窗

- **文件**：`app/components/OnboardingModal.tsx`
- **触发**：首次进入游戏页时弹出（`localStorage` 检查 `bc-onboarding-done`）
- **内容**：分 2-3 步介绍核心规则，简洁明了
- **关闭**：完成或跳过后写入 `bc-onboarding-done`，不再弹出

### C. E2E 测试

使用 Playwright（已在 devDependencies），编写 1-2 个关键路径用例：

1. **简化版基本流程**：进入 `/simple` → 输入 4 位数字 → 提交 → 看到猜测行
2. **经典版基本流程**：进入 `/classic` → 输入 → 提交 → 看到 B/C 反馈
3. **首页导航**：点击卡片 → 跳转到对应游戏页 → 返回首页

### 验收标准

- Tab 键可在弹窗内循环，Esc 可关闭
- `prefers-reduced-motion` 开启时无动画
- 屏幕阅读器可识别所有交互区域
- 首次进入弹出引导，再次进入不弹出
- `npx playwright test` 通过
