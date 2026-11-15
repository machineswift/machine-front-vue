<template>
  <Teleport to="body">
    <Transition name="spotlight" appear>
      <div class="home-search-mask" role="dialog" aria-modal="true" aria-label="搜索应用" @mousedown.self="emit('close')">
        <div class="home-search-panel">
          <div class="home-search-input-wrap">
            <el-icon class="home-search-input-icon" :size="20"><Search /></el-icon>
            <input
              ref="inputEl"
              v-model="keyword"
              name="home-search-keyword"
              class="home-search-input"
              placeholder="搜索应用"
              autocomplete="off"
              spellcheck="false"
              @keydown="handleKeydown"
            />
            <button v-if="keyword" class="home-search-clear" aria-label="清空搜索" @click="clearKeyword">
              <el-icon :size="13"><Close /></el-icon>
            </button>
          </div>

          <div class="home-search-body">
            <p v-if="!keyword" class="home-search-tip">共 {{ results.length }} 个应用</p>
            <p v-else-if="!results.length" class="home-search-empty">未找到「{{ keyword }}」相关应用</p>
            <p v-else class="home-search-tip">共 {{ results.length }} 个匹配</p>

            <div v-if="results.length" ref="gridEl" class="home-search-grid">
              <div
                v-for="(item, index) in results"
                :key="item.app.code"
                class="home-search-grid-item"
                :class="{ 'is-active': index === activeIndex }"
                @click="openByIndex(index)"
                @mousemove="activeIndex = index"
              >
                <HomeAppIcon :app="item.app" :size="56" :draggable="false" />
              </div>
            </div>

            <div class="home-search-footer">
              <span>
                <kbd>←</kbd>
                <kbd>→</kbd>
                <kbd>↑</kbd>
                <kbd>↓</kbd>
                选择
              </span>
              <span>
                <kbd>↵</kbd>
                打开
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { computed, nextTick, onMounted, ref, watch } from 'vue'
  import { Search, Close } from '@element-plus/icons-vue'
  import { match } from 'pinyin-pro'
  import HomeAppIcon from './HomeAppIcon.vue'
  import type { HomeAppItem } from '@/shared/types/HomeApp.type'

  interface SearchResultItem {
    app: HomeAppItem
    /** 排序权重（越大越靠前） */
    score: number
  }

  /**
   * 计算应用与搜索关键词的匹配结果。
   */
  function matchHomeApp(app: HomeAppItem, rawKeyword: string): number | null {
    const keyword = rawKeyword.trim()
    if (!keyword) return 0

    const hits = match(app.title, keyword)
    if (!hits || hits.length === 0) return null

    const first = hits[0]
    const last = hits[hits.length - 1]
    let score = hits.length * 10
    // 首字符命中（前缀匹配）加分
    if (first === 0) score += 20
    // 完全命中加分
    if (hits.length === app.title.length) score += 40
    // 命中越紧凑（连续）越优
    score += Math.max(0, hits.length * 2 - (last - first + 1))
    // 命中位置越靠前越优
    score += Math.max(0, 10 - first)

    return score
  }

  const props = defineProps<{
    apps: HomeAppItem[]
  }>()

  const emit = defineEmits<{
    (e: 'open', app: HomeAppItem): void
    (e: 'close'): void
  }>()

  const keyword = ref('')
  const activeIndex = ref(0)
  const inputEl = ref<HTMLInputElement>()
  const gridEl = ref<HTMLElement>()

  /** 搜索结果：空关键词展示全部应用，否则按匹配度排序 */
  const results = computed<SearchResultItem[]>(() => {
    const kw = keyword.value.trim()
    if (!kw) return props.apps.map(app => ({ app, score: 0 }))
    const matched: SearchResultItem[] = []
    for (const app of props.apps) {
      const score = matchHomeApp(app, kw)
      if (score !== null) matched.push({ app, score })
    }
    matched.sort((a, b) => b.score - a.score || a.app.title.localeCompare(b.app.title))
    return matched
  })

  watch(keyword, () => {
    activeIndex.value = 0
    scrollActiveIntoView()
  })

  onMounted(() => nextTick(() => inputEl.value?.focus()))

  const openByIndex = (index: number) => {
    const item = results.value[index]
    if (item) emit('open', item.app)
  }

  const clearKeyword = () => {
    keyword.value = ''
  }

  const scrollActiveIntoView = () => {
    nextTick(() => {
      gridEl.value?.querySelector<HTMLElement>('.home-search-grid-item.is-active')?.scrollIntoView({ block: 'nearest' })
    })
  }

  /** 当前结果网格的实际列数（按布局读取，读取失败时回退 5），用于「↑↓」跨行、「←→」跨列选择 */
  const getColumnCount = (): number => {
    const grid = gridEl.value
    if (!grid) return 5
    const count = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length
    return count || 5
  }

  /** 在当前结果列表中按步长移动高亮项（支持负数，越界时循环） */
  const moveActive = (step: number) => {
    const length = results.value.length
    if (!length) {
      activeIndex.value = 0
      return
    }
    activeIndex.value = (activeIndex.value + step + length) % length
    scrollActiveIntoView()
  }

  const handleKeydown = (event: KeyboardEvent) => {
    // 输入法组合中（如拼音选字/确认候选词），Enter/方向键用于输入法自身，不触发打开/选择
    if (event.isComposing || event.keyCode === 229) return

    switch (event.key) {
      case 'ArrowDown':
        // 下一行
        event.preventDefault()
        moveActive(getColumnCount())
        break
      case 'ArrowUp':
        // 上一行
        event.preventDefault()
        moveActive(-getColumnCount())
        break
      case 'ArrowLeft':
        // 左边一个
        event.preventDefault()
        moveActive(-1)
        break
      case 'ArrowRight':
        // 右边一个
        event.preventDefault()
        moveActive(1)
        break
      case 'Enter':
        event.preventDefault()
        openByIndex(activeIndex.value)
        break
      case 'Escape':
        event.preventDefault()
        emit('close')
        break
    }
  }
