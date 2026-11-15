<template>
  <div class="feature-placeholder">
    <el-empty :description="`${title}功能建设中`">
      <el-button type="primary" @click="router.push('/admin/home')">返回应用中心</el-button>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  defineOptions({
    name: 'FeaturePlaceholder'
  })

  const route = useRoute()
  const router = useRouter()

  const title = computed(() => String(route.meta.title ?? '该'))
</script>

<style scoped lang="scss">
  .feature-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 24px;
  }
</style>
