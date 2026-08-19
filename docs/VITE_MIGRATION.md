# vite-migration: Next 14 → 16 + vinext (Vite 8) 迁移记录

分支 `vite-migration`,2026-08-18。构建器从 `next build` 换成
[vinext](https://github.com/cloudflare/vinext)(在 Vite 上重新实现 Next.js
API 面的兼容层),**业务代码零逻辑改动** —— 所有源码修改都是机械适配,
逐条列在下面。

## 版本矩阵

| | 迁移前 | 迁移后 |
|---|---|---|
| React | 18.2.0 | 19.2.8 |
| Next.js | 14.2.35 | **已移除**(类型由 vinext/@vinext/types 提供) |
| 构建器 | next build (webpack) | vinext 1.0.0-beta.6 + Vite 8.2.1 |
| TypeScript | 5.x | 6.0.3(7.x 被 typescript-eslint `<6.1.0` 挡住,勿升) |
| ESLint | 8 + .eslintrc | 9 + eslint.config.mjs(flat) |
| Tailwind | 3.4.19 | 4.3.3(CSS `@theme`,无 tailwind.config.ts) |
| ProseMirror | 旧 minor | 全家最新 1.x + overrides 锁单版本 |
| 运行时镜像 | oven/bun | node:24-slim |
| 包管理器 | bun | pnpm(2026-08-19 起) |

## 常用命令

```bash
pnpm run dev          # vinext dev(Vite + HMR),端口跟 --port
pnpm run build        # vinext build → dist/
pnpm run start        # vinext start(读 PORT/HOST,不是 HOSTNAME)
pnpm run lint         # eslint 直跑
npx tsc --noEmit     # next-env.d.ts 由 vinext dev 生成/管理,勿手改
```

构建时间(同机 3 次中位):vinext **9.6s** vs webpack 33s。

## 迁移中的机械改动(即 review 重点)

1. **async request API**(Next 15 起 `params`/`searchParams`/`cookies()`/
   `headers()` 变 Promise):官方 codemod 改了 82 个文件;整体传 props 给
   `data.ts` loader 的 33 个页面用 `awaitProps()` 在页面边界 resolve,
   loader 本身未动。页面签名用 `AsyncProps<T>` 映射类型满足 Next 16 生成的
   PageProps 约束。两者都在 `src/utils/index.ts`。
2. **`dynamic({ssr:false})` 不允许出现在 server component**(共 6 处):
   挪进 `*ClientOnly.tsx` client wrapper。
3. **`next/head` 在三个 layout 里的 favicon 块**:App Router 下本是 no-op
   死代码,但会让 vinext 的 head shim 在 RSC 渲染时崩溃,已删
   (真 favicon 是 `src/app/icon.svg`)。
4. **middleware**:`NextResponse.next({headers})` 改为
   `{request: {headers}}` —— 前者按文档语义是设置响应头,真 Next 碰巧
   把它也透传给了 `headers()`,vinext 不透传,`x-current-path` 的读方
   (share 页 QR、layout)全部拿到 null。
5. **CJS default-export 互操作**:`markdown-to-text`(TS 编译的
   `exports.default`)在 Vite RSC 环境下 default import 拿到 namespace。
   已改为自有实现 `src/utils/remove_markdown.ts` 并移除依赖。全部服务端
   引用的依赖扫过一遍,只有它有这个模式。
6. **Tailwind 4 官方升级工具的两个坑**(手工修正):丢掉了
   `tailwindcss-animate` 插件(shadcn 动画类全靠它,已用 `@plugin` 接回);
   把 `<Button variant={'outline'}>` 的 cva 变体名误改成
   `outline-solid`(8 个文件,已还原)。
7. **React 19**:`useRef()` 必须给初值(2 处);一处真实的条件调用
   `useImperativeHandle` 改为无条件(null ref 是 no-op,行为不变)。

## 环境与配置要点

- **`vite.config.ts` 一旦存在,必须自己声明 `vinext()` 插件和 react
  dedupe** —— vinext 检测到该文件就把整个配置交给它,漏声明则全站 404。
- **env 加载优先级与 Next 完全一致**(vinext 自带 dotenv 实现):
  `.env.local` > `.env.production` > `.env`。本地构建产物里是 localhost
  是因为本地有 Vercel CLI 遗留的 `.env.local`;Docker 构建上下文排除了
  它(.dockerignore),生产正确内联 `api.sola.day`。
- **`"type": "module"`** 已设(Vite 要求)。新增 CJS 风格配置文件要用
  `.cjs` 后缀。
- 字体:构建时下载 Poppins 自托管到 `_next/static/_vinext_fonts/`,
  运行时不再访问 Google —— CN 部署无碍。
- `ipaddr.js` 是 vinext `next/image` shim 的运行时依赖,bun 隔离布局
  不提升它,必须留在 dependencies。
- prosemirror 全家在 package.json `overrides` 锁单版本 —— 树里出现两份
  model/view 时,结构相同的类型在名义上不兼容,tsc 会炸。

## 已知形态(非 bug)

- **dev 模式切页闪烁**:Vite dev 按源文件服务(~205 个模块/页),原生
  `<a>` 整页导航每次重演加载瀑布。生产是打包产物,无此问题。缓解:
  optimizeDeps 已配;后续方向是导航改 `<Link>`/`router.push`
  (2026-08-18 起的新约定,见下)。
- `?`(Unknown)分类的路由是 vinext 静态分析的限制,运行时按动态渲染,
  行为正确。

## 约定变更

- **导航不再默认原生 `<a>`**:新增/改动的导航用 `next/link` 或
  `router.push`。存量不做无差别批量替换,但改到哪个页面顺手转换。
  `@next/next/no-html-link-for-pages` 规则目前关闭,大规模转换后可重开。

## 回退路径

`next` 包与 webpack 回退脚本已彻底移除(用户决定只保留 Vite 链路)。
如需回退,从 git 历史恢复:`bun add next@16 eslint-config-next@16`、
恢复 dev:next/build:next/start:next 脚本与旧 Dockerfile(见
`404e976^` 之前的版本)。next.config.mjs 仍保留 —— vinext 读它。

## 部署注意(尚未部署)

- 镜像 runtime 是 `node:24-slim`,注入的环境变量名 **`HOST`**(vinext
  刻意与 Next 的 `HOSTNAME` 不同,避开 Linux 系统变量)。
- ginger 配置无需改 —— 端口仍是 3000,健康检查仍是 `/api/health`。
- 首次上线前先在浏览器过一遍:登录回跳(middleware return cookie)、
  富文本编辑器、地图选点、支付、server actions。
