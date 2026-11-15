import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'

/**
 * 供应链模块路由配置
 */
export const scmRoutes: ExtendedRouteRecordRaw[] = [
  {
    path: '/admin/scm',
    meta: {
      code: 'MANAGE_APP:SCM',
      title: '供应链',
      icon: 'el-icon-Van',
      hidden: false
    },
    children: [
      {
        path: '/admin/scm/category',
        meta: {
          code: 'MANAGE_APP:SCM:CATEGORY',
          title: '类目管理',
          icon: 'el-icon-Menu',
          hidden: false
        },
        children: [
          {
            path: '/admin/scm/category/front',
            component: () => import('@/modules/scm/category/category/ScmFrontCategory.vue'),
            meta: {
              code: 'MANAGE_APP:SCM:CATEGORY:FRONT',
              title: '前台类目',
              icon: 'el-icon-View',
              hidden: false
            }
          },
          {
            path: '/admin/scm/category/back',
            component: () => import('@/modules/scm/category/category/ScmBackCategory.vue'),
            meta: {
              code: 'MANAGE_APP:SCM:CATEGORY:BACK',
              title: '后台类目',
              icon: 'el-icon-Setting',
              hidden: false
            }
          },
          {
            path: '/admin/scm/category/attribute_group',
            component: () => import('@/modules/scm/category/attribute/ScmAttributeGroup.vue'),
            meta: {
              code: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE_GROUP',
              title: '属性分组',
              icon: 'el-icon-Files',
              hidden: false
            }
          },
          {
            path: '/admin/scm/category/attribute',
            component: () => import('@/modules/scm/category/attribute/ScmAttribute.vue'),
            meta: {
              code: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE',
              title: '属性管理',
              icon: 'el-icon-List',
              hidden: false
            }
          },
          {
            path: '/admin/scm/category/brand_config',
            component: () => import('@/modules/scm/category/brand/ScmBrandConfig.vue'),
            meta: {
              code: 'MANAGE_APP:SCM:CATEGORY:BRAND_CONFIG',
              title: '品牌配置',
              icon: 'el-icon-PriceTag',
              hidden: false
            }
          }
        ]
      },
      {
        path: '/admin/scm/item',
        meta: {
          code: 'MANAGE_APP:SCM:PRODUCT',
          title: '商品管理',
          icon: 'el-icon-Goods',
          hidden: false
        },
        children: [
          {
            path: '/admin/scm/item/sku',
            component: () => import('@/modules/scm/item/ScmItemSku.vue'),
            meta: {
              code: 'MANAGE_APP:SCM:PRODUCT:SKU',
              title: 'SKU管理',
              icon: 'el-icon-Discount',
              hidden: false
            }
          },
          {
            path: '/admin/scm/item/spu',
            component: () => import('@/modules/scm/item/ScmItemSpu.vue'),
            meta: {
              code: 'MANAGE_APP:SCM:PRODUCT:SPU',
              title: 'SPU管理',
              icon: 'el-icon-Box',
              hidden: false
            }
          },
          {
            path: '/admin/scm/item/attribute',
            component: () => import('@/modules/scm/item/ScmItemAttribute.vue'),
            meta: {
              code: 'MANAGE_APP:SCM:PRODUCT:ATTRIBUTE',
              title: '商品属性',
              icon: 'el-icon-Tickets',
              hidden: false
            }
          }
        ]
      }
    ]
  }
]
