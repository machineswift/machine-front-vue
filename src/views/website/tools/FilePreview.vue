<template>
  <div class="fp-page">
    <AppHeader :tool-categories="toolCategories" :nav-items="[]" active-section="" @scroll-to-top="goHome" @go-to-login="goToLogin" @go-to-home="goToHome" />

    <!-- ========== 顶部操作栏 ========== -->
    <div class="fp-toolbar">
      <div class="fp-toolbar-left">
        <!-- 文件下拉 -->
        <div class="tb-dropdown" ref="fileMenuRef">
          <button class="tb-btn" @click="fileMenuOpen = !fileMenuOpen" title="文件">
            文件
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div v-if="fileMenuOpen" class="tb-dropdown-menu dropdown-left" @click="fileMenuOpen = false">
            <button class="dd-item" @click.stop="showUrlInput = !showUrlInput">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
              粘贴链接
            </button>
            <button class="dd-item" @click.stop="triggerFileInput">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              打开文件
            </button>
            <div class="dd-divider"></div>
            <button class="dd-item" :disabled="!canDownload" @click.stop="downloadFile">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              下载
            </button>
            <button class="dd-item" @click.stop="printFile">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              打印
            </button>
          </div>
        </div>

        <input ref="fileInputRef" type="file" style="display: none" @change="onFileSelected" />
      </div>

      <!-- 文件信息 + 主题/下载/更多 -->
      <div v-if="currentFile" class="fp-file-info">
        <span class="fp-file-icon">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </span>
        <span class="fp-file-name">{{ currentFile.name }}</span>
        <span class="fp-file-ext">{{ getFileExt(currentFile.name) }}</span>
      </div>

      <div class="fp-toolbar-right">
        <!-- 最近打开 -->
        <button class="tb-btn" :class="{ active: showRecent }" @click="showRecent = !showRecent" title="最近打开">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          最近
        </button>

        <!-- 工具下拉 -->
        <div class="tb-dropdown" ref="moreDropdownRef">
          <button class="tb-btn" @click="moreOpen = !moreOpen" title="工具">
            工具
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div v-if="moreOpen" class="tb-dropdown-menu" @click="moreOpen = false">
            <button class="dd-item" @click.stop="zoomIn">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              放大
            </button>
            <button class="dd-item" @click.stop="zoomOut">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              缩小
            </button>
            <button class="dd-item" @click.stop="zoomReset">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
              </svg>
              重置缩放
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== URL 输入面板 ========== -->
    <div v-if="showUrlInput" class="fp-url-panel">
      <div class="fp-url-input-wrap">
        <input v-model="urlInput" class="fp-url-input" placeholder="输入文件链接（支持 PDF、Word、Excel、图片等）" @keydown.enter="loadFromUrl" />
        <button class="fp-url-btn" @click="loadFromUrl" :disabled="!urlInput.trim()">预览</button>
        <button class="fp-url-close" @click="showUrlInput = false">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- ========== 主体区域 ========== -->
    <div class="fp-main" :class="{ 'has-recent': showRecent }">
      <!-- 预览区域 -->
      <div class="fp-viewer" ref="viewerRef">
        <!-- 空状态 -->
        <div v-if="!currentFile && !loading" class="fp-empty">
          <div class="fp-empty-icon">
            <svg viewBox="0 0 80 80" width="80" height="80" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
              <path d="M50 10H20a4 4 0 00-4 4v52a4 4 0 004 4h40a4 4 0 004-4V24z" />
              <polyline points="50 10 50 24 64 24" />
              <line x1="28" y1="38" x2="52" y2="38" />
              <line x1="28" y1="46" x2="52" y2="46" />
              <line x1="28" y1="54" x2="40" y2="54" />
            </svg>
          </div>
          <h3>打开文件开始预览</h3>
          <p>支持 PDF、Word、Excel、PowerPoint、图片、音视频、CAD 等 200+ 格式</p>
        </div>

        <!-- 加载中 -->
        <div v-else-if="loading" class="fp-loading">
          <div class="fp-loading-spinner"></div>
          <p>{{ loadingText }}</p>
        </div>

        <!-- 错误提示 -->
        <div v-else-if="error" class="fp-error">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <h3>预览失败</h3>
          <p>{{ error }}</p>
          <button class="fp-retry-btn" @click="retry">重试</button>
        </div>

        <!-- FileViewer 组件 -->
        <div v-show="currentFile && !loading && !error" class="fp-viewer-container">
          <FileViewer
            ref="fvRef"
            v-if="previewUrl || previewFile"
            :key="viewerKey"
            :url="previewUrl"
            :file="previewFile"
            :options="viewerOptions"
            @load-complete="onLoadComplete"
            @load-error="onLoadError"
          />
        </div>
      </div>

      <!-- 最近打开侧栏 -->
      <Transition name="slide">
        <div v-if="showRecent" class="fp-recent">
          <div class="fp-recent-header">
            <h3>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              最近打开
            </h3>
            <button class="fp-recent-close" @click="showRecent = false">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>
          <div class="fp-recent-list">
            <div v-for="(item, idx) in recentFiles" :key="idx" class="fp-recent-item" @click="openRecent(item)">
              <div class="fp-recent-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div class="fp-recent-info">
                <strong>{{ item.name }}</strong>
                <span>{{ getFileExt(item.name) }}</span>
              </div>
              <button class="fp-recent-remove" @click.stop="removeRecent(idx)" title="移除">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>
          </div>
          <div v-if="recentFiles.length === 0" class="fp-recent-empty">
            <p>暂无最近打开的文件</p>
          </div>
        </div>
      </Transition>
    </div>

    <AppLogin v-model:visible="showLogin" @login-success="goToHome" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
  import { useRouter } from 'vue-router'
  import AppHeader from '@/views/website/components/AppHeader.vue'
  import AppLogin from '@/views/admin/auth/AppLogin.vue'
  import { toolCategories } from '@/shared/constants/Portal.constant'

  // @file-viewer/vue3-full 已内置 preset-all，无需额外传入 preset
  import { FileViewer, type ViewerOptions } from '@file-viewer/vue3-full'
  import { usePortalTheme } from '@/views/website/composables/usePortalTheme'

  const { isDark } = usePortalTheme()

  const router = useRouter()
  const goHome = () => router.push('/')
  const goToLogin = () => {
    showLogin.value = true
  }
  const goToHome = () => router.push('/admin/home')
  const showLogin = ref(false)

  // ========== 状态 ==========
  const fileInputRef = ref<HTMLInputElement | null>(null)
  const fvRef = ref<{
    download?: () => void
    print?: () => void
    zoomIn?: () => void
    zoomOut?: () => void
    zoomReset?: () => void
  } | null>(null)
  const moreDropdownRef = ref<HTMLElement | null>(null)
  const fileMenuRef = ref<HTMLElement | null>(null)

  const showUrlInput = ref(false)
  const urlInput = ref('')
  const showRecent = ref(false)
  const moreOpen = ref(false)
  const fileMenuOpen = ref(false)
  const loading = ref(false)
  const loadingText = ref('正在加载文件...')
  const error = ref('')
  const viewerKey = ref(0)

  interface FileItem {
    name: string
    url?: string
    file?: File
  }

  const currentFile = ref<FileItem | null>(null)
  const recentFiles = ref<FileItem[]>([])

  // 传递给 FileViewer 组件的 props
  const previewUrl = computed(() => currentFile.value?.url || undefined)
  const previewFile = computed(() => currentFile.value?.file || undefined)

  const canDownload = computed(() => !!currentFile.value)

  const viewerOptions: ViewerOptions = {
    theme: isDark.value ? 'dark' : 'light',
    styleIsolation: 'shadow',
    toolbar: false,
    archive: {
      maxArchiveSize: 2 * 1024 * 1024 * 1024,
      maxEntryPreviewSize: 256 * 1024 * 1024
    }
  }

  // ========== 方法 ==========

  function getFileExt(name: string): string {
    const ext = name.split('.').pop()?.toUpperCase() || ''
    return ext
  }

  function triggerFileInput() {
    fileInputRef.value?.click()
  }

  function onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    error.value = ''
    loading.value = true
    loadingText.value = `正在准备文件 ${file.name}...`
    currentFile.value = { name: file.name, file }
    viewerKey.value++
    addToRecent(file.name)
    input.value = ''
  }

  function loadFromUrl() {
    const url = urlInput.value.trim()
    if (!url) return

    error.value = ''
    loading.value = true
    loadingText.value = '正在下载文件资源...'
    const name = url.split('/').pop() || 'document'
    currentFile.value = { name, url }
    viewerKey.value++
    addToRecent(name)
    showUrlInput.value = false
    urlInput.value = ''
  }

  function addToRecent(name: string) {
    showRecent.value = true
    recentFiles.value = recentFiles.value.filter(r => r.name !== name)
    recentFiles.value.unshift({ name })
    if (recentFiles.value.length > 10) {
      recentFiles.value = recentFiles.value.slice(0, 10)
    }
  }

  function removeRecent(idx: number) {
    recentFiles.value.splice(idx, 1)
  }

  function openRecent(item: FileItem) {
    error.value = ''
    loading.value = true
    loadingText.value = item.file ? `正在准备文件 ${item.name}...` : '正在加载文件...'
    currentFile.value = { name: item.name, url: item.url, file: item.file }
    viewerKey.value++
  }

  function retry() {
    error.value = ''
    loading.value = true
    loadingText.value = '正在重试...'
    viewerKey.value++
  }

  function onLoadComplete() {
    loading.value = false
  }

  function onLoadError(err: unknown) {
    console.error('Viewer load error:', err)
    error.value = typeof err === 'string' ? err : err instanceof Error ? err.message : '文件加载失败，请检查文件格式是否支持'
    loading.value = false
  }

  // ========== 同步官网主题到 FileViewer ==========
  watch(isDark, val => {
    viewerOptions.theme = val ? 'dark' : 'light'
    viewerKey.value++
  })

  function downloadFile() {
    fvRef.value?.download?.()
  }

  function printFile() {
    fvRef.value?.print?.()
  }

  function zoomIn() {
    fvRef.value?.zoomIn?.()
  }

  function zoomOut() {
    fvRef.value?.zoomOut?.()
  }

  function zoomReset() {
    fvRef.value?.zoomReset?.()
  }

  // ========== 点击外部关闭下拉菜单 ==========
  function onDocumentClick(e: MouseEvent) {
    if (moreDropdownRef.value && !moreDropdownRef.value.contains(e.target as Node)) {
      moreOpen.value = false
    }
    if (fileMenuRef.value && !fileMenuRef.value.contains(e.target as Node)) {
      fileMenuOpen.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('click', onDocumentClick)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', onDocumentClick)
  })
