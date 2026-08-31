<template>
  <div class="home-app" :draggable="draggable" @click="handleClick" @contextmenu.prevent="$emit('contextmenu', $event, app)" @dragstart="handleDragStart">
    <div class="home-app-tile" :class="tileClass" :style="tileStyle">
      <el-icon v-if="isElIcon" :size="iconSize">
        <component :is="app.icon" />
      </el-icon>
      <SvgIcon v-else-if="app.icon" :name="app.icon" :width="iconSize" :height="iconSize" :margin="'0'" />
      <span v-else class="home-app-fallback">{{ app.title.charAt(0) }}</span>
    </div>

    <span v-if="showTitle" class="home-app-title">{{ app.title }}</span>

    <!-- 程序坞激活指示点 -->
    <span v-if="active" class="home-app-active-dot"></span>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import SvgIcon from '@/shared/components/SvgIcon.vue'
  import type { HomeAppItem } from '@/shared/types/HomeApp.type'

  /** macOS 风格应用图标渐变色板 */
  const HOME_APP_PALETTES: Array<[string, string]> = [
    ['#4facfe', '#00f2fe'],
    ['#fa709a', '#fee140'],
    ['#30cfd0', '#330867'],
    ['#a18cd1', '#fbc2eb'],
    ['#fccb90', '#d57eeb'],
    ['#5ee7df', '#b490ca'],
    ['#ff9a9e', '#fecfef'],
    ['#f6d365', '#fda085'],
    ['#84fab0', '#8fd3f4'],
    ['#667eea', '#764ba2']
  ]

  /** 渐变色缓存：同一实例只计算一次（程序坞放大镜逐帧重渲染时复用，避免重复哈希） */
  const gradientCache = new Map<string, string>()

  /** 根据权限码生成稳定的渐变色 */
  function getAppGradient(code: string): string {
    const cached = gradientCache.get(code)
    if (cached) return cached
    let hash = 0
    for (let i = 0; i < code.length; i++) {
      hash = (hash * 31 + code.charCodeAt(i)) >>> 0
    }
    const [from, to] = HOME_APP_PALETTES[hash % HOME_APP_PALETTES.length]
    const gradient = `linear-gradient(135deg, ${from} 0%, ${to} 100%)`
    gradientCache.set(code, gradient)
    return gradient
  }

  const props = withDefaults(
    defineProps<{
      app: HomeAppItem
      /** 图标尺寸（px） */
      size?: number
      /** 是否显示名称 */
      showTitle?: boolean
      /** 是否当前激活（程序坞指示点） */
      active?: boolean
      /** 放大倍数（程序坞悬停效果） */
      magnify?: number
      /** 是否可原生拖拽（程序坞内交给 Sortable 处理，设为 false） */
      draggable?: boolean
      /** 自定义磁贴背景（覆盖默认渐变，如搜索入口的毛玻璃效果） */
      tileBackground?: string
      /** 磁贴附加样式类 */
      tileClass?: string
    }>(),
    {
      size: 64,
      showTitle: true,
      active: false,
      magnify: 1,
      draggable: true
    }
  )

  const emit = defineEmits<{
    (e: 'click', app: HomeAppItem): void
    (e: 'contextmenu', event: MouseEvent, app: HomeAppItem): void
  }>()

  const isElIcon = computed(() => props.app.icon.startsWith('el-icon'))
  const iconSize = computed(() => `${Math.round(props.size * 0.52)}px`)
  const tileStyle = computed(() => ({
    width: `${props.size}px`,
    height: `${props.size}px`,
    borderRadius: `${Math.round(props.size * 0.22)}px`,
    background: props.tileBackground || getAppGradient(props.app.code),
    transform: props.magnify !== 1 ? `scale(${props.magnify})` : undefined,
    zIndex: props.magnify !== 1 ? Math.round(props.magnify * 100) : undefined
  }))

  const handleClick = () => emit('click', props.app)

  const handleDragStart = (event: DragEvent) => {
    if (!props.draggable) return
    event.dataTransfer?.setData('text/plain', props.app.code)
  }
</script>

<style scoped lang="scss">
  .home-app {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    user-select: none;

    &:hover .home-app-tile {
      transform: scale(1.08);
    }

    .home-app-tile {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow:
        0 8px 18px rgb(0 0 0 / 22%),
        inset 0 1px 0 rgb(255 255 255 / 30%);
      transition: transform 0.22s cubic-bezier(0.34, 1.3, 0.64, 1);
      will-change: transform;

      .home-app-fallback {
        font-size: 24px;
        font-weight: 600;
      }
    }

    .home-app-title {
      max-width: 84px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
      line-height: 1.2;
      color: var(--el-text-color-regular);
      text-align: center;
    }

    .home-app-active-dot {
      position: absolute;
      bottom: -8px;
      left: 50%;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 0 4px rgb(255 255 255 / 60%);
      transform: translateX(-50%);
    }
  }
</style>
