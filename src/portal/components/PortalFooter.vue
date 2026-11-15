<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="logo">
          <span class="logo-icon">M</span>
          <span class="logo-text">{{ setting.title }}</span>
        </div>
        <p>企业管理更智能</p>
      </div>
      <div class="footer-links">
        <div class="link-group" v-for="group in footerGroups" :key="group.title">
          <h4>{{ group.title }}</h4>
          <div class="link-list">
            <a
              v-for="link in group.links"
              :key="link.label"
              :href="link.href"
              :target="link.external ? '_blank' : undefined"
              :rel="link.external ? 'noopener noreferrer' : undefined"
              class="footer-link"
            >
              <span v-if="link.icon" class="link-icon" v-html="link.icon"></span>
              {{ link.label }}
            </a>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© {{ currentYear }} {{ setting.title }}. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
  import setting from '@/setting'

  const currentYear = new Date().getFullYear()

  const footerGroups = [
    {
      title: '资源',
      links: [
        { label: 'API 文档', href: '#' },
        { label: '帮助中心', href: '#' },
        { label: '系统状态', href: '#' },
        { label: '版本更新', href: '#' }
      ]
    },
    {
      title: '社区',
      links: [
        {
          label: 'Gitee',
          href: 'https://gitee.com/machineswift',
          external: true,
          icon: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M11.984 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 01-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63a.592.592 0 00.592-.592v-1.482a.593.593 0 01.593-.593h2.963a.593.593 0 01.593.593v3.556a.593.593 0 01-.593.592h-5.63a4.15 4.15 0 01-4.148-4.148v-5.63a4.15 4.15 0 014.148-4.148h8.296z"/></svg>'
        },
        {
          label: 'GitHub',
          href: 'https://github.com/machineswift',
          external: true,
          icon: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>'
        },
        { label: '意见反馈', href: '#' },
        { label: '建议提交', href: '#' }
      ]
    },
    {
      title: '关于',
      links: [
        { label: '公司介绍', href: '/#/website/portal/about' },
        { label: '联系我们', href: '/#/website/portal/contact' },
        { label: '加入我们', href: '#' },
        { label: '隐私政策', href: '#' }
      ]
    }
  ]
</script>

<style scoped lang="scss">
  $t1: var(--portal-t1);
  $t2: var(--portal-t2);
  $t3: var(--portal-t3);
  $bd: var(--portal-bd);
  $a: #667eea;

  .app-footer {
    background: var(--portal-bg, #0a0a0c);
    color: $t2;
    padding: 60px 24px 0;
    border-top: 1px solid $bd;
  }
  .footer-inner {
    max-width: 1600px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 2fr 3fr;
    gap: 60px;
    padding-bottom: 40px;
  }
  .footer-brand {
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      .logo-icon {
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-weight: 700;
        font-size: 18px;
      }
      .logo-text {
        font-size: 20px;
        font-weight: 700;
        color: $t1;
      }
    }
    p {
      font-size: 18px;
      font-weight: 700;
      line-height: 1.6;
      color: $t3;
    }
  }
  .footer-links {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 32px;
  }
  .link-group {
    h4 {
      color: $t1;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
      letter-spacing: 0.5px;
    }
    a {
      display: block;
      color: $t3;
      text-decoration: none;
      font-size: 13px;
      padding: 4px 0;
      transition: all 0.2s;
      &:hover {
        color: $a;
        padding-left: 4px;
      }
    }
    .link-icon {
      display: inline-block;
      vertical-align: middle;
      margin-right: 4px;
      line-height: 1;
    }
  }
  .footer-bottom {
    border-top: 1px solid $bd;
    text-align: center;
    padding: 20px 0;
    font-size: 13px;
    color: $t3;
  }

  @media (max-width: 768px) {
    .footer-inner {
      grid-template-columns: 1fr;
      gap: 32px;
    }
    .footer-links {
      grid-template-columns: 1fr;
      gap: 24px;
    }
  }
</style>
