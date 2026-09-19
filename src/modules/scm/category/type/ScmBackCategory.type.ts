import type { HighlightRange, TreeNode } from '@/shared/types/Common.type'

export interface ScmBackCategoryCreateRequestVo {
  parentId: string
  name: string
  sort: number
}

export interface ScmBackCategoryUpdateRequestVo {
  id: string
  name: string
  sort: number
}

export interface ScmBackCategoryUpdateParentRequestVo {
  id: string
  parentId: string
}

export interface ScmBackCategoryDetailResponseVo {
  id: string
  code: string
  name: string
  parentId: string
  sort: number
  createName: string
  createBy: string
  createTime: number
  updateName: string
  updateBy: string
  updateTime: number
}

export interface ScmBackCategoryTreeSimpleResponseVo extends TreeNode<ScmBackCategoryTreeSimpleResponseVo> {
  code: string
}

export interface ScmBackCategoryTreeExpandResponseVo extends TreeNode<ScmBackCategoryTreeExpandResponseVo> {
  code: string
  backCategoryNumber: number
  createName: string
  createBy: string
  createTime: number
  updateName: string
  updateBy: string
  updateTime: number
  /** 搜索命中区间（渲染时再生成高亮节点，存储区间可避免 HTML 拼接与 XSS） */
  highlight?: { name?: HighlightRange[]; code?: HighlightRange[] }
}
