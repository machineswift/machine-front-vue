import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'

export const systemAccessControlRoute: ExtendedRouteRecordRaw = {
  path: '/admin/system/access_control',
  meta: {
    code: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL',
    title: '权限管理',
    icon: 'el-icon-Lock',
    hidden: false
  },
  children: [
    {
      path: '/admin/system/access_control/user',
      component: () => import('@/modules/biam/accessControl/user/BIamUser.vue'),
      meta: {
        code: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL:USER',
        title: '用户管理',
        icon: 'el-icon-User',
        hidden: false
      }
    },
    {
      path: '/admin/system/access_control/role',
      component: () => import('@/modules/biam/accessControl/role/BIamRole.vue'),
      meta: {
        code: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL:ROLE',
        title: '角色管理',
        icon: 'el-icon-Avatar',
        hidden: false
      }
    },
    {
      path: '/admin/system/access_control/permission',
      component: () => import('@/modules/biam/accessControl/permission/BIamPermission.vue'),
      meta: {
        code: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL:PERMISSION',
        title: '菜单管理',
        icon: 'el-icon-Menu',
        hidden: false
      }
    },
    {
      path: '/admin/system/access_control/organization',
      component: () => import('@/modules/biam/accessControl/organization/BIamOrganization.vue'),
      meta: {
        code: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL:ORGANIZATION',
        title: '组织管理',
        icon: 'el-icon-OfficeBuilding',
        hidden: false
      }
    }
  ]
}

export const systemIdentityCenterRoute: ExtendedRouteRecordRaw = {
  path: '/admin/system/identity_center',
  meta: {
    code: 'MANAGE_APP:SYSTEM:IDENTITY_CENTER',
    title: '认证中心',
    icon: 'el-icon-Key',
    hidden: false
  },
  children: [
    {
      path: '/admin/system/identity_center/auth2_registered_client',
      component: () => import('@/modules/biam/identityCenter/registeredClient/BIamAuth2RegisteredClient.vue'),
      meta: {
        code: 'MANAGE_APP:SYSTEM:IDENTITY_CENTER:AUTH2_REGISTERED_CLIENT',
        title: '客户端管理',
        icon: 'el-icon-Monitor',
        hidden: false
      }
    }
  ]
}

export const systemLogCenterRoute: ExtendedRouteRecordRaw = {
  path: '/admin/system/log_center',
  meta: {
    code: 'MANAGE_APP:SYSTEM:LOG_CENTER',
    title: '日志中心',
    icon: 'el-icon-Document',
    hidden: false
  },
  children: [
    {
      path: '/admin/system/log_center/operation_log',
      component: () => import('@/modules/biam/logCenter/operationLog/BIamOperationLog.vue'),
      meta: {
        code: 'MANAGE_APP:SYSTEM:LOG_CENTER:OPERATION_LOG',
        title: '操作日志',
        icon: 'el-icon-Document',
        hidden: false
      }
    },
    {
      path: '/admin/system/log_center/login_log',
      component: () => import('@/modules/biam/logCenter/loginLog/BIamUserLoginLog.vue'),
      meta: {
        code: 'MANAGE_APP:SYSTEM:LOG_CENTER:LOGIN_LOG',
        title: '登录日志',
        icon: 'el-icon-Notebook',
        hidden: false
      }
    },
    {
      path: '/admin/system/log_center/access_log',
      component: () => import('@/modules/biam/logCenter/accessLog/BIamAccessLog.vue'),
      meta: {
        code: 'MANAGE_APP:SYSTEM:LOG_CENTER:ACCESS_LOG',
        title: '访问日志',
        icon: 'el-icon-Connection',
        hidden: false
      }
    }
  ]
}

export const systemWebhookRoute: ExtendedRouteRecordRaw = {
  path: '/admin/system/webhook',
  meta: {
    code: 'MANAGE_APP:SYSTEM:WEBHOOK',
    title: 'webhook',
    icon: 'el-icon-Bell',
    hidden: false
  },
  children: [
    {
      path: '/admin/system/webhook/endpoint',
      component: () => import('@/modules/biam/webhook/endpoint/BIamWebhookEndpoint.vue'),
      meta: {
        code: 'MANAGE_APP:SYSTEM:WEBHOOK:ENDPOINT',
        title: '接收端管理',
        icon: 'el-icon-Link',
        hidden: false
      }
    },
    {
      path: '/admin/system/webhook/event',
      component: () => import('@/modules/biam/webhook/event/BIamWebhookEvent.vue'),
      meta: {
        code: 'MANAGE_APP:SYSTEM:WEBHOOK:EVENT',
        title: '事件管理',
        icon: 'el-icon-Document',
        hidden: false
      }
    },
    {
      path: '/admin/system/webhook/task',
      component: () => import('@/modules/biam/webhook/task/BIamWebhookTask.vue'),
      meta: {
        code: 'MANAGE_APP:SYSTEM:WEBHOOK:TASK',
        title: '投递任务',
        icon: 'el-icon-Promotion',
        hidden: false
      }
    },
    {
      path: '/admin/system/webhook/monitor',
      component: () => import('@/modules/biam/webhook/monitor/BIamWebhookMonitor.vue'),
      meta: {
        code: 'MANAGE_APP:SYSTEM:WEBHOOK:MONITOR',
        title: '运行监控',
        icon: 'el-icon-Odometer',
        hidden: false
      }
    }
  ]
}
