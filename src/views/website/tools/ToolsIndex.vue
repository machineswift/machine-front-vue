<template>
  <div class="tools-page">
    <AppHeader :tool-categories="toolCategories" @scroll-to-top="goHome" @go-to-login="goToLogin" @go-to-home="goToHome" />

    <div class="tools-layout">
      <!-- 左侧树形分类导航 -->
      <aside class="tools-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <h3>研发工具</h3>
          <button class="sidebar-toggle" @click="sidebarCollapsed = !sidebarCollapsed">
            <span></span>
            <span></span>
          </button>
        </div>
        <div class="sidebar-search">
          <el-input v-model="searchQuery" placeholder="搜索工具..." size="small" clearable prefix-icon="Search" />
        </div>
        <nav class="sidebar-nav">
          <div v-for="category in filteredCategories" :key="category.key" class="nav-category">
            <div class="category-header" :class="{ active: activeCategory === category.key }" @click="toggleCategory(category.key)">
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-label">{{ category.label }}</span>
              <span class="category-count">{{ category.tools.length }}</span>
              <span class="category-arrow" :class="{ open: expandedCategories.has(category.key) }">▶</span>
            </div>
            <div v-show="expandedCategories.has(category.key)" class="category-children">
              <router-link v-for="tool in category.tools" :key="tool.path" :to="tool.path" class="tool-link" :class="{ active: activeTool === tool.path }">
                <span class="tool-dot"></span>
                <span class="tool-label">{{ tool.label }}</span>
              </router-link>
            </div>
          </div>
        </nav>
      </aside>

      <!-- 右侧主内容 -->
      <main class="tools-main">
        <div class="tools-welcome">
          <h1>研发工具集</h1>
          <p>提升开发效率，从这些实用工具开始</p>
        </div>

        <div class="tools-grid" v-if="!searchQuery">
          <div v-for="category in toolCategories" :key="category.key" class="tool-category-section">
            <div class="category-section-header">
              <span class="section-icon">{{ category.icon }}</span>
              <h2>{{ category.label }}</h2>
            </div>
            <div class="category-tools-grid">
              <router-link v-for="tool in category.tools" :key="tool.path" :to="tool.path" class="tool-card">
                <div class="card-icon" v-html="tool.cardIcon"></div>
                <h3>{{ tool.label }}</h3>
                <p>{{ tool.desc }}</p>
                <div class="card-tags">
                  <span v-for="tag in tool.tags" :key="tag" class="card-tag">{{ tag }}</span>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <!-- 搜索结果 -->
        <div v-else class="search-results">
          <h3>搜索结果：{{ searchQuery }}</h3>
          <div v-if="searchResults.length" class="search-grid">
            <router-link v-for="tool in searchResults" :key="tool.path" :to="tool.path" class="tool-card">
              <div class="card-icon" v-html="tool.cardIcon"></div>
              <h3>{{ tool.label }}</h3>
              <p>{{ tool.desc }}</p>
              <div class="card-tags">
                <span v-for="tag in tool.tags" :key="tag" class="card-tag">{{ tag }}</span>
              </div>
            </router-link>
          </div>
          <div v-else class="search-empty">
            <p>未找到匹配 "{{ searchQuery }}" 的工具</p>
          </div>
        </div>
      </main>
    </div>

    <AppLogin v-model:visible="showLogin" @login-success="goToHome" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import AppLogin from '@/views/admin/auth/AppLogin.vue'
  import AppHeader from '@/views/website/components/AppHeader.vue'
  import { toolCategories } from '@/shared/constants/Portal.constant'

  const router = useRouter()

  const sidebarCollapsed = ref(false)
  const searchQuery = ref('')
  const activeCategory = ref('text')
  const activeTool = ref('')
  const expandedCategories = ref<Set<string>>(new Set(['text']))
  const showLogin = ref(false)

  const goHome = () => router.push('/')
  const goToLogin = () => {
    showLogin.value = true
  }
  const goToHome = () => router.push('/admin/home')

  const toggleCategory = (key: string) => {
    if (expandedCategories.value.has(key)) {
      expandedCategories.value.delete(key)
    } else {
      expandedCategories.value.add(key)
    }
    activeCategory.value = key
  }

  const filteredCategories = computed(() => {
    if (!searchQuery.value) return toolCategories
    const q = searchQuery.value.toLowerCase()
    return toolCategories
      .map(cat => ({
        ...cat,
        tools: cat.tools.filter(t => t.label.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q)))
      }))
      .filter(cat => cat.tools.length > 0)
  })

  const searchResults = computed(() => {
    if (!searchQuery.value) return []
    const q = searchQuery.value.toLowerCase()
    return toolCategories.flatMap(cat =>
      cat.tools.filter(t => t.label.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q)))
    )
  })

  onMounted(() => {
    toolCategories.forEach(c => expandedCategories.value.add(c.key))
  })
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
  $sidebar-w: 260px;

  .tools-page {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: $t1;
    background: $bg;
    min-height: 100vh;
  }

  // ========== 布局 ==========
  .tools-layout {
    display: flex;
    padding-top: 46px;
    min-height: calc(100vh - 46px);
  }

  // ========== 左侧栏 ==========
  .tools-sidebar {
    width: $sidebar-w;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.02);
    border-right: 1px solid $bd;
    padding: 20px 0;
    overflow-y: auto;
    height: calc(100vh - 46px);
    position: sticky;
    top: 46px;
    transition: width 0.3s;

    &.collapsed {
      width: 0;
      overflow: hidden;
      padding: 0;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px 12px;
      h3 {
        font-size: 15px;
        font-weight: 600;
        color: $t1;
        margin: 0;
      }
    }

    .sidebar-toggle {
      background: none;
      border: 1px solid $bd;
      border-radius: 4px;
      cursor: pointer;
      padding: 4px 6px;
      display: flex;
      flex-direction: column;
      gap: 3px;
      span {
        width: 14px;
        height: 1.5px;
        background: $t3;
        border-radius: 1px;
      }
    }

    .sidebar-search {
      padding: 0 16px 12px;

      :deep(.el-input) {
        --el-input-bg-color: $bc;
        --el-input-border-color: $bd;
        --el-input-text-color: $t1;
        --el-input-hover-border-color: $a;
        --el-input-focus-border-color: $a;
        --el-input-placeholder-color: $t3;
        --el-input-icon-color: $t3;

        .el-input__wrapper {
          background-color: $bc;
          box-shadow: 0 0 0 1px $bd inset;
          border-radius: 8px;
          transition: all 0.2s;

          &:hover {
            box-shadow: 0 0 0 1px var(--el-input-hover-border-color) inset;
          }

          &.is-focus {
            box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
          }
        }

        .el-input__inner {
          color: $t1;
          &::placeholder {
            color: $t3;
          }
        }

        .el-input__prefix {
          .el-icon {
            color: $t3;
          }
        }

        .el-input__clear {
          color: $t3;
          &:hover {
            color: $t2;
          }
        }
      }
    }

    .nav-category {
      margin-bottom: 2px;

      .category-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        cursor: pointer;
        transition: all 0.2s;
        user-select: none;
        position: relative;

        &:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        &.active {
          background: rgba(102, 126, 234, 0.06);
          border-right: 2px solid $a;
        }

        .category-icon {
          font-size: 16px;
          width: 24px;
          text-align: center;
        }

        .category-label {
          font-size: 13px;
          font-weight: 500;
          color: $t1;
          flex: 1;
        }

        .category-count {
          font-size: 11px;
          color: $t3;
          background: rgba(255, 255, 255, 0.04);
          padding: 1px 6px;
          border-radius: 8px;
          min-width: 18px;
          text-align: center;
        }

        .category-arrow {
          font-size: 8px;
          color: $t3;
          transition: transform 0.2s;
          &.open {
            transform: rotate(90deg);
          }
        }
      }

      .category-children {
        padding: 2px 0;
      }

      .tool-link {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 16px 6px 48px;
        text-decoration: none;
        color: $t2;
        font-size: 13px;
        transition: all 0.2s;
        position: relative;

        &:hover {
          color: $t1;
          background: rgba(255, 255, 255, 0.02);
        }

        &.active {
          color: $a;
          background: rgba(102, 126, 234, 0.06);
        }

        .tool-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: currentColor;
          flex-shrink: 0;
        }

        .tool-label {
          flex: 1;
        }
      }
    }
  }

  // ========== 主内容 ==========
  .tools-main {
    flex: 1;
    padding: 32px 40px;
    max-width: 1100px;
  }

  .tools-welcome {
    margin-bottom: 40px;
    h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
      background: $ag;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    p {
      font-size: 15px;
      color: $t2;
    }
  }

  .tool-category-section {
    margin-bottom: 40px;

    .category-section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;

      .section-icon {
        font-size: 20px;
      }

      h2 {
        font-size: 18px;
        font-weight: 600;
        color: $t1;
        margin: 0;
      }
    }
  }

  .category-tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 14px;
  }

  .tool-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
    border: 1px solid $bd;
    border-radius: 12px;
    padding: 20px;
    text-decoration: none;
    color: inherit;
    transition: all 0.3s;
    display: block;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
      border-color: rgba(102, 126, 234, 0.3);
    }

    .card-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(102, 126, 234, 0.08);
      border-radius: 10px;
      margin-bottom: 12px;
      color: $a;
    }

    h3 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 6px;
      color: $t1;
    }

    p {
      font-size: 12px;
      color: $t2;
      line-height: 1.6;
      margin-bottom: 10px;
    }

    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;

      .card-tag {
        font-size: 10px;
        padding: 2px 7px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid $bd;
        border-radius: 4px;
        color: $t3;
      }
    }
  }

  .search-results {
    h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 20px;
      color: $t1;
    }

    .search-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 14px;
    }

    .search-empty {
      text-align: center;
      padding: 60px 0;
      color: $t3;
      p {
        font-size: 15px;
      }
    }
  }

  @media (max-width: 768px) {
    .tools-sidebar {
      display: none;
    }
    .tools-main {
      padding: 24px 16px;
    }
    .category-tools-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
