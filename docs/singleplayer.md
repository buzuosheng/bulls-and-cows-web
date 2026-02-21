Failed to compile.
./app/components/GameBoard.tsx:164:13
Type error: Property 'isComposing' does not exist on type 'React.KeyboardEvent<Element> | KeyboardEvent'.
  Property 'isComposing' does not exist on type 'KeyboardEvent<Element>'.
  162 |     (e: React.KeyboardEvent | KeyboardEvent) => {
  163 |       if (showHelp || showResult) return
> 164 |       if (e.isComposing) return // 忽略 IME 组合输入中的事件
      |             ^
  165 |
  166 |       // 字母行数字键 Digit0–Digit9 / 小键盘 Numpad0–Numpad9
  167 |       if (/^Digit[0-9]$/.test(e.code)) {
Next.js build worker exited with code: 1 and signal: null
Error: Command "npm run build" exited with 1