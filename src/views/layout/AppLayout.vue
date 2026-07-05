<template>
  <div class="layout_container">
    <!--左侧菜单-->
    <div class="layout_slider" :class="{ fold: settingStore.getIsCollapse() }">
      <LayoutLogo></LayoutLogo>
      <el-scrollbar class="scrollbar">
        <el-menu :default-active="activeMenu" :collapse="settingStore.getIsCollapse()" router>
          <LayoutMenu :menuList="filteredRoutes"></LayoutMenu>
        </el-menu>
      </el-scrollbar>
    </div>

    <!--顶部导航-->
    <div class="layout_head" :class="{ fold: settingStore.getIsCollapse() }">
      <LayoutHead></LayoutHead>
    </div>

    <!--内容展示区-->
    <div class="layout_main" :class="{ fold: settingStore.getIsCollapse() }">
      <LayoutMain></LayoutMain>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import LayoutLogo from '@/views/layout/slider/LayoutLogo.vue'
  import LayoutMenu from '@/views/layout/slider/LayoutMenu.vue'
  import LayoutMain from '@/views/layout/main/LayoutMain.vue'
  import LayoutHead from '@/views/layout/head/LayoutHead.vue'
  import { useIamUserStore } from '@/common/stores/IamUser.store'
  import { useSettingStore } from '@/common/stores/SystemSetting.store'
  import type { ExtendedRouteRecordRaw } from '@/common/types/Router.type'

  const userStore = useIamUserStore()
  const settingStore = useSettingStore()

  // 获取当前路由
  const route = useRoute()

  // 计算当前激活的菜单
  const activeMenu = computed(() => {
    const currentPath = route.path
    const rootRoute = userStore.menuRouters.find(r => r.name === 'LAYOUT')
    const findActiveCode = routes => {
      for (const item of routes) {
        if (item.path === currentPath) {
          return item.meta?.code || item.path
        }
        if (item.children) {
          const result = findActiveCode(item.children)
          if (result) {
            return result
          }
        }
      }
      return null
    }

    return findActiveCode(rootRoute?.children || []) || currentPath
  })

  // 过滤隐藏的路由
  const filteredRoutes = computed(() => {
    const rootRoute = userStore.menuRouters.find((route: ExtendedRouteRecordRaw) => route.name === 'LAYOUT')
    return filterHiddenRoutes(rootRoute?.children || [])
  })

  const filterHiddenRoutes = (routes: ExtendedRouteRecordRaw[]): ExtendedRouteRecordRaw[] => {
    return routes
      .filter(route => !route.meta?.hidden)
      .map(route => ({
        ...route,
        children: route.children ? filterHiddenRoutes(route.children) : undefined
      }))
  }
</script>

<style scoped lang="scss">
  @use 'sass:color';

  .layout_container {
    width: 100%;
    height: 100vh;
    padding: 8px;
    box-sizing: border-box;

    .layout_slider {
      position: fixed;
      width: $base-menu-width;
      height: calc(100vh - 16px);
      left: 8px;
      top: 8px;
      margin: 0;
      border-radius: 8px;
      border: 2px solid var(--el-border-color);
      overflow: hidden;
      transition: all 0.3s ease;

      .scrollbar {
        width: 100%;
        height: calc(100% - #{$base-menu-logo-height});

        .el-menu {
          border-right: none;
        }
      }

      &.fold {
        width: $base-menu-min-width;
      }
    }

    .layout_head {
      position: fixed;
      width: calc(100% - #{$base-menu-width} - 20px);
      height: $base-head-height;
      top: 8px;
      left: calc(#{$base-menu-width} + 12px);
      margin: 0;
      border-radius: 8px;
      border: 2px solid var(--el-border-color);
      overflow: hidden;
      transition: all 0.3s ease;

      &.fold {
        width: calc(100% - #{$base-menu-min-width} - 24px);
        left: calc(#{$base-menu-min-width} + 24px);
      }
    }

    .layout_main {
      position: fixed;
      width: calc(100% - #{$base-menu-width} - 20px);
      height: calc(100vh - #{$base-head-height} - 20px);
      left: calc(#{$base-menu-width} + 12px);
      top: calc(#{$base-head-height} + 12px);
      margin: 0;
      padding: 4px;
      border-radius: 8px;
      border: 2px solid var(--el-border-color);
      overflow: auto;
      transition: all 0.3s ease;

      &.fold {
        width: calc(100% - #{$base-menu-min-width} - 36px);
        left: calc(#{$base-menu-min-width} + 24px);
      }
    }
  }
</style>
