/**
 * Proves the server-side markdown renderer emits exactly what the old
 * read-only ProseMirror EditorView produced in the browser.
 *
 * The oracle is the editor itself: the same document is parsed once, then
 * rendered two ways — through prosemirror-view's DOMSerializer against a real
 * DOM (what shipped before) and through our string serializer (what ships now)
 * — and the resulting markup is compared character for character.
 *
 * Needs a DOM, so it runs the browser side under a minimal document shim via
 * prosemirror-model's DOMSerializer, which only uses createElement/appendChild
 * /setAttribute/createTextNode.
 *
 *   node scripts/verify-markdown-html.mjs
 */
import {execFileSync} from 'node:child_process'
import {mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(repoRoot, 'node_modules/.cache/mdhtml')

// Compile the source we need (and its local imports) to plain JS. A generated
// tsconfig rather than CLI flags, because the `@/*` path alias cannot be
// expressed on the command line.
rmSync(outDir, {recursive: true, force: true})
mkdirSync(outDir, {recursive: true})
const tsconfigPath = resolve(outDir, 'tsconfig.build.json')
writeFileSync(tsconfigPath, JSON.stringify({
    compilerOptions: {
        outDir,
        module: 'esnext',
        target: 'es2022',
        moduleResolution: 'bundler',
        skipLibCheck: true,
        allowJs: true,
        strict: false,
        jsx: 'preserve',
        rootDir: repoRoot,
        paths: {'@/*': [resolve(repoRoot, 'src') + '/*']},
    },
    files: [resolve(repoRoot, 'src/utils/markdown_html.ts')],
}))
execFileSync('npx', ['tsc', '-p', tsconfigPath], {cwd: repoRoot, stdio: 'inherit'})

// tsc emits extensionless and alias specifiers; rewrite both for Node's loader.
const patch = (dir) => {
    for (const entry of readdirSync(dir, {withFileTypes: true})) {
        const path = resolve(dir, entry.name)
        if (entry.isDirectory()) {
            patch(path)
            continue
        }
        if (!entry.name.endsWith('.js')) continue
        let source = readFileSync(path, 'utf8')
        // A specifier may name a directory (…/markdown -> …/markdown/index.js).
        const withExtension = (base) => {
            try {
                readFileSync(`${base}.js`)
                return `${base}.js`
            } catch {
                return `${base}/index.js`
            }
        }
        source = source.replace(/(from\s+['"])(\.[^'"]+?)(['"])/g, (m, a, spec, b) => {
            if (spec.endsWith('.js')) return m
            return `${a}${withExtension(resolve(dirname(path), spec))}${b}`
        })
        source = source.replace(/(from\s+['"])@\/([^'"]+?)(['"])/g, (m, a, spec, b) =>
            `${a}${withExtension(resolve(outDir, 'src', spec))}${b}`)
        writeFileSync(path, source)
    }
}
patch(outDir)
writeFileSync(resolve(outDir, 'package.json'), JSON.stringify({type: 'module'}))

const {markdownToHtml} = await import(resolve(outDir, 'src/utils/markdown_html.js'))
const {defaultMarkdownParser} = await import(resolve(outDir, 'src/components/client/Editor/markdown/index.js'))
const {DOMSerializer} = await import('prosemirror-model')

/** The smallest document that satisfies prosemirror's DOMSerializer. */
const makeDocumentShim = () => {
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const escAttr = (s) => esc(s).replace(/"/g, '&quot;')
    const VOID = new Set(['img', 'br', 'hr'])

    const makeNode = (tag) => ({
        nodeType: 1,
        tagName: tag,
        attributes: {},
        children: [],
        setAttribute(name, value) { this.attributes[name] = value },
        appendChild(child) { this.children.push(child); return child },
        get outerHTML() {
            const attrs = Object.entries(this.attributes)
                .map(([k, v]) => ` ${k}="${escAttr(String(v))}"`).join('')
            if (VOID.has(this.tagName)) return `<${this.tagName}${attrs}>`
            const inner = this.children.map(c => c.nodeType === 3 ? esc(c.text) : c.outerHTML).join('')
            return `<${this.tagName}${attrs}>${inner}</${this.tagName}>`
        },
    })

    return {
        createElement: (tag) => makeNode(tag),
        createElementNS: (_ns, tag) => makeNode(tag),
        createTextNode: (text) => ({nodeType: 3, text}),
        createDocumentFragment: () => {
            const frag = makeNode('#fragment')
            Object.defineProperty(frag, 'outerHTML', {
                get() {
                    return this.children.map(c => c.nodeType === 3 ? esc(c.text) : c.outerHTML).join('')
                },
            })
            return frag
        },
    }
}

const renderViaEditorPath = (markdown) => {
    const doc = defaultMarkdownParser.parse(markdown)
    const serializer = DOMSerializer.fromSchema(doc.type.schema)
    const frag = serializer.serializeFragment(doc.content, {document: makeDocumentShim()})
    return frag.outerHTML
}

const CASES = [
    ['纯文本', 'hello world'],
    ['段落 + 换行', 'first paragraph\n\nsecond paragraph'],
    ['强调', 'some *em* and **strong** and `code`'],
    ['标题 h1-h6', '# h1\n\n## h2\n\n### h3\n\n#### h4\n\n##### h5\n\n###### h6'],
    ['无序列表', '- one\n- two\n- three'],
    ['有序列表', '1. one\n2. two'],
    ['有序列表(非 1 起始)', '5. five\n6. six'],
    ['嵌套列表', '- a\n  - b\n    - c'],
    ['引用', '> quoted text\n>\n> second para'],
    ['分隔线', 'above\n\n---\n\nbelow'],
    ['代码块', '```\nplain code\n```'],
    ['代码块(带语言)', '```js\nconst x = 1\n```'],
    ['链接', '[sola](https://sola.day)'],
    ['链接(带 title)', '[sola](https://sola.day "the title")'],
    ['图片', '![alt text](https://sola.day/a.png)'],
    ['硬换行', 'line one  \nline two'],
    ['中文', '# 社交层\n\n这是一段**中文**说明,含 `代码`。'],
    ['emoji', 'party 🎉 time'],
    ['HTML 转义', 'a < b & c > d'],
    ['尖括号文本', 'use <div> tags'],
    ['引号', 'say "hello" and \'bye\''],
    ['混合文档', '# Event\n\nJoin us at **Sola**!\n\n- when: today\n- where: [here](https://sola.day)\n\n> be on time\n\n```\ncode\n```\n\n---\n\ndone'],
    ['长文本', Array.from({length: 40}, (_, i) => `paragraph number ${i} with **bold** text`).join('\n\n')],
]

// Inputs that must not survive as executable markup.
const XSS_CASES = [
    ['javascript: 链接', '[click](javascript:alert(1))'],
    ['JS 图片源', '![x](javascript:alert(1))'],
    ['原始 script 标签', '<script>alert(1)</script>'],
    ['img onerror', '<img src=x onerror=alert(1)>'],
    ['data: 链接', '[click](data:text/html,<script>alert(1)</script>)'],
    ['属性注入', '[a](https://x.com" onmouseover="alert(1))'],
]

let pass = 0, fail = 0
const check = (name, ok, detail = '') => {
    ok ? pass++ : fail++
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}${ok ? '' : '\n        ' + detail}`)
}

console.log('\n1. 与旧的 EditorView 渲染逐字符比对')
for (const [name, md] of CASES) {
    const expected = renderViaEditorPath(md)
    const actual = markdownToHtml(md)
    check(name, expected === actual, `期望: ${JSON.stringify(expected)}\n        实际: ${JSON.stringify(actual)}`)
}

// Empty input never reaches the renderer: both the old and the new component
// short-circuit to <div></div> before calling it. The bare serializer would
// emit "<p></p>" (a doc always holds at least one block), so this asserts the
// contract the component actually relies on rather than that artefact.
check('空输入返回空串(组件在此之前已短路)', markdownToHtml('') === '')

console.log('\n2. XSS(输出不得含可执行标记)')
// Only markup counts. A payload that survives as *escaped text* is exactly the
// safe outcome, so checking the raw string for "javascript:" would fail on
// output that is in fact harmless — inspect tags only.
const isDangerous = (html) => {
    const tags = html.match(/<[^>]*>/g) || []
    return tags.some(tag =>
        /^<\s*script/i.test(tag) ||
        /\son\w+\s*=/i.test(tag) ||
        /(href|src)\s*=\s*"\s*(javascript|data|vbscript):/i.test(tag))
}
for (const [name, md] of XSS_CASES) {
    const html = markdownToHtml(md)
    check(name, !isDangerous(html), `输出: ${JSON.stringify(html)}`)
}

console.log(`\n${pass}/${pass + fail} 项通过`)
process.exit(fail ? 1 : 0)
