import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'

/**
 * 商业智能模块路由配置
 */
export const biRoutes: ExtendedRouteRecordRaw[] = [
  {
    path: '/admin/bi',
    name: 'MANAGE_APP:BI',
    meta: {
      code: 'MANAGE_APP:BI',
      title: '商业智能',
      icon: 'el-icon-DataAnalysis',
      hidden: false,
      isDynamic: true
    },
    children: [
      {
        path: '/admin/bi/dashboard',
        component: () => import('@/modules/bi/components/BiDashboard.vue'),
        name: 'MANAGE_APP:BI:DASHBOARD',
        meta: {
          code: 'MANAGE_APP:BI:DASHBOARD',
          title: '智能看板',
          icon: 'el-icon-Monitor',
          hidden: false,
          isDynamic: true
        }
      }
    ]
  }
]
