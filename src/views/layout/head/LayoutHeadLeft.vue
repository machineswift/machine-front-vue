<template>
  <div class="breadcrumb-container">
    <el-icon class="expand-icon" @click="toggleCollapse">
      <component :is="isCollapse ? 'el-icon-Expand' : 'el-icon-Fold'" />
    </el-icon>

    <el-breadcrumb separator-icon="el-icon-ArrowRight">
      <el-breadcrumb-item v-for="(item, index) in filteredBreadcrumbs" :key="item.path || index" :to="item.path ? { path: item.path } : undefined">
        <template v-if="item.meta?.icon">
          <el-icon v-if="item.meta.icon.startsWith('el-icon')" class="breadcrumb-icon">
            <component :is="item.meta.icon" />
          </el-icon>
          <SvgIcon v-else :name="item.meta.icon" width="15" height="15" />
        </template>
        <span>{{ item.meta?.title }}</span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { useSettingStore } from '@/common/stores/SystemSetting.store'
  import SvgIcon from '@/common/components/svgIcon/SvgIcon.vue'

  const route = useRoute()
  const settingStore = useSettingStore()

  const isCollapse = computed<boolean>(() => settingStore.getIsCollapse())

  const filteredBreadcrumbs = computed(() => route.matched.filter(record => record.meta?.title && !record.meta?.hidden))

  const toggleCollapse = () => {
    settingStore.setIsCollapse(!isCollapse.value)
  }
</script>

<style scoped lang="scss">
  .breadcrumb-container {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .expand-icon {
    margin-right: 12px;
    cursor: pointer;
    font-size: 32px;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s;
    border: 1px solid transparent;

    &:hover {
      border-color: var(--el-border-color);
      transform: scale(1.1);
    }
  }

  .breadcrumb-icon {
    margin-right: 4px;
    vertical-align: middle;
  }
</style>
