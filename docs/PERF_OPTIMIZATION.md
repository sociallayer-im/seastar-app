# 升级后的精简与提速(2026-08-18)

`vite-migration` 分支上,框架迁移(见 `VITE_MIGRATION.md`)完成后的第二轮工作:
利用新版本能力减重、提速、清理过时用法。**业务逻辑零改动**,所有修改要么是
机械替换,要么是加载/请求时机的调整。

分五批提交,每批独立验证(tsc / eslint / build / 生产冒烟):

| 提交 | 内容 |
|---|---|
| `399051e` | 删重复 markdown 目录、死依赖、死文件、tsconfig ES2022 |
| `6b5cf8a` | 硬跳转改 `router.push`,卡片/Header 改 `Link` |
| `72410bc` | 重依赖按需加载,精简 utils barrel |
| `dbe0312` | loader 请求并行化,`cache()` 替代 NodeCache |
| `ab34360` | 路由级 `loading.tsx`、移除 `forwardRef`、`Img` 清理 |
| `b315c48` | 深度 review 发现的问题修复(见最后一节) |

## 一、减重

### 依赖(净减 6 个)

移除:`react-share`(分享按钮的图标本来就是手写 SVG,只用到 URL 拼接,几行
`window.open` 即可)、`lodash`(5 个文件只用 `debounce`,换成
`src/utils/debounce.ts` 十行实现)、`bignumber.js`(3 处除以 `10^decimals`,
换原生除法;`price` 是 `number` 类型,行为等价)、`node-cache`(见下文
`cache()`)、`react-server-dom-webpack`(vinext 的 peer,bun 自动解析)、
`@types/lodash`。

**保留但曾被误判可删的**:`ipaddr.js`(vinext image shim 在 bun 隔离布局下的
运行时依赖,迁移时踩过)、`orderedmap`(`Editor/schema-list.ts` 直接引用)、
`js-sha3`(决定存量用户的默认头像映射,换算法会让所有人头像变脸)、
`cropperjs`(CSS 被直接 import,且 pin 住 react-cropper 的传递版本)。
**教训:自动扫描报告的“零引用”必须逐个人工核实。**

### 重复代码

`src/utils/markdown/` 与 `src/components/client/Editor/markdown/` 是同一份
vendored prosemirror-markdown 的两个拷贝,逐文件 diff 只差 `const`/`let` 和
一处返回类型注解 —— 但因为字节不同,Rollup 无法去重,产物里是两个 150 KB
的 chunk。已删除 `utils` 那份(CSV 工具移到 `src/utils/resolveLocalCsvFile.ts`)。

`AddSingleEventToCalendarAppBtn` 只想要 `to_plain_text`,却经 barrel 把整个
markdown-it 拖进事件详情页 —— 改为直接 import 自有的
`@/utils/remove_markdown`。

## 二、按需加载(实测有效)

事件详情页(全站最热路由)的初始 HTML 现在**不再引用**这三个大块:

| chunk | 大小 | 何时加载 |
|---|---|---|
| html5-qrcode | 360 KB(最大) | 扫码对话框的 effect 里 `await import()`。**后已整个替换掉,见文末「自研二维码解码器」** |
| viem / `evm_payment` | 135 KB + 101 KB | 用户点击加密支付时 |
| `DialogTicket` | — | 打开购票弹窗时(`next/dynamic`) |
| `DialogCropper`(cropperjs) | — | 用户选择头像文件时 |

viem 那项需要拆包:步骤文案和纯函数移到无 viem 依赖的
`src/utils/evm_payment_steps.ts`,只有 `executePayHubPayment` 留在
`evm_payment.ts` 里动态加载 —— 否则组件渲染时就会把 viem 拉进来。

验证方法(不要只看 chunk 列表,要看页面真正引用了什么):

```bash
curl -s http://localhost:PORT/event/detail/<id> | grep -o 'chunks/[A-Za-z0-9_.-]*\.js' | sort -u
```

**仍在首屏的 markdown 块(294 KB)是已知项**,见 `TODO.md` 的 Displayer 条目。

## 三、提速

### 请求瀑布

53 个 `data.ts` loader 里原本只有 4 个用了 `Promise.all`。已并行化:

- **事件详情**:原本 profile → event → group → recurring → tickets → form 六层
  串行,现在 profile ∥ event,然后 group ∥ recurring ∥ form ∥ 订单 —— 降到 2-3 层。
