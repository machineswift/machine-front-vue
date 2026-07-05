import type { ExtendedRouteRecordRaw } from '@/common/types/Router.type'

/**
 * 客户关系模块路由配置
 */
export const crmRoutes: ExtendedRouteRecordRaw[] = [
  {
    path: '/crm',
    name: 'CRM',
    meta: {
      title: '客户关系',
      code: 'CRM',
      icon: 'el-icon-Connection',
      hidden: false,
      isDynamic: true
    },
    children: [
      {
        path: '/crm/customer',
        name: 'CRM:CUSTOMER',
        meta: {
          code: 'CRM:CUSTOMER',
          title: '客户',
          icon: 'el-icon-Folder',
          hidden: false,
          isDynamic: true
        },
        children: [
          {
            path: '/crm/customer/customer',
            component: () => import('@/modules/crm/customer/CrmCustomer.vue'),
            name: 'CRM:CUSTOMER:CUSTOMER',
            meta: {
              code: 'CRM:CUSTOMER:CUSTOMER',
              title: '客户管理',
              icon: 'el-icon-User',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/crm/customer/member',
            component: () => import('@/modules/crm/member/CrmMember.vue'),
            name: 'CRM:CUSTOMER:MEMBER',
            meta: {
              code: 'CRM:CUSTOMER:MEMBER',
              title: '会员管理',
              icon: 'el-icon-Star',
              hidden: false,
              isDynamic: true
            }
          }
        ]
      }
    ]
  }
]
