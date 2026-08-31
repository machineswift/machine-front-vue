<template>
  <div v-if="dockReady" class="home-page">
    <div class="home-bg" aria-hidden="true"></div>

    <div class="home-content">
      <HomeAppGrid
        v-if="apps.length"
        :apps="apps"
        :dock-codes="dockCodes"
        :page="activePage"
        @update:page="activePage = $event"
        @page-count="pageCount = $event"
        @open="handleOpen"
        @toggle="handleToggleDock"
      />
      <el-empty v-else class="home-empty" description="暂无可用菜单" />
    </div>

    <nav v-if="pageCount > 1" ref="dotsEl" class="home-page-dots" aria-label="应用页面指示" @click="handleDotsClick">
      <button
        v-for="i in pageCount"
        :key="i"
        class="home-page-dot"
        :class="{ 'is-active': i - 1 === activePage }"
        :aria-label="`第 ${i} 页`"
        :aria-current="i - 1 === activePage ? 'page' : undefined"
        type="button"
        @click="activePage = i - 1"
      ></button>
    </nav>

    <div class="home-dock-wrap">
      <HomeDock
        :apps="apps"
        :dock-codes="dockCodes"
        :current-code="route.meta?.code"
        :search-active="searchOpen"
        @reorder="handleReorder"
        @remove="handleRemoveDock"
        @add="handleAddDock"
        @open="handleOpen"
        @search="searchOpen = true"
      />
    </div>

    <HomeSearchOverlay v-if="searchOpen" :apps="apps" @open="handleSearchOpen" @close="searchOpen = false" />
  </div>

  <div v-else class="home-page home-page-loading" aria-busy="true">
    <span class="home-page-loading-spinner"></span>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { BIamUserConfigApi } from '@/modules/biam/userConfig/api/BIamUserConfig.api'
  import { useIamUserStore } from '@/shared/stores/IamUser.store'
  import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'
  import { HOME_APP_ITEM, type HomeAppItem } from '@/shared/types/HomeApp.type'
  import HomeAppGrid from './HomeAppGrid.vue'
  import HomeDock from './HomeDock.vue'
  import HomeSearchOverlay from './HomeSearchOverlay.vue'

  const route = useRoute()
  const router = useRouter()
  const userStore = useIamUserStore()

  const HOME_DOCK_CONFIG_KEY_CODE = 'DOCK_CONFIG'

  const dockCodes = ref<string[]>([])
  const dockReady = ref(false)
  const searchOpen = ref(false)
  const activePage = ref(0)
  const pageCount = ref(1)
  const dotsEl = ref<HTMLElement>()

  function buildHomeApps(routes: ExtendedRouteRecordRaw[]): HomeAppItem[] {
    const layout = routes.find(r => r.name === 'ADMIN:LAYOUT')
    const children = layout?.children ?? []
    const appList: HomeAppItem[] = []
    const seen = new Set<string>()

    const walk = (nodes: ExtendedRouteRecordRaw[], inheritedTitle?: string, inheritedIcon?: string) => {
      for (const node of nodes) {
        if (node.meta?.hidden) continue

        if (node.component && node.name !== 'ADMIN:HOME') {
          const code = node.meta?.code ?? String(node.name ?? node.path)
          if (!seen.has(code)) {
            seen.add(code)
            appList.push({
              code,
              title: node.meta?.title ?? inheritedTitle ?? node.path,
              icon: node.meta?.icon ?? inheritedIcon ?? '',
              path: node.path
            })
          }
        }

        if (node.children?.length) {
          walk(node.children, node.meta?.title ?? inheritedTitle, node.meta?.icon ?? inheritedIcon)
        }
      }
    }

    walk(children)
    return appList
  }

  const apps = computed(() => buildHomeApps(userStore.menuRouters))

  async function fetchDockConfig(): Promise<string[]> {
    const configKey = HOME_DOCK_CONFIG_KEY_CODE
    const res = await BIamUserConfigApi.getByKey({ configKey })
    if (!res?.configValue) return []
    const list: unknown = JSON.parse(res.configValue)
    if (!Array.isArray(list)) {
      throw new Error(`程序坞配置格式异常（非数组）：${res.configValue}`)
    }
    return list.filter((code): code is string => typeof code === 'string')
  }

  async function saveDockConfig(codes: string[]): Promise<void> {
    const configKey = HOME_DOCK_CONFIG_KEY_CODE
    await BIamUserConfigApi.save({ configKey, configValue: JSON.stringify(codes) })
  }

  let dockSaveQueue: Promise<void> = Promise.resolve()

  const persistDock = (codes: string[]): void => {
    dockCodes.value = codes
    dockSaveQueue = dockSaveQueue.then(() => saveDockConfig(codes)).catch(err => console.error('保存程序坞配置失败', err))
  }

  const cleanupDock = (available: HomeAppItem[]): void => {
    if (available.length === 0) return
    const valid = new Set(available.map(app => app.code))
    const filtered = dockCodes.value.filter(code => valid.has(code))
    if (filtered.length !== dockCodes.value.length) {
      persistDock(filtered)
    }
  }

  const handleDotsClick = (event: MouseEvent): void => {
    if ((event.target as HTMLElement).closest('.home-page-dot')) return
    const rect = dotsEl.value?.getBoundingClientRect()
    if (!rect) return
    const goLeft = event.clientX - rect.left < rect.width / 2
    const next = goLeft ? activePage.value - 1 : activePage.value + 1
    if (next >= 0 && next < pageCount.value) {
      activePage.value = next
    }
  }

  const handleOpen = (app: HomeAppItem): void => {
    router.push(app.path)
  }

  const handleSearchOpen = (app: HomeAppItem): void => {
    searchOpen.value = false
    handleOpen(app)
  }

  const handleToggleDock = (app: HomeAppItem): void => {
    if (app.code === HOME_APP_ITEM.code) return
    if (dockCodes.value.includes(app.code)) {
      handleRemoveDock(app.code)
    } else {
      handleAddDock(app.code, dockCodes.value.length)
    }
  }

  const handleAddDock = (code: string, index?: number): void => {
    if (code === HOME_APP_ITEM.code || dockCodes.value.includes(code)) return
    const i = Math.min(index ?? dockCodes.value.length, dockCodes.value.length)
    persistDock([...dockCodes.value.slice(0, i), code, ...dockCodes.value.slice(i)])
  }

  const handleRemoveDock = (code: string): void => {
    if (code === HOME_APP_ITEM.code) return
    persistDock(dockCodes.value.filter(c => c !== code))
  }

  const handleReorder = (codes: string[]): void => {
    persistDock(codes)
  }

  watch(apps, cleanupDock)

  fetchDockConfig()
    .then(codes => {
      dockCodes.value = codes
      cleanupDock(apps.value)
    })
    .catch(error => {
      console.error('加载程序坞配置失败', error)
    })
    .finally(() => {
      dockReady.value = true
    })