- **event/edit**:hosts ∥ recurring ∥ 场地过滤 ∥ form。
- **group / profile**:被访问对象 ∥ 访问者自己;父 group 管理员判定 ∥ teams。
- **discover**(站点首页):discover 数据 ∥ 访问者 profile。
- **event/[grouphandle]**:修了一个隐藏 bug —— `Promise.all` 数组里多写了一个
  `await`,把第一个请求变回串行;`getCategories` 也并入同批。

并行化时要保住 redirect 语义:`redirect()` 是抛异常,原来 null 检查发生在后续
请求之前。现在的写法是先 `Promise.all` 再检查再 redirect,**代价是极端情况下
(对象不存在 + 另一请求同时网络失败)404 会变成错误页** —— 需要双重故障,接受。

### 缓存

`getCurrProfile` 原来用模块级 `NodeCache`(按 token 缓存 2 秒)去重 —— 那是
**跨请求共享用户数据**,正确性上有隐患。换成 React `cache()` 按请求去重,
语义正确且省掉一个依赖。

注意 `group/[handle]/data.ts` 和 `profile/[handle]/data.ts` 直接调
`getProfileDetailByAuth` 而非 `getCurrProfile`,所以**不共享这个去重**,这两个
页面仍会取两次 `/users/me`。改动它会牵动“用户名未设置时返回 null”的归一化
语义,留作后续。

**SDK 的 `revalidate` 缓存通道尚未做** —— `/discover`、`/groups/directory`
(最多 20 次串行未缓存分页)等公共只读数据现在仍是 `no-store`。这是数据新鲜度
的产品取舍,需要先定各端点可接受的延迟。

### 客户端导航

54 处 `window.location.href` 改 `router.push`;`CardEvent`/`CardGroup`/
`CardTopic`/`Header` 改 `<Link>`(覆盖全站大多数点击)。

**保留硬跳转的情况**(不要一律替换):外部 URL、OAuth redirect、支付
checkout_url、`/api/*` 路由、来源不明的 auth 回跳、`utils/index.ts` 里的非组件
辅助函数、iframe 内的 schedule 视图。`ProfileMenu` 是混合情况 —— 用
`startsWith('/')` 区分。

顺带修了 `map/[grouphandle]/TopBar.tsx` 一个真 bug:URL 里写着字面量
`[grouphandle]`。

### 流式渲染

5 个最热路由加了 `loading.tsx`(共享 `@/components/RouteLoading`),布局可以
先出,不再整页等 `data.ts`。原来全站零 `loading.tsx`、零 `<Suspense>`。

## 四、过时用法清理

- `tsconfig.json`:`target` ES2017 → **ES2022**(607 处 `?.`、245 处对象展开
  不再降级),删 `allowJs`(树里零 JS 文件)。
- 移除全部 **27 处 `forwardRef`**(shadcn/radix 原语)—— React 19 里 `ref` 是
  普通 prop。`Img` 的 “React 18.2 不认识 fetchPriority” workaround 同样作废。
- 删死文件:`.eslintignore`(ESLint 9 flat config 根本不读)、
  `packages/sola-sdk/yarn.lock`、`.vercel/`、`components.json` 里指向已删除的
  `tailwind.config.ts`、`next.config.mjs` 里在 App Router 下无效的
  `reactStrictMode`、零引用的 env 变量。

## 五、Review 发现的问题(`b315c48`)

三路并行深度 review 找到**一类系统性 bug**,值得记下来,因为它不是“转换写错
了”,而是转换本身改变了一个没人明说的前提:

> **原来靠整页跳转“免费销毁”的 UI,在软导航下活了下来。**

- `TransferOwnerForm`:loading 遮罩只在 catch 里关。转让群主成功后,目标页面被
  永久全屏 spinner 盖住、body 滚动锁死,只能手动刷新。
- `DialogVoucherDetail` 接受徽章:同样的卡死遮罩,且对话框留在 profile 页上面。
- 地图创建 marker:对话框悬浮在 marker 页上。
- `DialogBadgeSwap` 轮询路径(最恶性):检测到交换成功后 1 秒轮询不停,每秒弹
  一次成功提示并重复 push。

修法:成功路径显式 `closeModal` / `close?.()` / `clearInterval`。

另外给编辑类 mutation → push 流程统一加了 `router.refresh()` —— vinext 的客户端
路由缓存语义未经验证,不加的话可能显示改动前的数据。代价是一次 RSC 拉取。

同批修复:`useScanQrcode` 的既有竞态(扫码器启动完成前关闭对话框会让摄像头
一直开着),用 closed 标志守住。

**其余 review 结论**:loader 并行化的作用域/守卫/redirect 语义正确,无悬空
Promise;markdown 去重语义相同;分享 URL、debounce、BigNumber 替换行为一致;
forwardRef 移除后无 ref 泄漏进 DOM;`loading.tsx` 只落在 `(normal)` 树,不影响
iframe/dashboard 布局。

