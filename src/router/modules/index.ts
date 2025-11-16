import type { ExtendedRouteRecordRaw } from '@/modules/common/types/Router.type'
import { scmRoutes } from './scm'
import { crmRoutes } from './crm'
import { biRoutes } from './bi'
import { systemRoutes } from './system'

export const asyncRoute: ExtendedRouteRecordRaw[] = [
  // 财务管理模块（预留）
  {
    path: '/fm',
    name: 'FM',
    meta: {
      code: 'FM',
      title: '财务管理',
      icon: 'el-icon-Money',
      hidden: false,
      isDynamic: true
    }
  },
  // 人力资源模块（预留）
  {
    path: '/hrm',
    name: 'HRM',
    meta: {
      code: 'HRM',
      title: '人力资源',
      icon: 'el-icon-UserFilled',
      hidden: false,
      isDynamic: true
    }
  },
  // 供应链模块
  ...scmRoutes,
  // 客户关系模块
  ...crmRoutes,
  // 商业智能模块
  ...biRoutes,
  // 系统管理模块
  ...systemRoutes
]
