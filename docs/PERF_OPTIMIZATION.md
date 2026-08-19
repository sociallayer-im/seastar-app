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
| `b315c48` | 深度 review 发现的问题修复 |
| `13ee927` | 自研二维码解码器,移除 html5-qrcode |
| `035ec2b` | 移除 viem、qrcode 生成器、apollo,镜像剥离 next |
| `953d8c5` | 三轮深度审查发现的问题修复 |
| `2047f9c` | 关闭双重支付窗口,停止把用户数据当 HTML 渲染 |
| `a04fdb3` | 部署前审查修复 |

合并到 main:2026-08-19,快进合并,共 28 个提交。

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

## 尚未验证(截至合并时仍未做)

1. 需要登录态的浏览器交互流程:登录回跳、富文本编辑器、地图选点、server
   actions,尤其是修过的**转让群主**和**接受徽章券**。
2. 测试网上的加密支付。自动化验证只覆盖到 ABI 编码层,**链校验、替换交易识别、
   重试续传都是 RPC 交互逻辑,只有真钱包能验**。建议试三个动作:付款时切错
   网络、发出后点"加速"、确认阶段断网后点重试(应续传而非重付)。

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

---

# 第三轮:移除剩余大依赖(2026-08-19)

`035ec2b`。四个大件,每一个都以**精确对照物**为验收门槛,而不是靠人工检查。
这一轮的方法论比结果更值得记:凡是能找到"原库"当对照物的替换,就用逐字节/逐位
比对当闸门;找不到对照物的(比如裁剪 UI),就不要替换。

## viem → 原生 EIP-1193(236 KB → 2.9 KB raw)

支付路径只用到六个 JSON-RPC 调用和两种 ABI 编码。`src/utils/evm_abi.ts` 自己
编码(selector 由签名字符串经 `js-sha3` 推导,不硬编码十六进制),
`evm_payment.ts` 直接走 `window.ethereum`。

验收:`scripts/verify-evm-encoding.mjs` 与 viem 的 `encodeFunctionData` 比对
1574 组 calldata,逐字节相同。**并且验证了这个测试会失败** —— 把左填充改成右
填充、selector 取 5 字节,分别掉到 69/1574 和 61/1574。

`localBatchGatewayRequest` 那个 101 KB 的 chunk 是 viem 的 CCIP-read 模块,
随之整个消失。注意 viem 只装了一份,两个 chunk 是 Rollup 拆的,不是重复依赖。

## qrcode 生成器 → 自实现

`src/utils/qrcode/encode.ts`,与解码器共用新抽出的 `spec.ts`(decode.ts 由
560 行缩到 365 行)。794 个矩阵与原包逐位一致 —— 尺寸、版本、掩码、每个模块。

**要做到逐位一致必须移植原包的 Dijkstra 分段优化器**:混合模式字符串
(`AB12cd34EF56gh78IJ90`)会被拆成多个段,单段选择做不到一致。

`qrcode` 包**降级为 devDependency 而非删除**:它是两套二维码测试的独立对照物。
一个只跟自家编码器对照过的解码器等于没验证。

发现的既有真相:旧代码 `color: {light: 'red'}` 从来不是红色 —— 包内把 'red'
当十六进制解析得到 NaN,渲染成透明。读 PNG 像素证实(`0,0,0,0`)。替换保留的是
**实际像素**而非字面意图。

## markdown-it + prosemirror 离开客户端(294 KB / 102 KB gz)

这是当时最大的 chunk,而且在事件详情页是**首屏**加载。

关键判断:**不需要重写 markdown 解析器**。它之所以在客户端,只是因为只读展示
组件挂载了一个真正的 ProseMirror 编辑器实例。把解析挪到服务端,客户端归零。

实现上没有另写渲染器,而是遍历解析后的文档、**用 schema 里每个节点自己的
`toDOM` 规格**生成 HTML —— 浏览器原本就是用这套规格构建 DOM 的,所以结构一致
是构造上的必然。

