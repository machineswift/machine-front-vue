<template>
  <div class="about-page">
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

    <!-- 介绍内容 -->
    <section class="about-hero">
      <h1>{{ setting.title }}</h1>
      <p class="about-motto">企业管理更智能</p>
    </section>

    <section class="about-content">
      <div class="content-block">
        <h2>项目介绍</h2>
        <p>
          <strong>Machine</strong>
          是一个面向企业的智能化微服务平台，致力于为企业提供一站式的数字化解决方案。 平台涵盖统一身份认证（IAM）、客户关系管理（CRM）、供应链管理（SCM）、
          人力资源管理（HRM）、AI 智能服务、数据中台、流程引擎（Camunda BPM）、 商业智能（BI）、第三方渠道集成等核心业务模块。
        </p>
        <p>
          后端基于
          <strong>Spring Boot 4</strong>
          +
          <strong>Spring Cloud Alibaba 2025</strong>
          微服务架构， 运行在
          <strong>Java 25</strong>
          之上，采用 Nacos 服务注册与配置中心，OpenFeign 服务间通信， Spring Cloud Gateway 统一网关路由。前端使用
          <strong>Vue 3 + TypeScript + Element Plus + Vite 8</strong>
          构建， 通过动态路由与后端 RBAC 权限模型联动，实现按钮级细粒度权限控制。
        </p>
        <p>
          数据层采用
          <strong>PostgreSQL</strong>
          （业务库）+
          <strong>MySQL</strong>
          （中间件）混合架构， 通过 MyBatis-Plus + dynamic-datasource 实现多数据源动态切换。缓存层采用 Redisson + Jedis + Caffeine 三级缓存体系，消息队列集成
          RocketMQ，分布式调度集成 XXL-Job。
        </p>
        <p>
          平台同时提供
          <strong>微服务</strong>
          与
          <strong>单体</strong>
          两种部署形态： 微服务版基于 Nacos + OpenFeign 实现服务治理，适合中大型企业分布式部署；
          单体版同源共建，业务能力保持一致，适合单机/小规模场景快速交付与运维。 线上演示：
          <strong>www.machinerust.cn</strong>
          （账号 demo / 123456）。
        </p>
      </div>

      <div class="content-block">
        <h2>核心优势</h2>
        <div class="advantages-grid">
          <div class="advantage-card" v-for="a in advantages" :key="a.title">
            <el-icon :size="28" :color="a.color"><component :is="a.icon" /></el-icon>
            <h3>{{ a.title }}</h3>
            <p>{{ a.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <AppFooter />

    <AppLogin v-model:visible="showLogin" @login-success="goToHome" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import setting from '@/setting'
  import AppLogin from '@/views/admin/auth/AppLogin.vue'
  import AppFooter from '@/views/website/components/AppFooter.vue'
  import AppHeader from '@/views/website/components/AppHeader.vue'
  import { toolCategories } from '@/shared/constants/Portal.constant'

  const router = useRouter()
  const showLogin = ref(false)

  const activeSection = ref('')
  const navItems: Array<{ key: string; href: string; label: string }> = []

  const scrollToTop = () => router.push('/')
  const scrollTo = () => {}
  const goToLogin = () => {
    showLogin.value = true
  }
  const goToHome = () => router.push('/admin/home')

  const advantages = [
    { icon: 'el-icon-SetUp', color: '#667eea', title: '双形态架构', desc: '微服务 + 单体同源共建，一套代码两种部署形态，兼顾分布式能力与单机轻量交付' },
    { icon: 'el-icon-Lock', color: '#43e97b', title: '全面安全体系', desc: 'RBAC 细粒度权限、OAuth2 授权服务器、JWT 无状态鉴权、操作审计日志全覆盖' },
    {
      icon: 'el-icon-Connection',
      color: '#f093fb',
      title: '多生态集成',
      desc: '微信小程序/公众号/企业微信/支付、飞书开放平台、华为云 API Gateway、北森 HR SaaS'
    },
    { icon: 'el-icon-Cpu', color: '#4facfe', title: 'AI 智能驱动', desc: '基于 Spring AI + DashScope 大语言模型，支持智能问答、文档分析、流程自动化' },
    {
      icon: 'el-icon-DataAnalysis',
      color: '#fa709a',
      title: '全链路数据能力',
      desc: 'PostgreSQL + MySQL 混合存储，MyBatis-Plus 多数据源，Redisson 三级缓存体系'
    },
    { icon: 'el-icon-Notification', color: '#11998e', title: '异步消息与调度', desc: 'RocketMQ 异步消息解耦，XXL-Job 分布式调度，Camunda BPM 工作流引擎' }
  ]
</script>

<style scoped lang="scss">
  $bg-primary: var(--portal-bg);
  $bg-card: var(--portal-bc);
  $border-subtle: var(--portal-bd);
  $text-primary: var(--portal-t1);
  $text-secondary: var(--portal-t2);
  $text-muted: var(--portal-t3);
  $accent: #667eea;
  $accent-gradient: linear-gradient(135deg, #667eea, #764ba2);

  .about-page {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: $text-primary;
    background: $bg-primary;
    min-height: 100vh;
  }

  .about-hero {
    padding: 140px 24px 80px;
    text-align: center;
    background: linear-gradient(180deg, var(--portal-bg), rgba(102, 126, 234, 0.06));

    h1 {
      font-size: 42px;
      font-weight: 700;
      margin-bottom: 16px;
      color: $text-primary;
    }

    .about-motto {
      font-size: 18px;
      color: $accent;
      font-weight: 500;
    }
  }

  .about-content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 80px 24px;
  }

  .content-block {
    margin-bottom: 64px;

    h2 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 24px;
      position: relative;
      padding-left: 16px;
      color: $text-primary;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 4px;
        bottom: 4px;
        width: 4px;
        background: $accent-gradient;
        border-radius: 2px;
      }
    }

    p {
      font-size: 15px;
      color: $text-secondary;
      line-height: 1.8;
      margin-bottom: 16px;
    }
  }

  .advantages-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .advantage-card {
    background: $bg-card;
    border-radius: 12px;
    padding: 24px;
    border: 1px solid $border-subtle;
    transition:
      transform 0.3s,
      box-shadow 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      border-color: rgba(102, 126, 234, 0.2);
    }

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 12px 0 8px;
      color: $text-primary;
    }

    p {
      font-size: 14px;
      color: $text-secondary;
      line-height: 1.6;
      margin: 0;
    }
  }

  @media (max-width: 768px) {
    .advantages-grid {
      grid-template-columns: 1fr;
    }

    .about-hero h1 {
      font-size: 28px;
    }
  }
</style>
