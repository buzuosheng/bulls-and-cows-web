# Bulls & Cows

数字猜谜小游戏：简化版（仅 Bulls）与经典版（Bulls + Cows），支持主题切换、辅助计数器、行对比等。  
技术栈：Next.js、React、TypeScript、Tailwind CSS。

---

## TODO List

### 功能与体验

- [ ] **对局统计**：用 localStorage 记录总局数、胜率、平均步数、最少步数，在首页或结果弹窗展示一句摘要
- [ ] **分享结果**：猜中后提供「复制结果」按钮，生成类似 Wordle 的一行摘要（如 `Bulls & Cows 4/6 ⭐⭐⭐`）便于分享
- [ ] **无结果提示**：在结果弹窗中加一句轻量引导（如「下次试试用辅助计数器和行对比，能更快猜中」）

### 无障碍与可用性

- [ ] **焦点与键盘**：规则面板、结果弹窗打开时把焦点移入，关闭时还原；支持 Esc 关闭规则/弹窗
- [ ] **减少动效**：在 CSS 中根据 `prefers-reduced-motion: reduce` 关闭或减弱 flip、烟花等动画
- [ ] **语义与标签**：为猜测区域、数字键盘、辅助计数器补全 `aria-label` / `role`，方便读屏

### 代码与工程

- [ ] **抽共用布局**：将 GameBoard 与 ClassicGameBoard 的 header、footer、主题/键盘逻辑、Eliminator 状态抽成共用布局或 hook，减少重复
- [ ] **E2E 测试**：用 Playwright 为「进入游戏 → 猜一次 → 看结果/重开」等关键路径写 1～2 个用例

### 部署与分享

- [ ] **README 项目说明**：在 README 中补充两种模式说明、在线地址、本地运行方式、技术栈及仓库/博客链接
- [ ] **SEO / 分享**：为首页与 /simple、/classic 配置 description 与 Open Graph（og:title、og:description），优化分享预览
- [ ] **自定义 404**：在 `app/not-found.tsx` 中做风格统一的 404 页，带「返回首页」与主题一致样式

### 可选增强

- [ ] **对局恢复**：将当前局 guesses、elimCells 存到 localStorage，刷新或误关后可恢复，并提示「是否恢复未完成对局」
- [ ] **多语言**：若需中英双语，将文案抽到 key-value 或 next-intl，先搭结构再补翻译
- [ ] **PWA**：需要「添加到主屏幕」或离线壳子时，增加 manifest.json 与 Service Worker
