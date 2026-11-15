<template>
  <div class="ai-feature-placeholder">
    <el-empty :description="`${title}建设中`" />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'

  const route = useRoute()
  const title = computed(() => (route.meta.title as string) || '该功能')
</script>

<style scoped lang="scss">
  .ai-feature-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 320px;
  }
</style>
