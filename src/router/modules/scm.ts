import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'

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
        path: '/scm/category',
        name: 'SCM:CATEGORY',
        meta: {
          code: 'SCM:CATEGORY',
          title: '类目管理',
          icon: 'el-icon-Menu',
          hidden: false,
          isDynamic: true
        },
        children: [
          {
            path: '/scm/category/front',
            component: () => import('@/modules/scm/category/ScmFrontCategory.vue'),
            name: 'SCM:CATEGORY:FRONT',
            meta: {
              code: 'SCM:CATEGORY:FRONT',
              title: '前台类目',
              icon: 'el-icon-View',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/scm/category/back',
            component: () => import('@/modules/scm/category/ScmBackCategory.vue'),
            name: 'SCM:CATEGORY:BACK',
            meta: {
              code: 'SCM:CATEGORY:BACK',
              title: '后台类目',
              icon: 'el-icon-Setting',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/scm/category/property',
            component: () => import('@/modules/scm/category/ScmProperty.vue'),
            name: 'SCM:CATEGORY:PROPERTY',
            meta: {
              code: 'SCM:CATEGORY:PROPERTY',
              title: '属性管理',
              icon: 'el-icon-List',
              hidden: false,
              isDynamic: true
            }
          }
        ]
      },
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
            component: () => import('@/modules/scm/item/ScmItemSku.vue'),
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
            component: () => import('@/modules/scm/item/ScmItemSpu.vue'),
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
            component: () => import('@/modules/scm/item/ScmItemAttribute.vue'),
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
