import type { PageRequest, PageResponse } from '@/common/types/Common.type'
import type { DataPermissionRuleDto } from '@/common/types/CommonIam.type'

export interface IamRoleCreateRequestVo {
  type: string
  name: string
  description?: string
  dataPermissionRule: DataPermissionRuleDto
}

export interface IamRoleUpdateRequestVo {
  id: string
  name: string
  description?: string
  dataPermissionRule: DataPermissionRuleDto
}

export interface IamRoleUpdateStatusRequestVo {
  id: string
  status: string
}

export interface IamRoleUpdatePermissionRequestVo {
  id: string
  permissionIdSet: string[]
  dataPermissionRuleMap: Map<string, List<DataPermissionRuleDto>>
}

export interface IamRoleDetailResponseVo {
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
export interface IamRoleQueryPageRequestVo extends PageRequest {
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
export interface IamRoleSimpleListResponseVo {
  id: string
  code?: string
  type: string
  name: string
  status: string
  createTime: number
  updateTime: number
}

export interface IamRoleExpandListResponseVo {
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

export type IamRoleSimplePageResponse = PageResponse<IamRoleSimpleListResponseVo>
export type IamRoleExpandPageResponse = PageResponse<IamRoleExpandListResponseVo>
