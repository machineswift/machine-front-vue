<template>
  <div class="landing-page">
    <AppHeader
      :nav-items="navItems"
      :tool-categories="toolCategories"
      :active-section="activeSection"
      @scroll-to="scrollTo"
      @go-to-login="goToLogin"
      @go-to-home="goToHome"
      @scroll-to-top="scrollToTop"
    />

    <!-- ========== HERO 区域 ========== -->
    <section id="hero" class="hero-section">
      <div class="hero-bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
      <div class="hero-content">
        <!-- 开源标识 -->
        <div class="hero-badge">
          <span class="badge-dot"></span>
          开源 · 微服务 · 云原生
        </div>

        <h1 class="hero-title">
          <span class="gradient-text">{{ setting.title }}</span>
          <br />
          企业级智能管理平台
        </h1>
        <p class="hero-subtitle">
          基于 Spring Boot 4 + Spring Cloud Alibaba 2025，覆盖
          <strong>CRM、SCM、HRM、AI、流程引擎、BI</strong>
          等核心业务，微服务与单体同源共建，开源开放。
        </p>
        <div class="hero-actions">
          <el-button type="primary" size="large" round @click="goToLogin">
            立即体验
            <el-icon class="btn-icon"><ArrowRight /></el-icon>
          </el-button>
          <el-button size="large" round @click="goToLogin">
            <el-icon style="margin-right: 4px"><component :is="'el-icon-View'" /></el-icon>
            核心功能
          </el-button>
        </div>
        <div class="hero-stats">
          <div class="stat-item" v-for="s in stats" :key="s.label">
            <span class="stat-number">{{ s.number }}</span>
            <span class="stat-label">{{ s.label }}</span>
          </div>
        </div>
        <div class="hero-demo">
          <span class="hero-demo-label">体验账号</span>
          <div class="hero-demo-table">
            <div class="hero-demo-tr" v-for="acct in demoAccounts" :key="acct[1]">
              <span>👤 访客</span>
              <span>
                <code>{{ acct[0] }}</code>
              </span>
              <span>
                <code>{{ acct[1] }}</code>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <AppFooter />

    <AppLogin v-model:visible="showLogin" @login-success="goToHome" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import AppLogin from '@/views/admin/auth/AppLogin.vue'
  import AppFooter from '@/views/website/components/AppFooter.vue'
  import AppHeader from '@/views/website/components/AppHeader.vue'
  import { ArrowRight } from '@element-plus/icons-vue'
  import setting from '@/setting'
  import { toolCategories } from '@/shared/constants/Portal.constant'

  const router = useRouter()
  // ========== 导航 ==========
  const activeSection = ref('')
  const navItems: Array<{ key: string; href: string; label: string }> = []

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const scrollTo = () => {}

  const showLogin = ref(false)
  const goToLogin = () => {
    showLogin.value = true
  }
  const goToHome = () => router.push('/admin/home')

  // ========== 统计数据 ==========
  const stats = [
    { number: '9+', label: '业务微服务' },
    { number: '12', label: '核心功能模块' },
    { number: '2', label: '部署形态' },
    { number: '17+', label: '技术组件' }
  ]

  const demoAccounts = [
    ['demo', '123456'],
    ['guest', '123456']
  ]
</script>

