<template>
  <div></div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  defineOptions({
    name: 'LayoutRedirect'
  })

  const route = useRoute()
  const router = useRouter()

  onMounted(() => {
    const { params, query } = route
    const { path, ...otherQuery } = query

    router.replace({
      path: '/' + (params.path || path || ''),
      query: otherQuery
    })
  })
</script>
