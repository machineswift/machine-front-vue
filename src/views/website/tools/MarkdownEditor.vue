<template>
  <div class="md-editor-page">
    <AppHeader :tool-categories="toolCategories" :nav-items="[]" active-section="" @scroll-to-top="goHome" @go-to-login="goToLogin" @go-to-home="goToHome" />

    <!-- ========== 头部工具栏（参考 tools.top 设计） ========== -->
    <div class="editor-header-bar">
      <div class="header-bar-left">
        <!-- 加载 -->
        <div class="hdr-dropdown" @mouseenter="openDropdown('load')" @mouseleave="closeDropdown('load')">
          <button class="hdr-btn">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12,19L17,14H14V10H10V14H7L12,19Z" />
            </svg>
            <span>加载</span>
            <span class="hdr-arrow">▼</span>
          </button>
          <div v-show="activeDropdown === 'load'" class="hdr-dropdown-menu">
            <div class="hdr-dropdown-item" @click="openFile">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              加载文件
            </div>
            <div class="hdr-dropdown-item" @click="loadSample('welcome')">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
              </svg>
              加载示例
            </div>
          </div>
        </div>

        <!-- 标题 -->
        <div class="hdr-dropdown" @mouseenter="openDropdown('heading')" @mouseleave="closeDropdown('heading')">
          <button class="hdr-btn">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M13,20V11H20V9H13V4H11V9H4V11H11V20H13Z" /></svg>
            <span>标题</span>
            <span class="hdr-arrow">▼</span>
          </button>
          <div v-show="activeDropdown === 'heading'" class="hdr-dropdown-menu">
            <div class="hdr-dropdown-item" v-for="h in 6" :key="h" @click="insertMarkdown('#'.repeat(h) + ' ', ' 标题' + h)">
              <span class="hdr-h-preview" :style="{ fontSize: 20 - h + 'px', fontWeight: h <= 2 ? 700 : 600 }">标题 {{ h }}</span>
            </div>
          </div>
        </div>

        <!-- 元素 -->
        <div class="hdr-dropdown" @mouseenter="openDropdown('element')" @mouseleave="closeDropdown('element')">
          <button class="hdr-btn">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg>
            <span>元素</span>
            <span class="hdr-arrow">▼</span>
          </button>
          <div v-show="activeDropdown === 'element'" class="hdr-dropdown-menu">
            <template v-for="item in elementItems" :key="'el-' + (item as any).label">
              <div v-if="(item as any).divider" class="hdr-divider"></div>
              <div v-else class="hdr-dropdown-item" @click="execElementAction(item as ToolbarAction)">
                <span v-html="(item as ToolbarAction).icon"></span>
                {{ (item as ToolbarAction).label }}
              </div>
            </template>
          </div>
        </div>

        <!-- 图表 (Mermaid) -->
        <div class="hdr-dropdown" @mouseenter="openDropdown('chart')" @mouseleave="closeDropdown('chart')">
          <button class="hdr-btn">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
              <path d="M2,2V22H22V20H4V4H2M7,10V18H9V10H7M12,6V18H14V6H12M17,14V18H19V14H17Z" />
            </svg>
            <span>图表</span>
            <span class="hdr-arrow">▼</span>
          </button>
          <div v-show="activeDropdown === 'chart'" class="hdr-dropdown-menu">
            <div v-for="chart in chartTypes" :key="chart.value" class="hdr-dropdown-item" @click="insertChart(chart)">
              <span style="font-size: 14px; width: 18px; text-align: center">{{ chart.icon }}</span>
              {{ chart.label }}
            </div>
          </div>
        </div>

        <!-- 公式 (LaTeX) -->
        <div class="hdr-dropdown" @mouseenter="openDropdown('formula')" @mouseleave="closeDropdown('formula')">
          <button class="hdr-btn">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
              <path
                d="M15.6,5.29C14.5,5.19 13.53,6 13.43,7.11L13.18,10H16V12H13L12.56,17.07C12.37,19.27 10.43,20.9 8.23,20.7C6.92,20.59 5.82,19.86 5.34,18.66L7.19,17.62C7.35,18.11 7.71,18.5 8.21,18.58C8.86,18.69 9.46,18.19 9.56,17.54L10,12H7V10H10.17L10.41,7.11C10.5,6.1 11.39,5.29 12.39,5.29C12.77,5.29 13.14,5.37 13.5,5.5L15.6,5.29Z"
              />
            </svg>
            <span>公式</span>
            <span class="hdr-arrow">▼</span>
          </button>
          <div v-show="activeDropdown === 'formula'" class="hdr-dropdown-menu">
            <div class="hdr-dropdown-item" @click="insertFormula('inline')">
              <span v-html="icons.formulaInline"></span>
              行内公式 ($...$)
            </div>
            <div class="hdr-dropdown-item" @click="insertFormula('block')">
              <span v-html="icons.formulaBlock"></span>
              块级公式 ($$...$$)
            </div>
          </div>
        </div>
      </div>

      <div class="header-bar-right">
        <!-- 全屏 -->
        <button class="hdr-btn" title="全屏" @click="toggleFullscreen">
          <span v-html="icons.fullscreen"></span>
          <span>全屏</span>
        </button>

        <!-- 模式 -->
        <div class="hdr-dropdown" @mouseenter="openDropdown('mode')" @mouseleave="closeDropdown('mode')">
          <button class="hdr-btn">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
              <path
                d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"
              />
            </svg>
            <span>模式</span>
            <span class="hdr-arrow">▼</span>
          </button>
          <div v-show="activeDropdown === 'mode'" class="hdr-dropdown-menu hdr-dropdown-menu-right">
            <div v-for="m in modeItems" :key="m.mode" class="hdr-dropdown-item" :class="{ active: previewMode === m.mode }" @click="setMode(m.mode)">
              <span v-html="m.icon"></span>
              {{ m.label }}
            </div>
          </div>
        </div>

        <!-- 导出 -->
        <div class="hdr-dropdown" @mouseenter="openDropdown('export')" @mouseleave="closeDropdown('export')">
          <button class="hdr-btn">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12,19L17,14H14V10H10V14H7L12,19Z" />
            </svg>
            <span>导出</span>
            <span class="hdr-arrow">▼</span>
          </button>
          <div v-show="activeDropdown === 'export'" class="hdr-dropdown-menu hdr-dropdown-menu-right">
            <div v-for="ex in exportItems" :key="ex.label" class="hdr-dropdown-item" @click="ex.handler()">
              <span v-html="ex.icon"></span>
              {{ ex.label }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑区 -->
    <div class="editor-main" :class="previewMode">
      <div v-show="previewMode !== 'preview'" class="editor-pane">
        <div class="pane-header">
          <span class="pane-title">Markdown</span>
          <span class="pane-word-count">{{ wordCount }} 字</span>
        </div>
        <div ref="cmContainerRef" class="editor-cm"></div>
      </div>
      <div v-show="previewMode !== 'edit'" class="preview-pane">
        <div class="pane-header">
          <span class="pane-title">预览</span>
        </div>
        <div ref="previewRef" class="preview-content markdown-body" v-html="renderedHtml"></div>
      </div>
    </div>

    <!-- 图表放大查看弹窗 -->
    <el-dialog v-model="chartDialogVisible" :title="chartDialogTitle" width="80%" top="5vh" destroy-on-close>
      <div class="chart-dialog-body" ref="chartDialogBodyRef" v-html="chartDialogSvg"></div>
    </el-dialog>

    <AppLogin v-model:visible="showLogin" @login-success="goToHome" />
  </div>
</template>

<script lang="ts">
  import DOMPurify from 'dompurify'

  // ===== DOMPurify 全局钩子（模块加载时注册一次） =====
  // DOMPurify 默认会剥离所有内联事件处理器（onclick 等）。
  // 这里仅对“复制代码”按钮保留其固定的内联 onclick，其余内联事件一律被清除。
  const copyBtnOnClick = new WeakMap<Element, string>()

  const preserveCopyBtnOnClick = (node: Node): void => {
    if (node instanceof Element && node.classList.contains('code-copy-btn')) {
      const onclick = node.getAttribute('onclick')
      if (onclick) copyBtnOnClick.set(node, onclick)
    }
  }

  const restoreCopyBtnOnClick = (node: Node): void => {
    if (node instanceof Element && copyBtnOnClick.has(node)) {
      node.setAttribute('onclick', copyBtnOnClick.get(node) as string)
      copyBtnOnClick.delete(node)
    }
  }

  DOMPurify.addHook('beforeSanitizeAttributes', preserveCopyBtnOnClick)
  DOMPurify.addHook('afterSanitizeAttributes', restoreCopyBtnOnClick)
</script>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, nextTick } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { marked } from 'marked'
  import hljs from 'highlight.js'
  import 'highlight.js/styles/github-dark.css'
  import mermaid from 'mermaid'
  import AppHeader from '@/views/website/components/AppHeader.vue'
  import AppLogin from '@/views/admin/auth/AppLogin.vue'
  import { toolCategories } from '@/shared/constants/Portal.constant'

  // ===== CodeMirror 6 =====
  import { EditorView, keymap, placeholder } from '@codemirror/view'
  import { EditorState } from '@codemirror/state'
  import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
  import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
  import { oneDark } from '@codemirror/theme-one-dark'
  import { autocompletion, closeBrackets } from '@codemirror/autocomplete'

  const router = useRouter()
  const showLogin = ref(false)

  // ===== Mermaid 图表弹窗 =====
  const chartDialogVisible = ref(false)
  const chartDialogTitle = ref('')
  const chartDialogSvg = ref('')

  // ===== CodeMirror 实例 =====
  const cmContainerRef = ref<HTMLDivElement | null>(null)
  let cmView: EditorView | null = null

  const content = ref(`# 欢迎使用 Markdown 编辑器

这是一个功能完整的 **Markdown** 编辑器，支持实时预览和代码高亮。

## 快速入门

### 文本样式

- **粗体** 和 *斜体* 和 ~~删除线~~
- 行内代码：\`console.log('hello')\`

### 代码块

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet('Machine'));
\`\`\`

\`\`\`python
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

print(fibonacci(10))
\`\`\`

### 表格

| 功能 | 状态 | 优先级 |
|------|------|--------|
| Markdown 编辑 | ✅ 已完成 | 高 |
| 代码高亮 | ✅ 已完成 | 高 |
| 实时预览 | ✅ 已完成 | 高 |

### 待办清单

- [x] 基础编辑功能
- [x] 实时预览
- [ ] 导出 PDF
- [ ] 暗色主题切换

### 引用

> 好的代码本身就是最好的文档。
> — 代码规范最佳实践

### 链接和图片

- 访问 [Gitee 仓库](https://gitee.com/machineswift)
- 探索 [Machine 官网](https://www.machinerust.cn)

### 流程图 (Mermaid)

\`\`\`mermaid
flowchart TD
    A[开始] --> B[处理]
    B --> C[结束]
\`\`\`

### 时序图 (Mermaid)

\`\`\`mermaid
sequenceDiagram
    participant A as 用户
    participant B as 系统
    A->>B: 请求
    B-->>A: 响应
\`\`\`
`)

  // ===== 初始化 CodeMirror =====
  const initCodeMirror = () => {
    if (!cmContainerRef.value) return

    const updateListener = EditorView.updateListener.of(update => {
      if (update.docChanged) {
        content.value = update.state.doc.toString()
      }
    })

    const cmState = EditorState.create({
      doc: content.value,
      extensions: [
        markdown({ base: markdownLanguage }),
        oneDark,
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        autocompletion(),
        closeBrackets(),
        placeholder('在此输入 Markdown 内容...'),
        EditorView.lineWrapping,
        updateListener
      ]
    })

    cmView = new EditorView({
      state: cmState,
      parent: cmContainerRef.value
    })
  }

  // ===== 获取编辑器当前选区/光标 =====
  const cmFocus = () => {
    cmView?.focus()
  }

  // ========== 图表类型 (Mermaid) ==========
  const chartTypes = [
    { value: 'flowchart', label: '流程图', icon: '🔀' },
    { value: 'sequence', label: '时序图', icon: '⏱️' },
    { value: 'gantt', label: '甘特图', icon: '📊' },
    { value: 'class', label: '类图', icon: '📐' },
    { value: 'state', label: '状态图', icon: '🔄' },
    { value: 'pie', label: '饼图', icon: '🥧' },
    { value: 'journey', label: '用户旅程图', icon: '🗺️' },
    { value: 'gitgraph', label: 'Git图', icon: '🌿' },
    { value: 'mindmap', label: '思维导图', icon: '🧠' },
    { value: 'timeline', label: '时间轴', icon: '📅' },
    { value: 'xychart', label: 'XY图表', icon: '📈' },
    { value: 'quadrant', label: '象限图', icon: '🎯' }
  ]

  // ========== 头部下拉菜单 ==========
  const activeDropdown = ref<string | null>(null)
  let dropdownTimer: ReturnType<typeof setTimeout> | null = null

  const openDropdown = (name: string) => {
    if (dropdownTimer) clearTimeout(dropdownTimer)
    activeDropdown.value = name
  }

  const closeDropdown = (name: string) => {
    dropdownTimer = setTimeout(() => {
      if (activeDropdown.value === name) {
        activeDropdown.value = null
      }
    }, 150)
  }

  const closeAllDropdowns = () => {
    activeDropdown.value = null
  }

  // ========== SVG 图标 ==========
  const icons = {
    bold: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M13.5,15.5H10V12.5H13.5A1.5,1.5 0 0,1 15,14A1.5,1.5 0 0,1 13.5,15.5M10,6.5H13A1.5,1.5 0 0,1 14.5,8A1.5,1.5 0 0,1 13,9.5H10M15.6,10.79C16.57,10.11 17.25,9.02 17.25,8C17.25,5.74 15.5,4 13.25,4H7V18H14.04C16.14,18 17.75,16.3 17.75,14.21C17.75,12.69 16.89,11.39 15.6,10.79Z"/></svg>',
    italic: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M10,4V7H12.21L8.79,15H6V18H14V15H11.79L15.21,7H18V4H10Z"/></svg>',
    strike: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3,14H21V12H3M5,4V7H10V10H14V7H19V4M10,19H14V16H10V19Z"/></svg>',
    ul: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z"/></svg>',
    ol: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7,13V11H21V13H7M7,19V17H21V19H7M7,7V5H21V7H7M3,8V5H2V4H4V8H3M2,17V16H5V20H2V19H4V18.5H3V17.5H4V17H2M4.25,10A0.75,0.75 0 0,1 5,10.75C5,10.95 4.92,11.14 4.79,11.27L3.12,13H5V14H2V13.08L4,11H2V10H4.25Z"/></svg>',
    quote: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z"/></svg>',
    link: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z"/></svg>',
    image:
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/></svg>',
    code: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z"/></svg>',
    table:
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M5,4H19A2,2 0 0,1 21,6V18A2,2 0 0,1 19,20H5A2,2 0 0,1 3,18V6A2,2 0 0,1 5,4M5,8V12H11V8H5M13,8V12H19V8H13M5,14V18H11V14H5M13,14V18H19V14H13Z"/></svg>',
    edit: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    preview:
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    split:
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>',
    exportHtml: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M16,18H18V6H16M6,18L14.5,12L6,6V18Z"/></svg>',
    exportMd:
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12,19L17,14H14V10H10V14H7L12,19Z"/></svg>',
    exportPdf:
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20,2H8A2,2 0 0,0 6,4V16A2,2 0 0,0 8,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M20,16H8V4H20V16M4,6H2V20A2,2 0 0,0 4,22H18V20H4V6M12,10H16A1,1 0 0,1 17,11V13A1,1 0 0,1 16,14H14V17H12V10M14,12V12H15V12.5H14V12Z"/></svg>',
    formulaInline:
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M4,7V10H7V7H4M10,7V10H13V7H10M16,7V10H19V7H16M4,13V16H7V13H4M10,13V16H13V13H10M16,13V16H19V13H16"/></svg>',
    formulaBlock:
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M4,7V10H7V7H4M10,7V10H13V7H10M16,7V10H19V7H16M4,13V16H7V13H4M10,13V16H13V13H10M16,13V16H19V13H16"/></svg>',
    fullscreen:
      '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z"/></svg>'
  }

  interface ToolbarAction {
    label: string
    icon: string
    type: 'wrap' | 'prefix' | 'codeblock' | 'table'
    params?: string[]
  }

  // ========== 工具栏菜单项定义 ==========
  const elementItems: (ToolbarAction | { divider: true })[] = [
    { label: '粗体', icon: icons.bold, type: 'wrap', params: ['**', '**', '粗体文本'] },
    { label: '斜体', icon: icons.italic, type: 'wrap', params: ['*', '*', '斜体文本'] },
    { label: '删除线', icon: icons.strike, type: 'wrap', params: ['~~', '~~', '删除文本'] },
    { divider: true },
    { label: '无序列表', icon: icons.ul, type: 'prefix', params: ['- ', '列表项'] },
    { label: '有序列表', icon: icons.ol, type: 'prefix', params: ['1. ', '列表项'] },
    { label: '引用', icon: icons.quote, type: 'prefix', params: ['> ', '引用文本'] },
    { divider: true },
    { label: '插入链接', icon: icons.link, type: 'wrap', params: ['[', '](url)', '链接文本'] },
    { label: '插入图片', icon: icons.image, type: 'wrap', params: ['![', '](url)', '图片描述'] },
    { divider: true },
    { label: '代码块', icon: icons.code, type: 'codeblock' },
    { label: '插入表格', icon: icons.table, type: 'table' }
  ]

  const execElementAction = (item: ToolbarAction) => {
    switch (item.type) {
      case 'wrap':
        return insertWrap(item.params![0], item.params![1], item.params![2])
      case 'prefix':
        return insertMarkdown(item.params![0], item.params![1])
      case 'codeblock':
        return insertCodeBlock()
      case 'table':
        return insertTable()
    }
  }

  const modeItems = [
    { label: '普通模式', icon: icons.split, mode: 'normal' },
    { label: '编辑模式', icon: icons.edit, mode: 'edit' },
    { label: '预览模式', icon: icons.preview, mode: 'preview' }
  ]

  const exportItems = [
    { label: '导出 HTML', icon: icons.exportHtml, handler: () => exportHtml() },
    { label: '导出 Markdown', icon: icons.exportMd, handler: () => downloadMarkdown() },
    { label: '导出 PDF', icon: icons.exportPdf, handler: () => exportPdf() }
  ]

  // ========== 加载示例文档 ==========
  const loadSample = (type: string) => {
    const samples: Record<string, string> = {
      welcome: `# 欢迎使用 Markdown 编辑器

这是一个功能完整的 **Markdown** 编辑器，支持实时预览和代码高亮。

## 功能特性

- **实时预览** - 编辑内容即时渲染
- **代码高亮** - 支持多种编程语言
- **表格/列表** - GFM 标准支持

### 代码示例

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### 表格示例

| 功能 | 状态 |
|------|------|
| 实时预览 | ✅ |
| 代码高亮 | ✅ |

> 好的代码本身就是最好的文档。
`,
      api: `# API 接口文档

## 用户管理

### 获取用户列表

\`\`\`http
GET /api/v1/users
Authorization: Bearer <token>
\`\`\`

**响应示例：**

\`\`\`json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "name": "张三",
      "email": "zhangsan@example.com"
    }
  ]
}
\`\`\`

### 创建用户

\`\`\`http
POST /api/v1/users
Content-Type: application/json

{
  "name": "李四",
  "email": "lisi@example.com"
}
\`\`\`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 用户姓名 |
| email | string | 是 | 邮箱地址 |
`,
      changelog: `# 更新日志

## [2.1.0] - 2026-07-16

### ✨ 新增功能
- 新增 Markdown 编辑器工具栏
- 支持全屏编辑模式

### 🐛 修复
- 修复代码高亮显示问题
- 修复表格渲染错位

### 📝 优化
- 优化编辑性能
- 改善移动端适配

## [2.0.0] - 2026-06-01

### 🚀 重大更新
- 全新的 UI 界面
- 支持多主题切换
- 性能提升 50%
`
    }
    content.value = samples[type] || samples.welcome
    activeDropdown.value = null
    ElMessage.success('已加载示例文档')
  }

  // ========== 全屏 ==========
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
    closeAllDropdowns()
  }
  const previewRef = ref<HTMLElement | null>(null)
  const previewMode = ref<string>('split')

  const goHome = () => router.push('/')
  const goToLogin = () => {
    showLogin.value = true
  }
  const goToHome = () => router.push('/admin/home')

  // ========== 图表类型映射 ==========
  const chartTypeMap: Record<string, string> = {
    flowchart: '流程图',
    sequenceDiagram: '时序图',
    gantt: '甘特图',
    classDiagram: '类图',
    'stateDiagram-v2': '状态图',
    pie: '饼图',
    journey: '用户旅程图',
    gitGraph: 'Git图',
    mindmap: '思维导图',
    timeline: '时间轴',
    'xychart-beta': 'XY图表',
    quadrantChart: '象限图'
  }

  const getChartType = (text: string): string => {
    const firstLine = text.trim().split('\n')[0] || ''
    for (const [key, label] of Object.entries(chartTypeMap)) {
      if (firstLine.startsWith(key)) return label
    }
    return '图表'
  }

  let mermaidChartIdCounter = 0

  // ========== Mermaid 初始化 ==========
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'strict', // 严格模式：禁用 HTML 标签与点击事件，防止 XSS
    fontFamily: 'inherit',
    maxTextSize: 100000
  })

  // ========== Markdown 渲染 ==========
  const mdRenderer = new (marked.Renderer as unknown as { new (): { code: (token: { text: string; lang?: string }) => string } })()
  mdRenderer.code = function (token: { text: string; lang?: string }) {
    const language = token.lang || ''

    // 如果是 Mermaid 图表，输出带工具栏的 div
    if (language === 'mermaid') {
      mermaidChartIdCounter++
      const chartId = 'mermaid-chart-' + mermaidChartIdCounter
      const chartType = getChartType(token.text)
      return (
        '<div class="mermaid-chart-container" id="' +
        chartId +
        '">' +
        '<div class="mermaid-chart-toolbar">' +
        '<div class="chart-type-label">' +
        chartType +
        '</div>' +
        '<div class="chart-actions">' +
        '<button class="chart-action-btn chart-expand-btn" data-chart="' +
        chartId +
        '" title="放大查看">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">' +
        '<path d="M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z"/>' +
        '</svg> 放大查看' +
        '</button>' +
        '<button class="chart-action-btn chart-png-btn" data-chart="' +
        chartId +
        '" title="导出PNG">PNG</button>' +
        '</div>' +
        '</div>' +
        '<div class="mermaid">' +
        token.text +
        '</div>' +
        '</div>'
      )
    }

    let highlighted
    if (language && hljs.getLanguage(language)) {
      try {
        highlighted = hljs.highlight(token.text, { language }).value
      } catch {
        highlighted = hljs.highlightAuto(token.text).value
      }
    } else {
      highlighted = hljs.highlightAuto(token.text).value
    }
    const encoded = encodeURIComponent(token.text)
    const langClass = language ? 'language-' + language : ''
    return (
      '<div class="code-block-wrapper">' +
      '<div class="code-block-header">' +
      '<span class="code-lang">' +
      (language || 'text') +
      '</span>' +
      '<button class="code-copy-btn" onclick="(function(btn){' +
      "navigator.clipboard.writeText(decodeURIComponent(btn.getAttribute('data-code')));" +
      "btn.textContent='\u5df2\u590d\u5236!';" +
      'setTimeout(function(){btn.textContent="\u590d\u5236"},1500);' +
      '})(this)" data-code="' +
      encoded +
      '">\u590d\u5236</button>' +
      '</div>' +
      '<pre><code class="hljs ' +
      langClass +
      '">' +
      highlighted +
      '</code></pre>' +
      '</div>'
    )
  }

  const renderedHtml = computed(() => {
    try {
      const html = marked.parse(content.value, {
        gfm: true,
        breaks: true,
        renderer: mdRenderer
      } as unknown as Parameters<typeof marked.parse>[1]) as string
      // 使用 DOMPurify 净化 Markdown 渲染结果，防止 XSS
      return DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true }
      })
    } catch {
      return '<p style="color:red">\u6e32\u67d3\u9519\u8bef</p>'
    }
  })

  // ========== 自动渲染 Mermaid 图表 ==========
  const chartDialogBodyRef = ref<HTMLElement | null>(null)

  const renderMermaid = async () => {
    try {
      const container = document.querySelector('.preview-content')
      if (!container) return
      const nodes = container.querySelectorAll('.mermaid:not([data-processed])')
      if (nodes.length === 0) return
      await mermaid.run({
        nodes: Array.from(nodes) as HTMLElement[],
        suppressErrors: true
      })
      // 为工具栏按钮绑定事件
      container.querySelectorAll('.chart-expand-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          const chartId = (e.currentTarget as HTMLElement).getAttribute('data-chart') || ''
          expandChart(chartId)
        })
      })
      container.querySelectorAll('.chart-png-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          const chartId = (e.currentTarget as HTMLElement).getAttribute('data-chart') || ''
          downloadChartPng(chartId)
        })
      })
    } catch {
      console.warn('[Mermaid] render error')
    }
  }

  // ========== 放大查看图表 ==========
  const expandChart = (chartId: string) => {
    const container = document.getElementById(chartId)
    if (!container) return
    const svg = container.querySelector('svg')
    if (!svg) return
    // 获取图表类型标签
    const label = container.querySelector('.chart-type-label')
    chartDialogTitle.value = label?.textContent || '图表查看'
    chartDialogSvg.value = svg.outerHTML
    chartDialogVisible.value = true
  }

  // ========== 下载图表 PNG ==========
  const downloadChartPng = async (chartId: string) => {
    const container = document.getElementById(chartId)
    if (!container) return
    const svg = container.querySelector('svg')
    if (!svg) return

    const svgData = svg.outerHTML
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      ElMessage.warning('浏览器不支持导出PNG')
      return
    }

    const img = new Image()
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      const scale = 2
      const w = svg.getBoundingClientRect().width || 800
      const h = svg.getBoundingClientRect().height || 400
      canvas.width = w * scale
      canvas.height = h * scale
      ctx.scale(scale, scale)
      ctx.fillStyle = '#1e1e1e'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)

      const link = document.createElement('a')
      link.download = chartId + '.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
      ElMessage.success('PNG 已导出')
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      ElMessage.warning('PNG 导出失败')
    }

    img.src = url
  }

  let mermaidRenderTimer: ReturnType<typeof setTimeout> | null = null
  watch(renderedHtml, () => {
    if (mermaidRenderTimer) clearTimeout(mermaidRenderTimer)
    mermaidRenderTimer = setTimeout(renderMermaid, 500)
  })

  // ========== 字数统计 ==========
  const wordCount = computed(() => {
    const text = content.value.replace(/\s/g, '').replace(/[#*`~\-_>|[\]()!]/g, '')
    return text.length
  })

  // ========== 编辑操作 ==========
  const insertMarkdown = (prefix: string, placeholder: string) => {
    if (!cmView) return
    const sel = cmView.state.selection.main
    const text = cmView.state.doc.toString()
    const selected = text.substring(sel.from, sel.to) || placeholder
    const insertText = prefix + selected
    cmView.dispatch({
      changes: { from: sel.from, to: sel.to, insert: insertText },
      selection: { anchor: sel.from + insertText.length }
    })
    cmFocus()
  }

  const insertWrap = (before: string, after: string, placeholder: string) => {
    if (!cmView) return
    const sel = cmView.state.selection.main
    const text = cmView.state.doc.toString()
    const selected = text.substring(sel.from, sel.to) || placeholder
    const insertText = before + selected + after
    const cursorPos = sel.from + before.length
    cmView.dispatch({
      changes: { from: sel.from, to: sel.to, insert: insertText },
      selection: { anchor: cursorPos, head: cursorPos + selected.length }
    })
    cmFocus()
  }

  const insertCodeBlock = () => {
    if (!cmView) return
    const sel = cmView.state.selection.main
    const codeBlock = '\n```\nconst code = "hello world";\n```\n'
    cmView.dispatch({
      changes: { from: sel.from, to: sel.to, insert: codeBlock },
      selection: { anchor: sel.from + codeBlock.length }
    })
    cmFocus()
  }

  const insertTable = () => {
    if (!cmView) return
    const sel = cmView.state.selection.main
    const tableTemplate = '\n| 列1 | 列2 | 列3 |\n|------|------|------|\n| 数据1 | 数据2 | 数据3 |\n'
    cmView.dispatch({
      changes: { from: sel.from, to: sel.to, insert: tableTemplate },
      selection: { anchor: sel.from + tableTemplate.length }
    })
    cmFocus()
  }

  // ========== 同步滚动 ==========
  const syncScroll = () => {
    if (!cmView || !previewRef.value || previewMode.value !== 'split') return
    const cmEl = cmView.scrollDOM
    const preview = previewRef.value
    const ratio = cmEl.scrollTop / (cmEl.scrollHeight - cmEl.clientHeight)
    preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight)
  }

  // ========== 下载 ==========
  const downloadMarkdown = () => {
    const blob = new Blob([content.value], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document-' + Date.now() + '.md'
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('已下载')
  }

  // ========== 打开文件 ==========
  const openFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.markdown,.txt'
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        content.value = reader.result as string
        closeAllDropdowns()
        ElMessage.success('文件已加载')
      }
      reader.readAsText(file)
    }
    input.click()
  }

  // ========== 设置模式 ==========
  const setMode = (mode: string) => {
    previewMode.value = mode
    closeAllDropdowns()
    nextTick(() => cmView?.focus())
  }

  // ========== 插入图表 (Mermaid) ==========
  const insertChart = (chart: { value: string; label: string }) => {
    const templates: Record<string, string> = {
      flowchart: '```mermaid\nflowchart TD\n    A[开始] --> B[处理]\n    B --> C[结束]\n```',
      sequence: '```mermaid\nsequenceDiagram\n    participant A as 用户\n    participant B as 系统\n    A->>B: 请求\n    B-->>A: 响应\n```',
      gantt:
        '```mermaid\ngantt\n    title 项目计划\n    dateFormat YYYY-MM-DD\n    section 需求阶段\n    需求分析       :a1, 2026-01-01, 7d\n    需求评审       :a2, after a1, 3d\n    section 开发阶段\n    功能开发       :b1, after a2, 14d\n    单元测试       :b2, after b1, 5d\n    section 测试阶段\n    集成测试       :c1, after b2, 7d\n    上线部署       :c2, after c1, 3d\n```',
      class:
        '```mermaid\nclassDiagram\n    class Animal {\n        +String name\n        +move()\n    }\n    class Dog {\n        +bark()\n    }\n    Animal <|-- Dog\n```',
      state: '```mermaid\nstateDiagram-v2\n    [*] --> 待机\n    待机 --> 运行: 启动\n    运行 --> 停止: 关闭\n    停止 --> [*]\n```',
      pie: '```mermaid\npie\n    title 数据分布\n    "类别A" : 40\n    "类别B" : 30\n    "类别C" : 30\n```',
      journey:
        '```mermaid\njourney\n    title 用户体验旅程\n    section 注册流程\n      访问页面: 5: 用户\n      填写表单: 3: 用户\n      提交成功: 4: 用户\n```',
      gitgraph:
        '```mermaid\ngitGraph\n    commit id: "初始化"\n    branch develop\n    checkout develop\n    commit id: "开发"\n    checkout main\n    merge develop\n```',
      mindmap: '```mermaid\nmindmap\n  root((主题))\n    分支1\n      子节点A\n      子节点B\n    分支2\n      子节点C\n```',
      timeline: '```mermaid\ntimeline\n    title 项目里程碑\n    2026 Q1 : 需求分析\n    2026 Q2 : 开发测试\n    2026 Q3 : 上线部署\n```',
      xychart:
        '```mermaid\nxychart-beta\n    title "月度数据"\n    x-axis "月份" [1月, 2月, 3月]\n    y-axis "数值"\n    bar [30, 45, 60]\n    line [20, 35, 50]\n```',
      quadrant:
        '```mermaid\nquadrantChart\n    title "优先级矩阵"\n    x-axis "低重要性" --> "高重要性"\n    y-axis "低紧急度" --> "高紧急度"\n    quadrant-1 "重要且紧急"\n    quadrant-2 "重要不紧急"\n    quadrant-3 "不重要不紧急"\n    quadrant-4 "紧急不重要"\n```'
    }
    const template = templates[chart.value] || ''
    insertMarkdown(template + '\n\n', '')
    closeAllDropdowns()
  }

  // ========== 插入 LaTeX 公式 ==========
  const insertFormula = (type: string) => {
    if (type === 'inline') {
      insertWrap('$', '$', '公式')
    } else {
      insertMarkdown('\n$$\n', '公式\n')
    }
    closeAllDropdowns()
  }

  // ========== 导出 HTML ==========
  const exportHtml = () => {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>文档</title>
<style>
body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333; }
pre { background: #f5f5f5; padding: 16px; border-radius: 6px; overflow-x: auto; }
code { font-family: 'SF Mono', monospace; font-size: 14px; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
th { background: #f8f8f8; }
img { max-width: 100%; }
blockquote { border-left: 3px solid #667eea; margin: 0; padding: 8px 16px; background: #f8f8ff; }
</style></head><body>${renderedHtml.value}</body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '文档.html'
    a.click()
    URL.revokeObjectURL(url)
    closeAllDropdowns()
    ElMessage.success('HTML 已导出')
  }

  // ========== 导出 PDF ==========
  const exportPdf = () => {
    ElMessage.info('PDF 导出功能即将推出')
    closeAllDropdowns()
  }

  onMounted(() => {
    initCodeMirror()
    setTimeout(() => {
      if (cmView) {
        cmView.scrollDOM.addEventListener('scroll', syncScroll)
      }
      renderMermaid()
    }, 600)
  })

  // cmView 在组件卸载前自动跟随 DOM 销毁，无需手动清理
</script>

<style scoped lang="scss">
  $bg: #0f0f11;
  $bc: rgba(255, 255, 255, 0.03);
  $bd: rgba(255, 255, 255, 0.08);
  $t1: rgba(255, 255, 255, 0.87);
  $t2: rgba(255, 255, 255, 0.6);
  $t3: rgba(255, 255, 255, 0.38);
  $a: #667eea;
  $ag: linear-gradient(135deg, #667eea, #764ba2);
  .md-editor-page {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: $t1;
    background: $bg;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding-top: 46px;
    box-sizing: border-box;
  }

  // ========== 头部功能栏（加载/标题/元素/图标等） ==========
  .editor-header-bar {
    flex-shrink: 0;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    background: $bc;
    border-bottom: 1px solid $bd;
    gap: 8px;
  }

  .header-bar-left,
  .header-bar-right {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .hdr-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    height: 30px;
    background: none;
    border: 1px solid transparent;
    border-radius: 6px;
    color: $t2;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
    &:hover {
      background: $bc;
      color: $t1;
      border-color: $bd;
    }
    svg {
      flex-shrink: 0;
    }
    .hdr-arrow {
      font-size: 7px;
      opacity: 0.5;
      margin-left: 2px;
    }
  }

  // 头部下拉
  .hdr-dropdown {
    position: relative;

    .hdr-dropdown-menu {
      position: absolute;
      left: 0;
      top: calc(100% + 4px);
      min-width: 130px;
      background: $bg;
      border: 1px solid $bd;
      border-radius: 8px;
      padding: 4px;
      z-index: 1002;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
    }

    .hdr-dropdown-menu-right {
      left: auto;
      right: 0;
    }

    .hdr-dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 12px;
      color: $t2;
      cursor: pointer;
      transition: all 0.12s;
      svg {
        flex-shrink: 0;
        opacity: 0.6;
      }
      &:hover {
        background: rgba(102, 126, 234, 0.08);
        color: $t1;
        svg {
          opacity: 1;
        }
      }
      &.active {
        background: rgba(102, 126, 234, 0.1);
        color: $a;
      }
    }

    .hdr-divider {
      height: 1px;
      background: $bd;
      margin: 3px 6px;
    }

    .hdr-h-preview {
      color: $t1;
    }
  }

  // ========== 编辑区 ==========
  .editor-main {
    flex: 1;
    display: flex;
    overflow: hidden;

    &.edit .preview-pane {
      display: none;
    }
    &.preview .editor-pane {
      display: none;
    }
  }

  .editor-pane,
  .preview-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }

  .editor-pane {
    border-right: 1px solid $bd;
  }

  // CodeMirror 编辑器容器
  .editor-cm {
    flex: 1;
    overflow: hidden;

    .cm-editor {
      height: 100%;
      font-size: 14px;
      background: $bg !important;
    }

    .cm-scroller {
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
      line-height: 1.7;
    }

    .cm-content {
      padding: 16px 20px;
      caret-color: $t1;
    }

    .cm-gutters {
      border-right: 1px solid $bd;
      background: $bc;
    }

    .cm-lineNumbers .cm-gutterElement {
      padding: 0 10px 0 6px;
      color: $t3;
      font-size: 12px;
    }

    .cm-placeholder {
      color: $t3;
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 14px;
    }

    .cm-focused {
      outline: none;
    }

    .cm-selectionBackground {
      background: rgba(102, 126, 234, 0.2) !important;
    }

    .cm-cursor {
      border-left-color: rgba(255, 255, 255, 0.6) !important;
    }

    .cm-activeLine {
      background: $bc;
    }
  }

  .pane-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 16px;
    background: $bc;
    border-bottom: 1px solid $bd;
    .pane-title {
      font-size: 11px;
      font-weight: 600;
      color: $t3;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .pane-word-count {
      font-size: 11px;
      color: $t3;
    }
  }

  .preview-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px 28px;
    line-height: 1.7;
    font-size: 15px;
  }

  // ========== Markdown 预览样式 ==========
  :deep(.markdown-body) {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin-top: 24px;
      margin-bottom: 12px;
      font-weight: 600;
      color: $t1;
      line-height: 1.3;
    }
    h1 {
      font-size: 26px;
      border-bottom: 1px solid $bd;
      padding-bottom: 8px;
    }
    h2 {
      font-size: 22px;
      border-bottom: 1px solid $bd;
      padding-bottom: 6px;
    }
    h3 {
      font-size: 18px;
    }
    h4 {
      font-size: 16px;
    }

    p {
      margin: 8px 0;
      line-height: 1.7;
    }

    strong {
      font-weight: 600;
      color: #fff;
    }

    em {
      font-style: italic;
    }

    del {
      color: $t3;
    }

    a {
      color: $a;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }

    ul,
    ol {
      padding-left: 24px;
      margin: 8px 0;
    }

    li {
      margin: 4px 0;
    }

    ul li {
      list-style: disc;
    }

    blockquote {
      margin: 12px 0;
      padding: 8px 16px;
      border-left: 3px solid $a;
      background: rgba(102, 126, 234, 0.04);
      border-radius: 0 6px 6px 0;
      p {
        margin: 4px 0;
      }
    }

    hr {
      border: none;
      border-top: 1px solid $bd;
      margin: 24px 0;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: 12px 0;
      font-size: 14px;
    }

    th,
    td {
      border: 1px solid $bd;
      padding: 8px 12px;
      text-align: left;
    }

    th {
      background: $bc;
      font-weight: 600;
      color: $t1;
    }

    td {
      color: $t2;
    }

    tr:nth-child(even) td {
      background: $bc;
    }

    input[type='checkbox'] {
      margin-right: 6px;
      accent-color: $a;
    }

    img {
      max-width: 100%;
      border-radius: 8px;
      margin: 12px 0;
    }

    // 代码块包装
    .code-block-wrapper {
      margin: 16px 0;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid $bd;

      .code-block-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 12px;
        background: $bc;
        border-bottom: 1px solid $bd;

        .code-lang {
          font-size: 11px;
          color: $t3;
          text-transform: uppercase;
          font-family: 'SF Mono', monospace;
        }

        .code-copy-btn {
          font-size: 11px;
          padding: 2px 8px;
          border: 1px solid $bd;
          border-radius: 4px;
          background: transparent;
          color: $t2;
          cursor: pointer;
          transition: all 0.15s;
          &:hover {
            background: rgba(102, 126, 234, 0.1);
            color: $a;
            border-color: $a;
          }
        }
      }
    }

    pre {
      margin: 0;
      padding: 16px;
      overflow-x: auto;
      background: rgba(0, 0, 0, 0.3);
    }

    code {
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
      font-size: 13px;
      line-height: 1.5;
    }

    :not(pre) > code {
      padding: 2px 6px;
      background: rgba(102, 126, 234, 0.08);
      border-radius: 4px;
      color: #e0aaff;
      font-size: 13px;
    }

    // Mermaid 图表样式
    .mermaid-chart-container {
      margin: 16px 0;
      border-radius: 8px;
      border: 1px solid $bd;
      overflow: hidden;

      .mermaid-chart-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 12px;
        background: $bc;
        border-bottom: 1px solid $bd;

        .chart-type-label {
          font-size: 12px;
          font-weight: 600;
          color: $t2;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .chart-actions {
          display: flex;
          gap: 4px;

          .chart-action-btn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 11px;
            padding: 3px 10px;
            border: 1px solid $bd;
            border-radius: 4px;
            background: transparent;
            color: $t2;
            cursor: pointer;
            transition: all 0.15s;
            white-space: nowrap;

            &:hover {
              background: rgba(102, 126, 234, 0.1);
              color: $a;
              border-color: $a;
            }

            svg {
              flex-shrink: 0;
            }
          }
        }
      }

      .mermaid {
        padding: 20px;
        overflow-x: auto;
        text-align: center;
        background: $bc;

        svg {
          max-width: 100%;
          height: auto;
        }
      }
    }
  }

  // 图表放大弹窗
  .chart-dialog-body {
    text-align: center;
    overflow-x: auto;
    padding: 8px 0;
    background: $bg;

    svg {
      max-width: 100%;
      height: auto;
    }
  }

  @media (max-width: 768px) {
    .editor-main {
      flex-direction: column;
      &.split {
        .editor-pane,
        .preview-pane {
          height: 50%;
        }
      }
    }
    .editor-pane {
      border-right: none;
      border-bottom: 1px solid $bd;
    }
    .toolbar-left {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
  }
</style>
