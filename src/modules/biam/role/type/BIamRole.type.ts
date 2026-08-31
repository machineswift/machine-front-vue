import type { PageRequest, PageResponse } from '@/shared/types/Common.type'
import type { DataPermissionRuleDto } from '@/shared/types/CommonIam.type'

export interface BIamRoleCreateRequestVo {
  type: string
  name: string
  description?: string
  dataPermissionRule: DataPermissionRuleDto
}

export interface BIamRoleUpdateRequestVo {
  id: string
  name: string
  description?: string
  dataPermissionRule: DataPermissionRuleDto
}

export interface BIamRoleUpdateStatusRequestVo {
  id: string
  status: string
}

export interface BIamRoleUpdatePermissionRequestVo {
  id: string
  permissionIdSet: string[]
  dataPermissionRuleMap: Map<string, DataPermissionRuleDto[]>
}

export interface BIamRoleDetailResponseVo {
  id: string
  code?: string
  type: string
  name: string
  status: string
  defaultRole: boolean
  description?: string
  dataPermissionRule: DataPermissionRuleDto
  permissionIdSet: string[]
  dataPermissionRuleMap: Map<string, DataPermissionRuleDto[]>
  createName?: string
  createBy?: string
  createTime: number
  updateName?: string
  updateBy?: string
  updateTime: number
}

// 角色分页查询接口请求参数
export interface BIamRoleQueryPageRequestVo extends PageRequest {
  type?: string
  code?: string
  name?: string
  status?: string
  createUserIdSet?: string[]
  updateUserIdSet?: string[]
  createStartTime?: number
  createEndTime?: number
  updateStartTime?: number
  updateEndTime?: number
}

// 角色分页查询接口返回参数
export interface BIamRoleSimpleListResponseVo {
  id: string
  code?: string
  type: string
  name: string
  status: string
  createTime: number
  updateTime: number
}

export interface BIamRoleExpandListResponseVo {
  id: string
  code?: string
  type: string
  name: string
  status: string
  defaultRole: boolean
  userNumber: number
  createName?: string
  createBy?: string
  createTime: number
  updateName?: string
  updateBy?: string
  updateTime: number
}

export type BIamRoleSimplePageResponse = PageResponse<BIamRoleSimpleListResponseVo>
export type BIamRoleExpandPageResponse = PageResponse<BIamRoleExpandListResponseVo>
