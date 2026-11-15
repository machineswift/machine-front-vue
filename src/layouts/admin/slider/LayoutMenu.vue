<template>
  <template v-for="item in menuList" :key="item.meta?.code">
    <!-- 没有子路由的情况 -->
    <el-menu-item v-if="!item.children || item.children.length === 0" :index="item.path">
      <template #title>
        <template v-if="item.meta?.icon">
          <el-icon v-if="item.meta.icon.startsWith('el-icon')">
            <component :is="item.meta.icon" />
          </el-icon>
          <SvgIcon v-else :name="item.meta.icon" width="15" height="15" />
        </template>
        <span>{{ item.meta?.title }}</span>
      </template>
    </el-menu-item>

    <!-- 有子路由的情况 -->
    <el-sub-menu v-else :index="item.path">
      <template #title>
        <template v-if="item.meta?.icon">
          <el-icon v-if="item.meta.icon.startsWith('el-icon')">
            <component :is="item.meta.icon" />
          </el-icon>
          <SvgIcon v-else :name="item.meta.icon" width="15" height="15" />
        </template>
        <span>{{ item.meta?.title }}</span>
      </template>
      <!-- 递归调用自身组件 -->
      <LayoutMenu :menu-list="item.children" />
    </el-sub-menu>
  </template>
</template>

<script setup lang="ts">
  import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'
  import SvgIcon from '@/shared/components/SvgIcon.vue'

  defineProps<{
    menuList: ExtendedRouteRecordRaw[]
  }>()
</script>
