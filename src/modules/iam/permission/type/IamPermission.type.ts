import type { TreeNode } from '@/shared/types/Common.type'
import type { DataPermissionMetaDto } from '@/shared/types/CommonIam.type'

export interface IamPermissionCreateRequestVo {
  parentId: string
  resourceType: string
  code: string
  name: string
  icon?: string
  sort?: number
  description?: string
  dataPermissionMetaList: DataPermissionMetaDto[]
}

export interface IamPermissionUpdateRequestVo {
  id: string
  code: string
  name: string
  icon?: string
  sort?: number
  description?: string
  dataPermissionMetaList: DataPermissionMetaDto[]
}

export interface IamPermissionUpdateParentRequestVo {
  id: string
  parentId: string
}

export interface IamPermissionDetailResponseVo {
  id: string
  parentId: string
  resourceType: string
  code: string
  name: string
  icon: string
  sort: number
  description: string
  dataPermissionMetaList: DataPermissionMetaDto[]
  createName: string
  createBy: string
  createTime: number
  updateName: string
  updateBy: string
  updateTime: number
}

export interface IamPermissionTreeSimpleResponseVo extends TreeNode<IamPermissionTreeSimpleResponseVo> {
  resourceType: string
  code: string
  name: string
  icon: string
}

export interface IamPermissionTreeExpandResponseVo extends TreeNode<IamPermissionTreeExpandResponseVo> {
  resourceType: string
  code: string
  name: string
  icon: string
  sort: number
  description: string
  dataPermissionMetaList: DataPermissionMetaDto[]
  createName?: string
  createBy?: string
  createTime: number
  updateName?: string
  updateBy?: string
  updateTime: number
}