<style scoped lang="scss">
  $bg: var(--portal-bg);
  $bd: var(--portal-bd);
  $t1: var(--portal-t1);
  $t2: var(--portal-t2);
  $t3: var(--portal-t3);
  $a: #667eea;
  $ag: linear-gradient(135deg, #667eea, #764ba2);

  .landing-page {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: $t1;
    background: $bg;
    overflow-x: hidden;
  }

  .hero-section {
    min-height: 92vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    padding: 80px 24px 0;
  }

  .hero-bg-shapes {
    position: absolute;
    inset: 0;
    pointer-events: none;
    .shape {
      position: absolute;
      border-radius: 50%;
      opacity: 0.08;
      &.shape-1 {
        width: 700px;
        height: 700px;
        background: #667eea;
        top: -200px;
        right: -150px;
        animation: float 8s ease-in-out infinite;
      }
      &.shape-2 {
        width: 500px;
        height: 500px;
        background: #764ba2;
        bottom: -150px;
        left: -100px;
        animation: float 10s ease-in-out infinite reverse;
      }
      &.shape-3 {
        width: 300px;
        height: 300px;
        background: #43e97b;
        top: 60%;
        left: 70%;
        animation: float 12s ease-in-out infinite;
      }
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
    }
    33% {
      transform: translate(30px, -30px) scale(1.05);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.95);
    }
  }

  .hero-content {
    text-align: center;
    position: relative;
    z-index: 1;
    max-width: 800px;
  }

  .hero-title {
    font-size: 32px;
    font-weight: 700;
    line-height: 1.1;
    margin-bottom: 16px;
    letter-spacing: -0.5px;
    color: $t1;
    .gradient-text {
      background: $ag;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 16px;
    background: rgba(102, 126, 234, 0.08);
    border: 1px solid rgba(102, 126, 234, 0.15);
    border-radius: 20px;
    font-size: 13px;
    color: $a;
    font-weight: 500;
    margin-bottom: 28px;
    backdrop-filter: blur(4px);
    .badge-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #43e97b;
      animation: dotPulse 2s ease-in-out infinite;
    }
  }

  @keyframes dotPulse {
    0%,
    100% {
      opacity: 1;
      box-shadow: 0 0 0 0 rgba(67, 233, 123, 0.4);
    }
    50% {
      opacity: 0.8;
      box-shadow: 0 0 0 6px rgba(67, 233, 123, 0);
    }
  }

  .hero-subtitle {
    font-size: 18px;
    color: $t2;
    line-height: 1.7;
    margin-bottom: 36px;
    font-weight: 400;
    strong {
      color: $t1;
      font-weight: 600;
    }
  }

  .hero-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-bottom: 52px;
    .btn-icon {
      margin-left: 4px;
      transition: transform 0.2s;
    }
    .el-button:hover .btn-icon {
      transform: translateX(3px);
    }
  }

  .hero-stats {
    display: flex;
    justify-content: center;
    gap: 56px;
    margin-bottom: 28px;
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      .stat-number {
        font-size: 30px;
        font-weight: 700;
        color: $t1;
        background: linear-gradient(180deg, $t1, rgba(255, 255, 255, 0.6));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .stat-label {
        font-size: 13px;
        color: $t3;
      }
    }
  }

  .hero-demo {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-top: 16px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.06), rgba(118, 75, 162, 0.06));
    border: 1px solid rgba(102, 126, 234, 0.2);
    border-radius: 12px;
    padding: 14px 20px 16px;
    backdrop-filter: blur(8px);
    .hero-demo-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--portal-t2, $t2);
      letter-spacing: 1px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 6px;
      &::before {
        content: '🔑';
        font-size: 13px;
      }
    }
    .hero-demo-table {
      display: flex;
      gap: 8px;
    }
    .hero-demo-tr {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 8px;
      background: rgba(102, 126, 234, 0.08);
      border: 1px solid rgba(102, 126, 234, 0.12);
      transition: all 0.2s;
      &:hover {
        background: rgba(102, 126, 234, 0.14);
        border-color: rgba(102, 126, 234, 0.25);
        transform: translateY(-1px);
      }
      span {
        color: var(--portal-t2, $t2);
        font-size: 12px;
        white-space: nowrap;
      }
      code {
        display: inline-block;
        color: var(--portal-t1, $t1);
        background: rgba(102, 126, 234, 0.2);
        padding: 2px 10px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
        letter-spacing: 0.3px;
      }
    }
  }

  @media (max-width: 768px) {
    .hero-title {
      font-size: 32px;
    }
    .hero-subtitle {
      font-size: 15px;
    }
    .hero-stats {
      gap: 24px;
      flex-wrap: wrap;
      .stat-number {
        font-size: 24px;
      }
    }
  }
</style>
