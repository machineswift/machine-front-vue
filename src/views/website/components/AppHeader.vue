<template>
  <header class="app-header" :class="{ scrolled: isScrolled }">
    <div class="header-inner">
      <div class="logo" @click="$emit('scroll-to-top')">
        <span class="logo-icon">M</span>
        <span class="logo-text">{{ setting.title }}</span>
      </div>

      <nav class="nav-links">
        <a
          v-for="item in navItems"
          :key="item.key"
          :href="item.href"
          :class="{ active: activeSection === item.key }"
          @click.prevent="$emit('scroll-to', item.key)"
        >
          {{ item.label }}
        </a>
        <router-link to="/website/portal/products" class="nav-link">产品</router-link>
        <div class="nav-dropdown">
          <router-link to="/website/tools" class="nav-dropdown-trigger">工具</router-link>
          <div class="dropdown-menu">
            <div v-for="cat in toolCategories" :key="cat.key" class="dropdown-category">
              <div class="dropdown-category-title">
                <span class="cat-icon">{{ cat.icon }}</span>
                <span>{{ cat.label }}</span>
              </div>
              <div class="dropdown-category-items">
                <router-link v-for="tool in cat.tools" :key="tool.path" :to="tool.path" class="dropdown-item">
                  <span class="item-dot"></span>
                  <span class="item-label">{{ tool.label }}</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div class="header-actions">
        <!-- 官网主题切换 -->
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换到亮色模式' : '切换到深色模式'">
          <svg v-if="isDark" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        </button>
        <el-button v-if="!isLoggedIn" type="primary" size="small" round @click="$emit('go-to-login')">登录</el-button>
        <el-button v-else type="primary" size="small" round @click="$emit('go-to-home')">进入控制台</el-button>
      </div>

      <!-- 移动端菜单按钮 -->
      <button class="mobile-menu-btn" :class="{ open: mobileMenuOpen }" @click="mobileMenuOpen = !mobileMenuOpen">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <!-- 移动端遮罩层 -->
    <transition name="fade">
      <div v-if="mobileMenuOpen" class="mobile-overlay" @click="mobileMenuOpen = false"></div>
    </transition>

    <!-- 移动端下拉菜单 -->
    <transition name="slide">
      <div v-if="mobileMenuOpen" class="mobile-menu">
        <!-- 导航链接 -->
        <a v-for="item in navItems" :key="item.key" :href="item.href" class="mobile-nav-link" @click.prevent="handleNavClick(item.key)">
          {{ item.label }}
        </a>

        <!-- 产品 -->
        <router-link to="/website/portal/products" class="mobile-nav-link" @click="mobileMenuOpen = false">
          <span class="mobile-nav-icon">📦</span>
          产品
        </router-link>

        <!-- 工具 -->
        <router-link to="/website/tools" class="mobile-nav-link" @click="mobileMenuOpen = false">
          <span class="mobile-nav-icon">🔧</span>
          工具
        </router-link>

        <!-- 登录按钮 -->
        <div class="mobile-menu-footer">
          <el-button type="primary" round @click="handleMobileLogin" class="mobile-login-btn">
            {{ isLoggedIn ? '进入控制台' : '登录' }}
          </el-button>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
  import { useIamUserStore } from '@/shared/stores/IamUser.store'
  import { usePortalTheme } from '@/views/website/composables/usePortalTheme'
  import setting from '@/setting'

  const { isDark, toggle: toggleTheme } = usePortalTheme()

  defineProps<{
    navItems?: Array<{ key: string; href: string; label: string }>
    toolCategories: Array<{
      key: string
      label: string
      icon: string
      tools: Array<{ path: string; label: string }>
    }>
    activeSection?: string
  }>()

  const emit = defineEmits<{
    'scroll-to': [key: string]
    'go-to-login': []
    'go-to-home': []
    'scroll-to-top': []
  }>()

  const userStore = useIamUserStore()
  const isLoggedIn = computed(() => userStore.isAuthenticated)

  const isScrolled = ref(false)
  const mobileMenuOpen = ref(false)
  // 移动端菜单打开时禁止 body 滚动
  watch(mobileMenuOpen, open => {
    document.body.style.overflow = open ? 'hidden' : ''
  })

  const handleScroll = () => {
    isScrolled.value = window.scrollY > 50
  }

  const handleNavClick = (key: string) => {
    mobileMenuOpen.value = false
    emit('scroll-to', key)
  }

  const handleMobileLogin = () => {
    mobileMenuOpen.value = false
    if (isLoggedIn.value) {
      emit('go-to-home')
    } else {
      emit('go-to-login')
    }
  }

  onMounted(() => window.addEventListener('scroll', handleScroll))
  onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped lang="scss">
  $t1: rgba(255, 255, 255, 0.87);
  $t2: rgba(255, 255, 255, 0.6);
  $t3: rgba(255, 255, 255, 0.38);
  $bd: rgba(255, 255, 255, 0.06);
  $a: #667eea;
  $ag: linear-gradient(135deg, #667eea, #764ba2);

  .app-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: var(--portal-header-bg);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--portal-bd, $bd);
    transition:
      background 0.3s,
      border-color 0.3s;
    &.scrolled {
      border-bottom-color: rgba(255, 255, 255, 0.1);
    }
    .header-inner {
      max-width: 1600px;
      margin: 0 auto;
      padding: 0 24px;
      height: 46px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
    }
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    .logo-icon {
      width: 30px;
      height: 30px;
      background: $ag;
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 700;
      font-size: 15px;
    }
    .logo-text {
      font-size: 17px;
      font-weight: 700;
      color: var(--portal-t1, $t1);
    }
  }

  .nav-links {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 28px;
    align-items: center;
    > a {
      text-decoration: none;
      color: var(--portal-t2, $t2);
      font-size: 13px;
      font-weight: 500;
      transition: color 0.2s;
      &:hover,
      &.active {
        color: var(--portal-t1, $t1);
      }
    }
  }

  // ========== 工具下拉菜单 ==========
  .nav-dropdown {
    position: relative;
    cursor: pointer;

    &:hover .dropdown-menu,
    .dropdown-menu:hover {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(0);
    }

    .nav-link,
    .nav-dropdown-trigger {
      text-decoration: none;
      color: var(--portal-t2, $t2);
      font-size: 13px;
      font-weight: 500;
      transition: color 0.2s;
      position: relative;
      &:hover {
        color: var(--portal-t1, $t1);
      }
    }
    .nav-dropdown-trigger {
      &::after {
        content: '▾';
        font-size: 8px;
        margin-left: 3px;
        opacity: 0.5;
      }
    }

    .dropdown-menu {
      position: absolute;
      left: 50%;
      top: calc(100% + 16px);
      transform: translateX(-50%) translateY(-6px);
      min-width: 320px;
      background: var(--portal-bg, #1a1a1e);
      border: 1px solid var(--portal-bd, rgba(255, 255, 255, 0.08));
      border-radius: 12px;
      padding: 12px 16px;
      opacity: 0;
      visibility: hidden;
      transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      z-index: 1001;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 16px;

      &::before {
        content: '';
        position: absolute;
        top: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 12px;
        height: 8px;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 8px solid rgba(255, 255, 255, 0.08);
      }
    }

    .dropdown-category {
      padding: 6px 0;

      .dropdown-category-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 600;
        color: var(--portal-t3, $t3);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
        padding: 0 8px;

        .cat-icon {
          font-size: 12px;
        }
      }

      .dropdown-category-items {
        display: flex;
        flex-direction: column;
        gap: 1px;
      }

      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 5px 8px;
        border-radius: 6px;
        text-decoration: none;
        color: var(--portal-t2, $t2);
        font-size: 13px;
        transition: all 0.15s;

        &:hover {
          background: rgba(102, 126, 234, 0.08);
          color: var(--portal-t1, $t1);
        }

        .item-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: currentColor;
          flex-shrink: 0;
        }

        .item-label {
          flex: 1;
        }
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: auto;
  }

  // ========== 主题切换按钮 ==========
  .theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: 1px solid var(--portal-bd, $bd);
    border-radius: 50%;
    background: transparent;
    color: var(--portal-t2, $t2);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: var(--portal-bc);
      color: var(--portal-t1, $t1);
      border-color: var(--portal-bd-hover);
    }
  }

  // ========== 汉堡菜单按钮（带动画） ==========
  .mobile-menu-btn {
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    margin-right: -8px;
    width: 40px;
    height: 40px;
    position: relative;
    z-index: 1002;

    span {
      display: block;
      width: 22px;
      height: 2px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 2px;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      transform-origin: center;
    }

    // 打开状态：三线 → X
    &.open {
      span:nth-child(1) {
        transform: translateY(7px) rotate(45deg);
      }
      span:nth-child(2) {
        opacity: 0;
        transform: scaleX(0);
      }
      span:nth-child(3) {
        transform: translateY(-7px) rotate(-45deg);
      }
    }
  }

  // ========== 遮罩层 ==========
  .mobile-overlay {
    position: fixed;
    top: 46px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    z-index: 998;
  }

  // ========== 移动端右侧抽屉菜单 ==========
  .mobile-menu {
    position: fixed;
    top: 46px;
    right: 0;
    left: auto;
    width: 260px;
    max-width: 48vw;
    max-height: calc(100vh - 46px);
    overflow-y: auto;
    background: var(--portal-bg, #1a1a1e);
    border-left: 1px solid var(--portal-bd, rgba(255, 255, 255, 0.08));
    border-bottom: 1px solid var(--portal-bd, rgba(255, 255, 255, 0.06));
    border-radius: 0 0 0 16px;
    box-shadow: -8px 8px 32px rgba(0, 0, 0, 0.4);
    z-index: 999;
    padding: 8px 0;

    .mobile-nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: $t2;
      font-size: 15px;
      padding: 12px 24px;
      transition: all 0.15s;
      min-height: 44px;
      -webkit-tap-highlight-color: transparent;

      &:active {
        background: rgba(102, 126, 234, 0.06);
        color: $t1;
      }
    }

    .mobile-nav-icon {
      font-size: 16px;
    }

    // 底部登录按钮
    .mobile-menu-footer {
      padding: 12px 24px 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.04);
      margin-top: 8px;

      .mobile-login-btn {
        width: 100%;
      }
    }
  }

  // ========== 过渡动画 ==========
  // 遮罩淡入淡出
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.25s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  // 右侧抽屉水平滑入
  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .slide-enter-from {
    opacity: 0;
    transform: translateX(60px);
  }
  .slide-leave-to {
    opacity: 0;
    transform: translateX(60px);
  }

  @media (max-width: 768px) {
    // 中间导航：取消绝对定位，变回正常流，紧凑排列填满中间
    .nav-links {
      position: static;
      transform: none;
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      padding: 0 4px;

      > a {
        white-space: nowrap;
        flex-shrink: 1;
        min-width: 0;
        font-size: 12px;
        padding: 2px 7px;
        line-height: 1.2;
      }

      // 工具下拉菜单在导航栏中隐藏（已在汉堡菜单中）
      .nav-dropdown {
        display: none;
      }
    }

    // 右侧操作按钮保持可见，重置桌面端的 margin-left:auto
    .header-actions {
      display: flex;
      margin-left: 0;

      .el-button {
        font-size: 12px;
        padding: 5px 10px;
      }
    }

    .mobile-menu-btn {
      display: flex;
    }
  }
</style>