验收三重:与 prosemirror 官方 `DOMSerializer` 逐字符比对 23 种文档;6 个 XSS
载荷;以及**改动前后事件详情页截图逐字节相同**。

日程弹窗是客户端组件,保留客户端渲染,但改成点击时才动态导入解析器。

## next:199 MB 从镜像里消失

它作为 `@unpic/react` 的**可选 peer** 一直被 bun 装着,占生产 node_modules
的 597 MB 中的 199 MB。

**这件事的意义不止于体积**:迁移时"next 已彻底移除"的结论**从未真正被验证过**
—— 所有检查都是在包还物理存在于磁盘上的情况下跑的,万一有代码在运行时解析
`next`,会静默成功而测不出来。把它移走重跑 build / dev / 生产冒烟,才补上这个
验证缺口。

Dockerfile 里的清理带 `test -d` 守卫:bun 布局变了会**构建失败**,而不是静默地
又把 199 MB 装回去。`webpack`(9.5 MB)故意不删 —— 清理它会在 vinext 运行时
真正使用的包里留下悬空符号链接。

`@apollo/client`(10 MB):SDK 的 package.json 里声明,源码零引用,删除。

---

# 三轮深度审查发现的问题(`953d8c5`、`2047f9c`)

编码层面的证明都站得住(ABI 逐字节、二维码逐位、markdown 逐字符),**问题全
出在这些证明看不到的地方**。这一节值得完整保留,因为它是这次工作最大的教训来源。

## 严重:支付可能被签到错误的链上

viem 的 client 构造时带了 `chain`,它在**每次发送交易前**都会 `getChainId()`
+ `assertCurrentChain()`。移除 viem 时这层保护一起丢了,只剩一个
`await wallet_switchEthereumChain` —— 而多个移动钱包会在网络真正切换完成前就
返回。

后果链条完整:USDC/USDT 在支持的五条链上都有部署,错误链上的授权查询会**成功
并返回 0**,随后授权和转账都签在错链上。PayHub 若不在那条链的该地址上,代币
直接消失;若在,后端按订单自己的链验证,永远匹配不上,买家付了钱拿不到票。

**MetaMask 桌面版会挡住切换直到完成,所以在开发机上根本复现不出来。**

修法:链校验放进 `sendTransaction` 内部(结构上没有发送路径能绕过),每次发送
都校验(用户可能在等授权确认的一分钟里切了网络),并在 `eth_sendTransaction`
里显式传 `chainId` 让钱包自己也能拒绝。

## 高:钱包"加速"导致钱付了、票没了

viem 的 `waitForTransactionReceipt` 会跟踪替换交易,我们的轮询只盯一个固定
哈希。用户点"加速"后原哈希永不上链,但**钱在替换交易里已经付出去了** —— 前端
干等 5 分钟报失败,哈希从未上报,订单过期作废,且 item id 已烧进 calldata,
重试永远匹配不上。现在通过账户 nonce 越过该交易来识别。

## 高:我自己引入的订单卡死(部署前审查发现)

修上一条时引入的:哈希在等待回执**之前**就存了,交易 revert 或被替换后没人
清除 —— 重试会永远提交一个死哈希,买家在订单被清理前(约 35 分钟)**完全无法
付款**。而 revert 意味着钱根本没动,本该是可恢复的失败,被我变成了死局。

现在 revert 和替换抛可区分的错误并清除哈希,超时和上报失败则保留(那些哈希
仍可能生效,而这正是这个存储存在的意义)。

## 一类系统性 bug:靠整页跳转"免费销毁"的 UI

把 `window.location.href` 改成 `router.push` 后,原来随页面卸载自动消失的东西
不再消失:

- 转让群主成功后被永久 spinner 盖住、body 滚动锁死,只能手动刷新
- 接受徽章券后对话框留在目标页面上
- 徽章交换的 1 秒轮询在跳转后继续,每秒弹一次成功提示并重复 push

这不是"转换写错了",而是转换本身改变了一个没人明说的前提。**转换硬跳转时,
要问原来的页面卸载在悄悄做什么。**

## XSS:没攻破,但测试是假的

