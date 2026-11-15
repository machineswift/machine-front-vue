import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'

export const reservedRoutes: ExtendedRouteRecordRaw[] = [
  {
    path: '/admin/fm',
    component: () => import('@/shared/components/FeaturePlaceholder.vue'),
    meta: {
      code: 'MANAGE_APP:FM',
      title: '财务管理',
      icon: 'el-icon-Money',
      hidden: false
    }
  },
  {
    path: '/admin/hrm',
    component: () => import('@/shared/components/FeaturePlaceholder.vue'),
    meta: {
      code: 'MANAGE_APP:HRM',
      title: '人力资源',
      icon: 'el-icon-UserFilled',
      hidden: false
    }
  }
]
