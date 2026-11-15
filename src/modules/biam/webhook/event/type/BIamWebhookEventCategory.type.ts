import type { TreeNode } from '@/shared/types/Common.type'

export interface BIamWebhookEventCategoryCreateRequestVo {
  parentId: string
  name: string
  sort?: number
}

export interface BIamWebhookEventCategoryUpdateRequestVo {
  id: string
  name: string
  sort?: number
}

export interface BIamWebhookEventCategoryUpdateParentRequestVo {
  id: string
  parentId: string
}

export interface BIamWebhookEventCategoryDetailResponseVo {
  id: string
  parentId: string
  code: string
  name: string
  sort: number
  createName: string
  createBy: string
  createTime: number
  updateName: string
  updateBy: string
  updateTime: number
}

/** 事件分类树(应用于组件弹窗) */
export interface BIamWebhookEventCategorySimpleTreeResponseVo extends TreeNode<BIamWebhookEventCategorySimpleTreeResponseVo> {
  code: string
}
