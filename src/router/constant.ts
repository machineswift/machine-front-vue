import type { ExtendedRouteRecordRaw } from '@/common/types/Router.type'

/**
 * 静态路由配置
 */
export const constantRoute: ExtendedRouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
    name: 'ROOT',
    meta: {
      title: '根路径',
      code: 'ROOT',
      hidden: true
    }
  },
  {
    path: '/login',
    component: () => import('@/views/AppLogin.vue'),
    name: 'LOGIN',
    meta: {
      title: '登录',
      code: 'LOGIN',
      hidden: true
    }
  },
  {
    path: '/auth2/callback',
    component: () => import('@/views/auth/AuthCallback.vue'),
    name: 'AUTH2_CALLBACK',
    meta: {
      title: '第三方登录回调',
      code: 'AUTH2_CALLBACK',
      hidden: true
    }
  },
  {
    path: '/layout',
    component: () => import('@/views/layout/AppLayout.vue'),
    name: 'LAYOUT',
    meta: {
      title: 'layout',
      code: 'LAYOUT',
      hidden: true
    },
    children: [
      {
        path: '/home',
        component: () => import('@/views/AppHome.vue'),
        name: 'HOME',
        meta: {
          title: '首页',
          code: 'HOME',
          icon: 'el-icon-House',
          hidden: false
        }
      }
    ]
  },
  {
    path: '/redirect',
    component: () => import('@/views/layout/AppLayout.vue'),
    name: 'REDIRECT',
    meta: {
      title: '重定向',
      code: 'REDIRECT',
      hidden: true
    },
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/layout/Redirect.vue'),
        name: 'REDIRECT_PATH',
        meta: {
          title: '重定向',
          code: 'REDIRECT_PATH',
          hidden: true
        }
      }
    ]
  },
  {
    path: '/404',
    component: () => import('@/views/404.vue'),
    name: '404',
    meta: {
      title: '404',
      code: '404',
      hidden: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    name: 'ANY',
    meta: {
      title: 'any',
      code: 'ANY',
      hidden: true
    }
  }
]
