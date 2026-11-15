import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'

/**
 * 静态路由配置
 */
export const constantRoute: ExtendedRouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/portal/pages/LandingPage.vue'),
    name: 'LANDING',
    meta: {
      title: '官网首页',
      code: 'LANDING',
      public: true,
      hidden: true
    }
  },

  {
    path: '/website',
    redirect: '/website/portal',
    name: 'WEBSITE',
    meta: {
      title: '官网',
      code: 'WEBSITE',
      public: true,
      hidden: true
    },
    children: [
      {
        path: 'portal',
        name: 'WEBSITE:PORTAL',
        meta: {
          title: '门户页面',
          code: 'WEBSITE:PORTAL',
          hidden: true
        },
        children: [
          {
            path: '',
            component: () => import('@/portal/pages/LandingPage.vue'),
            name: 'WEBSITE:PORTAL:HOME',
            meta: {
              title: '门户首页',
              code: 'WEBSITE:PORTAL:HOME',
              hidden: true
            }
          },
          {
            path: 'products',
            component: () => import('@/portal/pages/ProductsPage.vue'),
            name: 'WEBSITE:PORTAL:PRODUCTS',
            meta: {
              title: '产品',
              code: 'WEBSITE:PORTAL:PRODUCTS',
              hidden: false
            }
          },
          {
            path: 'about',
            component: () => import('@/portal/pages/AboutPage.vue'),
            name: 'WEBSITE:PORTAL:ABOUT',
            meta: {
              title: '关于我们',
              code: 'WEBSITE:PORTAL:ABOUT',
              hidden: false
            }
          },
          {
            path: 'contact',
            component: () => import('@/portal/pages/ContactPage.vue'),
            name: 'WEBSITE:PORTAL:CONTACT',
            meta: {
              title: '联系我们',
              code: 'WEBSITE:PORTAL:CONTACT',
              hidden: false
            }
          }
        ]
      },
      {
        path: 'tools',
        name: 'WEBSITE:TOOLS',
        meta: {
          title: '研发工具',
          code: 'WEBSITE:TOOLS',
          hidden: false
        },
        children: [
          {
            path: '',
            component: () => import('@/tools/ToolsIndex.vue'),
            name: 'WEBSITE:TOOLS:INDEX',
            meta: {
              title: '工具首页',
              code: 'WEBSITE:TOOLS:INDEX',
              hidden: false
            }
          },
          {
            path: 'markdown-editor',
            component: () => import('@/tools/MarkdownEditor.vue'),
            name: 'WEBSITE:TOOLS:MARKDOWN_EDITOR',
            meta: {
              title: 'Markdown 编辑器',
              code: 'WEBSITE:TOOLS:MARKDOWN_EDITOR',
              hidden: false
            }
          },
          {
            path: 'json-formatter',
            component: () => import('@/tools/JsonFormatter.vue'),
            name: 'WEBSITE:TOOLS:JSON_FORMATTER',
            meta: {
              title: 'JSON 格式化',
              code: 'WEBSITE:TOOLS:JSON_FORMATTER',
              hidden: false
            }
          },
          {
            path: 'file-preview',
            component: () => import('@/tools/FilePreview.vue'),
            name: 'WEBSITE:TOOLS:FILE_PREVIEW',
            meta: {
              title: '文件预览',
              code: 'WEBSITE:TOOLS:FILE_PREVIEW',
              hidden: false
            }
          },
          {
            path: 'json-tree',
            component: () => import('@/tools/JsonTree.vue'),
            name: 'WEBSITE:TOOLS:JSON_TREE',
            meta: {
              title: 'JSON 树形查看',
              code: 'WEBSITE:TOOLS:JSON_TREE',
              hidden: false
            }
          }
        ]
      }
    ]
  },

  {
    path: '/admin',
    redirect: '/admin/home',
    name: 'ADMIN',
    meta: {
      title: '控制台',
      code: 'ADMIN',
      hidden: true
    },
    children: [
      {
        path: 'login',
        component: () => import('@/layouts/auth/LoginPage.vue'),
        name: 'ADMIN:LOGIN',
        meta: {
          title: '登录',
          code: 'ADMIN:LOGIN',
          public: true,
          hidden: true
        }
      },
      {
        path: 'auth2/callback',
        component: () => import('@/layouts/auth/AuthCallback.vue'),
        name: 'ADMIN:AUTH2_CALLBACK',
        meta: {
          title: '第三方登录回调',
          code: 'ADMIN:AUTH2_CALLBACK',
          public: true,
          hidden: true
        }
      },
      {
        path: 'layout',
        component: () => import('@/layouts/admin/AdminLayout.vue'),
        name: 'ADMIN:LAYOUT',
        meta: {
          title: 'layout',
          code: 'ADMIN:LAYOUT',
          hidden: true
        },
        children: [
          {
            path: '/admin/home',
            component: () => import('@/modules/home/HomePage.vue'),
            name: 'ADMIN:HOME',
            meta: {
              title: '应用中心',
              code: 'ADMIN:HOME',
              icon: 'el-icon-Grid',
              hidden: false
            }
          },
          {
            path: '/admin/:pathMatch(.*)*',
            component: () => import('@/layouts/admin/AdminNotFound.vue'),
            name: 'ADMIN:NOT_FOUND',
            meta: {
              title: '页面不存在',
              code: 'ADMIN:NOT_FOUND',
              hidden: true
            }
          }
        ]
      },
      {
        path: 'redirect',
        component: () => import('@/layouts/admin/AdminLayout.vue'),
        name: 'ADMIN:REDIRECT',
        meta: {
          title: '重定向',
          code: 'ADMIN:REDIRECT',
          hidden: true
        },
        children: [
          {
            path: '/admin/redirect/:path(.*)',
            component: () => import('@/layouts/admin/Redirect.vue'),
            name: 'ADMIN:REDIRECT_PATH',
            meta: {
              title: '重定向',
              code: 'ADMIN:REDIRECT_PATH',
              hidden: true
            }
          }
        ]
      }
    ]
  },

  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/portal/pages/NotFound.vue'),
    name: 'ANY',
    meta: {
      title: '404',
      code: 'ANY',
      hidden: true
    }
  }
]
