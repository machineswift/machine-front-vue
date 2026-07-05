import type { TreeNode } from '@/common/types/Common.type'

export interface ScmFrontCategoryCreateRequestVo {
  parentId: string
  name: string
  sort: number
  backCategoryIdSet?: string[]
}

export interface ScmFrontCategoryUpdateRequestVo {
  id: string
  name: string
  sort: number
  backCategoryIdSet?: string[]
}

export interface ScmFrontCategoryUpdateParentRequestVo {
  id: string
  parentId: string
}

export interface ScmFrontCategoryDetailResponseVo {
  id: string
  code: string
  name: string
  parentId: string
  sort: number
  backCategoryIdSet?: string[]
  createName: string
  createBy: string
  createTime: number
  updateName: string
  updateBy: string
  updateTime: number
}

export interface ScmFrontCategoryTreeSimpleResponseVo extends TreeNode<ScmFrontCategoryTreeSimpleResponseVo> {
  code: string
}

export interface ScmFrontCategoryTreeExpandResponseVo extends TreeNode<ScmFrontCategoryTreeExpandResponseVo> {
  code: string
  frontCategoryNumber: number
  backCategoryNumber: number
  createName: string
  createBy: string
  createTime: number
  updateName: string
  updateBy: string
  updateTime: number
}
