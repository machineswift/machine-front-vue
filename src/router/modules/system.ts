import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'
import { systemAttachmentLogRoute, systemBasicDataRoute, systemWorkspaceRoute } from './system/data'
import { systemAccessControlRoute, systemIdentityCenterRoute, systemLogCenterRoute, systemWebhookRoute } from './system/iam'

const iamLogCenterChildren = systemLogCenterRoute.children ?? []

export const systemRoutes: ExtendedRouteRecordRaw[] = [
  {
    path: '/admin/system',
    meta: {
      code: 'MANAGE_APP:SYSTEM',
      title: '系统管理',
      icon: 'el-icon-Tools',
      hidden: false
    },
    children: [
      systemBasicDataRoute,
      systemAccessControlRoute,
      systemIdentityCenterRoute,
      {
        ...systemLogCenterRoute,
        children: [...iamLogCenterChildren.slice(0, 1), systemAttachmentLogRoute, ...iamLogCenterChildren.slice(1)]
      },
      systemWebhookRoute,
      systemWorkspaceRoute
    ]
  }
]
