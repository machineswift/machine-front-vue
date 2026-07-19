import type { TreeNode } from '@/shared/types/Common.type'

export interface DataAreaDto {
  id: string
  parentId: string
  code: string
  name: string
}

export interface DataAreaCreateRequestVo {
  parentId: string
  code: string
  name: string
  sort: number
}

export interface DataAreaUpdateRequestVo {
  id: string
  code: string
  name: string
  sort: number
}

export interface DataAreaUpdateParentRequestVo {
  id: string
  parentId: string
}

export interface DataAreaDetailResponseVo {
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

export interface DataAreaTreeRequestVo {
  countryCode: string
}

export interface DataAreaTreeSimpleResponseVo extends TreeNode<DataAreaTreeSimpleOutputDto> {
  code: string
}

export interface DataAreaExpandTreeResponseVo extends TreeNode<DataAreaExpandTreeResponseVo> {
  code: string
  createName: string
  createBy: string
  createTime: number
  updateName: string
  updateBy: string
  updateTime: number
}

export interface DataAreaWithShopTreeResponseVo extends TreeNode<DataAreaWithShopTreeResponseVo> {
  code: string
  AreaNumber: number
  shopNumber: number
  createName: string
  createBy: string
  createTime: number
  updateName: string
  updateBy: string
  updateTime: number
}
