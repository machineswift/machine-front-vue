import type { TreeNode } from '@/modules/common/types/Common.type'

export interface DataAttachmentCategoryCreateRequestVo {
  parentId: string
  name: string
  sort?: number
}

export interface DataAttachmentCategoryUpdateParentRequestVo {
  id: string
  parentId: string
}

export interface DataAttachmentCategoryUpdateRequestVo {
  id: string
  name: string
  sort?: number
}

export interface DataAttachmentCategoryDetailResponseVo {
  id?: string
  parentId?: string
  code?: string
  name?: string
  sort?: number
}

export interface DataAttachmentCategorySimpleTreeResponseVo extends TreeNode<DataAttachmentCategorySimpleTreeResponseVo> {
  code: string
}
