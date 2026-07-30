import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'
import { scmRoutes } from './scm'
import { crmRoutes } from './crm'
import { biRoutes } from './bi'
import { pceRoutes } from './pce'
import { aiRoutes } from './ai'
import { systemRoutes } from './system'

export const asyncRoute: ExtendedRouteRecordRaw[] = [
  // 财务管理模块（预留）
  {
    path: '/admin/fm',
    name: 'MANAGE_APP:FM',
    meta: {
      code: 'MANAGE_APP:FM',
      title: '财务管理',
      icon: 'el-icon-Money',
      hidden: false,
      isDynamic: true
    }
  },
  // 人力资源模块（预留）
  {
    path: '/admin/hrm',
    name: 'MANAGE_APP:HRM',
    meta: {
      code: 'MANAGE_APP:HRM',
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
  // 流程中心模块
  ...pceRoutes,
  // 智能中心模块
  ...aiRoutes,
  // 系统管理模块
  ...systemRoutes
]
