<template>
  <div>
    <el-card>
      <h1>{{ currentUser.name }} 你好</h1>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useIamUserStore } from '@/modules/iam/stores/IamUser.store'

  const userStore = useIamUserStore()
  const currentUser = ref(userStore.currentUser)
</script>

<style scoped lang="scss"></style>
