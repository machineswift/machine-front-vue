import type { TreeNode } from '@/modules/common/types/Common.type'

export interface DataMaterialCategoryCreateRequestVo {
  parentId: string
  name: string
  sort?: number
}

export interface DataMaterialCategoryUpdateParentRequestVo {
  id: string
  parentId: string
}

export interface DataMaterialCategoryUpdateRequestVo {
  id: string
  name: string
  sort?: number
}

export interface DataMaterialCategoryDetailResponseVo {
  id?: string
  parentId?: string
  code?: string
  name?: string
  sort?: number
}

export interface DataMaterialCategorySimpleTreeResponseVo extends TreeNode<DataMaterialCategorySimpleTreeResponseVo> {
  code: string
}
