import type { TreeNode } from '@/shared/types/Common.type'

export interface DataBrandCategoryCreateRequestVo {
  parentId: string
  name: string
  sort?: number
}

export interface DataBrandCategoryUpdateRequestVo {
  id: string
  name: string
  sort?: number
}

export interface DataBrandCategoryUpdateParentRequestVo {
  id: string
  parentId: string
}

export interface DataBrandCategoryDetailResponseVo {
  id?: string
  parentId?: string
  code?: string
  name?: string
  sort?: number
  createName?: string
  createBy?: string
  createTime?: number
  updateName?: string
  updateBy?: string
  updateTime?: number
}

export interface DataBrandCategorySimpleTreeResponseVo extends TreeNode<DataBrandCategorySimpleTreeResponseVo> {
  code?: string
}
