import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'

/**
 * 客户关系模块路由配置
 */
export const crmRoutes: ExtendedRouteRecordRaw[] = [
  {
    path: '/admin/crm',
    name: 'MANAGE_APP:CRM',
    meta: {
      title: '客户关系',
      code: 'MANAGE_APP:CRM',
      icon: 'el-icon-Connection',
      hidden: false,
      isDynamic: true
    },
    children: [
      {
        path: '/admin/crm/customer',
        name: 'MANAGE_APP:CRM:CUSTOMER',
        meta: {
          code: 'MANAGE_APP:CRM:CUSTOMER',
          title: '客户',
          icon: 'el-icon-Folder',
          hidden: false,
          isDynamic: true
        },
        children: [
          {
            path: '/admin/crm/customer/customer',
            component: () => import('@/modules/crm/customer/CrmCustomer.vue'),
            name: 'MANAGE_APP:CRM:CUSTOMER:CUSTOMER',
            meta: {
              code: 'MANAGE_APP:CRM:CUSTOMER:CUSTOMER',
              title: '客户管理',
              icon: 'el-icon-User',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/admin/crm/customer/member',
            component: () => import('@/modules/crm/member/CrmMember.vue'),
            name: 'MANAGE_APP:CRM:CUSTOMER:MEMBER',
            meta: {
              code: 'MANAGE_APP:CRM:CUSTOMER:MEMBER',
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
