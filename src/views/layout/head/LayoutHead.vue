<template>
  <div class="head">
    <div class="head_left">
      <LayoutHeadLeft></LayoutHeadLeft>
    </div>

    <div class="head_right">
      <LayoutHeadRight></LayoutHeadRight>
    </div>
  </div>
</template>

<script setup lang="ts">
  import LayoutHeadLeft from '@/views/layout/head/LayoutHeadLeft.vue'
  import LayoutHeadRight from '@/views/layout/head/LayoutHeadRight.vue'
</script>

<style scoped lang="scss">
  .head {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;

    .head_left {
      display: flex;
      align-items: center;
      margin-left: 10px;
    }

    .head_right {
      display: flex;
      align-items: center;
    }
  }
</style>
