import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'

/**
 * 流程中心模块路由配置
 * 与菜单资源 code 对应：PCE / PCE:MANAGEMENT / PCE:TASK_CENTER / PCE:OPERATION
 */
export const pceRoutes: ExtendedRouteRecordRaw[] = [
  {
    path: '/admin/pce',
    meta: {
      code: 'MANAGE_APP:PCE',
      title: '流程中心',
      icon: 'el-icon-SetUp',
      hidden: false
    },
    children: [
      {
        path: '/admin/pce/management',
        meta: {
          code: 'MANAGE_APP:PCE:MANAGEMENT',
          title: '流程管理',
          icon: 'el-icon-Management',
          hidden: false
        },
        children: [
          {
            path: '/admin/pce/management/modeling',
            component: () => import('@/modules/pce/management/modeling/PceManagementModeling.vue'),
            meta: {
              code: 'MANAGE_APP:PCE:MANAGEMENT:PROCESS_MODELING',
              title: '流程建模',
              icon: 'el-icon-SetUp',
              hidden: false
            }
          },
          {
            path: '/admin/pce/management/form_design',
            component: () => import('@/modules/pce/management/design/PceManagementFormDesign.vue'),
            meta: {
              code: 'MANAGE_APP:PCE:MANAGEMENT:FORM_DESIGN',
              title: '表单设计',
              icon: 'el-icon-DocumentAdd',
              hidden: false
            }
          },
          {
            path: '/admin/pce/management/template',
            component: () => import('@/modules/pce/management/template/PceManagementTemplate.vue'),
            meta: {
              code: 'MANAGE_APP:PCE:MANAGEMENT:PROCESS_TEMPLATE',
              title: '流程模板',
              icon: 'el-icon-Collection',
              hidden: false
            }
          },
          {
            path: '/admin/pce/management/deploy',
            component: () => import('@/modules/pce/management/deploy/PceManagementDeploy.vue'),
            meta: {
              code: 'MANAGE_APP:PCE:MANAGEMENT:DEPLOY_MANAGEMENT',
              title: '部署管理',
              icon: 'el-icon-UploadFilled',
              hidden: false
            }
          }
        ]
      },
      {
        path: '/admin/pce/task_center',
        meta: {
          code: 'MANAGE_APP:PCE:TASK_CENTER',
          title: '任务中心',
          icon: 'el-icon-Bell',
          hidden: false
        },
        children: [
          {
            path: '/admin/pce/task_center/my_todo',
            component: () => import('@/modules/pce/task/todo/PceTaskMyToDo.vue'),
            meta: {
              code: 'MANAGE_APP:PCE:TASK_CENTER:MY_TODO',
              title: '我的待办',
              icon: 'el-icon-AlarmClock',
              hidden: false
            }
          },
          {
            path: '/admin/pce/task_center/my_initiated',
            component: () => import('@/modules/pce/task/initiated/PceTaskMyInitiated.vue'),
            meta: {
              code: 'MANAGE_APP:PCE:TASK_CENTER:MY_INITIATED',
              title: '我发起的',
              icon: 'el-icon-UserFilled',
              hidden: false
            }
          },
          {
            path: '/admin/pce/task_center/cc_to_me',
            component: () => import('@/modules/pce/task/copy/PceTaskCcToMe.vue'),
            meta: {
              code: 'MANAGE_APP:PCE:TASK_CENTER:CC_TO_ME',
              title: '抄送我的',
              icon: 'el-icon-Message',
              hidden: false
            }
          },
          {
            path: '/admin/pce/task_center/my_completed',
            component: () => import('@/modules/pce/task/completed/PceTaskMyCompleted.vue'),
            meta: {
              code: 'MANAGE_APP:PCE:TASK_CENTER:MY_COMPLETED',
              title: '我的已办',
              icon: 'el-icon-Finished',
              hidden: false
            }
          }
        ]
      },
      {
        path: '/admin/pce/operation',
        meta: {
          code: 'MANAGE_APP:PCE:OPERATION',
          title: '流程运维',
          icon: 'el-icon-Operation',
          hidden: false
        },
        children: [
          {
            path: '/admin/pce/operation/running',
            component: () => import('@/modules/pce/operation/running/PceOperationRunning.vue'),
            meta: {
              code: 'MANAGE_APP:PCE:OPERATION:RUNNING_INSTANCE',
              title: '运行实例',
              icon: 'el-icon-VideoPlay',
              hidden: false
            }
          },
          {
            path: '/admin/pce/operation/history',
            component: () => import('@/modules/pce/operation/history/PceOperationHistory.vue'),
            meta: {
              code: 'MANAGE_APP:PCE:OPERATION:HISTORY_INSTANCE',
              title: '历史实例',
              icon: 'el-icon-Collection',
              hidden: false
            }
          },
          {
            path: '/admin/pce/operation/exception',
            component: () => import('@/modules/pce/operation/exception/PceOperationException.vue'),
            meta: {
              code: 'MANAGE_APP:PCE:OPERATION:EXCEPTION_HANDING',
              title: '异常处理',
              icon: 'el-icon-WarningFilled',
              hidden: false
            }
          },
          {
            path: '/admin/pce/operation/monitoring',
            component: () => import('@/modules/pce/operation/monitoring/PceOperationMonitoring.vue'),
            meta: {
              code: 'MANAGE_APP:PCE:OPERATION:PROCESS_MONITORING',
              title: '流程监控',
              icon: 'el-icon-Monitor',
              hidden: false
            }
          }
        ]
      }
    ]
  }
]
