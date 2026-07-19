<template>
  <div class="features-page">
    <AppHeader :tool-categories="toolCategories" @scroll-to="scrollTo" @go-to-login="goToLogin" @go-to-home="goToHome" @scroll-to-top="scrollToTop" />

    <!-- ========== 产品 ========== -->
    <section class="features-section">
      <div class="section-header">
        <h2>产品</h2>
        <p>覆盖「营销→供应→管理→智能」全业务闭环的企业级解决方案</p>
      </div>
      <div class="feature-tabs">
        <button v-for="cat in featureCategories" :key="cat.key" :class="{ active: activeCategory === cat.key }" @click="activeCategory = cat.key">
          {{ cat.label }}
        </button>
      </div>
      <div class="features-grid">
        <div class="feature-card" v-for="f in filteredFeatures" :key="f.code" @click="goToLogin">
          <div class="feature-card-bg" :style="{ background: f.gradient }"></div>
          <div class="feature-icon" :style="{ background: f.gradient }">
            <el-icon :size="24"><component :is="f.icon" /></el-icon>
          </div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
          <div class="feature-meta">
            <span class="feature-service-tag" v-for="s in f.services" :key="s">{{ s }}</span>
          </div>
          <span class="feature-link">了解更多 →</span>
        </div>
      </div>
    </section>

    <AppFooter />

    <AppLogin v-model:visible="showLogin" @login-success="goToHome" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import AppLogin from '@/views/admin/auth/AppLogin.vue'
  import AppFooter from '@/views/website/components/AppFooter.vue'
  import AppHeader from '@/views/website/components/AppHeader.vue'
  import { toolCategories, featureCategories, features } from '@/shared/constants/Portal.constant'

  const router = useRouter()

  const scrollToTop = () => router.push('/')
  const scrollTo = () => {}

  const showLogin = ref(false)
  const goToLogin = () => {
    showLogin.value = true
  }
  const goToHome = () => router.push('/admin/home')

  const activeCategory = ref('all')

  const filteredFeatures = computed(() => (activeCategory.value === 'all' ? features : features.filter(f => f.category === activeCategory.value)))
</script>

<style scoped lang="scss">
  $bg: var(--portal-bg);
  $bc: var(--portal-bc);
  $bd: var(--portal-bd);
  $t1: var(--portal-t1);
  $t2: var(--portal-t2);
  $t3: var(--portal-t3);
  $a: #667eea;
  $ag: linear-gradient(135deg, #667eea, #764ba2);

  .features-page {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif;
    color: $t1;
    background: $bg;
    min-height: 100vh;
  }

  .features-section {
    padding: 120px 24px 120px;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 1px;
      height: 60px;
      background: linear-gradient(180deg, transparent, rgba(102, 126, 234, 0.2));
    }
  }

  .section-header {
    text-align: center;
    margin-bottom: 52px;
    h2 {
      font-size: 34px;
      font-weight: 700;
      margin-bottom: 12px;
      color: $t1;
      letter-spacing: -0.3px;
    }
    p {
      font-size: 16px;
      color: $t2;
      line-height: 1.6;
    }
  }

  .feature-tabs {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 36px;
    flex-wrap: wrap;
    button {
      padding: 7px 22px;
      border: 1px solid $bd;
      border-radius: 20px;
      background: transparent;
      color: $t2;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.25s;
      letter-spacing: 0.3px;
      &:hover {
        border-color: rgba(102, 126, 234, 0.3);
        color: $t1;
        background: rgba(102, 126, 234, 0.04);
      }
      &.active {
        background: $ag;
        border-color: transparent;
        color: #fff;
        box-shadow: 0 4px 14px rgba(102, 126, 234, 0.25);
      }
    }
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }

  .feature-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
    border: 1px solid $bd;
    border-radius: 14px;
    padding: 24px 18px 20px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition:
      transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow 0.35s,
      border-color 0.35s;
    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);
      border-color: rgba(102, 126, 234, 0.3);
      .feature-card-bg {
        opacity: 0.08;
      }
      .feature-link {
        opacity: 1;
      }
    }
    .feature-card-bg {
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 0.4s;
      pointer-events: none;
      border-radius: 14px;
    }
    .feature-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      margin-bottom: 14px;
      position: relative;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    h3 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 6px;
      color: $t1;
      position: relative;
    }
    p {
      font-size: 12px;
      color: $t2;
      line-height: 1.65;
      margin-bottom: 12px;
      position: relative;
    }
    .feature-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 10px;
      position: relative;
      .feature-service-tag {
        font-size: 10px;
        padding: 2px 7px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid $bd;
        border-radius: 4px;
        color: $t3;
        font-family: monospace;
      }
    }
    .feature-link {
      font-size: 12px;
      font-weight: 500;
      color: $a;
      position: relative;
      opacity: 0.7;
      transition: opacity 0.25s;
    }
  }

  @media (max-width: 768px) {
    .features-section {
      padding: 80px 16px 80px;
    }
    .section-header h2 {
      font-size: 24px;
    }
    .features-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .feature-tabs {
      gap: 6px;
    }
  }
  @media (min-width: 769px) and (max-width: 1024px) {
    .features-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
