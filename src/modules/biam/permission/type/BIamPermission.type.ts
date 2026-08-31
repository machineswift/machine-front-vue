import type { TreeNode } from '@/shared/types/Common.type'
import type { DataPermissionMetaDto } from '@/shared/types/CommonIam.type'

export interface BIamPermissionCreateRequestVo {
  parentId: string
  resourceType: string
  code: string
  name: string
  icon?: string
  sort?: number
  description?: string
  dataPermissionMetaList?: DataPermissionMetaDto[]
}

export interface BIamPermissionUpdateRequestVo {
  id: string
  code: string
  name: string
  icon?: string
  sort?: number
  description?: string
  dataPermissionMetaList?: DataPermissionMetaDto[]
}

export interface BIamPermissionUpdateParentRequestVo {
  id: string
  parentId: string
}

export interface BIamPermissionDetailResponseVo {
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

export interface BIamPermissionTreeSimpleResponseVo extends TreeNode<BIamPermissionTreeSimpleResponseVo> {
  resourceType: string
  code: string
  name: string
  icon: string
}

export interface BIamPermissionTreeExpandResponseVo extends TreeNode<BIamPermissionTreeExpandResponseVo> {
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
