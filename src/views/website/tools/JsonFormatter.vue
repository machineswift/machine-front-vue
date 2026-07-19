<template>
  <div class="json-page">
    <AppHeader :tool-categories="toolCategories" :nav-items="[]" active-section="" @scroll-to-top="goHome" @go-to-login="goToLogin" @go-to-home="goToHome" />

    <!-- 顶部操作栏 -->
    <div class="json-toolbar">
      <div class="toolbar-left">
        <!-- 更多操作下拉 -->
        <div class="tb-dropdown">
          <button class="tb-btn" @click="moreOpen = !moreOpen" title="更多操作">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
              <path
                d="M22.7,19L13.6,9.9C14.5,7.6 14,4.9 12.1,3C10.1,1 7.1,0.6 4.7,1.7L9,6L6,9L1.6,4.7C0.4,7.1 0.9,10.1 2.9,12.1C4.8,14 7.5,14.5 9.8,13.6L18.9,22.7C19.3,23.1 19.9,23.1 20.3,22.7L22.6,20.4C23.1,20 23.1,19.3 22.7,19Z"
              />
            </svg>
            工具
            <svg class="dd-arrow" viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
              <path d="M7.41,8.59L12,13.17L16.59,8.59L18,10L12,16L6,10L7.41,8.59Z" />
            </svg>
          </button>
          <div v-if="moreOpen" class="tb-dropdown-menu" @click="moreOpen = false">
            <button class="dd-item" @click.stop="loadSample">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
              </svg>
              加载示例
            </button>
            <button class="dd-item" @click.stop="importFile">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              导入文件
            </button>
            <button class="dd-item" @click.stop="downloadJson">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" /></svg>
              导出下载
            </button>
            <div class="dd-divider"></div>
            <button class="dd-item dd-danger" @click.stop="clearAll">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
              清空全部
            </button>
          </div>
        </div>

        <div class="tb-separator"></div>

        <div class="tb-btn-group">
          <button class="tb-btn" @click="formatJson" title="格式化 (Alt+F)">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M3,3H21V5H3V3M9,7H21V9H9V7M3,11H21V13H3V11M9,15H21V17H9V15M3,19H21V21H3V19Z" />
            </svg>
            格式化
          </button>
          <button class="tb-btn" @click="compressJson" title="压缩">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z" />
            </svg>
            压缩
          </button>
          <button class="tb-btn" :class="{ active: sortEnabled }" @click="toggleSort" title="排序键">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path
                d="M3,18H9V16H3V18M3,6V8H15V6H3M3,13H12V11H3V13M21,13H17V20L15,18H14L16.5,21L19,18H18V20H21V13M21,6L18.5,3L16,6H17V8H21V6M17,8H19.5L17,10.5V8Z"
              />
            </svg>
            排序
          </button>
          <button class="tb-btn" :class="{ active: autoDecode }" @click="toggleAutoDecode" title="自动解码嵌套JSON">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M16.59,5.59L18,7L13,12L18,17L16.59,18.41L10.59,12.41L9.17,12L10.59,10.59L16.59,4.59M6,19H4V5H6V19Z" />
            </svg>
            自动解码
          </button>
        </div>
      </div>

      <div class="tb-search">
        <button
          class="tb-search-target"
          :class="{ left: searchTarget === 'input' }"
          @click="toggleSearchTarget"
          :title="searchTarget === 'output' ? '搜索右侧输出' : '搜索左侧输入'"
        >
          {{ searchTarget === 'output' ? '右侧' : '左侧' }}
        </button>
        <input
          v-model="searchText"
          class="tb-search-input"
          :placeholder="searchTarget === 'output' ? '搜索右侧JSON' : '搜索左侧JSON'"
          @input="onSearchInput"
          @keydown.enter="searchNext"
        />
        <span v-if="searchMatchCount > 0" class="tb-search-count">
          <span class="tb-sc-current">{{ searchCurrentIndex + 1 }}</span>
          /{{ searchMatchCount }}
        </span>
        <span v-else-if="searchText && searchMatchCount === 0" class="tb-search-count no-match">0</span>
        <template v-if="searchMatchCount > 1">
          <button class="tb-sc-btn" @click="searchPrev" :title="'上一个'">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M15.41,7.41L14,6L8,12L14,18L15.41,16.59L10.83,12Z" /></svg>
          </button>
          <button class="tb-sc-btn" @click="searchNext" :title="'下一个'">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M8.59,16.59L10,18L16,12L10,6L8.59,7.41L13.17,12Z" /></svg>
          </button>
        </template>
      </div>

      <div class="toolbar-right">
        <div v-if="jsonSizeInfo.outputChars > 0" class="tb-size-info">
          <span class="si-size">{{ formatSize(jsonSizeInfo.outputChars) }}</span>
          <span class="si-sep">|</span>
          <span class="si-lines">{{ jsonSizeInfo.outputLines }} 行</span>
        </div>
        <button class="tb-btn" @click="expandAllTree" title="展开全部">展开</button>
        <button class="tb-btn" @click="collapseAllTree" title="折叠全部">折叠</button>
        <button class="tb-btn" @click="copyOutput" title="复制结果">复制</button>
      </div>
    </div>

    <!-- 主体区域 -->
    <div class="json-main">
      <!-- 输入面板 -->
      <div class="json-panel input-panel">
        <div class="panel-editor" ref="inputEditorRef" @dragover.prevent @drop.prevent="onDrop"></div>
        <div v-if="errorMsg" class="panel-error">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12,2L1,21H23M12,6L19.5,19H4.5M11,10V14H13V10M11,16V18H13V16" /></svg>
          <span>{{ errorMsg }}</span>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="json-divider" @mousedown="startResize">
        <div class="divider-handle">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M3,9H17V7H3V9M3,13H17V11H3V13M3,17H17V15H3V17M19,17H21V15H19V17M19,7V9H21V7H19M19,13H21V11H19V13Z" />
          </svg>
        </div>
      </div>

      <!-- 输出面板 -->
      <div class="json-panel output-panel">
        <div class="panel-tree">
          <div class="tree-scroll">
            <JsonTree
              :key="'tree-' + searchText"
              ref="treeRef"
              :data="treeData"
              :search="searchText"
              :path="'$'"
              @update:data="onTreeUpdate"
              @copy="handleTreeCopy"
            />
          </div>
        </div>

        <div v-if="treeData.length === 0 && outputText" class="panel-empty">树形视图暂不支持该数据类型（仅对象/数组可展示）</div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <div class="json-toast" :class="{ show: toastVisible }">{{ toastMessage }}</div>

    <AppLogin v-model:visible="showLogin" @login-success="goToHome" />
  </div>
