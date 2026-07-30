import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'

/**
 * 供应链模块路由配置
 */
export const scmRoutes: ExtendedRouteRecordRaw[] = [
  {
    path: '/admin/scm',
    name: 'MANAGE_APP:SCM',
    meta: {
      code: 'MANAGE_APP:SCM',
      title: '供应链',
      icon: 'el-icon-Van',
      hidden: false,
      isDynamic: true
    },
    children: [
      {
        path: '/admin/scm/category',
        name: 'MANAGE_APP:SCM:CATEGORY',
        meta: {
          code: 'MANAGE_APP:SCM:CATEGORY',
          title: '类目管理',
          icon: 'el-icon-Menu',
          hidden: false,
          isDynamic: true
        },
        children: [
          {
            path: '/admin/scm/category/front',
            component: () => import('@/modules/scm/category/ScmFrontCategory.vue'),
            name: 'MANAGE_APP:SCM:CATEGORY:FRONT',
            meta: {
              code: 'MANAGE_APP:SCM:CATEGORY:FRONT',
              title: '前台类目',
              icon: 'el-icon-View',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/admin/scm/category/back',
            component: () => import('@/modules/scm/category/ScmBackCategory.vue'),
            name: 'MANAGE_APP:SCM:CATEGORY:BACK',
            meta: {
              code: 'MANAGE_APP:SCM:CATEGORY:BACK',
              title: '后台类目',
              icon: 'el-icon-Setting',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/admin/scm/category/property',
            component: () => import('@/modules/scm/category/ScmProperty.vue'),
            name: 'MANAGE_APP:SCM:CATEGORY:PROPERTY',
            meta: {
              code: 'MANAGE_APP:SCM:CATEGORY:PROPERTY',
              title: '属性管理',
              icon: 'el-icon-List',
              hidden: false,
              isDynamic: true
            }
          }
        ]
      },
      {
        path: '/admin/scm/item',
        name: 'MANAGE_APP:SCM:ITEM',
        meta: {
          code: 'MANAGE_APP:SCM:ITEM',
          title: '商品管理',
          icon: 'el-icon-Goods',
          hidden: false,
          isDynamic: true
        },
        children: [
          {
            path: '/admin/scm/item/sku',
            component: () => import('@/modules/scm/item/ScmItemSku.vue'),
            name: 'MANAGE_APP:SCM:ITEM:SKU',
            meta: {
              code: 'MANAGE_APP:SCM:ITEM:SKU',
              title: 'SKU管理',
              icon: 'el-icon-Discount',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/admin/scm/item/spu',
            component: () => import('@/modules/scm/item/ScmItemSpu.vue'),
            name: 'MANAGE_APP:SCM:ITEM:SPU',
            meta: {
              code: 'MANAGE_APP:SCM:ITEM:SPU',
              title: 'SPU管理',
              icon: 'el-icon-Box',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/admin/scm/item/attribute',
            component: () => import('@/modules/scm/item/ScmItemAttribute.vue'),
            name: 'MANAGE_APP:SCM:ITEM:attribute',
            meta: {
              code: 'MANAGE_APP:SCM:ITEM:ATTRIBUTE',
              title: '商品属性',
              icon: 'el-icon-Tickets',
              hidden: false,
              isDynamic: true
            }
          }
        ]
      }
    ]
  }
]