审查用约 70 个载荷没能突破转义。**但那 6 个 XSS 用例测的是 markdown-it,不是
我自己的代码** —— 把 `escapeAttr` 和 `safeUrl` 整个删掉,只有 1 个会失败。

现在改成断言精确 HTML,新增针对属性边界、实体解码顺序、被拒协议必须丢弃
href 等用例,并加了反向对照。实测:破坏 `escapeAttr` → 3 项失败,破坏
`safeUrl` → 1 项失败。

顺带加固 `safeUrl`:控制字符在协议判断前剥离(浏览器解析 URL 前会剥离它们,
`java\tscript:` 原本会掉进"相对路径"分支;今天不可利用只是因为 markdown-it
先做了百分号编码 —— 不应依赖这一点)。

## 三处把用户数据当 HTML 渲染

- `SelectVenue` 渲染 `venue.name`(后端数据)—— 真正的存储型 XSS
- `ScheduleEventPopup` 把群组的 `ticket_link` 拼进 `href` —— 群管理员可注入,
  影响该群日程的所有访客
- `RegisterForm` 拼入用户自己输入的 handle(自 XSS)

**没有逐处转义,而是把确认弹窗的 `content` 类型从 `string` 改成 `ReactNode`**
—— 所有传纯字符串的调用点自动获得转义,真正需要标记的改传 JSX。是消除注入点,
不是加护栏。

代价是要扫全部调用点:部署前审查又发现三处漏网(`AttendEventBtn` 会把购票
链接变成纯文本标签、`GoToBuyTicket`、以及一个 lang 值里含 `<b>`)——
**它们是"本身就是带标签的普通字符串",不是从变量拼接的**,我第一次的 grep
按后者去找,所以漏了。

## 摄像头两处

`closedRef` 在 effect 入口没重置,React StrictMode 双调用会让摄像头永久卡在
"Starting camera...";原生 `BarcodeDetector` 存在但每帧都抛异常时,会无限扫描
且**没有任何兜底**(那个分支从未导入 JS 解码器)。

---

# 部署前审查(`a04fdb3`)

## 结论:迁移本身无阻塞项

用**端到端模拟镜像运行时**验证 —— 生产安装 + 执行 prune + 只保留 Dockerfile
会复制的文件 + node 24,所有路由 200、服务端 markdown 正常、零错误。这证实了
`--production` 没漏掉服务端需要的包(markdown-it 和 prosemirror 被打进
`dist/` 而非外部化)、prune 守卫的 shell 优先级正确、entrypoint 可解析。

```bash
# 复现方法
mkdir sim && cd sim
cp <repo>/package.json <repo>/bun.lock . && mkdir -p packages/sola-sdk
cp <repo>/packages/sola-sdk/package.json packages/sola-sdk/
pnpm install --frozen-lockfile --ignore-scripts --production
# 执行 Dockerfile 里的 prune,然后:
cp -R <repo>/dist <repo>/public <repo>/packages ./
cp <repo>/next.config.mjs <repo>/.env.production ./
PORT=4057 node node_modules/vinext/dist/cli.js start
```

**注意别用 3000 端口**:本机 Rails 后端占着它,curl 会打到那个服务,得到看似
是路由问题的 404。我因此报过一次假警报。

## 两个既有的安全问题

- **SG 生产镜像一直带着 `YATCH_TOKEN`**(仓库**推送**凭据)。`ginger.cn.yml`
  专门过滤了它并写明原因,`ginger.yml` 却没有 —— 任何能拉取镜像的人都能往
  仓库写。改在 Dockerfile 里剥离,两个环境都覆盖,且不会因为将来有人改
  pipeline 而失效。
- **`.env.cn.production` 在构建上下文里**,`COPY . .` 会把微信密钥和 CN 仓库
  token 烤进构建层,而 `builder.cache: max` 会把每层推到镜像仓库缓存。已加入
  `.dockerignore`(CN 部署钩子在本地就写好了 `.env.production`)。

## 待你确认