</script>

<style scoped lang="scss">
  @use 'sass:color';
  $bg: var(--portal-bg);
  $bc: var(--portal-bc);
  $bd: var(--portal-bd);
  $bd-hover: var(--portal-bd-hover);
  $t1: var(--portal-t1);
  $t2: var(--portal-t2);
  $t3: var(--portal-t3);
  $a: #667eea;
  $ag: linear-gradient(135deg, #667eea, #764ba2);

  .fp-page {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: $t1;
    background: $bg;
    min-height: 100vh;
  }

  // ========== 顶部工具栏 ==========
  .fp-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid $bd;
    margin-top: 46px;
    gap: 12px;
  }

  .fp-toolbar-left {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .fp-toolbar-right {
    display: flex;
    align-items: center;
  }

  .tb-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: 1px solid $bd;
    border-radius: 6px;
    background: transparent;
    color: $t2;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: $bc;
      color: $t1;
      border-color: $bd-hover;
    }

    &.active {
      background: rgba($a, 0.12);
      color: $a;
      border-color: rgba($a, 0.3);
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
      pointer-events: none;
    }
  }

  // ========== 分隔线 ==========
  .tb-separator {
    width: 1px;
    height: 20px;
    background: $bd;
    margin: 0 4px;
  }

  // ========== 下拉菜单 ==========
  .tb-dropdown {
    position: relative;
  }

  .tb-dropdown-menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    min-width: 140px;
    background: color.adjust(#0f0f11, $lightness: 6%);
    border: 1px solid $bd;
    border-radius: 8px;
    padding: 4px;
    z-index: 100;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  .tb-dropdown-menu.dropdown-left {
    right: auto;
    left: 0;
  }

  .dd-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: $t2;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;

    &:hover {
      background: $bc;
      color: $t1;
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
      pointer-events: none;
    }
  }

  .dd-divider {
    height: 1px;
    margin: 4px 8px;
    background: $bd;
  }

  // ========== URL 输入面板 ==========
  .fp-url-panel {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid $bd;
  }

  .fp-url-input-wrap {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .fp-url-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid $bd;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.04);
    color: $t1;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;

    &::placeholder {
      color: $t3;
    }

    &:focus {
      border-color: $a;
    }
  }

  .fp-url-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background: $ag;
    color: #fff;
    font-size: 13px;
    cursor: pointer;
    transition: opacity 0.2s;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      opacity: 0.9;
    }
  }

  .fp-url-close {
    padding: 6px;
    border: none;
    background: transparent;
    color: $t3;
    cursor: pointer;
    display: flex;

    &:hover {
      color: $t1;
    }
  }

  // ========== 文件信息 ==========
  .fp-file-info {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.04);
    font-size: 13px;
  }

  .fp-file-icon {
    display: flex;
    color: $t2;
  }

  .fp-file-name {
    color: $t1;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .fp-file-ext {
    padding: 1px 6px;
    border-radius: 4px;
    background: rgba($a, 0.15);
    color: $a;
    font-size: 11px;
    font-weight: 600;
  }

  // ========== 主体区域 ==========
  .fp-main {
    display: flex;
    height: calc(100vh - 46px - 42px);
    position: relative;
  }

  .fp-viewer {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
  }

  .fp-viewer-container {
    width: 100%;
    height: 100%;
  }

  // ========== 空状态 ==========
  .fp-empty {
    text-align: center;
    padding: 40px;
    max-width: 400px;

    .fp-empty-icon {
      margin-bottom: 20px;
      color: $t3;
    }

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: $t2;
      margin: 0 0 8px;
    }

    p {
      font-size: 13px;
      color: $t3;
      line-height: 1.6;
      margin: 0;
    }
  }

  // ========== 加载中 ==========
  .fp-loading {
    text-align: center;
    padding: 40px;

    p {
      color: $t2;
      font-size: 14px;
      margin: 16px 0 0;
    }
  }

  .fp-loading-spinner {
    width: 36px;
    height: 36px;
    border: 3px solid $bd-hover;
    border-top-color: $a;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  // ========== 错误状态 ==========
  .fp-error {
    text-align: center;
    padding: 40px;
    color: #f56c6c;

    h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 12px 0 8px;
    }

    p {
      font-size: 13px;
      color: $t2;
      margin: 0 0 16px;
      max-width: 400px;
      word-break: break-all;
    }
  }

  .fp-retry-btn {
    padding: 8px 20px;
    border: 1px solid rgba(#f56c6c, 0.3);
    border-radius: 6px;
    background: rgba(#f56c6c, 0.1);
    color: #f56c6c;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: rgba(#f56c6c, 0.2);
    }
  }

  // ========== 最近打开侧栏 ==========
  .fp-recent {
    width: 280px;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.02);
    border-left: 1px solid $bd;
    overflow-y: auto;
  }

  .fp-recent-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;

    h3 {
      font-size: 14px;
      font-weight: 600;
      color: $t1;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .fp-recent-close {
    padding: 4px;
    border: none;
    background: transparent;
    color: $t3;
    cursor: pointer;
    display: flex;

    &:hover {
      color: $t1;
    }
  }

  .fp-recent-list {
    padding: 0 12px;
  }

  .fp-recent-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
    position: relative;

    &:hover {
      background: $bc;

      .fp-recent-remove {
        opacity: 1;
      }
    }
  }

  .fp-recent-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: rgba($a, 0.1);
    color: $a;
    flex-shrink: 0;
  }

  .fp-recent-info {
    flex: 1;
    min-width: 0;

    strong {
      display: block;
      font-size: 13px;
      color: $t1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    span {
      font-size: 11px;
      color: $t3;
    }
  }

  .fp-recent-remove {
    opacity: 0;
    padding: 4px;
    border: none;
    background: transparent;
    color: $t3;
    cursor: pointer;
    transition: opacity 0.2s;
    flex-shrink: 0;

    &:hover {
      color: #f56c6c;
    }
  }

  .fp-recent-empty {
    padding: 32px 16px;
    text-align: center;
    color: $t3;
    font-size: 13px;
  }

  // ========== 过渡动画 ==========
  .slide-enter-active,
  .slide-leave-active {
    transition:
      width 0.25s ease,
      opacity 0.25s ease;
  }

  .slide-enter-from,
  .slide-leave-to {
    width: 0;
    opacity: 0;
    overflow: hidden;
  }
</style>
