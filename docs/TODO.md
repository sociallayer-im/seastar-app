# TODO

- **Displayer 改为服务端 markdown→HTML 渲染**(2026-08-18)。
  `src/components/client/Editor/Displayer.tsx` 现在为“只读展示”挂载完整
  prosemirror EditorView(markdown-it + prosemirror ≈300 KB),静态出现在
  事件详情等 4 个页面。正确方向是服务端渲染 markdown 为 HTML(同一份
  schema 保证样式一致),客户端不再需要 prosemirror。因涉及内容展示路径
  (样式回归风险),留待专门验证后做,不混入 vite-migration。

- **去掉 `html5-qrcode` 依赖,自己实现扫码**(2026-08-18)。它是全站最大的
  client chunk(370 KB raw),使用点只有 4 个:`src/hooks/useScanQrcode.tsx`
  经 `remember/Remember.tsx`、两个 `CheckinBtn.tsx`、`DialogBadgeSwap.tsx`。
  方向:原生 `BarcodeDetector` API(Chrome/Edge/Android 原生支持)+ 轻量
  polyfill(如 `barcode-detector`,~20 KB)兜底 Safari/Firefox;取流用
  `getUserMedia` + `requestVideoFrameCallback`。过渡措施:已(将)把扫码器
  改为点击时动态加载,见 vite-migration 批次 3。
