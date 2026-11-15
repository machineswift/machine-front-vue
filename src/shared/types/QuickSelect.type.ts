/**
 * 跨模块快速选择器的稳定标识。
 *
 * 使用方只依赖 `QuickSelectHost` + kind 字符串，不直接 import 其他模块的
 * 对话框组件；具体实现由各领域在装配层通过 registry 注册。
 */
export type QuickSelectKind = 'iam.user' | 'data.shop' | 'data.brand'
