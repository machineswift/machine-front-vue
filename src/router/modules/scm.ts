import type { ExtendedRouteRecordRaw } from '@/modules/common/types/Router.type'

/**
 * 供应链模块路由配置
 */
export const scmRoutes: ExtendedRouteRecordRaw[] = [
  {
    path: '/scm',
    name: 'SCM',
    meta: {
      code: 'SCM',
      title: '供应链',
      icon: 'el-icon-Van',
      hidden: false,
      isDynamic: true
    },
    children: [
      {
        path: '/scm/item',
        name: 'SCM:ITEM',
        meta: {
          code: 'SCM:ITEM',
          title: '商品管理',
          icon: 'el-icon-Goods',
          hidden: false,
          isDynamic: true
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
              hidden: false,
              isDynamic: true
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
              hidden: false,
              isDynamic: true
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
              hidden: false,
              isDynamic: true
            }
          }
        ]
      }
    ]
  }
]
