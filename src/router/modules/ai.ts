import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'

/**
 * 智能中心模块路由配置
 */
export const aiRoutes: ExtendedRouteRecordRaw[] = [
  {
    path: '/admin/ai',
    meta: {
      code: 'MANAGE_APP:AI',
      title: '智能中心',
      icon: 'el-icon-Cpu',
      hidden: false
    },
    children: [
      {
        path: '/admin/ai/application_center',
        component: () => import('@/modules/ai/common/AiFeaturePlaceholder.vue'),
        meta: {
          code: 'MANAGE_APP:AI:APPLICATION_CENTER',
          title: '应用中心',
          icon: 'el-icon-Grid',
          hidden: false
        }
      },
      {
        path: '/admin/ai/development_center',
        component: () => import('@/modules/ai/common/AiFeaturePlaceholder.vue'),
        meta: {
          code: 'MANAGE_APP:AI:DEVELOPMENT_CENTER',
          title: '开发中心',
          icon: 'el-icon-SetUp',
          hidden: false
        }
      },
      {
        path: '/admin/ai/resource_center',
        meta: {
          code: 'MANAGE_APP:AI:RESOURCE_CENTER',
          title: '资源中心',
          icon: 'el-icon-FolderOpened',
          hidden: false
        },
        children: [
          {
            path: '/admin/ai/resource_center/provider',
            component: () => import('@/modules/ai/resource/provider/AiResourceProvider.vue'),
            meta: {
              code: 'MANAGE_APP:AI:RESOURCE_CENTER:PROVIDER',
              title: '厂商管理',
              icon: 'el-icon-OfficeBuilding',
              hidden: false
            }
          },
          {
            path: '/admin/ai/resource_center/model',
            component: () => import('@/modules/ai/resource/model/AiResourceModel.vue'),
            meta: {
              code: 'MANAGE_APP:AI:RESOURCE_CENTER:MODEL',
              title: '模型管理',
              icon: 'el-icon-Key',
              hidden: false
            }
          }
        ]
      },
      {
        path: '/admin/ai/operations_center',
        component: () => import('@/modules/ai/common/AiFeaturePlaceholder.vue'),
        meta: {
          code: 'MANAGE_APP:AI:OPERATIONS_CENTER',
          title: '运维中心',
          icon: 'el-icon-Monitor',
          hidden: false
        }
      },
      {
        path: '/admin/ai/platform_governance',
        component: () => import('@/modules/ai/common/AiFeaturePlaceholder.vue'),
        meta: {
          code: 'MANAGE_APP:AI:PLATFORM_GOVERNANCE',
          title: '平台治理',
          icon: 'el-icon-Platform',
          hidden: false
        }
      }
    ]
  }
]