</script>

<style scoped lang="scss">
  .home-search-mask {
    position: fixed;
    inset: 0;
    z-index: 3200;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
    background: rgb(18 18 28 / 42%);
    backdrop-filter: blur(5px) saturate(120%);
    -webkit-backdrop-filter: blur(5px) saturate(120%);
  }

  .home-search-panel {
    display: flex;
    flex-direction: column;
    width: min(600px, 94vw);
    height: min(560px, calc(100vh - 32px));
    overflow: hidden;
    border-radius: 18px;
    background: color-mix(in srgb, var(--el-bg-color-overlay) 92%, transparent);
    backdrop-filter: blur(28px) saturate(180%);
    -webkit-backdrop-filter: blur(28px) saturate(180%);
    border: 1px solid var(--el-border-color-light);
    box-shadow: 0 24px 60px rgb(20 20 40 / 34%);
  }

  .home-search-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 18px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .home-search-input-icon {
      flex: 0 0 auto;
      color: #6366f1;
    }

    .home-search-input {
      flex: 1 1 auto;
      min-width: 0;
      border: none;
      outline: none;
      background: transparent;
      color: var(--el-text-color-primary);
      font-size: 20px;

      &::placeholder {
        color: var(--el-text-color-placeholder);
      }
    }

    .home-search-clear {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      flex: 0 0 auto;
      border: none;
      border-radius: 50%;
      background: var(--el-fill-color);
      color: var(--el-text-color-secondary);
      cursor: pointer;

      &:hover {
        background: var(--el-fill-color-light);
      }
    }
  }

  .home-search-body {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
  }

  .home-search-tip {
    margin: 0;
    padding: 9px 18px 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .home-search-empty {
    margin: 0;
    padding: 34px 18px;
    text-align: center;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .home-search-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 18px 14px;
    justify-items: center;
    align-content: start;
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 14px 16px 18px;
    margin: 0;
  }

  .home-search-grid-item {
    display: flex;
    justify-content: center;
    border-radius: 14px;
    cursor: pointer;
    transition: transform 0.12s ease;

    &.is-active :deep(.home-app-tile) {
      box-shadow:
        0 0 0 3px rgb(99 102 241 / 70%),
        0 10px 22px rgb(0 0 0 / 24%);
      transform: scale(1.1);
    }
  }

  .home-search-footer {
    display: flex;
    justify-content: center;
    gap: 16px;
    padding: 10px;
    border-top: 1px solid var(--el-border-color-lighter);
    font-size: 12px;
    color: var(--el-text-color-secondary);

    kbd {
      display: inline-block;
      padding: 1px 6px;
      margin: 0 2px;
      border-radius: 5px;
      border: 1px solid var(--el-border-color);
      background: var(--el-fill-color-light);
      font-family: inherit;
      font-size: 11px;
    }
  }

  /* 打开/关闭动效 */
  .spotlight-enter-active {
    transition:
      opacity 0.16s ease,
      transform 0.18s cubic-bezier(0.34, 1.3, 0.64, 1);
  }

  .spotlight-leave-active {
    transition:
      opacity 0.12s ease,
      transform 0.12s ease;
  }

  .spotlight-enter-from,
  .spotlight-leave-to {
    opacity: 0;
    transform: translateY(-14px) scale(0.98);
  }
</style>
