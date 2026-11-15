<template>
  <div class="admin-not-found">
    <el-result icon="warning" title="页面不存在" sub-title="当前地址没有对应的后台页面，可能已被移除或没有访问权限。">
      <template #extra>
        <el-button type="primary" @click="goHome">返回应用中心</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'

  defineOptions({
    name: 'AdminNotFound'
  })

  const router = useRouter()

  const goHome = () => {
    router.replace('/admin/home')
  }
</script>

<style scoped lang="scss">
  .admin-not-found {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 24px;
  }
</style>
