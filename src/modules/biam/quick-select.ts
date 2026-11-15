import { registerQuickSelect } from '@/shared/components/quick-select/registry'

/**
 * biam 领域向装配层注册自己的快速选择器实现。
 * 使用方（data 品牌/标签/物料等）只依赖 shared 的 QuickSelectHost + kind。
 */
export function installBiamQuickSelect(): void {
  registerQuickSelect('iam.user', () => import('@/modules/biam/accessControl/user/BIamUserQuickSelectDialog.vue'))
}
