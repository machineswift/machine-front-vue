import type { ExtendedRouteRecordRaw } from '@/modules/common/types/Router.type'

export const constantRoute: ExtendedRouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
    name: 'ROOT',
    meta: {
      title: '根路径',
      code: 'ROOT',
      hidden: true
    }
  },
  {
    path: '/login',
    component: () => import('@/views/AppLogin.vue'),
    name: 'LOGIN',
    meta: {
      title: '登录',
      code: 'LOGIN',
      hidden: true
    }
  },
  {
    path: '/auth2/callback',
    component: () => import('@/views/auth/AuthCallback.vue'),
    name: 'AUTH2_CALLBACK',
    meta: {
      title: '第三方登录回调',
      code: 'AUTH2_CALLBACK',
      hidden: true
    }
  },
  {
    path: '/layout',
    component: () => import('@/views/layout/AppLayout.vue'),
    name: 'LAYOUT',
    meta: {
      title: 'layout',
      code: 'LAYOUT',
      hidden: true
    },
    children: [
      {
        path: '/home',
        component: () => import('@/views/AppHome.vue'),
        name: 'HOME',
        meta: {
          title: '首页',
          code: 'HOME',
          icon: 'el-icon-House',
          hidden: false
        }
      }
    ]
  },
  {
    path: '/404',
    component: () => import('@/views/404.vue'),
    name: '404',
    meta: {
      title: '404',
      code: '404',
      hidden: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    name: 'ANY',
    meta: {
      title: 'any',
      code: 'ANY',
      hidden: true
    }
  }
]

export const asyncRoute: ExtendedRouteRecordRaw[] = [
  {
    path: '/fm',
    name: 'FM',
    meta: {
      code: 'FM',
      title: '财务管理',
      icon: 'el-icon-Money',
      hidden: false
    }
  },
  {
    path: '/hrm',
    name: 'HRM',
    meta: {
      code: 'HRM',
      title: '人力资源',
      icon: 'el-icon-UserFilled',
      hidden: false
    }
  },
  {
    path: '/scm',
    name: 'SCM',
    meta: {
      code: 'SCM',
      title: '供应链',
      icon: 'el-icon-Van',
      hidden: false
    },
    children: [
      {
        path: '/scm/item',
        name: 'SCM:ITEM',
        meta: {
          code: 'SCM:ITEM',
          title: '商品管理',
          icon: 'el-icon-Goods',
          hidden: false
        },
        children: [
          {
            path: '/scm/item/sku',
            component: () => import('@/modules/scm/components/item/ScmItemSku.vue'),
            name: 'SCM:ITEM:SKU',
            meta: {
              code: 'SCM:ITEM:SKU',
              title: 'SKU管理',
              icon: 'el-icon-Discount',
              hidden: false
            }
          },
          {
            path: '/scm/item/spu',
            component: () => import('@/modules/scm/components/item/ScmItemSpu.vue'),
            name: 'SCM:ITEM:SPU',
            meta: {
              code: 'SCM:ITEM:SPU',
              title: 'SPU管理',
              icon: 'el-icon-Box',
              hidden: false
            }
          },
          {
            path: '/scm/item/attribute',
            component: () => import('@/modules/scm/components/item/ScmItemAttribute.vue'),
            name: 'SCM:ITEM:attribute',
            meta: {
              code: 'SCM:ITEM:ATTRIBUTE',
              title: '商品属性',
              icon: 'el-icon-Tickets',
              hidden: false
            }
          }
        ]
      }
    ]
  },
  {
    path: '/crm',
    name: 'CRM',
    meta: {
      title: '客户关系',
      code: 'CRM',
      icon: 'el-icon-Connection',
      hidden: false
    }
  },
  {
    path: '/bi',
    name: 'BI',
    meta: {
      code: 'BI',
      title: '商业智能',
      icon: 'el-icon-DataAnalysis',
      hidden: false
    },
    children: [
      {
        path: '/bi/dashboard',
        component: () => import('@/modules/bi/components/BiDashboard.vue'),
        name: 'BI:DASHBOARD',
        meta: {
          code: 'BI:DASHBOARD',
          title: '智能看板',
          icon: 'el-icon-Monitor',
          hidden: false
        }
      }
    ]
  },
  {
    path: '/system',
    name: 'SYSTEM',
    meta: {
      code: 'SYSTEM',
      title: '系统管理',
      icon: 'el-icon-Setting',
      hidden: false
    },
    children: [
      {
        path: '/system/basic_data',
        name: 'SYSTEM:BASIC_DATA',
        meta: {
          code: 'SYSTEM:BASIC_DATA',
          title: '基础数据管理',
          icon: 'el-icon-Collection',
          hidden: false
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
              hidden: false
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
              hidden: false
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
              hidden: false
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
              hidden: false
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
          hidden: false
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
              hidden: false
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
              hidden: false
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
              hidden: false
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
              hidden: false
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
              hidden: false
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
              hidden: false
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
          hidden: false
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
              hidden: false
            }
          }
        ]
      }
    ]
  }
]
