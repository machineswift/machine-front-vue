import type { ExtendedRouteRecordRaw } from '@/common/types/Router.type'

/**
 * 商业智能模块路由配置
 */
export const biRoutes: ExtendedRouteRecordRaw[] = [
  {
    path: '/bi',
    name: 'BI',
    meta: {
      code: 'BI',
      title: '商业智能',
      icon: 'el-icon-DataAnalysis',
      hidden: false,
      isDynamic: true
    },
    children: [
      {
        path: '/bi/dashboard',
        component: () => import('@/modules/bi/components/BiDashboard.vue'),
        name: 'BI:DASHBOARD',
        meta: {
          code: 'BI:DASHBOARD',
          title: '智能看板',
          icon: 'el-icon-Monitor',
          hidden: false,
          isDynamic: true
        }
      }
    ]
  }
]
