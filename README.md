# Bulls & Cows

数字猜谜小游戏，支持**简化版**和**经典版**两种玩法。

## 游戏模式

### 简化版

每次猜测后只告诉你**命中数（Bulls）**：数字和位置都正确才算命中。仅靠命中数来推理答案。

### 经典版

每次猜测后同时显示 **Bulls（B）** 和 **Cows（C）**：
- **B**：数字正确且位置正确
- **C**：数字在答案中但位置错误

## 功能特性

- 🎯 两种游戏模式（简化版 / 经典版）
- 🔢 数字键盘 + 物理键盘双支持
- 📊 对局统计（总局数、胜率、最佳步数）
- 🔍 辅助计数器（排除/确认数字）
- 📏 行对比（选中两行，自动推理分析）
- 🌓 深色 / 浅色主题切换
- 🎆 胜利烟花动画

## 技术栈

- [Next.js](https://nextjs.org/) 16 (App Router)
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/) 5
- [Tailwind CSS](https://tailwindcss.com/) 4
- [lucide-react](https://lucide.dev/) 图标
- [Playwright](https://playwright.dev/) E2E 测试

## 本地运行

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可开始游戏。

## 构建

```bash
npm run build
npm start
```

## 项目结构

```
app/
├── components/     # 共用组件（GameShell、NumberPad、ResultModal 等）
├── hooks/          # 共用 Hooks（useTheme、useKeyboard、useEliminator、useGameStats）
├── lib/            # 游戏逻辑（game.ts）、统计（stats.ts）
├── simple/         # 简化版页面
├── classic/        # 经典版页面及其专属组件
├── layout.tsx      # 根布局
├── page.tsx        # 首页
└── not-found.tsx   # 404 页面
```

## 仓库

[GitHub](https://github.com/buzuosheng/bulls-and-cows-web)