</template>

<script setup lang="ts">
  /* eslint-disable @typescript-eslint/no-explicit-any */
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import { useRouter } from 'vue-router'
  import AppHeader from '@/views/website/components/AppHeader.vue'
  import AppLogin from '@/views/admin/auth/AppLogin.vue'
  import { toolCategories } from '@/shared/constants/Portal.constant'
  import JsonTree from './JsonTree.vue'
  // ========== CodeMirror 导入 ==========
  import { EditorView, basicSetup } from 'codemirror'
  import { EditorState, StateEffect, StateField } from '@codemirror/state'
  import { json } from '@codemirror/lang-json'
  import { oneDark } from '@codemirror/theme-one-dark'
  import { keymap, Decoration } from '@codemirror/view'
  import { defaultKeymap, indentWithTab } from '@codemirror/commands'

  const router = useRouter()
  const showLogin = ref(false)

  // ========== 核心状态 ==========
  const indentSize = ref(2)
  const sortEnabled = ref(false)
  const autoDecode = ref(false)
  const errorMsg = ref('')
  const toastVisible = ref(false)
  const toastMessage = ref('')

  // 文本内容
  const outputText = ref('')

  // JSON 大小信息
  const jsonSizeInfo = ref({ inputChars: 0, outputChars: 0, inputLines: 0, outputLines: 0 })

  // 树形
  const treeData = ref<any[]>([])
  const filteredTreeData = ref<any[]>([])

  // 更多操作下拉
  const moreOpen = ref(false)
  const treeRef = ref<any>(null)

  // 点击外部关闭下拉
  function onDocClickForMore(e: MouseEvent) {
    if (moreOpen.value) {
      const el = (e.target as HTMLElement).closest('.tb-dropdown')
      if (!el) moreOpen.value = false
    }
  }
  onMounted(() => document.addEventListener('click', onDocClickForMore))
  onBeforeUnmount(() => document.removeEventListener('click', onDocClickForMore))

  // 搜索
  const searchText = ref('')
  const searchTarget = ref<'output' | 'input'>('output')
  const searchMatchCount = ref(0)
  const searchCurrentIndex = ref(0)

  // CodeMirror
  const inputEditorRef = ref<HTMLDivElement | null>(null)
  let inputCmView: EditorView | null = null
  let changeTimer: ReturnType<typeof setTimeout> | null = null
  let searchTimer: ReturnType<typeof setTimeout> | null = null
  let toastTimer: ReturnType<typeof setTimeout> | null = null

  // ========== JSON 解析（支持 BigInt） ==========
  function parseJsonSafe(text: string): { result: any; error: string | null } {
    try {
      return { result: JSON.parse(text), error: null }
    } catch {
      try {
        const result = JSON.parse(text, (_k, v) => {
          if (typeof v === 'string' && /^-?\d{17,}$/.test(v)) return v
          if (typeof v === 'string' && /^-?\d+$/.test(v) && v.length >= 16) {
            try {
              return BigInt(v).toString()
            } catch {
              return v
            }
          }
          return v
        })
        return { result, error: null }
      } catch (e: any) {
        return { result: null, error: e.message || 'JSON 语法错误' }
      }
    }
  }

  function stringifyJsonSafe(obj: any, indent: number): string {
    const seen = new WeakSet()
    return JSON.stringify(
      obj,
      (_k, v) => {
        if (typeof v === 'object' && v !== null) {
          if (seen.has(v)) return '[Circular]'
          seen.add(v)
        }
        return v
      },
      indent > 0 ? indent : undefined
    )
  }

  // ========== 核心格式化 ==========
  function getInputText(): string {
    return inputCmView ? inputCmView.state.doc.toString() : ''
  }

  function resetOutput() {
    outputText.value = ''
    treeData.value = []
    filteredTreeData.value = []
    jsonSizeInfo.value = { inputChars: 0, outputChars: 0, inputLines: 0, outputLines: 0 }
  }

  function doFormat(): string {
    const text = getInputText().trim()
    if (!text) {
      errorMsg.value = ''
      resetOutput()
      return ''
    }

    const { result, error } = parseJsonSafe(text)
    if (error) {
      errorMsg.value = error
      resetOutput()
      return ''
    }

    errorMsg.value = ''
    let data = result
    if (autoDecode.value && typeof data === 'object' && data !== null) data = deepUnescapeValue(data)
    if (sortEnabled.value) data = sortKeys(data)

    try {
      const formatted = stringifyJsonSafe(data, indentSize.value)
      outputText.value = formatted

      jsonSizeInfo.value = {
        inputChars: text.length,
        outputChars: formatted.length,
        inputLines: text.split('\n').length,
        outputLines: formatted.split('\n').length
      }

      const isLarge = formatted.length > 100 * 1024
      if (typeof data === 'object' && data !== null) {
        if (isLarge) {
          setTimeout(() => buildTreeDataLazy(data), 0)
        } else {
          buildTreeData(data)
        }
      } else {
        treeData.value = []
        filteredTreeData.value = []
      }
      return formatted
    } catch (e: any) {
      errorMsg.value = e.message || '格式化失败'
      resetOutput()
      return ''
    }
  }

  function deepUnescapeValue(v: any): any {
    if (typeof v === 'string') {
      try {
        return JSON.parse(v)
      } catch {
        return v
      }
    }
    if (v !== null && typeof v === 'object') {
      if (Array.isArray(v)) return v.map(deepUnescapeValue)
      const r: Record<string, any> = {}
      for (const [k, val] of Object.entries(v)) r[k] = deepUnescapeValue(val)
      return r
    }
    return v
  }

  function sortKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj
    if (Array.isArray(obj)) return obj.map(sortKeys)
    const r: Record<string, any> = {}
    for (const k of Object.keys(obj).sort()) r[k] = sortKeys(obj[k])
    return r
  }

  // ========== 操作 ==========
  function formatJson() {
    if (doFormat()) showToast('格式化完成')
  }
  function compressJson() {
    const old = indentSize.value
    indentSize.value = 0
    const r = doFormat()
    indentSize.value = old
    if (r) showToast('已压缩')
  }
  function toggleSort() {
    sortEnabled.value = !sortEnabled.value
    formatJson()
  }
  function toggleAutoDecode() {
    autoDecode.value = !autoDecode.value
    formatJson()
  }

  // ========== 树形数据 ==========
  interface TreeNode {
    key: string
    value: any
    type: string
    path: string
    children: TreeNode[]
    collapsed: boolean
    depth: number
    isLast: boolean
    size?: number
  }

  function buildTreeData(obj: any) {
    treeData.value = buildNodes(obj, '$', 0)
    filteredTreeData.value = treeData.value
  }

  function buildTreeDataLazy(obj: any) {
    const top = buildNodes(obj, '$', 0, true)
    treeData.value = top
    filteredTreeData.value = top
    setTimeout(() => {
      const full = buildNodes(obj, '$', 0)
      mergeTreeData(treeData.value, full)
    }, 100)
  }

  function mergeTreeData(target: TreeNode[], source: TreeNode[]) {
    for (let i = 0; i < source.length && i < target.length; i++) {
      target[i].children = source[i].children
      if (target[i].children.length > 0 && !target[i].collapsed) mergeTreeData(target[i].children, source[i].children)
    }
  }

  function buildNodes(obj: any, path: string, depth: number, topLevelOnly?: boolean): TreeNode[] {
    if (obj === null || typeof obj !== 'object') return []
    const isArr = Array.isArray(obj)
    const entries = isArr ? obj.map((v: any, i: number) => [`[${i}]`, v] as [string, any]) : Object.entries(obj)
    const limit = topLevelOnly ? 500 : entries.length
    return entries.slice(0, limit).map(([key, value], idx) => {
      const cleanKey = isArr ? key.replace(/[[\]]/g, '') : key
      const nodePath = path + (isArr ? `[${cleanKey}]` : `.${key}`)
      const type = getType(value)
      const hasChildren = type === 'object' || type === 'array'
      const node: TreeNode = {
        key: cleanKey,
        value: hasChildren ? undefined : value,
        type,
        path: nodePath,
        children: [],
        collapsed: depth > 2,
        depth,
        isLast: idx === entries.length - 1
      }
      if (hasChildren) {
        const co = value as any
        node.size = isArr ? co.length : Object.keys(co).length
        if (!topLevelOnly) node.children = buildNodes(co, nodePath, depth + 1)
      }
      return node
    })
  }

  function getType(value: any): string {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    const t = typeof value
    if (t === 'object') return 'object'
    if (t === 'string') return 'string'
    if (t === 'number') return 'number'
    if (t === 'boolean') return 'boolean'
    return 'string'
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  // ========== 搜索 ==========
  function escapeRegex(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  function expandTreeForSearch(nodes: TreeNode[], search: string) {
    if (!search) return
    const q = search.toLowerCase()
    function walk(list: TreeNode[]): boolean {
      let hasMatch = false
      for (const n of list) {
        const selfMatch = n.key.toLowerCase().includes(q) || (n.value !== undefined && String(n.value).toLowerCase().includes(q))
        const childMatch = n.children.length > 0 ? walk(n.children) : false
        if (selfMatch || childMatch) hasMatch = true
        if (childMatch) n.collapsed = false
      }
      return hasMatch
    }
    walk(nodes)
    // 触发响应式更新
    treeData.value = [...treeData.value]
  }

  function collectTreeMatchPaths(nodes: TreeNode[], search: string): string[] {
    if (!search || !nodes.length) return []
    const q = search.toLowerCase()
    const paths: string[] = []
    function walk(list: TreeNode[]) {
      for (const n of list) {
        const match = n.key.toLowerCase().includes(q) || (n.value !== undefined && String(n.value).toLowerCase().includes(q))
        if (match) paths.push(n.path)
        if (n.children.length) walk(n.children)
      }
    }
    walk(nodes)
    return paths
  }

  function scrollToTreePath(path: string) {
    if (!treeRef.value) return
    // 通过 expandAll 确保目标节点可见后滚动
    const el = treeRef.value.$el?.querySelector(`[data-path="${CSS.escape(path)}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function toggleSearchTarget() {
    searchTarget.value = searchTarget.value === 'output' ? 'input' : 'output'
    // 切换搜索目标立即执行，不需要防抖
    if (searchTimer) clearTimeout(searchTimer)
    doSearch()
  }

  const searchMark = Decoration.mark({ class: 'cm-search-hl' })
  let inputMatchRanges: { from: number; to: number }[] = []
  let treeMatchPaths: string[] = []
  const setSearchDeco = StateEffect.define<any>()

  const searchDecoField = StateField.define<any>({
    create() {
      return Decoration.none
    },
    update(decos, tr) {
      for (const e of tr.effects) {
        if (e.is(setSearchDeco)) return e.value
      }
      return decos.map(tr.changes)
    },
    provide: f => EditorView.decorations.from(f)
  })

  function updateInputSearch(search: string) {
    if (!inputCmView) return
    if (!search) {
      inputCmView.dispatch({ effects: setSearchDeco.of(Decoration.none) })
      return
    }
    const regex = new RegExp(escapeRegex(search), 'gi')
    const doc = inputCmView.state.doc
    const decorations: any[] = []
    inputMatchRanges = []
    for (let i = 1; i <= doc.lines; i++) {
      const line = doc.line(i)
      let match
      while ((match = regex.exec(line.text)) !== null) {
        const from = line.from + match.index
        const to = from + match[0].length
        decorations.push(searchMark.range(from, to))
        inputMatchRanges.push({ from, to })
      }
    }
    inputCmView.dispatch({ effects: setSearchDeco.of(Decoration.set(decorations)) })
  }

  function countMatches(text: string, search: string): number {
    if (!search || !text) return 0
    const regex = new RegExp(escapeRegex(search), 'gi')
    const matches = text.match(regex)
    return matches ? matches.length : 0
  }

  function doSearch() {
    const text = searchTarget.value === 'output' ? outputText.value : getInputText()
    searchMatchCount.value = countMatches(text, searchText.value)
    searchCurrentIndex.value = 0

    if (searchTarget.value === 'input') {
      updateInputSearch(searchText.value)
    }

    if (searchTarget.value === 'output') {
      if (searchText.value) {
        collapseAllTree()
      }
      treeMatchPaths = collectTreeMatchPaths(treeData.value, searchText.value)
      expandTreeForSearch(treeData.value, searchText.value)
    }
  }

  function onSearchInput() {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => doSearch(), 300)
  }

  function flushSearch() {
    if (searchTimer) {
      clearTimeout(searchTimer)
      searchTimer = null
      doSearch()
    }
  }

  function searchGo(delta: number) {
    flushSearch()
    if (searchMatchCount.value === 0) return
    const n = (searchCurrentIndex.value + delta + searchMatchCount.value) % searchMatchCount.value
    searchCurrentIndex.value = n

    if (searchTarget.value === 'input' && inputMatchRanges[n]) {
      const { from, to } = inputMatchRanges[n]
      inputCmView?.dispatch({
        selection: { anchor: from, head: to },
        scrollIntoView: true
      })
    }
    if (searchTarget.value === 'output' && treeMatchPaths[n]) {
      scrollToTreePath(treeMatchPaths[n])
    }
  }
  function searchNext() {
    searchGo(1)
  }
  function searchPrev() {
    searchGo(-1)
  }

  function expandAllTree() {
    function walk(list: TreeNode[]) {
      for (const n of list) {
        n.collapsed = false
        if (n.children.length) walk(n.children)
      }
    }
    walk(treeData.value)
    treeData.value = [...treeData.value]
  }

  function collapseAllTree() {
    function walk(list: TreeNode[], depth: number) {
      for (const n of list) {
        if (depth >= 0) n.collapsed = true
        if (n.children.length) walk(n.children, depth + 1)
      }
    }
    walk(treeData.value, 0)
    treeData.value = [...treeData.value]
  }

  function onTreeUpdate(newData: TreeNode[]) {
    treeData.value = newData
    filteredTreeData.value = newData
    try {
      const obj = treeToObject(newData)
      const json = stringifyJsonSafe(obj, indentSize.value)
      outputText.value = json
    } catch {
      /* ignore */
    }
  }

  function treeToObject(nodes: TreeNode[]): any {
    if (!nodes.length) return undefined
    const isArr = nodes.every(n => /^\d+$/.test(n.key))
    if (isArr) {
      const a: any[] = []
      for (const n of nodes) a[parseInt(n.key)] = n.children.length > 0 ? treeToObject(n.children) : pv(n)
      return a
    }
    const o: Record<string, any> = {}
    for (const n of nodes) o[n.key] = n.children.length > 0 ? treeToObject(n.children) : pv(n)
    return o
  }

  function pv(n: TreeNode): any {
    if (n.type === 'null') return null
    if (n.type === 'boolean') return n.value === 'true' || n.value === true
    if (n.type === 'number') {
      const s = String(n.value)
      return /^\d{17,}$/.test(s) ? s : Number(s)
    }
    return n.value
  }

  // ========== 复制 ==========
  function handleTreeCopy(type: string, path: string, value?: any) {
    const t =
      type === 'path'
        ? path
        : type === 'key'
          ? path.replace(/^.*[.[]/, '').replace(/[[\]]/g, '') || path
          : typeof value === 'object'
            ? stringifyJsonSafe(value, 2)
            : String(value)
    navigator.clipboard.writeText(t).then(() => showToast('已复制'))
  }
  function copyOutput() {
    if (!outputText.value) return
    navigator.clipboard.writeText(outputText.value).then(() => showToast('已复制到剪贴板'))
  }

  // ========== 文件 ==========
  function importFile() {
    const el = document.createElement('input')
    el.type = 'file'
    el.accept = '.json,.txt'
    el.onchange = (e: Event) => {
      const f = (e.target as HTMLInputElement).files?.[0]
      if (!f) return
      const r = new FileReader()
      r.onload = () => {
        setInputText(r.result as string)
        showToast('已加载: ' + f.name)
        formatJson()
      }
      r.readAsText(f)
    }
    el.click()
  }

  function onDrop(e: DragEvent) {
    const f = e.dataTransfer?.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = () => {
      setInputText(r.result as string)
      showToast('已加载: ' + f.name)
      formatJson()
    }
    r.readAsText(f)
  }

  function downloadJson() {
    if (!outputText.value) {
      showToast('没有可下载的内容')
      return
    }
    const b = new Blob([outputText.value], { type: 'application/json' })
    const u = URL.createObjectURL(b)
    const a = document.createElement('a')
    a.href = u
    a.download = 'formatted-' + Date.now() + '.json'
    a.click()
    URL.revokeObjectURL(u)
    showToast('已下载')
  }

  function loadSample() {
    const sample = {
      webapp: {
        'tool-name': '在线JSON格式化工具',
        version: '2.0.0',
        features: ['动态搜索与节点折叠', '数组内容筛选', '时间戳解析', '节点路径复制', '可视化编辑'],
        config: { maxConnections: 100, timeout: 30000, debug: false, 'big-number': '12345678901234567890' },
        timestamp: 1758048279000000,
        nested: '{"inner":"嵌套JSON字符串","number":42}'
      }
    }
    setInputText(stringifyJsonSafe(sample, 2))
    showToast('示例已加载')
    formatJson()
  }

  function clearAll() {
    searchText.value = ''
    searchMatchCount.value = 0
    searchCurrentIndex.value = 0
    updateInputSearch('')
    setInputText('')
    outputText.value = ''
    treeData.value = []
    filteredTreeData.value = []
    errorMsg.value = ''
    showToast('已清空')
  }

  // ========== CodeMirror ==========
  function setInputText(text: string) {
    if (inputCmView) inputCmView.dispatch({ changes: { from: 0, to: inputCmView.state.doc.length, insert: text } })
  }

  function initEditor() {
    if (!inputEditorRef.value) return
    const ul = EditorView.updateListener.of(update => {
      if (update.docChanged) {
        if (changeTimer) clearTimeout(changeTimer)
        const len = update.state.doc.length
        const delay = len > 200 * 1024 ? 2000 : len > 50 * 1024 ? 1200 : 600
        changeTimer = setTimeout(() => doFormat(), delay)
      }
    })
    const state = EditorState.create({
      doc: '',
      extensions: [
        basicSetup,
        json(),
        oneDark,
        EditorView.theme({
          '&': { backgroundColor: '#0f0f11', height: '100%' },
          '.cm-scroller': { fontFamily: "'SF Mono','Fira Code','JetBrains Mono',monospace", fontSize: '13px', lineHeight: '1.6' },
          '.cm-content': { padding: '12px 16px' },
          '.cm-gutters': { borderRight: '1px solid rgba(255,255,255,0.04)', backgroundColor: 'rgba(0,0,0,0.15)' },
          '.cm-lineNumbers .cm-gutterElement': { padding: '0 8px 0 4px', color: 'rgba(255,255,255,0.2)', fontSize: '11px' },
          '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,0.02)' },
          '.cm-cursor': { borderLeftColor: 'rgba(255,255,255,0.6) !important' },
          '.cm-selectionBackground': { backgroundColor: 'rgba(102,126,234,0.2) !important' },
          '.cm-focused': { outline: 'none' }
        }),
        keymap.of([...defaultKeymap, indentWithTab]),
        EditorView.lineWrapping,
        searchDecoField,
        ul
      ]
    })
    inputCmView = new EditorView({ state, parent: inputEditorRef.value })
  }

  // ========== 计算 ==========
  // ========== Toast ==========
  function showToast(msg: string) {
    toastMessage.value = msg
    toastVisible.value = true
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toastVisible.value = false
    }, 2000)
  }

  // ========== 分隔线 ==========
  let isResizing = false
  function startResize(_e: MouseEvent) {
    isResizing = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    const mv = (ev: MouseEvent) => {
      if (!isResizing) return
      const c = (ev.target as HTMLElement).closest('.json-main') as HTMLElement
      if (!c) return
      const r = c.getBoundingClientRect()
      c.style.setProperty('--split', Math.max(25, Math.min(75, ((ev.clientX - r.left) / r.width) * 100)) + '%')
    }
    const up = () => {
      isResizing = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', mv)
      document.removeEventListener('mouseup', up)
    }
    document.addEventListener('mousemove', mv)
    document.addEventListener('mouseup', up)
  }

  // ========== 快捷键 ==========
  function handleKeydown(e: KeyboardEvent) {
    if ((e.altKey || e.metaKey) && e.key === 'f') {
      e.preventDefault()
      formatJson()
    }
  }

  // ========== 导航 ==========
  const goHome = () => router.push('/')
  const goToLogin = () => {
    showLogin.value = true
  }
  const goToHome = () => router.push('/admin/home')

  // ========== 生命周期 ==========
  onMounted(() => {
    initEditor()
    document.addEventListener('keydown', handleKeydown)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeydown)
    if (changeTimer) clearTimeout(changeTimer)
    if (toastTimer) clearTimeout(toastTimer)
    inputCmView?.destroy()
    inputCmView = null
  })
</script>

<style scoped lang="scss">
  $bg: var(--portal-bg);
  $bc: var(--portal-bc);
  $bd: var(--portal-bd);
  $t1: var(--portal-t1);
  $t2: var(--portal-t2);
  $t3: var(--portal-t3);
  $a: #667eea;
  $err: #f56c6c;
  $succ: #67c23a;

  .json-page {
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
  .json-toolbar {
    position: relative;
    flex-shrink: 0;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    background: $bc;
    border-bottom: 1px solid $bd;
    gap: 6px;
  }
  .toolbar-left,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .tb-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    height: 28px;
    background: none;
    border: 1px solid transparent;
    border-radius: 5px;
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
    &.active {
      background: rgba(102, 126, 234, 0.1);
      color: $a;
      border-color: rgba(102, 126, 234, 0.2);
    }
    svg {
      flex-shrink: 0;
    }
  }
  .tb-btn-primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    border: none;
    &:hover {
      opacity: 0.9;
      color: #fff;
    }
  }
  .tb-btn-sm {
    padding: 3px 6px;
    height: 26px;
    font-size: 11px;
  }
  .tb-btn-icon {
    padding: 4px 6px;
  }
  .tb-btn-group {
    display: flex;
    gap: 1px;
    .tb-btn {
      border-radius: 3px;
    }
  }
  .tb-separator {
    width: 1px;
    height: 20px;
    background: $bd;
    margin: 0 2px;
    flex-shrink: 0;
  }
  .json-main {
    flex: 1;
    display: flex;
    overflow: hidden;
    --split: 50%;
  }
  .json-panel {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: var(--split, 50%);
    min-width: 0;
  }
  .input-panel,
  .output-panel {
    background: $bg;
  }
  .panel-editor {
    flex: 1;
    overflow: hidden;
    :deep(.cm-editor) {
      height: 100%;
      background: $bg !important;
    }
    :deep(.cm-gutters) {
      background: $bc !important;
    }
  }
  .panel-output {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .output-loading {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: $t3;
    font-size: 13px;
  }
  .ol-spinner {
    width: 28px;
    height: 28px;
    border: 2px solid $bd;
    border-top-color: $a;
    border-radius: 50%;
    animation: ol-spin 0.7s linear infinite;
  }

  .tb-size-info {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 2px 10px;
    margin-right: 8px;
    font-size: 11px;
    font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
    background: rgba(102, 126, 234, 0.08);
    border: 1px solid rgba(102, 126, 234, 0.15);
    border-radius: 5px;
    color: $t2;
    white-space: nowrap;
    .si-icon {
      opacity: 0.5;
      flex-shrink: 0;
    }
    .si-size {
      color: $a;
      font-weight: 500;
    }
    .si-sep {
      opacity: 0.2;
      font-size: 10px;
    }
    .si-lines {
      color: $t2;
    }
  }
  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }
  .tb-search {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: inline-flex;
    align-items: center;
    gap: 3px;
    height: 26px;
    min-width: 260px;
    max-width: 520px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid $bd;
    border-radius: 5px;
    transition: border-color 0.15s;
    &:focus-within {
      border-color: rgba(102, 126, 234, 0.3);
    }
  }
  .tb-dropdown {
    position: relative;
    flex-shrink: 0;
    .dd-arrow {
      transition: transform 0.15s;
      opacity: 0.5;
    }
    .tb-btn {
      padding: 4px 6px;
    }
  }
  .tb-dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    min-width: 140px;
    background: $bg;
    border: 1px solid $bd;
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    z-index: 100;
    .dd-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 6px 10px;
      background: none;
      border: none;
      border-radius: 5px;
      color: $t2;
      font-size: 12px;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.12s;
      white-space: nowrap;
      svg {
        flex-shrink: 0;
      }
      &:hover {
        background: $bc;
        color: $t1;
      }
      &.dd-danger {
        color: $err;
        &:hover {
          background: rgba(245, 108, 108, 0.08);
        }
      }
    }
    .dd-divider {
      height: 1px;
      margin: 4px 8px;
      background: $bd;
    }
  }
  .tb-search-target {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    margin-left: 2px;
    padding: 0;
    background: none;
    border: none;
    border-radius: 4px;
    color: $t2;
    font-size: 10px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.12s;
    &:hover {
      background: $bc;
      color: $t1;
    }
    &.left {
      color: $a;
      background: rgba(102, 126, 234, 0.1);
    }
  }
  .tb-search-input {
    flex: 1;
    min-width: 180px;
    max-width: 400px;
    height: 22px;
    padding: 0 8px;
    background: none;
    border: none;
    outline: none;
    color: $t1;
    font-size: 12px;
    font-family: inherit;
    &::placeholder {
      color: $t3;
    }
  }
  .tb-search-count {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 0 4px;
    font-size: 10px;
    color: $t2;
    font-family: 'SF Mono', 'Fira Code', monospace;
    white-space: nowrap;
    .tb-sc-current {
      color: $a;
      font-weight: 600;
    }
    &.no-match {
      color: $err;
    }
  }
  .tb-sc-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    margin-right: 2px;
    background: none;
    border: none;
    border-radius: 3px;
    color: $t2;
    cursor: pointer;
    transition: all 0.12s;
    &:hover {
      background: rgba(255, 255, 255, 0.06);
      color: $t1;
    }
    svg {
      flex-shrink: 0;
    }
  }
  .search-hl {
    background: rgba(255, 204, 0, 0.25);
    color: inherit;
    border-radius: 2px;
    padding: 0 1px;
  }
  :deep(.cm-search-hl) {
    background: rgba(255, 180, 0, 0.3) !important;
    border-bottom: 2px solid #ff9900 !important;
    border-radius: 1px;
  }
  .tb-fold-actions {
    display: flex;
    gap: 2px;
    margin-right: 6px;
    padding-right: 6px;
    border-right: 1px solid $bd;
    .tfa-btn {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 2px 6px;
      height: 24px;
      background: none;
      border: 1px solid transparent;
      border-radius: 4px;
      color: $t2;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.12s;
      white-space: nowrap;
      &:hover {
        background: rgba(102, 126, 234, 0.08);
        border-color: rgba(102, 126, 234, 0.12);
        color: $t1;
      }
      svg {
        flex-shrink: 0;
      }
    }
  }
  .cf-gutter {
    display: inline-block;
    width: 16px;
    margin-right: 2px;
    text-align: center;
    user-select: none;
  }
  .cf-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    padding: 0;
    margin: 0;
    background: none;
    border: none;
    border-radius: 3px;
    color: $t3;
    font-size: 9px;
    cursor: pointer;
    transition: all 0.12s;
    vertical-align: middle;
    line-height: 1;
    &:hover {
      background: rgba(102, 126, 234, 0.12);
      color: $a;
    }
  }
  .cf-ellipsis {
    user-select: none;
  }
  .cf-comment {
    color: $t3;
    font-style: italic;
    font-size: 11px;
  }
  .output-placeholder {
    color: $t3;
    font-size: 13px;
    text-align: center;
    padding: 40px 20px;
  }
  .panel-error {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(245, 108, 108, 0.08);
    border-top: 1px solid rgba(245, 108, 108, 0.15);
    color: $err;
    font-size: 12px;
    svg {
      flex-shrink: 0;
    }
  }
  .panel-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $t3;
    font-size: 13px;
  }
  .panel-tree {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: $bg;
  }
  .tree-scroll {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 4px 0;
  }
  .json-divider {
    flex-shrink: 0;
    width: 7px;
    cursor: col-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bc;
    border-left: 1px solid $bd;
    border-right: 1px solid $bd;
    transition: background 0.15s;
    position: relative;
    z-index: 5;
    &:hover {
      background: rgba(102, 126, 234, 0.1);
    }
    .divider-handle {
      display: flex;
      align-items: center;
      justify-content: center;
      color: $t3;
      opacity: 0.5;
    }
    &:hover .divider-handle {
      opacity: 1;
    }
  }
  .json-toast {
    position: fixed;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: $bg;
    border: 1px solid $bd;
    border-radius: 8px;
    padding: 8px 20px;
    font-size: 13px;
    color: $t1;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 9999;
    pointer-events: none;
    &.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
  @media (max-width: 768px) {
    .json-main {
      flex-direction: column;
      --split: 100% !important;
    }
    .json-divider {
      width: 100%;
      height: 6px;
      cursor: row-resize;
      .divider-handle {
        transform: rotate(90deg);
      }
    }
    .toolbar-left {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
  }
</style>
