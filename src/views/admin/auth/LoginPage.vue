<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="bg-gradient"></div>
      <div class="bg-particles">
        <span v-for="_ in 20" :key="_" class="particle" :style="particleStyle()"></span>
      </div>
    </div>
    <AppLogin v-model:visible="visible" @login-success="handleLoginSuccess" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import AppLogin from './AppLogin.vue'

  const visible = ref(true)
  const router = useRouter()
  const route = useRoute()

  const handleLoginSuccess = () => {
    const redirect = route.query.redirect as string
    if (redirect) {
      const resolved = router.resolve(redirect)
      const isCatchAll = resolved.matched.some(r => r.name === 'ANY')
      if (!isCatchAll && resolved.name) {
        router.push(redirect)
        return
      }
    }
    router.push('/admin/home')
  }

  const particleStyle = () => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${Math.random() * 4 + 2}px`,
    height: `${Math.random() * 4 + 2}px`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${Math.random() * 3 + 3}s`
  })
</script>

<style scoped>
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: #0f0c29;
  }

  .login-bg {
    position: absolute;
    inset: 0;
  }

  .bg-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  }

  .bg-particles {
    position: absolute;
    inset: 0;
  }

  .particle {
    position: absolute;
    border-radius: 50%;
    background: rgba(0, 210, 255, 0.15);
    animation: float linear infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0) scale(1);
      opacity: 0.3;
    }
    50% {
      transform: translateY(-20px) scale(1.5);
      opacity: 0.8;
    }
  }
</style>
