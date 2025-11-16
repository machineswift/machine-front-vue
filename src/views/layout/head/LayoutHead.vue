<template>
  <div class="head">
    <!-- 顶部操作栏 -->
    <div class="head_top">
      <div class="head_left">
        <LayoutHeadLeft></LayoutHeadLeft>
      </div>
      <div class="head_right">
        <LayoutHeadRight></LayoutHeadRight>
      </div>
    </div>

    <!-- 标签页栏 -->
    <div class="head_tabs">
      <LayoutTabs></LayoutTabs>
    </div>
  </div>
</template>

<script setup lang="ts">
  import LayoutHeadLeft from '@/views/layout/head/LayoutHeadLeft.vue'
  import LayoutHeadRight from '@/views/layout/head/LayoutHeadRight.vue'
  import LayoutTabs from '@/views/layout/head/LayoutTabs.vue'
</script>

<style scoped lang="scss">
  .head {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-light);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

    // 顶部操作栏
    .head_top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 50px;
      padding: 0 10px;
      flex-shrink: 0;
      background: var(--el-bg-color-page);
      border-bottom: 1px solid var(--el-border-color-lighter);

      .head_left {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
        overflow: hidden;
      }

      .head_right {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        gap: 8px;
      }
    }

    // 标签页栏
    .head_tabs {
      flex: 1;
      height: 0; // 配合 flex: 1 使用，让标签页占据剩余空间
      min-height: 0;
      overflow: hidden;
      background: var(--el-bg-color);
    }
  }
</style>