## 尚未验证

合并部署前仍需真人过一遍需要登录态的交互流程 —— 尤其是本轮修过的**转让群主**
和**接受徽章券**这两条。其余:富文本编辑器、地图选点、支付、server actions。

---

# 自研二维码解码器(2026-08-19)

移除 `html5-qrcode`(370 KB,曾是全站最大的 client chunk),换成
`src/utils/qrcode/` 下的自有实现 —— **18 KB,缩小 20 倍**,且仍是按需加载
(扫码对话框打开时才拉)。

## 为什么必须自己写解码器,而不是只用原生 API

`BarcodeDetector` 在 Chrome/Android 上可用且比 JS 快得多,但
**Safari 至今不支持,因此 iOS 上所有浏览器都没有**(iOS 17 时期可用 flag
打开,iOS 18 又坏了)。签到是现场拿手机扫别人的手机,iPhone 占比很高 ——
所以 JS 解码器不是兜底,而是 iPhone 用户的主路径。

实现上是双路径:能用原生就用原生,否则动态加载自研解码器。

## 模块构成

`bitmatrix` / `binarize`(Rec.709 灰度 + 8×8 分块自适应阈值)/ `locate`
(定位图案检测)/ `extract`(透视变换 + 网格采样)/ `galois`(GF(256))/
`reedsolomon`(Berlekamp-Massey + Chien + Forney)/ `decode`(格式信息 BCH、
版本信息、8 种掩码、之字形读码、去交织、比特流解析)/ `index`(正反两次尝试)。

支持版本 1–40、四个纠错级别、8 种掩码、numeric/alphanumeric/byte(UTF-8)/ECI。
**Kanji 模式返回 null 而非崩溃** —— 相对 html5-qrcode 是一个窄的能力缺口,
本 app 自己生成的码不会用到,但如果将来要扫外部的 Shift-JIS 码需要留意。

## 验证

两套独立的测试,都必须绿:

```bash
node scripts/verify-qr-decoder.mjs      # 123 项:版本/纠错级别/掩码/长文本/损坏纠错
node scripts/qr-independent-check.mjs   # 23 项:旋转/真实载荷/小尺寸/延迟
```

两者都用仓库里已有的 `qrcode` 生成器做**往返测试**(生成 → 渲染成像素 → 解码
→ 比对),不依赖任何图像库。

**这里有一条教训值得记下**:第一版实现自测 123/123 全过,但我另写的独立测试
发现 **30°–60° 区间整段解不出来** —— 每 90° 里约 40% 的朝向失效,手机稍微拿
斜就扫不出。根因是模块尺寸估算:定位图案的 1:1:3:1:1 比例在对角方向依然成立
(所以能找到图案),但沿水平扫描线量到的是**对角线跨度**,在 45° 时比真实值大
√2 倍,推算出的符号尺寸随之偏小、版本判错。

修法是 ZXing 的做法:沿**两个定位图案的连线方向**追踪 black-white-black 游程
来量模块尺寸(`calculateModuleSize`/`blackWhiteBlackRun`),而不是用行扫描的
结果 —— 那条线就是符号自身的坐标轴,天然与旋转无关。

**同一套测试写两遍是有价值的**:自测覆盖了规格维度(版本、掩码、纠错),却整个
漏掉了物理维度(拿歪)。

## 实测性能

| 场景 | 耗时 |
|---|---|
| 640×480 帧,画面中有码 | 3.3 ms |
| 640×480 帧,画面中无码(最坏) | 15.8 ms |
| 浏览器内(Chromium,246×246) | 7.9 ms |

扫描循环节流在 100ms(约 10fps),即使手机上慢 3–4 倍也仍有余量;视频预览由
合成器渲染,不受主线程解码阻塞。**因此没有引入 Web Worker** —— 若将来现场
反馈有卡顿,再考虑。

## 摄像头层(`src/hooks/useScanQrcode.tsx`)

公开 API 未变(`const {scanQrcode} = useScanQrcode()`),四个调用点无需改动。
实现要点:

- **摄像头释放**:所有退出路径统一 `teardown()` 停掉 track。特别处理了「权限
  弹窗还开着时用户就关掉对话框」—— 那个 stream 若不停会永久泄漏(指示灯常亮),
  旧实现有这个问题。
- `playsinline`:否则 iOS Safari 会强制全屏播放。
- `facingMode: environment`:后置摄像头才是对着别人手机的那个。
- 解码前降采样到最长边 640px。
