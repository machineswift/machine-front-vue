import { registerQuickSelect } from '@/shared/components/quick-select/registry'

/**
 * data 领域向装配层注册门店/品牌选择器。
 * biam（用户关联门店）与 scm（品牌配置）通过 kind 使用，不再直接 import 组件。
 */
export function installDataQuickSelect(): void {
  registerQuickSelect('data.shop', () => import('@/modules/data/shop/DataShopQuickSelectDialog.vue'))
  registerQuickSelect('data.brand', () => import('@/modules/data/brand/DataBrandQuickSelectDialog.vue'))
}
