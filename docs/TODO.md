# TODO

- **star/attend 按钮改 `useOptimistic`**(2026-08-18)。
  `StarEventBtn`/`StarDiscussionBtn`/`AttendEventBtn` 现在是手写
  loading 标志 + `router.refresh()`;React 19 的 `useOptimistic` 可以即点即
  反馈。涉及交互行为变化,不混入 vite-migration 分支。

- **Displayer 改为服务端 markdown→HTML 渲染**(2026-08-18)。
  `src/components/client/Editor/Displayer.tsx` 现在为“只读展示”挂载完整
  prosemirror EditorView(markdown-it + prosemirror ≈300 KB),静态出现在
  事件详情等 4 个页面。正确方向是服务端渲染 markdown 为 HTML(同一份
  schema 保证样式一致),客户端不再需要 prosemirror。因涉及内容展示路径
  (样式回归风险),留待专门验证后做,不混入 vite-migration。

## 已完成

- ~~去掉 `html5-qrcode` 依赖,自己实现扫码~~ —— 2026-08-19 完成,见
  `PERF_OPTIMIZATION.md` 的「自研二维码解码器」一节。
