import type { AsyncComponentLoader } from 'vue'
import type { QuickSelectKind } from '@/shared/types/QuickSelect.type'

/**
 * 快速选择器注册表。
 *
 * 领域模块在装配层（main.ts）注册自己的选择器实现，业务页面只通过
 * `QuickSelectHost` 按 kind 使用，避免 data/biam/scm 之间互相 import
 * 对话框组件。registry 只保存懒加载函数，不会把实现打进入口 chunk。
 */
const loaders = new Map<QuickSelectKind, AsyncComponentLoader>()

export function registerQuickSelect(kind: QuickSelectKind, loader: AsyncComponentLoader): void {
  loaders.set(kind, loader)
}

export function getQuickSelectLoader(kind: QuickSelectKind): AsyncComponentLoader | undefined {
  return loaders.get(kind)
}

/** 仅供测试使用 */
export function clearQuickSelectRegistry(): void {
  loaders.clear()
}
