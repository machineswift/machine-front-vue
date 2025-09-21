import type { TreeNode } from '@/modules/common/types/Common.type'
import type { DataShopDto } from '@/modules/data/shop/type/DataShop.type'

export interface IamOrganizationDto {
  id: string
  parentId: string
  code: string
  name: string
  type: string
}

export interface IamOrganizationCreateRequestVo {
  parentId: string
  name: string
  sort?: number
  description?: string
}

export interface IamOrganizationUpdateRequestVo {
  id: string
  name: string
  sort?: number
  description?: string
}

export interface IamOrganizationUpdateParentRequestVo {
  id: string
  parentId: string
}

export interface IamOrganizationDetailResponseVo {
  id: string
  parentId: string
  code: string
  name: string
  organizationNumber: number
  shopNumber: number
  userNumber: number
  sort: number
  createName: string
  createBy: string
  createTime: number
  updateName: string
  updateBy: string
  updateTime: number
}

export interface IamOrganizationTreeSimpleResponseVo extends TreeNode<IamOrganizationTreeSimpleOutputDto> {
  code: string
  type: string
}

export interface IamOrganizationExpandTreeResponseVo extends TreeNode<IamOrganizationExpandTreeResponseVo> {
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
}

export interface IamOrganizationWithShopTreeResponseVo extends TreeNode<IamOrganizationWithShopTreeResponseVo> {
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

export interface OrganizationTypeTab {
  code: string // 组织类型编码
  name: string // 组织类型名称
  loading: boolean // 加载状态
  tableData: IamOrganizationExpandTreeResponseVo[] // 表格数据
  expandedRowKeys: string[] // 展开的行keys
  treeData: IamOrganizationExpandTreeResponseVo | null // 完整的树数据
}
