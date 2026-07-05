import type { ExtendedRouteRecordRaw } from '@/common/types/Router.type'

/**
 * 系统管理模块路由配置
 */
export const systemRoutes: ExtendedRouteRecordRaw[] = [
  {
    path: '/system',
    name: 'SYSTEM',
    meta: {
      code: 'SYSTEM',
      title: '系统管理',
      icon: 'el-icon-Setting',
      hidden: false,
      isDynamic: true
    },
    children: [
      {
        path: '/system/basic_data',
        name: 'SYSTEM:BASIC_DATA',
        meta: {
          code: 'SYSTEM:BASIC_DATA',
          title: '基础数据',
          icon: 'el-icon-Collection',
          hidden: false,
          isDynamic: true
        },
        children: [
          {
            path: '/system/basic_data/brand',
            component: () => import('@/modules/data/brand/DataBrand.vue'),
            name: 'SYSTEM:BASIC_DATA:BRAND',
            meta: {
              code: 'SYSTEM:BASIC_DATA:BRAND',
              title: '品牌管理',
              icon: 'el-icon-Trophy',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/system/basic_data/shop',
            component: () => import('@/modules/data/shop/DataShop.vue'),
            name: 'SYSTEM:BASIC_DATA:SHOP',
            meta: {
              code: 'SYSTEM:BASIC_DATA:SHOP',
              title: '门店管理',
              icon: 'el-icon-Shop',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/system/basic_data/area',
            component: () => import('@/modules/data/area/DataArea.vue'),
            name: 'SYSTEM:BASIC_DATA:AREA',
            meta: {
              code: 'SYSTEM:BASIC_DATA:AREA',
              title: '区域管理',
              icon: 'el-icon-LocationInformation',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/system/basic_data/material',
            component: () => import('@/modules/data/material/DataMaterial.vue'),
            name: 'SYSTEM:BASIC_DATA:MATERIAL',
            meta: {
              code: 'SYSTEM:BASIC_DATA:MATERIAL',
              title: '素材管理',
              icon: 'el-icon-Picture',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/system/basic_data/tag',
            component: () => import('@/modules/data/tag/DataTag.vue'),
            name: 'SYSTEM:BASIC_DATA:TAG',
            meta: {
              code: 'SYSTEM:BASIC_DATA:TAG',
              title: '标签管理',
              icon: 'el-icon-CollectionTag',
              hidden: false,
              isDynamic: true
            }
          }
        ]
      },
      {
        path: '/system/auth',
        name: 'SYSTEM:AUTH',
        meta: {
          code: 'SYSTEM:AUTH',
          title: '权限管理',
          icon: 'el-icon-Lock',
          hidden: false,
          isDynamic: true
        },
        children: [
          {
            path: '/system/auth/user',
            component: () => import('@/modules/iam/user/IamUser.vue'),
            name: 'SYSTEM:AUTH:USER',
            meta: {
              code: 'SYSTEM:AUTH:USER',
              title: '用户管理',
              icon: 'el-icon-User',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/system/auth/role',
            component: () => import('@/modules/iam/role/IamRole.vue'),
            name: 'SYSTEM:AUTH:ROLE',
            meta: {
              code: 'SYSTEM:AUTH:ROLE',
              title: '角色管理',
              icon: 'el-icon-Avatar',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/system/auth/permission',
            component: () => import('@/modules/iam/permission/IamPermission.vue'),
            name: 'SYSTEM:AUTH:permission',
            meta: {
              code: 'SYSTEM:AUTH:PERMISSION',
              title: '菜单管理',
              icon: 'el-icon-LayoutMenu',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/system/auth/organization',
            component: () => import('@/modules/iam/organization/IamOrganization.vue'),
            name: 'SYSTEM:AUTH:ORGANIZATION',
            meta: {
              code: 'SYSTEM:AUTH:ORGANIZATION',
              title: '组织管理',
              icon: 'el-icon-OfficeBuilding',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/system/auth/operation_log',
            component: () => import('@/modules/iam/operationLog/IamOperationLog.vue'),
            name: 'SYSTEM:AUTH:OPERATION_LOG',
            meta: {
              code: 'SYSTEM:AUTH:OPERATION_LOG',
              title: '操作日志',
              icon: 'el-icon-Document',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/system/auth/login_log',
            component: () => import('@/modules/iam/loginLog/IamUserLoginLog.vue'),
            name: 'SYSTEM:AUTH:LOGIN_LOG',
            meta: {
              code: 'SYSTEM:AUTH:LOGIN_LOG',
              title: '登录日志',
              icon: 'el-icon-Notebook',
              hidden: false,
              isDynamic: true
            }
          }
        ]
      },
      {
        path: '/system/workspace',
        name: 'SYSTEM:WORKSPACE',
        meta: {
          code: 'SYSTEM:WORKSPACE',
          title: '工作台',
          icon: 'el-icon-Monitor',
          hidden: false,
          isDynamic: true
        },
        children: [
          {
            path: '/system/workspace/download',
            component: () => import('@/modules/data/Download/DataDownload.vue'),
            name: 'SYSTEM:WORKSPACE:DOWNLOAD',
            meta: {
              code: 'SYSTEM:WORKSPACE:DOWNLOAD',
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