</script>

<style scoped lang="scss">
  .home-page {
    position: relative;
    height: 100%;
    overflow-y: auto;

    .home-bg {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background:
        radial-gradient(1100px 620px at 85% -10%, rgb(99 102 241 / 32%), transparent 60%),
        radial-gradient(900px 520px at 8% 110%, rgb(34 211 238 / 28%), transparent 60%),
        radial-gradient(700px 500px at 50% 50%, rgb(168 85 247 / 14%), transparent 60%), var(--el-bg-color-page);
    }

    .home-content {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 28px 24px 150px;
      box-sizing: border-box;
    }

    .home-dock-wrap {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 20px;
      z-index: 10;
      display: flex;
      justify-content: center;
      pointer-events: none;

      .home-dock {
        pointer-events: auto;
      }
    }

    .home-page-dots {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 104px;
      z-index: 9;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      height: 26px;
      cursor: pointer;

      .home-page-dot {
        width: 7px;
        height: 7px;
        padding: 0;
        border: none;
        border-radius: 999px;
        background: rgb(255 255 255 / 60%);
        box-shadow:
          0 0 0 1px rgb(0 0 0 / 12%),
          0 1px 3px rgb(0 0 0 / 30%);
        cursor: pointer;
        transition:
          width 0.28s cubic-bezier(0.34, 1.3, 0.64, 1),
          background 0.2s ease;

        &.is-active {
          width: 18px;
          background: #fff;
        }
      }
    }

    &.home-page-loading {
      display: flex;
      align-items: center;
      justify-content: center;

      .home-page-loading-spinner {
        width: 28px;
        height: 28px;
        border: 3px solid rgb(0 0 0 / 12%);
        border-top-color: var(--el-color-primary);
        border-radius: 50%;
        animation: home-page-loading-spin 0.8s linear infinite;
      }

      @keyframes home-page-loading-spin {
        to {
          transform: rotate(360deg);
        }
      }
    }
  }
</style>
