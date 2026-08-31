import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'

/**
 * 系统管理模块路由配置
 */
export const systemRoutes: ExtendedRouteRecordRaw[] = [
  {
    path: '/admin/system',
    name: 'MANAGE_APP:SYSTEM',
    meta: {
      code: 'MANAGE_APP:SYSTEM',
      title: '系统管理',
      icon: 'el-icon-Tools',
      hidden: false,
      isDynamic: true
    },
    children: [
      {
        path: '/admin/system/basic_data',
        name: 'MANAGE_APP:SYSTEM:BASIC_DATA',
        meta: {
          code: 'MANAGE_APP:SYSTEM:BASIC_DATA',
          title: '基础数据',
          icon: 'el-icon-Collection',
          hidden: false,
          isDynamic: true
        },
        children: [
          {
            path: '/admin/system/basic_data/brand',
            component: () => import('@/modules/data/brand/DataBrand.vue'),
            name: 'MANAGE_APP:SYSTEM:BASIC_DATA:BRAND',
            meta: {
              code: 'MANAGE_APP:SYSTEM:BASIC_DATA:BRAND',
              title: '品牌管理',
              icon: 'el-icon-Trophy',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/admin/system/basic_data/shop',
            component: () => import('@/modules/data/shop/DataShop.vue'),
            name: 'MANAGE_APP::BASIC_DATA:SHOP',
            meta: {
              code: 'MANAGE_APP:SYSTEM:BASIC_DATA:SHOP',
              title: '门店管理',
              icon: 'el-icon-Shop',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/admin/system/basic_data/area',
            component: () => import('@/modules/data/area/DataArea.vue'),
            name: 'MANAGE_APP:SYSTEM:BASIC_DATA:AREA',
            meta: {
              code: 'MANAGE_APP:SYSTEM:BASIC_DATA:AREA',
              title: '区域管理',
              icon: 'el-icon-LocationInformation',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/admin/system/basic_data/material',
            component: () => import('@/modules/data/material/DataMaterial.vue'),
            name: 'MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL',
            meta: {
              code: 'MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL',
              title: '素材管理',
              icon: 'el-icon-Picture',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/admin/system/basic_data/tag',
            component: () => import('@/modules/data/tag/DataTag.vue'),
            name: 'MANAGE_APP:SYSTEM:BASIC_DATA:TAG',
            meta: {
              code: 'MANAGE_APP:SYSTEM:BASIC_DATA:TAG',
              title: '标签管理',
              icon: 'el-icon-CollectionTag',
              hidden: false,
              isDynamic: true
            }
          }
        ]
      },
      {
        path: '/admin/system/access_control',
        name: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL',
        meta: {
          code: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL',
          title: '权限管理',
          icon: 'el-icon-Lock',
          hidden: false,
          isDynamic: true
        },
        children: [
          {
            path: '/admin/system/access_control/user',
            component: () => import('@/modules/biam/user/BIamUser.vue'),
            name: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL:USER',
            meta: {
              code: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL:USER',
              title: '用户管理',
              icon: 'el-icon-User',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/admin/system/access_control/role',
            component: () => import('@/modules/biam/role/BIamRole.vue'),
            name: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL:ROLE',
            meta: {
              code: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL:ROLE',
              title: '角色管理',
              icon: 'el-icon-Avatar',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/admin/system/access_control/permission',
            component: () => import('@/modules/biam/permission/BIamPermission.vue'),
            name: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL:PERMISSION',
            meta: {
              code: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL:PERMISSION',
              title: '菜单管理',
              icon: 'el-icon-Menu',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/admin/system/access_control/organization',
            component: () => import('@/modules/biam/organization/BIamOrganization.vue'),
            name: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL:ORGANIZATION',
            meta: {
              code: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL:ORGANIZATION',
              title: '组织管理',
              icon: 'el-icon-OfficeBuilding',
              hidden: false,
              isDynamic: true
            }
          }
        ]
      },
      {
        path: '/admin/system/identity_center',
        name: 'MANAGE_APP:SYSTEM:IDENTITY_CENTER',
        meta: {
          code: 'MANAGE_APP:SYSTEM:IDENTITY_CENTER',
          title: '认证中心',
          icon: 'el-icon-Key',
          hidden: false,
          isDynamic: true
        },
        children: [
          {
            path: '/admin/system/identity_center/auth2_registered_client',
            component: () => import('@/modules/biam/auth2RegisteredClient/BIamAuth2RegisteredClient.vue'),
            name: 'MANAGE_APP:SYSTEM:IDENTITY_CENTER:AUTH2_REGISTERED_CLIENT',
            meta: {
              code: 'MANAGE_APP:SYSTEM:IDENTITY_CENTER:AUTH2_REGISTERED_CLIENT',
              title: '客户端管理',
              icon: 'el-icon-Monitor',
              hidden: false,
              isDynamic: true
            }
          }
        ]
      },
      {
        path: '/admin/system/log_center',
        name: 'MANAGE_APP:SYSTEM:LOG_CENTER',
        meta: {
          code: 'MANAGE_APP:SYSTEM:LOG_CENTER',
          title: '日志中心',
          icon: 'el-icon-Document',
          hidden: false,
          isDynamic: true
        },
        children: [
          {
            path: '/admin/system/log_center/operation_log',
            component: () => import('@/modules/biam/operationLog/BIamOperationLog.vue'),
            name: 'MANAGE_APP:SYSTEM:LOG_CENTER:OPERATION_LOG',
            meta: {
              code: 'MANAGE_APP:SYSTEM:LOG_CENTER:OPERATION_LOG',
              title: '操作日志',
              icon: 'el-icon-Document',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/admin/system/log_center/login_log',
            component: () => import('@/modules/biam/loginLog/BIamUserLoginLog.vue'),
            name: 'MANAGE_APP:SYSTEM:LOG_CENTER:LOGIN_LOG',
            meta: {
              code: 'MANAGE_APP:SYSTEM:LOG_CENTER:LOGIN_LOG',
              title: '登录日志',
              icon: 'el-icon-Notebook',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/admin/system/log_center/access_log',
            component: () => import('@/modules/biam/accessLog/BIamAccessLog.vue'),
            name: 'MANAGE_APP:SYSTEM:LOG_CENTER:ACCESS_LOG',
            meta: {
              code: 'MANAGE_APP:SYSTEM:LOG_CENTER:ACCESS_LOG',
              title: '访问日志',
              icon: 'el-icon-Connection',
              hidden: false,
              isDynamic: true
            }
          }
        ]
      },
      {
        path: '/admin/system/identity_center',
        name: 'MANAGE_APP:SYSTEM:IDENTITY_CENTER',
        meta: {
          code: 'MANAGE_APP:SYSTEM:IDENTITY_CENTER',
          title: '认证中心',
          icon: 'el-icon-Key',
          hidden: false,
          isDynamic: true
        },
        children: [
          {
            path: '/admin/system/identity_center/auth2_registered_client',
            component: () => import('@/modules/biam/auth2RegisteredClient/BIamAuth2RegisteredClient.vue'),
            name: 'MANAGE_APP:SYSTEM:IDENTITY_CENTER:AUTH2_REGISTERED_CLIENT',
            meta: {
              code: 'MANAGE_APP:SYSTEM:IDENTITY_CENTER:AUTH2_REGISTERED_CLIENT',
              title: '客户端管理',
              icon: 'el-icon-Monitor',
              hidden: false,
              isDynamic: true
            }
          }
        ]
      },
      {
        path: '/admin/system/workspace',
        name: 'MANAGE_APP:SYSTEM:WORKSPACE',
        meta: {
          code: 'MANAGE_APP:SYSTEM:WORKSPACE',
          title: '工作台',
          icon: 'el-icon-Monitor',
          hidden: false,
          isDynamic: true
        },
        children: [
          {
            path: '/admin/system/workspace/download',
            component: () => import('@/modules/data/download/DataDownload.vue'),
            name: 'MANAGE_APP:SYSTEM:WORKSPACE:DOWNLOAD',
            meta: {
              code: 'MANAGE_APP:SYSTEM:WORKSPACE:DOWNLOAD',
              title: '下载中心',
              icon: 'el-icon-Download',
              hidden: false,
              isDynamic: true
            }
          }
        ]
      }
    ]
  }
]
