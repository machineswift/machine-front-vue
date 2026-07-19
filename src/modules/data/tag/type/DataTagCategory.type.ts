// 创建智能标签分类请求参数
import type { TreeNode } from '@/shared/types/Common.type'

export interface DataTagCategoryCreateRequestVo {
  parentId: string
  name: string
  sort: number
  description?: string
}

// 修改智能标签分类请求参数
export interface DataTagCategoryUpdateRequestVo {
  id: string
  name: string
  description?: string
}

// 修改智能标签分类排序请求参数
export interface DataTagCategoryUpdateSortRequestVo {
  id: string
  sort: number
}

// 修改智能标签分类父ID请求参数
export interface DataTagCategoryUpdateParentRequestVo {
  id: string
  parentId: string
}

// 智能标签分类详情返回参数
export interface DataTagCategoryDetailResponseVo {
  id: string
  parentId: string
  code: string
  name: string
  sort: number
  description?: string
  createName?: string
  createBy?: string
  createTime: number
  updateName?: string
  updateBy?: string
  updateTime: number
}

// 智能标签分类树查询请求参数
export interface DataTagCategoryTreeRequestVo {
  type: string
}

// 智能标签分类树节点
export interface DataTagCategoryTreeSimpleOutputDto extends TreeNode<DataTagCategoryTreeSimpleOutputDto> {
  type: string
}
