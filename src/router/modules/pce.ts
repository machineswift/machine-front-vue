import type { ExtendedRouteRecordRaw } from '@/common/types/Router.type'

/**
 * 流程中心模块路由配置
 * 与菜单资源 code 对应：PCE / PCE:MANAGEMENT / PCE:TASK_CENTER / PCE:OPERATION
 */
export const pceRoutes: ExtendedRouteRecordRaw[] = [
  {
    path: '/pce',
    name: 'PCE',
    meta: {
      code: 'PCE',
      title: '流程中心',
      icon: 'el-icon-SetUp',
      hidden: false,
      isDynamic: true
    },
    children: [
      // 流程管理 PCE:MANAGEMENT
      {
        path: '/pce/management',
        name: 'PCE:MANAGEMENT',
        meta: {
          code: 'PCE:MANAGEMENT',
          title: '流程管理',
          icon: 'el-icon-Management',
          hidden: false,
          isDynamic: true
        },
        children: [
          {
            path: '/pce/management/modeling',
            component: () => import('@/modules/pce/management/modeling/PceManagementModeling.vue'),
            name: 'PCE:MANAGEMENT:PROCESS_MODELING',
            meta: {
              code: 'PCE:MANAGEMENT:PROCESS_MODELING',
              title: '流程建模',
              icon: 'el-icon-SetUp',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/pce/management/form_design',
            component: () => import('@/modules/pce/management/design/PceManagementFormDesign.vue'),
            name: 'PCE:MANAGEMENT:FORM_DESIGN',
            meta: {
              code: 'PCE:MANAGEMENT:FORM_DESIGN',
              title: '表单设计',
              icon: 'el-icon-DocumentAdd',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/pce/management/template',
            component: () => import('@/modules/pce/management/template/PceManagementTemplate.vue'),
            name: 'PCE:MANAGEMENT:PROCESS_TEMPLATE',
            meta: {
              code: 'PCE:MANAGEMENT:PROCESS_TEMPLATE',
              title: '流程模板',
              icon: 'el-icon-Collection',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/pce/management/deploy',
            component: () => import('@/modules/pce/management/deploy/PceManagementDeploy.vue'),
            name: 'PCE:MANAGEMENT:DEPLOY_MANAGEMENT',
            meta: {
              code: 'PCE:MANAGEMENT:DEPLOY_MANAGEMENT',
              title: '部署管理',
              icon: 'el-icon-UploadFilled',
              hidden: false,
              isDynamic: true
            }
          }
        ]
      },
      // 任务中心 PCE:TASK_CENTER
      {
        path: '/pce/task_center',
        name: 'PCE:TASK_CENTER',
        meta: {
          code: 'PCE:TASK_CENTER',
          title: '任务中心',
          icon: 'el-icon-Bell',
          hidden: false,
          isDynamic: true
        },
        children: [
          {
            path: '/pce/task_center/my_todo',
            component: () => import('@/modules/pce/task/todo/PceTaskMyToDo.vue'),
            name: 'PCE:TASK_CENTER:MY_TODO',
            meta: {
              code: 'PCE:TASK_CENTER:MY_TODO',
              title: '我的待办',
              icon: 'el-icon-AlarmClock',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/pce/task_center/my_initiated',
            component: () => import('@/modules/pce/task/initiated/PceTaskMyInitiated.vue'),
            name: 'PCE:TASK_CENTER:MY_INITIATED',
            meta: {
              code: 'PCE:TASK_CENTER:MY_INITIATED',
              title: '我发起的',
              icon: 'el-icon-UserFilled',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/pce/task_center/cc_to_me',
            component: () => import('@/modules/pce/task/copy/PceTaskCcToMe.vue'),
            name: 'PCE:TASK_CENTER:CC_TO_ME',
            meta: {
              code: 'PCE:TASK_CENTER:CC_TO_ME',
              title: '抄送我的',
              icon: 'el-icon-Message',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/pce/task_center/my_completed',
            component: () => import('@/modules/pce/task/completed/PceTaskMyCompleted.vue'),
            name: 'PCE:TASK_CENTER:MY_COMPLETED',
            meta: {
              code: 'PCE:TASK_CENTER:MY_COMPLETED',
              title: '我的已办',
              icon: 'el-icon-Finished',
              hidden: false,
              isDynamic: true
            }
          }
        ]
      },
      // 流程运维 PCE:OPERATION
      {
        path: '/pce/operation',
        name: 'PCE:OPERATION',
        meta: {
          code: 'PCE:OPERATION',
          title: '流程运维',
          icon: 'el-icon-Operation',
          hidden: false,
          isDynamic: true
        },
        children: [
          {
            path: '/pce/operation/running',
            component: () => import('@/modules/pce/operation/running/PceOperationRunning.vue'),
            name: 'PCE:OPERATION:RUNNING_INSTANCE',
            meta: {
              code: 'PCE:OPERATION:RUNNING_INSTANCE',
              title: '运行实例',
              icon: 'el-icon-VideoPlay',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/pce/operation/history',
            component: () => import('@/modules/pce/operation/history/PceOperationHistory.vue'),
            name: 'PCE:OPERATION:HISTORY_INSTANCE',
            meta: {
              code: 'PCE:OPERATION:HISTORY_INSTANCE',
              title: '历史实例',
              icon: 'el-icon-Collection',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/pce/operation/exception',
            component: () => import('@/modules/pce/operation/exception/PceOperationException.vue'),
            name: 'PCE:OPERATION:EXCEPTION_HANDING',
            meta: {
              code: 'PCE:OPERATION:EXCEPTION_HANDING',
              title: '异常处理',
              icon: 'el-icon-WarningFilled',
              hidden: false,
              isDynamic: true
            }
          },
          {
            path: '/pce/operation/monitoring',
            component: () => import('@/modules/pce/operation/monitoring/PceOperationMonitoring.vue'),
            name: 'PCE:OPERATION:PROCESS_MONITORING',
            meta: {
              code: 'PCE:OPERATION:PROCESS_MONITORING',
              title: '流程监控',
              icon: 'el-icon-Monitor',
              hidden: false,
              isDynamic: true
            }
          }
        ]
      }
    ]
  }
]
