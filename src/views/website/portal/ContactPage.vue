<template>
  <div class="cosmic-contact">
    <canvas ref="starCanvasRef" class="star-canvas"></canvas>
    <div class="nebula nebula-1"></div>
    <div class="nebula nebula-2"></div>

    <!-- 顶部导航（复用官网公用组件） -->
    <AppHeader
      :nav-items="navItems"
      :tool-categories="toolCategories"
      :active-section="activeSection"
      @scroll-to="scrollTo"
      @go-to-login="goToLogin"
      @go-to-home="goToHome"
      @scroll-to-top="scrollToTop"
    />

    <section class="contact-hero">
      <h1>联系我们</h1>
      <p>期待与您的合作，请随时与我们取得联系</p>
    </section>

    <section class="contact-body">
      <div class="contact-grid">
        <div class="contact-info">
          <div class="info-item" v-for="item in contactInfo" :key="item.label">
            <div class="info-icon">
              <el-icon :size="22"><component :is="item.icon" /></el-icon>
            </div>
            <div class="info-body">
              <h3>{{ item.label }}</h3>
              <p>{{ item.value }}</p>
            </div>
          </div>
        </div>

        <div class="contact-form-wrapper">
          <h2>发送消息</h2>
          <el-form :model="form" label-position="top">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="姓名">
                  <el-input v-model="form.name" placeholder="请输入您的姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱">
                  <el-input v-model="form.email" placeholder="请输入您的邮箱" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="主题">
              <el-input v-model="form.subject" placeholder="请输入主题" />
            </el-form-item>
            <el-form-item label="消息内容">
              <el-input v-model="form.message" type="textarea" :rows="4" placeholder="请输入您要咨询的内容..." />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="default" round @click="submitForm">发送消息</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </section>

    <AppFooter />

    <AppLogin v-model:visible="showLogin" @login-success="goToHome" />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import AppLogin from '@/views/admin/auth/AppLogin.vue'
  import AppFooter from '@/views/website/components/AppFooter.vue'
  import AppHeader from '@/views/website/components/AppHeader.vue'
  import { toolCategories } from '@/shared/constants/Portal.constant'

  const router = useRouter()
  const showLogin = ref(false)

  // ========== 导航（与 AppLanding 一致） ==========
  const activeSection = ref('')
  const navItems: Array<{ key: string; href: string; label: string }> = []

  const scrollToTop = () => router.push('/')
  const scrollTo = () => {}
  const goToLogin = () => {
    showLogin.value = true
  }
  const goToHome = () => router.push('/admin/home')

  // ========== 星场背景 ==========
  const starCanvasRef = ref<HTMLCanvasElement | null>(null)
  let animFrameId = 0
  let mouseX = 0
  let mouseY = 0
  let starCleanup: (() => void) | undefined
  let mouseMoveCleanup: (() => void) | undefined

  interface Star {
    x: number
    y: number
    z: number
    size: number
    brightness: number
    twinkleSpeed: number
    twinkleOffset: number
  }

  const initStarField = () => {
    const canvas = starCanvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const stars: Star[] = []
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 1500), 1000)
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width * 1.5 - canvas.width * 0.25,
        y: Math.random() * canvas.height * 1.5 - canvas.height * 0.25,
        z: Math.random() * 3,
        size: Math.random() * 2 + 0.5,
        brightness: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2
      })
    }

    let time = 0
    const animate = () => {
      time += 0.016
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const star of stars) {
        const px = (mouseX - canvas.width / 2) * 0.0001 * (star.z + 0.5)
        const py = (mouseY - canvas.height / 2) * 0.0001 * (star.z + 0.5)
        const dx = Math.sin(time * 0.005 * (1 - star.z * 0.3) + star.twinkleOffset) * (star.z + 0.5) * 6
        const dy = Math.cos(time * 0.003 * (1 - star.z * 0.3) + star.twinkleOffset) * (star.z + 0.5) * 4
        const sx = star.x + px + dx,
          sy = star.y + py + dy
        const twinkle = Math.sin(time * star.twinkleSpeed * 60 + star.twinkleOffset) * 0.3 + 0.7
        const alpha = star.brightness * twinkle * (1 - star.z * 0.25)
        ctx.beginPath()
        ctx.arc(sx, sy, star.size * (1 - star.z * 0.25), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220, 215, 200, ${alpha})`
        ctx.fill()
      }
      animFrameId = requestAnimationFrame(animate)
    }
    animate()
    return () => {
      cancelAnimationFrame(animFrameId)
      window.removeEventListener('resize', resize)
    }
  }

  onMounted(() => {
    starCleanup = initStarField()
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener('mousemove', onMouseMove)
    mouseMoveCleanup = () => window.removeEventListener('mousemove', onMouseMove)
  })

  onUnmounted(() => {
    starCleanup?.()
    mouseMoveCleanup?.()
  })

  const contactInfo = [
    { icon: 'el-icon-Position', label: '公司地址', value: '中国 · 杭州 · 萧山' },
    { icon: 'el-icon-Phone', label: '联系电话', value: '+86 18217519210' },
    { icon: 'el-icon-Message', label: '电子邮箱', value: 'machineswift@qq.com' },
    { icon: 'el-icon-AlarmClock', label: '工作时间', value: '周一至周五 9:00-18:00' }
  ]

  const form = ref({ name: '', email: '', subject: '', message: '' })

  const submitForm = () => {
    ElMessage.success('感谢您的留言，我们会尽快与您联系！')
    form.value = { name: '', email: '', subject: '', message: '' }
  }
</script>

<style scoped lang="scss">
  $bg-primary: var(--portal-bg);
  $bg-card: var(--portal-bc);
  $border-subtle: var(--portal-bd);
  $text-primary: var(--portal-t1);
  $text-secondary: var(--portal-t2);
  $text-muted: var(--portal-t3);
  $accent: #667eea;

  .cosmic-contact {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif;
    color: $text-primary;
    background: $bg-primary;
    min-height: 100vh;
    position: relative;
  }

  .star-canvas {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .nebula {
    position: fixed;
    border-radius: 50%;
    filter: blur(100px);
    pointer-events: none;
    z-index: 0;
    animation: nebulaDrift 40s ease-in-out infinite;
    &.nebula-1 {
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, rgba(102, 126, 234, 0.06), transparent);
      bottom: -200px;
      left: -100px;
    }
    &.nebula-2 {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(118, 75, 162, 0.05), transparent);
      top: -100px;
      right: 10%;
      animation-delay: -15s;
    }
  }

  @keyframes nebulaDrift {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
    }
    25% {
      transform: translate(60px, -40px) scale(1.1);
    }
    50% {
      transform: translate(-30px, 50px) scale(0.95);
    }
    75% {
      transform: translate(40px, 30px) scale(1.05);
    }
  }

  .contact-hero {
    position: relative;
    z-index: 1;
    padding: 140px 20px 40px;
    text-align: center;

    h1 {
      font-size: 42px;
      font-weight: 700;
      color: $text-primary;
      margin-bottom: 10px;
    }
    p {
      font-size: 16px;
      color: $text-secondary;
    }
  }

  .contact-body {
    position: relative;
    z-index: 1;
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px 80px;
  }

  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 24px;
  }

  .contact-info {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .info-item {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    background: $bg-card;
    border: 1px solid $border-subtle;
    border-radius: 12px;
    padding: 20px;
    transition:
      background 0.2s,
      border-color 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(102, 126, 234, 0.2);
    }

    .info-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: rgba(102, 126, 234, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      .el-icon {
        color: $accent;
      }
    }

    .info-body {
      h3 {
        font-size: 14px;
        font-weight: 600;
        color: $text-primary;
        margin: 0 0 4px;
      }
      p {
        font-size: 13px;
        color: $text-secondary;
        margin: 0;
        line-height: 1.5;
      }
    }
  }

  .contact-form-wrapper {
    background: $bg-card;
    border: 1px solid $border-subtle;
    border-radius: 12px;
    padding: 24px 20px;

    h2 {
      font-size: 18px;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 16px;
    }

    :deep(.el-form-item) {
      margin-bottom: 14px;
    }
    :deep(.el-form-item__label) {
      color: $text-secondary !important;
      font-size: 13px;
    }
    :deep(.el-input__wrapper),
    :deep(.el-textarea__inner) {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid $border-subtle;
      border-radius: 8px;
      box-shadow: none !important;
      &:hover {
        border-color: rgba(255, 255, 255, 0.15);
        background: rgba(255, 255, 255, 0.08);
      }
      &.is-focus {
        border-color: rgba(102, 126, 234, 0.5);
      }
    }
    :deep(.el-input__inner),
    :deep(.el-textarea__inner) {
      color: #fff;
    }
    :deep(.el-input__inner::placeholder),
    :deep(.el-textarea__inner::placeholder) {
      color: rgba(255, 255, 255, 0.3);
    }
  }

  @media (max-width: 768px) {
    .contact-grid {
      grid-template-columns: 1fr;
    }
    .contact-info {
      grid-template-columns: 1fr;
    }
    .contact-hero {
      padding: 80px 16px 30px;
      h1 {
        font-size: 24px;
      }
    }
    .contact-body {
      padding: 0 12px 40px;
    }
    .contact-form-wrapper {
      padding: 20px 16px;
    }
  }
</style>