- CN 的 `.env.cn.production` 没定义 `NEXT_PUBLIC_DISCUSSION` 和
  `NEXT_PUBLIC_ICP_LICENSE` → juluo.xyz 上讨论功能关闭、ICP 备案号页脚不显示。
  后者涉及国内合规,值得确认是否有意为之。
- `ginger.yml` 的 `resources.memory: 900` 是按 `next start` 测的,vinext 从未
  重测。首次部署盯一下。

---

# 方法论小结

这次工作里真正起作用的几条,按价值排序:

1. **能找到对照物就用对照物当闸门。** QR、ABI、markdown 三处替换都有"原库"
   可比,于是验收标准是逐字节/逐位/逐字符相同,而不是"看起来对"。找不到对照物
   的(cropperjs 的裁剪交互)就别替换 —— 没有闸门的替换是在赌。
2. **测试必须被证明会失败。** 三次故意破坏(ABI 左右填充、markdown 转义、
   二维码掩码)都验证了闸门有效。反过来,XSS 那 6 个用例正是因为没做这一步,
   长期在测依赖而非自己的代码。
3. **同一件事由两个独立视角各写一套测试是值得的。** 二维码解码器自测 123/123
   全绿,我另写的测试发现 30°–60° 整段解不出来 —— 自测覆盖了规格维度(版本、
   掩码、纠错),整个漏掉了物理维度(手机拿歪)。
4. **编码正确 ≠ 流程正确。** 支付路径的 1574 项逐字节验证,看不到链校验丢失、
   替换交易、重试双付这三个真正会让用户损失金钱的问题。
5. **"验证过了"要问清楚是在什么条件下验的。** next 在磁盘上时验证"next 已
   移除",等于没验。

---

# JS 体积:迁移前 vs 现在(实测)

对照基线是迁移前的 `10801ec`(Next 14.2.35 + React 18.2),用 `git worktree`
单独装依赖构建。两边用**同一套测法**:启动生产服务器,抓页面 HTML 里引用的
`/_next/static/**.js`,去重后求和。

## 产物总量(磁盘上全部 JS)

| | 文件数 | raw | gzip |
|---|---|---|---|
| 迁移前(`.next/static`) | 179 | 3642 KB | 1214 KB |
| 现在(`dist/client`) | 246 | 1986 KB | **684 KB** |
| 变化 | +67 | **−45%** | **−44%** |

## 单页首屏实际加载

| 页面 | 迁移前 | 现在 | 变化(gzip) |
|---|---|---|---|
| `/event/detail/[id]` | 1357 KB raw / **431 KB gz** | 732 KB raw / **223 KB gz** | **−48%** |
| `/` | 830 KB raw / 266 KB gz | 782 KB raw / 240 KB gz | −10% |
| `/discover` | 757 KB raw / 241 KB gz | 782 KB raw / 240 KB gz | 持平 |

**收益高度集中在事件详情页,这是符合预期的**:markdown-it + prosemirror、
DialogTicket + viem、二维码这三块全都长在那条路径上,而它们正是这轮处理的对象。
`/discover` 上本来就没有这些东西,所以几乎没变 —— 这也说明总量数字要配合
单页数字看,否则容易高估对某个具体用户旅程的改善。

## 两个诚实的注脚

1. **chunk 数量涨了很多**(15 → 58/页,总数 179 → 246)。Rollup 的拆分粒度比
   webpack 细。HTTP/2 下多请求代价不大,且缓存粒度更好(改一个组件不会让整个
   vendor 包失效),但确实是一种权衡。
2. **`/discover` 的 raw 略微上升而 gzip 持平**。小 chunk 各自压缩,共享的压缩
   字典更少,所以颗粒度变细会略微削弱压缩率。gzip 才是实际传输量,以它为准。

## 构建时间

| | 中位耗时 |
|---|---|
| 迁移前(`next build`,webpack) | 32.0 s |
| 迁移后(`vinext build`) | **6.2 s** |

（本轮末次实测 6.25 / 6.23 / 7.00 s;迁移当时记录的 9.6 s 是依赖精简之前的数字。）
