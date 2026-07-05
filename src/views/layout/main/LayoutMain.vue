<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade-scale'" mode="out-in" @before-enter="beforeEnter" @after-enter="afterEnter">
      <keep-alive :include="cachedViews" :max="50">
        <component :is="Component" :key="componentKey" class="optimized-transition" v-if="flag" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script setup lang="ts">
  import { watch, ref, nextTick, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { useSettingStore } from '@/common/stores/SystemSetting.store'
  import { useTabStore } from '@/common/stores/LayoutTab.store'
  import { useDictionaryEnumStore } from '@/common/stores/DictionaryEnum.store'

  const route = useRoute()
  const settingStore = useSettingStore()
  const tabStore = useTabStore()
  const dictionaryEnumStore = useDictionaryEnumStore()

  // 控制当前组件是否刷新重建
  const flag = ref(true)
  const refreshKey = ref(0)

  // 计算需要缓存的视图名称列表
  // 注意：keep-alive 的 include 需要匹配组件的 name 选项
  // 由于 Vue 3 的 <script setup> 默认没有 name，我们需要确保路由 name 和组件 name 一致
  // 或者使用路由 name 作为组件的 name（如果组件没有定义 name）
  const cachedViews = computed(() => {
    const views = tabStore.tabs
      .filter(tab => tab.keepAlive !== false && tab.name) // 默认都缓存，除非明确设置为 false
      .map(tab => tab.name as string)
    // 如果没有任何需要缓存的视图，返回 undefined，让 keep-alive 缓存所有组件
    return views.length > 0 ? views : undefined
  })

  // 使用路由 fullPath 作为 key，确保同一路由的组件实例保持一致
  // 关键：只有在刷新时才改变 key，切换标签时保持相同的 key，这样组件不会被重新创建
  const componentKey = computed(() => {
    const currentTab = tabStore.tabs.find(tab => tab.fullPath === route.fullPath)
    // 如果点击了刷新按钮，使用 refreshKey 强制刷新
    if (settingStore.getIsRefresh()) {
      return `refresh-${refreshKey.value}-${route.fullPath}`
    }
    // 否则使用路由 fullPath 作为 key，确保切换标签时组件不会重新创建
    // 如果标签页存在且需要缓存，使用 fullPath 作为 key
    if (currentTab && currentTab.keepAlive) {
      return route.fullPath
    }
    // 如果不需要缓存，也使用 fullPath，但组件不会被 keep-alive 缓存
    return route.fullPath
  })

  // 监听数据判断是否点击了刷新按钮
  watch(
    () => settingStore.getIsRefresh(),
    () => {
      flag.value = false
      dictionaryEnumStore.clearAllEnumCache()
      nextTick(() => {
        flag.value = true
        refreshKey.value++
      })
    }
  )

  // 监听路由变化，处理标签页刷新
  watch(
    () => route.fullPath,
    newPath => {
      const tab = tabStore.tabs.find(t => t.fullPath === newPath)
      if (tab && !tab.keepAlive) {
        // 如果标签页被标记为不缓存，刷新后恢复缓存
        nextTick(() => {
          tab.keepAlive = true
        })
      }
    }
  )

  const beforeEnter = (_el: Element) => {
    // 可以在这里添加动画前的逻辑
  }

  const afterEnter = (_el: Element) => {
    // 动画结束后的逻辑
  }
</script>

<style scoped lang="scss">
  /* 性能优化基础 */
  .optimized-transition {
    will-change: transform, opacity;
    backface-visibility: hidden;
    transform-style: preserve-3d;
  }

  /* 1. 默认淡入淡出带缩放效果 - 适合大多数情况 */
  .fade-scale-enter-active,
  .fade-scale-leave-active {
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .fade-scale-enter-from,
  .fade-scale-leave-to {
    opacity: 0;
    transform: scale(0.98);
  }

  /* 2. 平滑滑动效果 - 适合层级导航 */
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: all 0.4s cubic-bezier(0.33, 1, 0.68, 1);
    position: absolute;
    width: 100%;
  }

  .slide-left-enter-from {
    opacity: 0;
    transform: translateX(50px);
  }

  .slide-left-leave-to {
    opacity: 0;
    transform: translateX(-30px);
  }

  .slide-right-enter-from {
    opacity: 0;
    transform: translateX(-50px);
  }

  .slide-right-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }

  /* 3. 3D翻转效果 - 适合内容展示/详情页 */
  .flip-enter-active {
    transition: all 0.5s cubic-bezier(0.68, -0.6, 0.32, 1.6);
    transform-style: preserve-3d;
  }

  .flip-leave-active {
    display: none;
  }

  .flip-enter-from {
    opacity: 0;
    transform: rotateY(90deg) scale(0.8);
  }

  /* 4. 弹性效果 - 适合重要操作/模态框 */
  .bounce-enter-active {
    animation: bounce-in 0.5s cubic-bezier(0.68, -0.6, 0.32, 1.6);
  }

  .bounce-leave-active {
    animation: bounce-in 0.5s reverse;
  }

  @keyframes bounce-in {
    0% {
      transform: scale(0.9);
      opacity: 0;
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* 5. 材质设计风格效果 - 适合卡片式UI */
  .material-enter-active,
  .material-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .material-enter-from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }

  .material-leave-to {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }

  /* 响应式调整 - 移动端减少动画幅度 */
  @media (max-width: 768px) {
    .slide-left-enter-from,
    .slide-right-enter-from {
      transform: translateX(30px);
    }

    .flip-enter-from {
      transform: rotateY(45deg) scale(0.9);
    }

    .material-enter-from {
      transform: translateY(10px) scale(0.98);
    }
  }
</style>
