import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'

export const systemBasicDataRoute: ExtendedRouteRecordRaw = {
  path: '/admin/system/basic_data',
  meta: {
    code: 'MANAGE_APP:SYSTEM:BASIC_DATA',
    title: '基础数据',
    icon: 'el-icon-Collection',
    hidden: false
  },
  children: [
    {
      path: '/admin/system/basic_data/brand',
      component: () => import('@/modules/data/brand/DataBrand.vue'),
      meta: {
        code: 'MANAGE_APP:SYSTEM:BASIC_DATA:BRAND',
        title: '品牌管理',
        icon: 'el-icon-Trophy',
        hidden: false
      }
    },
    {
      path: '/admin/system/basic_data/shop',
      component: () => import('@/modules/data/shop/DataShop.vue'),
      meta: {
        code: 'MANAGE_APP:SYSTEM:BASIC_DATA:SHOP',
        title: '门店管理',
        icon: 'el-icon-Shop',
        hidden: false
      }
    },
    {
      path: '/admin/system/basic_data/area',
      component: () => import('@/modules/data/area/DataArea.vue'),
      meta: {
        code: 'MANAGE_APP:SYSTEM:BASIC_DATA:AREA',
        title: '区域管理',
        icon: 'el-icon-LocationInformation',
        hidden: false
      }
    },
    {
      path: '/admin/system/basic_data/material',
      component: () => import('@/modules/data/material/DataMaterial.vue'),
      meta: {
        code: 'MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL',
        title: '素材管理',
        icon: 'el-icon-Picture',
        hidden: false
      }
    },
    {
      path: '/admin/system/basic_data/tag',
      component: () => import('@/modules/data/tag/DataTag.vue'),
      meta: {
        code: 'MANAGE_APP:SYSTEM:BASIC_DATA:TAG',
        title: '标签管理',
        icon: 'el-icon-CollectionTag',
        hidden: false
      }
    }
  ]
}

export const systemAttachmentLogRoute: ExtendedRouteRecordRaw = {
  path: '/admin/system/log_center/attachment_log',
  component: () => import('@/modules/data/attachment/DataAttachmentLog.vue'),
  meta: {
    code: 'MANAGE_APP:SYSTEM:LOG_CENTER:ATTACHMENT_LOG',
    title: '附件日志',
    icon: 'el-icon-Paperclip',
    hidden: false
  }
}

export const systemWorkspaceRoute: ExtendedRouteRecordRaw = {
  path: '/admin/system/workspace',
  meta: {
    code: 'MANAGE_APP:SYSTEM:WORKSPACE',
    title: '工作台',
    icon: 'el-icon-Monitor',
    hidden: false
  },
  children: [
    {
      path: '/admin/system/workspace/download',
      component: () => import('@/modules/data/download/DataDownload.vue'),
      meta: {
        code: 'MANAGE_APP:SYSTEM:WORKSPACE:DOWNLOAD',
        title: '下载中心',
        icon: 'el-icon-Download',
        hidden: false
      }
    }
  ]
}
