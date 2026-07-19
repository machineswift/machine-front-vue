import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'

/**
 * 智能中心模块路由配置
 */
export const aiRoutes: ExtendedRouteRecordRaw[] = [
  {
    path: '/ai',
    name: 'AI',
    meta: {
      code: 'AI',
      title: '智能中心',
      icon: 'el-icon-Cpu',
      hidden: false,
      isDynamic: true
    },
    children: [
      {
        path: '/ai/application_center',
        name: 'AI:APPLICATION_CENTER',
        meta: {
          code: 'AI:APPLICATION_CENTER',
          title: '应用中心',
          icon: 'el-icon-Grid',
          hidden: false,
          isDynamic: true
        }
      },
      {
        path: '/ai/development_center',
        name: 'AI:DEVELOPMENT_CENTER',
        meta: {
          code: 'AI:DEVELOPMENT_CENTER',
          title: '开发中心',
          icon: 'el-icon-SetUp',
          hidden: false,
          isDynamic: true
        }
      },
      {
        path: '/ai/resource_center',
        name: 'AI:RESOURCE_CENTER',
        meta: {
          code: 'AI:RESOURCE_CENTER',
          title: '资源中心',
          icon: 'el-icon-FolderOpened',
          hidden: false,
          isDynamic: true
        },
        children: [
          {
            path: '/ai/resource_center/provider',
            component: () => import('@/modules/ai/resource/provider/AiResourceProvider.vue'),
            name: 'AI:RESOURCE_CENTER:PROVIDER',
            meta: {
              code: 'AI:RESOURCE_CENTER:PROVIDER',
              title: '厂商管理',
              icon: 'el-icon-OfficeBuilding',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/ai/resource_center/model',
            component: () => import('@/modules/ai/resource/model/AiResourceModel.vue'),
            name: 'AI:RESOURCE_CENTER:MODEL',
            meta: {
              code: 'AI:RESOURCE_CENTER:MODEL',
              title: '模型管理',
              icon: 'el-icon-Key',
              hidden: false,
              isDynamic: true
            }
          }
        ]
      },
      {
        path: '/ai/operations_center',
        name: 'AI:OPERATIONS_CENTER',
        meta: {
          code: 'AI:OPERATIONS_CENTER',
          title: '运维中心',
          icon: 'el-icon-Monitor',
          hidden: false,
          isDynamic: true
        }
      },
      {
        path: '/ai/platform_governance',
        name: 'AI:PLATFORM_GOVERNANCE',
        meta: {
          code: 'AI:PLATFORM_GOVERNANCE',
          title: '平台治理',
          icon: 'el-icon-Platform',
          hidden: false,
          isDynamic: true
        }
      }
    ]
  }
]
