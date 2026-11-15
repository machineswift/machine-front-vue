import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'

/**
 * 商业智能模块路由配置
 */
export const biRoutes: ExtendedRouteRecordRaw[] = [
  {
    path: '/admin/bi',
    meta: {
      code: 'MANAGE_APP:BI',
      title: '商业智能',
      icon: 'el-icon-DataAnalysis',
      hidden: false
    },
    children: [
      {
        path: '/admin/bi/dashboard',
        component: () => import('@/modules/bi/components/BiDashboard.vue'),
        meta: {
          code: 'MANAGE_APP:BI:DASHBOARD',
          title: '智能看板',
          icon: 'el-icon-Monitor',
          hidden: false
        }
      }
    ]
  }
]
