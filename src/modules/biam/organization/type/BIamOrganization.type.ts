import type { TreeNode } from '@/shared/types/Common.type'
import type { DataShopDto } from '@/modules/data/shop/type/DataShop.type'

export interface BIamOrganizationDto {
  id: string
  parentId: string
  code: string
  name: string
  type: string
}

export interface BIamOrganizationCreateRequestVo {
  parentId: string
  name: string
  sort?: number
  description?: string
}

export interface BIamOrganizationUpdateRequestVo {
  id: string
  name: string
  sort?: number
  description?: string
}

export interface BIamOrganizationUpdateParentRequestVo {
  id: string
  parentId: string
}

export interface BIamOrganizationDetailResponseVo {
  id: string
  parentId: string
  code: string
  name: string
  organizationNumber: number
  shopNumber: number
  userNumber: number
  sort: number
  description?: string
  createName: string
  createBy: string
  createTime: number
  updateName: string
  updateBy: string
  updateTime: number
}

export interface BIamOrganizationTreeSimpleResponseVo extends TreeNode<BIamOrganizationTreeSimpleResponseVo> {
  code: string
  type: string
}

export interface BIamOrganizationExpandTreeResponseVo extends TreeNode<BIamOrganizationExpandTreeResponseVo> {
  code: string
  organizationNumber: number
  shopNumber: number
  userNumber: number
  createName: string
  createBy: string
  createTime: number
  updateName: string
  updateBy: string
  updateTime: number
  /** 搜索高亮片段 */
  highlight?: { name?: string; code?: string }
}

export interface BIamOrganizationWithShopTreeResponseVo extends TreeNode<BIamOrganizationWithShopTreeResponseVo> {
  code: string
  organizationNumber: number
  shopNumber: number
  bindShopList: DataShopDto[]
  createName: string
  createBy: string
  createTime: number
  updateName: string
  updateBy: string
  updateTime: number
}

export type BIamOrganizationSimpleTreeResponseVo = BIamOrganizationTreeSimpleResponseVo
