import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'
import { scmRoutes } from './scm'
import { crmRoutes } from './crm'
import { biRoutes } from './bi'
import { pceRoutes } from './pce'
import { aiRoutes } from './ai'
import { systemRoutes } from './system'
import { reservedRoutes } from './reserved'

export const asyncRoute: ExtendedRouteRecordRaw[] = [
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
  ...systemRoutes,
  // 预留模块（权限树已下发，业务未开始）
  ...reservedRoutes
]
