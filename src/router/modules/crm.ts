import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'

/**
 * 客户关系模块路由配置
 */
export const crmRoutes: ExtendedRouteRecordRaw[] = [
  {
    path: '/admin/crm',
    meta: {
      title: '客户关系',
      code: 'MANAGE_APP:CRM',
      icon: 'el-icon-Connection',
      hidden: false
    },
    children: [
      {
        path: '/admin/crm/customer',
        meta: {
          code: 'MANAGE_APP:CRM:CUSTOMER',
          title: '客户',
          icon: 'el-icon-Folder',
          hidden: false
        },
        children: [
          {
            path: '/admin/crm/customer/customer',
            component: () => import('@/modules/crm/customer/CrmCustomer.vue'),
            meta: {
              code: 'MANAGE_APP:CRM:CUSTOMER:CUSTOMER',
              title: '客户管理',
              icon: 'el-icon-User',
              hidden: false
            }
          },
          {
            path: '/admin/crm/customer/member',
            component: () => import('@/modules/crm/member/CrmMember.vue'),
            meta: {
              code: 'MANAGE_APP:CRM:CUSTOMER:MEMBER',
              title: '会员管理',
              icon: 'el-icon-Star',
              hidden: false
            }
          }
        ]
      }
    ]
  }
]
